import RtmEngine from 'agora-react-native-rtm'
import { Platform } from 'react-native'
import { AGORA_APP_ID } from './agoraConfig'

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

export const notifyCallCancelled = (peerId) => RtmService.sendCallControl(peerId, 'CALL_CANCELLED')
export const notifyCallDeclined = (peerId) => RtmService.sendCallControl(peerId, 'CALL_DECLINED')


