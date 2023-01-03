import { Injectable } from '@angular/core'
import { BehaviorSubject, from, Observable } from 'rxjs'
import { GlobalState } from '../types/global-state'
import { ethers, Signer } from 'ethers'
import { ContractAddresses } from '../contracts/addresses/addresses'
import { allowedNetworks } from '../settings'
import { TrustedPool } from '../../../typechain-types'
import abi from '../contracts/contracts/TrustedPool.sol/TrustedPool.json'
import { Network } from '@ethersproject/networks'
import detectEthereumProvider from '@metamask/detect-provider'
import { Metamask } from '../types/metamask'
import { NotificationService } from '../modules/notification/services/notification.service'
import { StatusClasses } from '../modules/notification/types/notification.types'

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

  constructor(private notificationService: NotificationService) {
    this.notificationService.showMessage('Connected!', null, '1', 1000 * 60)
  }

  public async connect(): Promise<void> {
    const wallet: Metamask = await detectEthereumProvider()
    if (!wallet) {
      return
    }

    this.provider = new ethers.providers.Web3Provider(wallet, 'any')
    await this.provider.getNetwork()

    this.setListeners(wallet)
    if (!this.checkNetwork()) {
      return
    }

    await this.provider.send('eth_requestAccounts', [])
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

  public getData(): Observable<string> {
    return from(this.state$.value?.trustedPoolContract.getData())
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

  private setListeners(wallet): void {
    wallet.on('accountsChanged', (accounts) => {
      console.log('accountsChanged', accounts)
    })

    this.provider.on('network', async () => {
      await this.provider.getNetwork()
      console.log(this.checkNetwork())
    })
  }
}
