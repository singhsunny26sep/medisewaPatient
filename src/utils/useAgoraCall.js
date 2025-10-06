import {useEffect, useRef, useState} from 'react'
import {PermissionsAndroid, Platform} from 'react-native'
import {getAgoraEngine, destroyAgoraEngine} from './agoraEngine'
import {fetchAgoraToken} from '../api/Instance'

async function requestPermissions(withVideo) {
  if (Platform.OS !== 'android') return true
  const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]
  if (withVideo) permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA)
  const granted = await PermissionsAndroid.requestMultiple(permissions)
  const audioGranted =
    granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
    PermissionsAndroid.RESULTS.GRANTED
  const cameraGranted = withVideo
    ? granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED
    : true
  return audioGranted && cameraGranted
}

export const useAgoraCall = ({channel, uid, withVideo, token}) => {
  const engineRef = useRef(null)
  const [joined, setJoined] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const ok = await requestPermissions(withVideo)
      if (!ok) return
      const engine = await getAgoraEngine()
      if (!mounted) return
      engineRef.current = engine

      engine.addListener('JoinChannelSuccess', () => setJoined(true))
      engine.addListener('UserJoined', (newUid) =>
        setRemoteUsers((prev) => Array.from(new Set([...prev, newUid])))
      )
      engine.addListener('UserOffline', (offUid) =>
        setRemoteUsers((prev) => prev.filter((u) => u !== offUid))
      )

      if (!withVideo) {
        await engine.enableAudio()
      } else {
        await engine.enableVideo()
      }

      // Use provided token or fallback to fetching one
      const agoraToken = token || await fetchAgoraToken(channel, uid)
      await engine.joinChannel(agoraToken ?? null, channel, null, uid)
    })()

    return () => {
      mounted = false
      ;(async () => {
        try {
          await engineRef.current?.leaveChannel()
        } finally {
          await destroyAgoraEngine()
        }
      })()
    }
  }, [channel, uid, withVideo, token])

  const toggleMute = async (mute) => {
    if (!engineRef.current) return
    await engineRef.current.muteLocalAudioStream(mute)
  }

  const toggleVideo = async (disable) => {
    if (!engineRef.current) return
    await engineRef.current.muteLocalVideoStream(disable)
  }

  const setSpeakerphone = async (enabled) => {
    if (!engineRef.current) return
    try {
      if (Platform.OS === 'android' && engineRef.current.setDefaultAudioRoutetoSpeakerphone) {
        await engineRef.current.setDefaultAudioRoutetoSpeakerphone(enabled)
      }
      if (engineRef.current.setEnableSpeakerphone) {
        await engineRef.current.setEnableSpeakerphone(enabled)
      }
    } catch (e) {
      // ignore
    }
  }

  const switchCamera = async () => {
    if (!engineRef.current) return
    await engineRef.current.switchCamera()
  }

  const leave = async () => {
    try {
      await engineRef.current?.leaveChannel()
    } finally {
      await destroyAgoraEngine()
      setJoined(false)
      setRemoteUsers([])
    }
  }

  return {joined, remoteUsers, toggleMute, toggleVideo, switchCamera, setSpeakerphone, leave}
}


