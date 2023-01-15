import { Injectable } from '@angular/core'
import { ContractAddresses } from '@app/contracts/addresses/addresses'
import abi from '@app/contracts/contracts/TrustedPool.sol/TrustedPool.json'
import { allowedNetworks } from '@app/settings'
import { TrustedPool } from '@app/typechain'
import { GlobalState, Metamask } from '@app/types'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Signer } from 'ethers'
import { BehaviorSubject, from, Observable } from 'rxjs'

import { NotificationService, StatusClasses } from '../modules/notification'

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  public state$: BehaviorSubject<GlobalState> = new BehaviorSubject<GlobalState>({
    networkConnected: false,
  })
  private provider: ethers.providers.Web3Provider
  private trustedPoolContract: TrustedPool
  private allowedNetworks: number[] = allowedNetworks
  private wallet: Metamask

  constructor(private notificationService: NotificationService) {
    this.init()
  }

  public async connect(): Promise<void> {
    if (!this.wallet?.isMetaMask) {
      return this.notificationService.showMessage(
        'Please, install Metamask wallet',
        StatusClasses.danger,
        'main',
      )
    }

    if (!this.checkNetwork()) {
      return this.wrongNetworkMessage()
    }
    const accounts = await this.getAccountConnection()

    if (!accounts.length) {
      return this.wrongAccountMessage()
    }

    const address: string = this.getContractAddress()
    this.trustedPoolContract = new ethers.Contract(address, abi, this.provider) as TrustedPool
    const signer: Signer = this.provider.getSigner()
    this.patchState({
      userConnected: true,
      trustedPoolContract: this.trustedPoolContract,
      userAccount: accounts[0],
      signer,
    })
  }

  public getData(): Observable<string> {
    return from(this.state$.value?.trustedPoolContract.getData())
  }

  public disconnect(): void {
    this.patchState({
      userConnected: false,
    })
  }

  public destroy(): void {
    this.wallet.removeAllListeners('accountsChanged')
    this.provider.removeAllListeners('network')
  }

  private async init(): Promise<void> {
    this.wallet = await detectEthereumProvider()
    this.provider = new ethers.providers.Web3Provider(this.wallet, 'any')
    await this.provider.getNetwork()
    const accounts = await this.provider.send('eth_accounts', [])

    this.patchState({
      networkConnected: true,
      chainId: this.provider.network.chainId,
      provider: this.provider,
    })
    this.setListeners()

    if (accounts.length) {
      await this.connect()
    }
  }

  private patchState(state: Partial<GlobalState>): void {
    this.state$.next({ ...this.state$.value, ...state })
  }

  private async getAccountConnection(): Promise<string[]> {
    return this.provider.send('eth_requestAccounts', [])
  }

  private checkNetwork(): boolean {
    return this.allowedNetworks.includes(this.provider.network?.chainId)
  }

  private getContractAddress(): string {
    return ContractAddresses[this.provider.network.chainId].TrustedPool
  }

  private setListeners(): void {
    this.wallet.on('accountsChanged', (accounts: string[]) => {
      console.log('accountsChanged', accounts)
      if (accounts.length) {
        this.connect()
      } else {
        this.disconnect()
        this.wrongAccountMessage()
      }
    })

    this.provider.on('network', async () => {
      console.log('network')
      await this.provider.getNetwork()
      const isRightNetwork = this.checkNetwork()
      this.patchState({
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
