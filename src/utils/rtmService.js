import RtmEngine from 'agora-react-native-rtm'
import { Platform } from 'react-native'
import { AGORA_APP_ID } from './agoraConfig'
import messaging from '@react-native-firebase/messaging'
import { AgoraNotificationManager } from './AgoraNotificationHandler'

class RtmServiceSingleton {
  constructor() {
    this.engine = null
    this.appId = null
    this.loggedInUserId = null
    this.messageHandler = null
  }

  initialize = async (appId = AGORA_APP_ID) => {
    if (this.engine) return
    this.appId = appId
    this.engine = new RtmEngine()
    await this.engine.createInstance(appId)
    console.log('[RTM] initialized with appId:', appId)
    this.engine.on('messageReceived', (evt) => {
      try {
        const { text, rawMessage, peerId } = evt || {}
        const body = typeof text === 'string' && text.trim().length ? text : rawMessage
        console.log('[RTM] messageReceived from', peerId, 'text:', body)

        if (!body) {
          console.log('[RTM] Empty message received; ignoring')
          return
        }

        let parsed
        try {
          parsed = typeof body === 'string' ? JSON.parse(body) : body
          console.log('[RTM] Parsed message:', JSON.stringify(parsed, null, 2))
        } catch (parseError) {
          console.log('[RTM] Failed to parse message as JSON:', parseError.message)
          console.log('[RTM] Raw message:', body)
          return
        }

        if (!parsed || typeof parsed !== 'object') {
          console.log('[RTM] Invalid message format; ignoring')
          return
        }

        const type = parsed.type || parsed.event || parsed.kind
        const payload = parsed.payload || parsed.data || parsed.body || {}

        console.log('[RTM] Extracted - type:', type, 'payload keys:', Object.keys(payload))

        if (this.messageHandler && type) {
          this.messageHandler({ type, payload, from: peerId })
        } else {
          console.log('[RTM] No handler or type for message; dropping. Type:', type, 'Has handler:', !!this.messageHandler)
        }
      } catch (e) {
        console.log('[RTM] messageReceived handler error', e?.message, e?.stack)
      }
    })
  }

  login = async (userId, token) => {
    if (!this.engine || !this.appId) throw new Error('RTM not initialized')
    const uid = String(userId)
    if (this.loggedInUserId === uid) return
    await this.engine.login({ uid, token: token || undefined })
    this.loggedInUserId = uid
    console.log('[RTM] logged in as', uid)
  }

  logout = async () => {
    if (!this.engine || !this.loggedInUserId) return
    await this.engine.logout()
    this.loggedInUserId = null
  }

  setMessageHandler = (handler) => {
    this.messageHandler = handler
    console.log('[RTM] message handler', handler ? 'registered' : 'cleared')
  }

  sendCallInvite = async (peerId, payload) => {
    if (!this.engine) throw new Error('RTM not initialized')

    const message = {
      type: 'CALL_INVITE',
      payload: {
        callId: payload.callId,
        callType: payload.callType || 'video',
        channel: payload.channel || payload.channelName,
        token: payload.token,
        callerId: payload.callerId,
        callerName: payload.callerName,
        callerAvatar: payload.callerAvatar,
        receiver: payload.receiver,
        timestamp: new Date().toISOString(),
        ...payload
      }
    }

    console.log('[RTM] sendCallInvite ->', peerId, JSON.stringify(message, null, 2))

    try {
      await this.engine.sendMessageByPeer({
        peerId: String(peerId),
        text: JSON.stringify(message),
      })
      console.log('[RTM] Call invite sent successfully to', peerId)
    } catch (error) {
      console.log('[RTM] Failed to send call invite:', error.message)
      throw error
    }
  }

  sendCallControl = async (peerId, type) => {
    if (!this.engine) throw new Error('RTM not initialized')
    if (type !== 'CALL_CANCELLED' && type !== 'CALL_DECLINED') {
      throw new Error('Invalid control type')
    }
    console.log('[RTM] sendCallControl ->', peerId, type)
    await this.engine.sendMessageByPeer({
      peerId: String(peerId),
      text: JSON.stringify({ type, payload: {} }),
    })
  }

