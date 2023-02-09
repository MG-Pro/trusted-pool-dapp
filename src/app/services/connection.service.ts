import { Injectable } from '@angular/core'
import { ContractAddresses } from '@app/contracts/addresses/addresses'
import abi from '@app/contracts/contracts/TrustedPool.sol/TrustedPool.json'
import { allowedNetworks } from '@app/settings'
import { TrustedPool } from '@app/typechain'
import { IMetamask } from '@app/types'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Signer } from 'ethers'
import { BehaviorSubject } from 'rxjs'

import { NotificationService, StatusClasses } from '../modules/notification'

import { GlobalStateService } from './global-state.service'

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  public loading$ = new BehaviorSubject(false)

  private provider: ethers.providers.Web3Provider
  private trustedPoolContract: TrustedPool
  private allowedNetworks: number[] = allowedNetworks
  private wallet: IMetamask

  constructor(
    private notificationService: NotificationService,
    private stateService: GlobalStateService,
  ) {}

  public async connect(): Promise<void> {
    if (!this.wallet?.isMetaMask) {
      return this.notificationService.showMessage(
        'Please, install Metamask wallet',
        StatusClasses.danger,
        'main',
      )
    }
    this.setLoadingStatus()
    const accounts = await this.getAccountConnection()

    if (!this.checkNetwork()) {
      return this.wrongNetworkMessage()
    }

    if (!accounts.length) {
      return this.wrongAccountMessage()
    }

    this.trustedPoolContract = await this.getContract()

    const signer: Signer = this.provider.getSigner()
    this.stateService.patchState({
      userConnected: true,
      trustedPoolContract: this.trustedPoolContract,
      userAccount: accounts[0]?.toLowerCase(),
      signer,
    })
    this.setLoadingStatus(false)
  }

  public disconnect(): void {
    this.stateService.patchState({
      userConnected: false,
    })
  }

  public destroy(): void {
    this.wallet.removeAllListeners('accountsChanged')
    this.provider.removeAllListeners('network')
  }

  public async initConnection(): Promise<void> {
    this.setLoadingStatus(true)
    this.wallet = await detectEthereumProvider({ mustBeMetaMask: true })
    if (!this.wallet) {
      return
    }
    this.provider = new ethers.providers.Web3Provider(this.wallet, 'any')
    await this.provider.getNetwork()

    this.stateService.patchState({
      networkConnected: true,
      chainId: this.provider.network.chainId,
      provider: this.provider,
    })
    this.setListeners()

    const accounts = await this.provider.send('eth_accounts', [])
    if (accounts.length) {
      await this.connect()
    }
    this.setLoadingStatus(false)
  }

  public setLoadingStatus(status = true): void {
    this.loading$.next(status)
  }

  private async getAccountConnection(): Promise<string[]> {
    return this.provider.send('eth_requestAccounts', [])
  }

  private checkNetwork(): boolean {
    return this.allowedNetworks.includes(this.provider.network?.chainId)
  }

  private async getContract(): Promise<TrustedPool> {
    const address = ContractAddresses[this.provider.network.chainId].TrustedPool
    try {
      if ((await this.provider.getCode(address)) === '0x') {
        return null
      }
    } catch (e) {
      return null
    }
    const contract = new ethers.Contract(address, abi, this.provider.getSigner()) as TrustedPool

    if (await contract.deployed()) {
      return contract
    }

    return null
  }

  private setListeners(): void {
    this.wallet.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length) {
        this.connect()
      } else {
        this.disconnect()
        this.wrongAccountMessage()
      }
    })

    this.provider.on('network', async () => {
      await this.provider.getNetwork()
      const isRightNetwork = this.checkNetwork()
      this.stateService.patchState({
        networkConnected: isRightNetwork,
        userConnected: isRightNetwork,
      })
      if (!isRightNetwork) {
        return this.wrongNetworkMessage()
      }
      await this.connect()
    })
  }

  private wrongNetworkMessage(name: string = ''): void {
    const message = name ? 'App does`t work on network ' + name : 'App does`t work on this network'

    this.notificationService.showMessage(message, StatusClasses.danger, 'main')
  }

  private wrongAccountMessage(): void {
    this.notificationService.showMessage(
      'Please, change or create account',
      StatusClasses.danger,
      'main',
    )
  }
}
