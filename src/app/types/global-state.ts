import { ethers, Signer } from 'ethers'

import { TrustedPool } from '../../../typechain-types'

export interface GlobalState {
  networkConnected: boolean
  userConnected?: boolean
  userAccount?: string
  provider?: ethers.providers.Web3Provider
  chainId?: number
  trustedPoolContract?: TrustedPool
  signer?: Signer
}
