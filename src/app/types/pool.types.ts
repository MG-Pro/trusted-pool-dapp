import { BytesLike } from '@ethersproject/bytes'
import { BigNumber } from 'ethers'

export enum PoolStatuses {
  Active = 'Active',
  Filled = 'Filled',
  NoFinalized = 'NoFinalized',
  WaitApprove = 'WaitApprove',
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
  finalized: boolean
  status: PoolStatuses
}

export interface ICreatePoolRequestParams {
  name: string
  tokenAddress?: string
  tokenName: string
  approverAddress: string
  privatable: boolean
  finalized: boolean
  stableApproverFee?: number
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

export interface IPageParams {
  first: number
  size: number
}

export interface IParticipantLoadParams extends IPageParams {
  mergeMode?: boolean
}

export type IDataLoadParams = IParticipantLoadParams
