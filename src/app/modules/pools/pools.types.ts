import { IParticipant, IPool } from '@app/types'

export interface IDashboardLocalState {
  activePool: IPool
  showAddParticipants: boolean
  participants?: IParticipant[]
  participantsValidness?: boolean
}
