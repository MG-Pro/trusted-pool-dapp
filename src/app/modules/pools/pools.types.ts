import { IParticipant, IPool } from '@app/types'

export interface IDashboardLocalState {
  activePool: IPool
  showParticipantsForm: boolean
  participants: IParticipant[]
  participantsValidness?: boolean
}
