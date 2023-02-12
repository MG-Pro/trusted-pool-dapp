import { TrustedPool } from '@app/contracts/typechain-types'
import { ethers, Signer } from 'ethers'

import { IPool } from './pool.types'

export interface IGlobalState {
  networkConnected: boolean
  userPools: IPool[]
  userConnected?: boolean
  userAccount?: string
  provider?: ethers.providers.Web3Provider
  chainId?: number
  trustedPoolContract?: TrustedPool
  signer?: Signer
}
