import RtcEngine, {ChannelProfile, ClientRole} from 'react-native-agora'
import {AGORA_APP_ID} from './agoraConfig'

let engineInstance = null

export const getAgoraEngine = async () => {
  if (engineInstance) return engineInstance
  engineInstance = await RtcEngine.create(AGORA_APP_ID)
  await engineInstance.setChannelProfile(ChannelProfile.LiveBroadcasting)
  await engineInstance.setClientRole(ClientRole.Broadcaster)
  return engineInstance
}

export const destroyAgoraEngine = async () => {
  if (!engineInstance) return
  try {
    await engineInstance?.leaveChannel()
  } finally {
    await engineInstance?.destroy()
    engineInstance = null
  }
}


