import { ethers } from 'ethers'

export interface Metamask extends ethers.providers.ExternalProvider {
  networkVersion: string
}
