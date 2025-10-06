import React, {useEffect, useRef, useState} from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import {RtmService, notifyCallDeclined} from '../utils/rtmService'
import { ACCEPT_CALL } from '../api/Api_Controller'

export default function CallInviteHandler() {
  const navigation = useNavigation()
  const showingRef = useRef(false)
  const [invite, setInvite] = useState(null)

  useEffect(() => {
    const handler = ({ type, payload, from }) => {
      console.log('[CallInviteHandler] event:', type, 'from:', from, 'payload:', payload)
      if (type === 'CALL_INVITE') {
        if (showingRef.current) return
        const callId = payload?.callId || payload?.data?.callId
        const callType = payload?.callType || payload?.data?.callType || 'video'
        const channelName = payload?.channel || payload?.channelName || payload?.data?.channelName || payload?.data?.channel
        const token = payload?.token || payload?.data?.token || null
        const receiver = payload?.receiver || payload?.data?.receiver || {}
        const callerId = payload?.callerId || receiver?.id || receiver?._id || from
        const callerName = payload?.callerName || receiver?.name || 'Unknown'
        const callerAvatar = payload?.callerAvatar || receiver?.image || receiver?.avatar || null

        const doctor = { id: callerId, name: callerName, image: callerAvatar }
        const callData = { callId, channelName, uid: 0, token, receiver: { name: callerName, image: callerAvatar } }
        showingRef.current = true
        setInvite({ from, callType, doctor, callData })
      }
      if (type === 'CALL_CANCELLED') {
        // Best-effort dismiss: Alert cannot be programmatically dismissed cross-platform
        console.log('[CallInviteHandler] CALL_CANCELLED received')
        showingRef.current = false
        setInvite(null)
      }
    }
    RtmService.setMessageHandler(handler)
    return () => RtmService.setMessageHandler(null)
  }, [navigation])

  if (!invite) return null

  const { from, callType, doctor, callData } = invite

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <View style={{ width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111' }} numberOfLines={1}>
          {doctor?.name || 'Incoming call'}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 14, color: '#555' }}>
          {callType === 'video' ? 'Video call' : 'Audio call'}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          <TouchableOpacity
            onPress={async () => {
              try { await notifyCallDeclined(from) } catch {}
              console.log('[CallInviteHandler] Declined invite from', from)
              showingRef.current = false
              setInvite(null)
            }}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f03d3d', alignItems: 'center', marginRight: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try { if (callData?.callId) { await ACCEPT_CALL(callData.callId); console.log('[CallInviteHandler] Accepted callId', callData.callId) } } catch {}
              if (callType === 'video') {
                navigation.navigate('VideoCall', { doctor, callData })
              } else {
                navigation.navigate('AudioCall', { doctor, callData })
              }
              showingRef.current = false
              setInvite(null)
            }}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#2e7d32', alignItems: 'center', marginLeft: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}


