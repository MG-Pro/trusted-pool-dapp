import { BigNumber } from 'ethers'

export enum PoolStatuses {
  Active = 'Active',
  Finished = 'Finished',
  Unknown = 'Unknown',
}

export interface IParticipant {
  share: number
  claimed: number
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
  _name: string
  _tokenAddress: string
  _tokenName: string
  _creator: string
  _participants: IParticipantResponse[]
  _status: number
}

export interface IParticipantResponse {
  account: string
  description: string
  share: BigNumber
  claimed: BigNumber
}
