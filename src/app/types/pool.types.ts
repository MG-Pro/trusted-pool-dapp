export enum PoolStatuses {
  Active = 'Active',
  Finished = 'Finished',
}

export interface IParticipant {
  share: number
  claimed: number
  account: string
  description?: string
}

export interface IPool {
  name: string
  contractAddress?: string
  tokenAddress?: string
  tokenName: string
  tokenAmount: number
  creatorAddress: string
  participants: IParticipant[]
  status: PoolStatuses
}
