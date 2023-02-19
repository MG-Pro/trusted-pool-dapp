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
  creatorAddress: string
  participantsCount: number
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
  participantsCount: BigNumber
}

export interface IParticipantResponse {
  account: string
  description: string
  share: BigNumber
  claimed: BigNumber
  accrued: BigNumber
}

export interface IParticipantLoadParams {
  first: number
  size: number
  mergeMode?: boolean
}
