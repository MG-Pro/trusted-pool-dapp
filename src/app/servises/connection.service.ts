import { Injectable } from '@angular/core'
import { BehaviorSubject, from, Observable } from 'rxjs'
import { GlobalState } from '../types/global-state'
import { ethers, Signer } from 'ethers'
import { ContractAddresses } from '../contracts/addresses/addresses'
import { allowedNetworks } from '../settings'
import { TrustedPool } from '../../../typechain-types'
import abi from '../contracts/contracts/TrustedPool.sol/TrustedPool.json'

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

  constructor() {}

  public async connect(wallet: ethers.providers.ExternalProvider): Promise<void> {
    if (!wallet) {
      return
    }
    this.provider = new ethers.providers.Web3Provider(wallet)
    await this.provider.getNetwork()

    this.setListeners(wallet)
    if (!this.checkNetwork()) {
      return
    }

    await this.provider.send('eth_requestAccounts', [])
    const signer: Signer = this.provider.getSigner()
    console.log(await signer.getAddress())
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

  private checkNetwork(): boolean {
    return this.allowedNetworks.includes(this.provider.network.chainId)
  }

  private getContractAddress(): string {
    return ContractAddresses[this.provider.network.chainId].TrustedPool
  }

  private setListeners(wallet): void {
    wallet.on('accountsChanged', (v) => {
      console.log('accountsChanged', v)
    })

    this.provider.on('chainChanged', (v) => {
      console.log('chainChanged', parseInt(v, 16))
      console.log(this.checkNetwork())
    })
  }
}
