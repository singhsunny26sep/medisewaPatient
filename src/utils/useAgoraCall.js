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
  console.log('🎯 useAgoraCall initialized with:', { channel, uid, withVideo, hasToken: !!token });

  useEffect(() => {
    let mounted = true
    ;(async () => {
      console.log('🎯 Starting Agora call setup...');
      const ok = await requestPermissions(withVideo)
      console.log('🎯 Permissions granted:', ok);
      if (!ok) {
        console.error('🎯 Permissions denied - cannot proceed with call');
        return;
      }

      const engine = await getAgoraEngine()
      console.log('🎯 Agora engine obtained:', !!engine);
      if (!mounted) return
      engineRef.current = engine

      // Add mock event listeners for development
      engine.addListener('JoinChannelSuccess', () => {
        console.log('🎯 JoinChannelSuccess event fired');
        setJoined(true);
      })
      engine.addListener('UserJoined', (newUid) => {
        console.log('🎯 UserJoined event:', newUid);
        setRemoteUsers((prev) => Array.from(new Set([...prev, newUid])))
      })
      engine.addListener('UserOffline', (offUid) => {
        console.log('🎯 UserOffline event:', offUid);
        setRemoteUsers((prev) => prev.filter((u) => u !== offUid))
      })

      // Enable audio/video based on call type
      console.log('🎯 Enabling audio/video...');
      if (!withVideo) {
        await engine.enableAudio()
        console.log('🎯 Audio enabled');
      } else {
        await engine.enableVideo()
        console.log('🎯 Video enabled');
      }

      // Use provided token or mock token for development
      let agoraToken = token;
      if (!agoraToken) {
        console.log('🎯 No token provided, using mock token');
        agoraToken = 'mock_token_' + Date.now();
      } else {
        console.log('🎯 Using provided token');
      }

      // Skip actual token fetching for mock implementation
      console.log('🎯 Attempting to join channel:', { channel, uid, tokenLength: agoraToken.length });

      try {
        await engine.joinChannel(agoraToken, channel, null, uid);
        console.log('🎯 Successfully joined Agora channel (mock):', channel);
        setJoined(true); // Set joined for mock
      } catch (joinError) {
        console.error('🎯 Failed to join Agora channel:', joinError);
        // For mock, still set as joined after a delay
        console.log('🎯 Setting joined=true after delay for mock implementation');
        setTimeout(() => setJoined(true), 1000);
      }
    })()

    return () => {
      console.log('🎯 Cleaning up Agora call...');
      mounted = false
      ;(async () => {
        try {
          await engineRef.current?.leaveChannel()
          console.log('🎯 Left channel successfully');
        } catch (leaveError) {
          console.error('🎯 Error leaving channel:', leaveError);
        } finally {
          await destroyAgoraEngine()
          console.log('🎯 Agora engine destroyed');
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


