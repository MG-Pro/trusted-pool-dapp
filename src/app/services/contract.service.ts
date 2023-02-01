import { Injectable } from '@angular/core'
import abi from '@app/contracts/contracts/PooledTemplate.sol/PooledTemplate.json'
import { NotificationService, StatusClasses } from '@app/modules/notification'
import { PooledTemplate, TrustedPool } from '@app/typechain'
import { IParticipant, IPool } from '@app/types'
import { ethers, Signer } from 'ethers'

import { ConnectionService } from './connection.service'
import { GlobalStateService } from './global-state.service'

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(
    private connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private notificationService: NotificationService,
  ) {}

  private get trustedPoolContract(): TrustedPool {
    return this.stateService.state$.value?.trustedPoolContract
  }

  private get signer(): Signer {
    return this.stateService.state$.value?.signer
  }

  private get userAccount(): string {
    return this.stateService.state$.value?.userAccount
  }

  public async createNewPool(poolData: Partial<IPool>): Promise<void> {
    console.log(poolData)
    if (!this.trustedPoolContract) {
      return
    }
    const tokenAddress = poolData.tokenAddress
      ? poolData.tokenAddress
      : ethers.constants.AddressZero
    this.connectionService.setLoadingStatus()

    const participants: IParticipant[] = poolData.participants.map((p) => ({
      ...p,
      description: p.description || '1',
      claimed: 0,
    }))

    try {
      await this.trustedPoolContract.createPooledContract(
        poolData.name,
        tokenAddress,
        poolData.tokenName,
        participants,
      )
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  public async dispatchPoolsData(): Promise<void> {
    if (!this.trustedPoolContract) {
      return
    }
    this.connectionService.setLoadingStatus()
    const poolsAccounts = await this.trustedPoolContract.getContractAddressesByParticipant(
      this.userAccount,
    )
    console.log(poolsAccounts)
    if (poolsAccounts.length) {
      const reqPools = poolsAccounts.map((address) => {
        return (new ethers.Contract(address, abi, this.signer) as PooledTemplate).getData()
      })

      const pools = await Promise.all(reqPools)
      console.log(pools)
    }
    // this.stateService.patchState({
    //   userPools: fakePoolData as IPool[],
    // })
    this.connectionService.setLoadingStatus(false)
  }

  private showError(e): void {
    console.error(e)
    this.notificationService.showMessage(e?.message || 'Error', StatusClasses.danger, 'main')
  }
}
