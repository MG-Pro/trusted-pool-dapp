import { Injectable } from '@angular/core'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Signer } from 'ethers'
import { BehaviorSubject, from, Observable } from 'rxjs'

import { TrustedPool } from '../../../typechain-types'
import { ContractAddresses } from '../contracts/addresses/addresses'
import abi from '../contracts/contracts/TrustedPool.sol/TrustedPool.json'
import { NotificationService } from '../modules/notification/services/notification.service'
import { StatusClasses } from '../modules/notification/types/notification.types'
import { allowedNetworks } from '../settings'
import { GlobalState } from '../types/global-state'
import { Metamask } from '../types/metamask'

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  public state$: BehaviorSubject<GlobalState> = new BehaviorSubject<GlobalState>({
    connected: false,
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
      this.notificationService.showMessage('Set up Metamask wallet', StatusClasses.danger, '1')
      return
    }

    if (!this.checkNetwork()) {
      this.notificationService.showMessage(
        'App does`t work on this network',
        StatusClasses.danger,
        '1',
      )
      return
    }

    const accs = await this.provider.send('eth_requestAccounts', [])
    console.log(accs)
    const signer: Signer = this.provider.getSigner()

    this.notificationService.showMessage(await signer.getAddress(), StatusClasses.danger, '1')

    const address: string = this.getContractAddress()
    this.trustedPoolContract = new ethers.Contract(address, abi, this.provider) as TrustedPool

    this.patchState({
      connected: true,
      trustedPoolContract: this.trustedPoolContract,
      chainId: this.provider.network.chainId,
      provider: this.provider,
    })
  }

  // public async disconnect(): Promise<void> {
  //   await this.provider.send('wallet_requestPermissions', [])
  // }

  public getData(): Observable<string> {
    return from(this.state$.value?.trustedPoolContract.getData())
  }

  private async init(): Promise<void> {
    this.wallet = await detectEthereumProvider()
    this.provider = new ethers.providers.Web3Provider(this.wallet, 'any')
    await this.provider.getNetwork()

    this.setListeners()
  }

  private patchState(state: Partial<GlobalState>): void {
    this.state$.next({ ...this.state$.value, ...state })
  }

  private async checkConnection(): Promise<void> {
    const accounts = await this.provider.send('eth_accounts', [])
    console.log(accounts)
  }

  private checkNetwork(): boolean {
    return this.allowedNetworks.includes(this.provider.network.chainId)
  }

  private getContractAddress(): string {
    return ContractAddresses[this.provider.network.chainId].TrustedPool
  }

  private setListeners(): void {
    this.wallet.on('accountsChanged', (accounts) => {
      console.log('accountsChanged', accounts)
      this.checkConnection()
    })

    this.provider.on('network', async () => {
      await this.provider.getNetwork()
      this.patchState({
        connected: this.checkNetwork(),
      })
    })
  }
}
