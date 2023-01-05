import { ethers } from 'ethers'

import { TrustedPool } from '../../../typechain-types'

export interface GlobalState {
  connected: boolean
  provider?: ethers.providers.Web3Provider
  chainId?: number
  trustedPoolContract?: TrustedPool
}
