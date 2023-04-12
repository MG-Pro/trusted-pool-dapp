import { IParticipant } from '@app/types'

export type AsyncFnType<T = boolean> = () => Promise<T>

export interface ICreatingPoolProcessing {
  active: boolean
  pending: boolean
  currentTs: number
  countTS: number
  tsCalls: AsyncFnType[]
}

export interface INewPoolState {
  participants: IParticipant[]
  formDisabled: boolean
  participantsValidness: boolean
}
