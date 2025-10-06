export const AGORA_APP_ID = '44f5e5b3efb943b59fbd47d2ed26a7db' 
export const AGORA_APP_CERTIFICATE = '57bad18055c94329b21107d8eedc0b9d'
export const AGORA_CHANNEL_PREFIX = 'mediseva'

export const buildChannelName = (suffix) => {
  return `${AGORA_CHANNEL_PREFIX}_${suffix}`
}


