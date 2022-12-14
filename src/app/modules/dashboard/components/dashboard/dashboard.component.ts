import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { ethers } from 'ethers'

import { ContractAddresses, ContractAddressesKey } from '../../../../addresses/addresses'

import artifact from 'src/app/abi/contracts/TrustedPool.sol/TrustedPool.json'
import { TrustedPool } from '../../../../../../typechain-types'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public connected = false
  private provider: ethers.providers.Web3Provider | undefined

  @HostBinding('class') classes = 'main-layout d-flex h-100 mx-auto flex-column '

  constructor() {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      return
    }
    this.provider = new ethers.providers.Web3Provider(ethereum)
  }

  public ngOnInit(): void {}

  public async onConnectWallet(): Promise<void> {
    const chainId: ContractAddressesKey = 1337
    const address: string = ContractAddresses[chainId].TrustedPool
    console.log(address)
    await this.provider!.send('eth_requestAccounts', [])
    const signer = this.provider!.getSigner()
    const trustedPoolContract: TrustedPool = new ethers.Contract(
      address,
      artifact,
      this.provider
    ) as TrustedPool

    console.log(await trustedPoolContract.getData())
  }
}
