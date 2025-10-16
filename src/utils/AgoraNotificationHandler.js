import { NativeModules, Platform } from 'react-native'

const { AgoraNotificationHandler } = NativeModules

class AgoraNotificationManager {
  constructor() {
    this.isInitialized = false
  }

  // Initialize Agora notification system
  async initialize() {
    if (Platform.OS !== 'android') return

    try {
      if (AgoraNotificationHandler) {
        await AgoraNotificationHandler.initialize()
        this.isInitialized = true
        console.log('[AgoraNotification] Initialized successfully')
      } else {
        console.log('[AgoraNotification] Native module not available')
      }
    } catch (error) {
      console.log('[AgoraNotification] Initialization error:', error)
    }
  }

  // Show incoming call notification using Agora's system
  async showIncomingCallNotification(callData) {
    if (Platform.OS !== 'android' || !this.isInitialized) {
      console.log('[AgoraNotification] Not available on this platform or not initialized')
      return false
    }

    try {
      const { callId, callType, callerName, callerId } = callData

      const result = await AgoraNotificationHandler.showCallNotification({
        callId,
        callType,
        callerName,
        callerId,
      })

      console.log('[AgoraNotification] Call notification shown:', result)
      return result
    } catch (error) {
      console.log('[AgoraNotification] Error showing call notification:', error)
      return false
    }
  }

  // Cancel call notification
  async cancelCallNotification(callId) {
    if (Platform.OS !== 'android' || !this.isInitialized) return

    try {
      if (AgoraNotificationHandler) {
        await AgoraNotificationHandler.cancelCallNotification(callId)
        console.log('[AgoraNotification] Call notification cancelled:', callId)
      }
    } catch (error) {
      console.log('[AgoraNotification] Error cancelling notification:', error)
    }
  }

  // Handle notification action (Accept/Decline)
  async handleNotificationAction(callId, action) {
    if (Platform.OS !== 'android' || !this.isInitialized) return

    try {
      if (AgoraNotificationHandler) {
        const result = await AgoraNotificationHandler.handleNotificationAction(callId, action)
        console.log('[AgoraNotification] Action handled:', { callId, action, result })
        return result
      }
    } catch (error) {
      console.log('[AgoraNotification] Error handling notification action:', error)
    }
  }

  // Check if the app was opened from a call notification
  async checkNotificationIntent() {
    if (Platform.OS !== 'android' || !this.isInitialized) return null

    try {
      if (AgoraNotificationHandler) {
        const intentData = await AgoraNotificationHandler.getNotificationIntent()
        if (intentData) {
          console.log('[AgoraNotification] App opened from notification:', intentData)
          return intentData
        }
      }
    } catch (error) {
      console.log('[AgoraNotification] Error checking notification intent:', error)
    }

    return null
  }
}

// Create singleton instance and initialize it
const agoraNotificationManager = new AgoraNotificationManager()

// Initialize Agora notification manager after class definition
agoraNotificationManager.initialize().catch(console.error)

export { agoraNotificationManager as AgoraNotificationManager }