import { TrustedPool } from '@app/typechain'
import { ethers, Signer } from 'ethers'

export interface GlobalState {
  networkConnected: boolean
  userConnected?: boolean
  userAccount?: string
  provider?: ethers.providers.Web3Provider
  chainId?: number
  trustedPoolContract?: TrustedPool
  signer?: Signer
}
