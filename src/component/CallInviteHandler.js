import React, {useEffect, useRef, useState} from 'react'
import {View, Text, TouchableOpacity} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import {RtmService, notifyCallDeclined} from '../utils/rtmService'
import { ACCEPT_CALL } from '../api/Api_Controller'
import { AgoraNotificationManager } from '../utils/AgoraNotificationHandler'
import { notificationService } from '../utils/NotificationService'

export default function CallInviteHandler() {
  const navigation = useNavigation()
  const showingRef = useRef(false)
  const currentCallRef = useRef(null)
  const [invite, setInvite] = useState(null)

  useEffect(() => {
    const handler = ({ type, payload, from }) => {
      console.log('[CallInviteHandler] event:', type, 'from:', from, 'payload:', JSON.stringify(payload, null, 2))

      if (type === 'CALL_INVITE' || type === 'CALL_INVITE_ENHANCED' || type === 'CALL_NOTIFICATION') {
        // Handle both regular and enhanced call invitations
        const callId = payload?.callId || payload?.data?.callId
        const callType = payload?.callType || payload?.data?.callType || 'video'
        const channelName = payload?.channel || payload?.channelName || payload?.data?.channelName || payload?.data?.channel
        const token = payload?.token || payload?.data?.token || null
        const receiver = payload?.receiver || payload?.data?.receiver || {}
        const callerId = payload?.callerId || payload?.caller_id || receiver?.id || receiver?._id || from
        const callerName = payload?.callerName || payload?.caller_name || receiver?.name || 'Unknown'
        const callerAvatar = payload?.callerAvatar || payload?.caller_avatar || receiver?.image || receiver?.avatar || null
        console.log('[CallInviteHandler] Parsed call data:', {
          callId, callType, channelName, token, callerId, callerName, callerAvatar
        })
        // Validate required fields
        if (!callId || !channelName) {
          console.log('[CallInviteHandler] Missing required fields: callId or channelName')
          return
        }
        const doctor = { id: callerId, name: callerName, image: callerAvatar }
        const callData = {
          callId,
          channelName,
          uid: 0,
          token,
          receiver: { name: callerName, image: callerAvatar }
        }
        currentCallRef.current = callId
        showingRef.current = true
        setInvite({ from, callType, doctor, callData })
        // Show "message received" notification when call is received
        notificationService.showMessageReceivedNotification({
          callerName: callerName,
          callType: callType
        }).catch(error => {
          console.log('[CallInviteHandler] Error showing message received notification:', error)
        })
      }
      if (type === 'CALL_CANCELLED') {
        console.log('[CallInviteHandler] CALL_CANCELLED received for call:', currentCallRef.current)
        showingRef.current = false
        currentCallRef.current = null
        setInvite(null)
      }
    }
    RtmService.setMessageHandler(handler)
    return () => RtmService.setMessageHandler(null)
  }, [navigation])
  const { from, callType, doctor, callData } = invite || {}
  if (!invite) return null
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    }}>
      <View style={{
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: callType === 'video' ? '#4CAF50' : '#2196F3',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>
              {callType === 'video' ? '📹' : '📞'}
            </Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center' }} numberOfLines={2}>
            {doctor?.name || 'Unknown Doctor'}
          </Text>

          <Text style={{ marginTop: 8, fontSize: 16, color: '#666', textAlign: 'center' }}>
            Incoming {callType === 'video' ? 'Video Call' : 'Audio Call'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await notifyCallDeclined(from)
                console.log('[CallInviteHandler] Declined invite from', from)
              } catch (error) {
                console.log('[CallInviteHandler] Error declining call:', error)
              } finally {
                showingRef.current = false
                currentCallRef.current = null
                setInvite(null)
              }
            }}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: '#f03d3d',
              alignItems: 'center',
              marginRight: 10,
              elevation: 2,
              shadowColor: '#f03d3d',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 2,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                // Don't call ACCEPT_CALL here - let the call screen handle it when it opens
                console.log('[CallInviteHandler] User accepted call - navigating to call screen')

                showingRef.current = false
                currentCallRef.current = null

                // Navigate to call screen - the call screen will handle ACCEPT_CALL API
                if (callType === 'video') {
                  navigation.navigate('VideoCall', {
                    doctor,
                    callData,
                    callAccepted: true // Flag to indicate call was accepted from invitation
                  })
                } else {
                  navigation.navigate('AudioCall', {
                    doctor,
                    callData,
                    callAccepted: true // Flag to indicate call was accepted from invitation
                  })
                }
              } catch (error) {
                console.log('[CallInviteHandler] Error navigating to call screen:', error)
                showingRef.current = false
                currentCallRef.current = null
                setInvite(null)
              }
            }}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: '#2e7d32',
              alignItems: 'center',
              marginLeft: 10,
              elevation: 2,
              shadowColor: '#2e7d32',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 2,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}


