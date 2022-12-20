import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { ethers } from 'ethers'

import { ContractAddresses, ContractAddressesKey } from 'src/app/contracts/addresses/addresses'

import abi from 'src/app/contracts/contracts/TrustedPool.sol/TrustedPool.json'
import { TrustedPool } from '../../../../../../typechain-types'
import { Metamask } from '../../../../types/metamask'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public connected = false
  private provider: ethers.providers.Web3Provider | undefined
  private HARDHAT_ID: ContractAddressesKey = 1337
  private mm: Metamask

  @HostBinding('class') classes = 'main-layout d-flex h-100 mx-auto flex-column '

  constructor() {}

  public async ngOnInit(): Promise<void> {
    this.mm = (window as any).ethereum
    if (!this.mm) {
      return
    }
    const [selectedAccount] = await this.mm.request({ method: 'eth_requestAccounts' })
    this.provider = new ethers.providers.Web3Provider(this.mm)
  }

  public async onConnectWallet(): Promise<void> {
    const address: string = ContractAddresses[this.HARDHAT_ID].TrustedPool
    console.log(address)
    await this.provider!.send('eth_requestAccounts', [])
    const signer = this.provider!.getSigner()
    const trustedPoolContract: TrustedPool = new ethers.Contract(
      address,
      abi,
      this.provider
    ) as TrustedPool

    console.log(await trustedPoolContract.getData())
  }

  private checkNetwork(): boolean {
    return this.mm.networkVersion === this.HARDHAT_ID + ''
  }
}
