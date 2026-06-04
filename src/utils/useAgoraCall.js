import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { getAgoraEngine, destroyAgoraEngine } from './agoraEngine';

async function requestPermissions(withVideo) {
  if (Platform.OS !== 'android') { return true; }
  const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  if (withVideo) { permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA); }
  const granted = await PermissionsAndroid.requestMultiple(permissions);
  const audioGranted =
    granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
    PermissionsAndroid.RESULTS.GRANTED;
  const cameraGranted = withVideo
    ? granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED
    : true;
  return audioGranted && cameraGranted;
}

export const useAgoraCall = ({ channel, uid, withVideo, token }) => {
  const engineRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      console.log('Starting Agora call setup for channel:', channel);
      const ok = await requestPermissions(withVideo);
      if (!ok) {
        console.error('Permissions denied - cannot proceed with call');
        return;
      }

      const engine = await getAgoraEngine();
      if (!mounted) { return; }
      engineRef.current = engine;

      // Set up event handlers for the new Agora SDK API
      engine.registerEventHandler({
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('Join channel success:', connection.channelId);
          setJoined(true);
        },
        onUserJoined: (connection, remoteUid) => {
          console.log('Remote user joined:', remoteUid);
          setRemoteUsers((prev) => Array.from(new Set([...prev, remoteUid])));
        },
        onUserOffline: (connection, remoteUid) => {
          console.log('Remote user offline:', remoteUid);
          setRemoteUsers((prev) => prev.filter((u) => u !== remoteUid));
        },
      });

      // Set channel profile - Communication mode (0) for 1-on-1 calls
      engine.setChannelProfile(0);

      // Join channel with provided token
      await engine.joinChannel({
        channelId: channel,
        localUid: uid,
        token: token || null,
      });

      console.log('Joined Agora channel:', channel);
    })();

    return () => {
      console.log('Cleaning up Agora call...');
      mounted = false;
      if (engineRef.current) {
        try {
          engineRef.current.leaveChannel();
        } catch (e) {
          console.error('Error leaving channel:', e);
        }
      }
    };
  }, [channel, uid, withVideo, token]);

  const toggleMute = async (mute) => {
    if (!engineRef.current) { return; }
    try {
      engineRef.current.muteLocalAudioStream(mute);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVideo = async (disable) => {
    if (!engineRef.current) { return; }
    try {
      engineRef.current.muteLocalVideoStream(disable);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const setSpeakerphone = async (enabled) => {
    if (!engineRef.current) { return; }
    try {
      if (Platform.OS === 'android') {
        engineRef.current.setEnableSpeakerphone(enabled);
      }
    } catch (e) {
      console.error('Error setting speakerphone:', e);
    }
  };

  const switchCamera = async () => {
    if (!engineRef.current) { return; }
    try {
      engineRef.current.switchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const leave = async () => {
    try {
      if (engineRef.current) {
        engineRef.current.leaveChannel();
      }
      await destroyAgoraEngine();
      setJoined(false);
      setRemoteUsers([]);
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  return { joined, remoteUsers, toggleMute, toggleVideo, switchCamera, setSpeakerphone, leave };
};