  // Send call notification through Agora's notification system
  sendCallNotification = async (targetUserId, callData) => {
    try {
      console.log('[Agora] Sending call notification to user:', targetUserId);

      // Use Agora RTM to send call invitation
      // This will trigger Agora's built-in notification system
      const notificationMessage = {
        type: 'CALL_NOTIFICATION',
        payload: {
          callId: callData.callId,
          callType: callData.callType,
          channelName: callData.channelName,
          token: callData.token,
          callerId: callData.callerId,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
          timestamp: new Date().toISOString(),
          // Agora-specific notification fields
          category: 'call',
          priority: 'high',
          persistent: true,
        }
      };

      // Send through RTM - Agora will handle the system notification
      await this.engine.sendMessageByPeer({
        peerId: String(targetUserId),
        text: JSON.stringify(notificationMessage),
        options: {
          enableHistoricalMessaging: true,
          enableOfflineMessaging: true,
        }
      });

      console.log('[Agora] Call notification sent successfully via RTM');
      return true;
    } catch (error) {
      console.log('[Agora] Error sending call notification:', error);

      // Fallback: Try to send through your backend API
      try {
        const response = await fetch(`${API_BASE_URL}/api/send-call-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetUserId,
            callData,
          }),
        });

        if (response.ok) {
          console.log('[Agora] Call notification sent via backend API');
          return true;
        }
      } catch (apiError) {
        console.log('[Agora] Backend API also failed:', apiError);
      }

      return false;
    }
  }

  // Enhanced call invitation with Agora notification support
  sendEnhancedCallInvite = async (peerId, payload) => {
    if (!this.engine) throw new Error('RTM not initialized');

    const message = {
      type: 'CALL_INVITE_ENHANCED',
      payload: {
        callId: payload.callId,
        callType: payload.callType || 'video',
        channel: payload.channel || payload.channelName,
        token: payload.token,
        callerId: payload.callerId,
        callerName: payload.callerName,
        callerAvatar: payload.callerAvatar,
        receiver: payload.receiver,
        timestamp: new Date().toISOString(),
        // Agora notification properties
        notification: {
          title: `Incoming ${payload.callType === 'video' ? 'Video' : 'Audio'} Call`,
          body: `${payload.callerName} is calling you`,
          icon: 'call',
          color: '#2196F3',
          sound: 'default',
          tag: `call_${payload.callId}`,
          requireInteraction: true,
          actions: [
            { action: 'accept', title: 'Accept', icon: 'call' },
            { action: 'decline', title: 'Decline', icon: 'call_end' }
          ]
        },
        ...payload
      }
    };

    console.log('[Agora] sendEnhancedCallInvite ->', peerId, JSON.stringify(message, null, 2));

    try {
      await this.engine.sendMessageByPeer({
        peerId: String(peerId),
        text: JSON.stringify(message),
        options: {
          enableHistoricalMessaging: true,
          enableOfflineMessaging: true,
          enableNotification: true, // Enable Agora's notification system
        }
      });
      console.log('[Agora] Enhanced call invite sent successfully');
    } catch (error) {
      console.log('[Agora] Failed to send enhanced call invite:', error.message);
      throw error;
    }
  }
}

export const RtmService = new RtmServiceSingleton()

// Convenience helpers for call flows
export const sendAudioCallInvite = (peerId, { callId, channel, callerId, callerName, callerAvatar }) => {
  return RtmService.sendCallInvite(peerId, {
    callId,
    channel,
    callType: 'audio',
    callerId: String(callerId),
    callerName,
    callerAvatar,
  })
}

export const sendVideoCallInvite = (peerId, { callId, channel, callerId, callerName, callerAvatar }) => {
  return RtmService.sendCallInvite(peerId, {
    callId,
    channel,
    callType: 'video',
    callerId: String(callerId),
    callerName,
    callerAvatar,
  })
}

// Enhanced call invitation methods using Agora's notification system
export const sendEnhancedAudioCallInvite = (peerId, { callId, channel, callerId, callerName, callerAvatar }) => {
  return RtmService.sendEnhancedCallInvite(peerId, {
    callId,
    channel,
    callType: 'audio',
    callerId: String(callerId),
    callerName,
    callerAvatar,
  })
}

export const sendEnhancedVideoCallInvite = (peerId, { callId, channel, callerId, callerName, callerAvatar }) => {
  return RtmService.sendEnhancedCallInvite(peerId, {
    callId,
    channel,
    callType: 'video',
    callerId: String(callerId),
    callerName,
    callerAvatar,
  })
}

// Send call notification through Agora's system
export const sendAgoraCallNotification = (targetUserId, callData) => {
  return RtmService.sendCallNotification(targetUserId, callData)
}

export const notifyCallCancelled = (peerId) => RtmService.sendCallControl(peerId, 'CALL_CANCELLED')
export const notifyCallDeclined = (peerId) => RtmService.sendCallControl(peerId, 'CALL_DECLINED')


