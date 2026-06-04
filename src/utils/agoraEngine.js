import { createAgoraRtcEngine } from 'react-native-agora';
import { AGORA_APP_ID } from './agoraConfig';

let engineInstance = null;

export const getAgoraEngine = async () => {
  if (engineInstance) { return engineInstance; }

  console.log('Initializing Agora RTC engine with App ID:', AGORA_APP_ID);

  engineInstance = createAgoraRtcEngine();

  // Initialize the engine
  engineInstance.initialize({
    appId: AGORA_APP_ID,
  });

  // Enable video if needed (will be called per call type)
  engineInstance.enableVideo();
  engineInstance.enableAudio();

  console.log('Agora RTC engine initialized successfully');

  return engineInstance;
};

export const destroyAgoraEngine = async () => {
  if (!engineInstance) { return; }

  try {
    engineInstance.leaveChannel();
    engineInstance.release();
    console.log('Agora engine destroyed successfully');
  } catch (error) {
    console.error('Error destroying Agora engine:', error);
  } finally {
    engineInstance = null;
  }
};