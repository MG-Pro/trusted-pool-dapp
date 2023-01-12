import { ethers } from 'ethers'

export interface Metamask extends ethers.providers.ExternalProvider {
  networkVersion: string
  once(eventName: string | symbol, listener: (...args: unknown[]) => void): this
  on(eventName: string | symbol, listener: (...args: unknown[]) => void): this
  off(eventName: string | symbol, listener: (...args: unknown[]) => void): this
}

export interface ConnectInfo {
  chainId: string
}
