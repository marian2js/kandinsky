export type AiResponse = ResponseWithPlugin | ResponseWithFollowUp
export interface ResponseWithPlugin {
  plugin: 'socialRecovery' | 'deadManSwitch'
  parameters: SocialRecoveryProps | DeadManSwitchProps
}
export interface ResponseWithFollowUp {
  followUp: string
}
export interface SocialRecoveryProps {
  contacts: string[]
  minContacts?: number
}
export interface DeadManSwitchProps {
  heir: string
  timeToSwitch: number
}
