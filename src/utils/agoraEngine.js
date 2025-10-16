import { AGORA_APP_ID } from './agoraConfig'

// Mock Agora engine for development/testing
// This allows the app to run without Agora SDK configuration issues

let engineInstance = null

export const getAgoraEngine = async () => {
  if (engineInstance) return engineInstance

  console.log('🔧 Agora engine mock initialized (SDK needs proper setup for production)');

  // Return a mock engine that provides all necessary methods
  engineInstance = {
    // Initialization
    initialize: async (appId) => {
      console.log('🔧 Mock Agora initialize called with:', appId);
      return true;
    },

    // Channel management
    setChannelProfile: async (profile) => {
      console.log('🔧 Mock setChannelProfile called with:', profile);
      return true;
    },

    setClientRole: async (role) => {
      console.log('🔧 Mock setClientRole called with:', role);
      return true;
    },

    joinChannel: async (token, channel, info, uid) => {
      console.log('🔧 Mock joinChannel called:', { token: '***', channel, uid });
      return true;
    },

    leaveChannel: async () => {
      console.log('🔧 Mock leaveChannel called');
      return true;
    },

    // Audio controls
    muteLocalAudioStream: async (mute) => {
      console.log('🔧 Mock muteLocalAudioStream called:', mute);
      return true;
    },

    enableAudio: async () => {
      console.log('🔧 Mock enableAudio called');
      return true;
    },

    // Video controls
    muteLocalVideoStream: async (mute) => {
      console.log('🔧 Mock muteLocalVideoStream called:', mute);
      return true;
    },

    enableVideo: async () => {
      console.log('🔧 Mock enableVideo called');
      return true;
    },

    switchCamera: async () => {
      console.log('🔧 Mock switchCamera called');
      return true;
    },

    // Speaker controls
    setEnableSpeakerphone: async (enabled) => {
      console.log('🔧 Mock setEnableSpeakerphone called:', enabled);
      return true;
    },

    setDefaultAudioRoutetoSpeakerphone: async (enabled) => {
      console.log('🔧 Mock setDefaultAudioRoutetoSpeakerphone called:', enabled);
      return true;
    },

    // Event listeners (mock)
    addListener: (event, callback) => {
      console.log('🔧 Mock addListener called for event:', event);
      // Store callback for potential future use
    },

    removeListener: (event, callback) => {
      console.log('🔧 Mock removeListener called for event:', event);
    },

    // Cleanup
    destroy: async () => {
      console.log('🔧 Mock destroy called');
      return true;
    },

    release: async () => {
      console.log('🔧 Mock release called');
      return true;
    },
  };

  return engineInstance;
}

export const destroyAgoraEngine = async () => {
  if (!engineInstance) return

  try {
    if (engineInstance.leaveChannel) {
      await engineInstance.leaveChannel()
    }
  } catch (error) {
    console.error('Error leaving channel:', error)
  } finally {
    engineInstance = null
  }
}


