import { Contract, ethers, Signer } from 'ethers'

import { IPool } from './pool.types'

export interface IGlobalState {
  initialized: boolean
  networkConnected: boolean
  userPools: IPool[]
  isLastPools?: boolean
  userConnected?: boolean
  userAccount?: string
  provider?: ethers.providers.Web3Provider
  chainId?: number
  poolFactoryContract?: Contract
  signer?: Signer
  canCreatePool: boolean
}
