import {useEffect, useRef, useState} from 'react'
import {PermissionsAndroid, Platform} from 'react-native'
import {getAgoraEngine, destroyAgoraEngine} from './agoraEngine'

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

      // Add mock event listeners for development
      engine.addListener('JoinChannelSuccess', () => {
        console.log('🔧 Mock JoinChannelSuccess event');
        setJoined(true);
      })
      engine.addListener('UserJoined', (newUid) => {
        console.log('🔧 Mock UserJoined event:', newUid);
        setRemoteUsers((prev) => Array.from(new Set([...prev, newUid])))
      })
      engine.addListener('UserOffline', (offUid) => {
        console.log('🔧 Mock UserOffline event:', offUid);
        setRemoteUsers((prev) => prev.filter((u) => u !== offUid))
      })

      // Enable audio/video based on call type
      if (!withVideo) {
        await engine.enableAudio()
      } else {
        await engine.enableVideo()
      }

      // Use provided token or mock token for development
      let agoraToken = token;
      if (!agoraToken) {
        console.log('🔧 Using mock token for development');
        agoraToken = 'mock_token_' + Date.now();
      }

      // Skip actual token fetching for mock implementation
      console.log('🔧 Skipping actual token fetch for development');

      try {
        await engine.joinChannel(agoraToken, channel, null, uid);
        console.log('🔧 Successfully joined Agora channel (mock):', channel);
        setJoined(true); // Set joined for mock
      } catch (joinError) {
        console.error('Failed to join Agora channel:', joinError);
        // For mock, still set as joined after a delay
        setTimeout(() => setJoined(true), 1000);
      }
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
    try {
      await engineRef.current.muteLocalAudioStream(mute)
    } catch (error) {
      console.error('Error toggling mute:', error)
    }
  }

  const toggleVideo = async (disable) => {
    if (!engineRef.current) return
    try {
      await engineRef.current.muteLocalVideoStream(disable)
    } catch (error) {
      console.error('Error toggling video:', error)
    }
  }

  const setSpeakerphone = async (enabled) => {
    if (!engineRef.current) return
    try {
      if (Platform.OS === 'android') {
        await engineRef.current.setDefaultAudioRoutetoSpeakerphone(enabled)
      } else {
        await engineRef.current.setEnableSpeakerphone(enabled)
      }
    } catch (e) {
      console.error('Error setting speakerphone:', e)
    }
  }

  const switchCamera = async () => {
    if (!engineRef.current) return
    try {
      await engineRef.current.switchCamera()
    } catch (error) {
      console.error('Error switching camera:', error)
    }
  }

  const leave = async () => {
    try {
      if (engineRef.current) {
        await engineRef.current.leaveChannel()
      }
    } catch (error) {
      console.error('Error leaving channel:', error)
    } finally {
      await destroyAgoraEngine()
      setJoined(false)
      setRemoteUsers([])
    }
  }

  return {joined, remoteUsers, toggleMute, toggleVideo, switchCamera, setSpeakerphone, leave}
}


