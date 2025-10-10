import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Modal, Text, TouchableOpacity, View } from 'react-native'
import RtmService from './rtmService'
import { useLogin } from './LoginProvider'
import { COLORS } from '../Theme/Colors'
import { AGORA_APP_ID } from './agoraConfig'

type IncomingPayload = {
    callId: string
    callerId: string
    callerName?: string
    callType: 'audio' | 'video'
    receiverId: string
}

type CallContextType = {
    incoming?: IncomingPayload | null
    setIncoming: React.Dispatch<React.SetStateAction<IncomingPayload | null>>
}

const CallContext = createContext<Partial<CallContextType>>({})

export const useCallCenter = () => useContext(CallContext)

const IncomingCallModal = ({ visible, onAccept, onDecline, callerName, callType }: any) => {
    return (
        <Modal visible={visible} transparent animationType='fade'>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: '80%', backgroundColor: COLORS.white, borderRadius: 12, padding: 16 }}>
                    <Text style={{ fontSize: 16, color: COLORS.black, marginBottom: 6 }}>Incoming {callType} call</Text>
                    <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: '600', marginBottom: 16 }}>{callerName || 'Unknown'}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={onDecline} style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: 8, backgroundColor: COLORS.red, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.white }}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onAccept} style={{ flex: 1, marginLeft: 8, padding: 12, borderRadius: 8, backgroundColor: COLORS.green, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.white }}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useLogin()
    const [incoming, setIncoming] = useState<IncomingPayload | null>(null)

    useEffect(() => {
        const setup = async () => {
            // Initialize and login to RTM when user is available
            if (!user?.id && !user?._id) return
            await RtmService.initialize(AGORA_APP_ID)
            await RtmService.login(String(user?.id || user?._id))
        }
        setup()
    }, [user?.id, user?._id])

    useEffect(() => {
        const offInvite = RtmService.on('call_invite', (payload: IncomingPayload) => {
            setIncoming(payload)
        })
        const offCancel = RtmService.on('call_cancelled', () => {
            setIncoming(null)
        })
        return () => {
            offInvite()
            offCancel()
        }
    }, [])

    const onAccept = async () => {
        // Placeholder: integrate navigation to VideoCall if available
        setIncoming(null)
    }

    const onDecline = async () => {
        setIncoming(null)
    }

    const value = useMemo(() => ({ incoming, setIncoming }), [incoming])

    return (
        <CallContext.Provider value={value}>
            {children}
            <IncomingCallModal
                visible={!!incoming}
                callerName={incoming?.callerName}
                callType={incoming?.callType}
                onAccept={onAccept}
                onDecline={onDecline}
            />
        </CallContext.Provider>
    )
}

export default CallProvider


