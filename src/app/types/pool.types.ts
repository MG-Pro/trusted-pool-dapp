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
  description: string
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

export interface IPoolResponse {
  name: string
  tokenAddress: string
  tokenName: string
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
