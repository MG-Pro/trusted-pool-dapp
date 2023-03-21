import { BytesLike } from '@ethersproject/bytes'
import { BigNumber } from 'ethers'

export enum PoolStatuses {
  Active = 'Active',
  Filled = 'Filled',
}

export interface IParticipant {
  share: number
  claimed: number
  accrued: number
  account: string
}

export interface IPool {
  name: string
  contractAddress?: string
  tokenAddress?: string
  tokenName: string
  tokenAmount: number
  filledAmount: number
  adminAddress: string
  participantsCount: number
  participants: IParticipant[]
  approverAddress: string
  privatable: boolean
  approved: boolean
  status: PoolStatuses
}

export interface ICreatePoolRequest {
  name: string
  tokenAddress?: string
  tokenName: string
  participants: string[]
  shares: number[]
  approverAddress: string
  privatable: boolean
  finalized: boolean
}

export interface IPoolResponse {
  name: BytesLike
  tokenAddress: string
  tokenName: BytesLike
  admin: string
  tokenAmount: BigNumber
  filledAmount: BigNumber
  approver: string
  privatable: boolean
  approved: boolean
  participantsCount: BigNumber
}

export interface IParticipantResponse {
  account: string
  share: BigNumber
  claimed: BigNumber
  accrued: BigNumber
}

export interface IParticipantLoadParams {
  first: number
  size: number
  mergeMode?: boolean
}
