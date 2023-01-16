import { IUser } from './user.types'

export enum PoolStatuses {
  Active = 'Active',
  Finished = 'Finished',
}

export interface IParticipantShare {
  participant: IUser
  share: number
  progress: number
}

export interface IPool {
  name: string
  contractAddress: string
  tokenAddress: string
  tokenName: string
  tokenAmount: number
  participantShares: IParticipantShare[]
  creator: IUser
  participants: IUser[]
  status: PoolStatuses
}
