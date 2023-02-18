import { Contract, ethers, Signer } from 'ethers'

import { IPool } from './pool.types'

export interface IGlobalState {
  networkConnected: boolean
  userPools?: IPool[]
  activePool?: IPool
  isLastPools?: boolean
  userConnected?: boolean
  userAccount?: string
  provider?: ethers.providers.Web3Provider
  chainId?: number
  poolFactoryContract?: Contract
  signer?: Signer
}
