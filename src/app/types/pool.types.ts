import { BigNumber } from 'ethers'

export enum PoolStatuses {
  Active = 'Active',
  Finished = 'Finished',
  Unknown = 'Unknown',
}

export interface IParticipant {
  share: number
  claimed: number
  accrued: number
  account: string
  description: string
}

export interface IPool {
  name: string
  contractAddress?: string
  tokenAddress?: string
  tokenName: string
  tokenAmount: number
  filled?: number
  creatorAddress: string
  participants: IParticipant[]
  status: PoolStatuses
}

export interface IPoolResponse {
  name: string
  tokenAddress: string
  tokenName: string
  creator: string
  status: number
  tokenAmount: BigNumber
  participants: IParticipantResponse[]
}

export interface IParticipantResponse {
  account: string
  description: string
  share: BigNumber
  claimed: BigNumber
  accrued: BigNumber
}

export interface IPoolsLoadParams {
  poolFirst: number
  poolSize: number
  participantFirst: number
  participantSize: number
}
