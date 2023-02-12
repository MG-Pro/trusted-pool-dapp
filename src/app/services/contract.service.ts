import { Injectable } from '@angular/core'
import abi from '@app/contracts/abi/contracts/PooledTemplate.sol/PooledTemplate.json'
import { PooledTemplate, TrustedPool } from '@app/contracts/typechain-types'
import { NotificationService, StatusClasses } from '@app/modules/notification'
import { IParticipant, IPool, IPoolResponse, PoolStatuses } from '@app/types'
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
    if (!this.checkContract()) {
      return
    }
    this.connectionService.setLoadingStatus()

    const tokenAddress = poolData.tokenAddress
      ? poolData.tokenAddress
      : ethers.constants.AddressZero

    const participants: IParticipant[] = poolData.participants.map((p) => ({
      ...p,
      description: p.description || '1',
      claimed: 0,
      accrued: 0,
    }))

    try {
      const tr = await this.trustedPoolContract.createPooledContract(
        poolData.name,
        tokenAddress,
        poolData.tokenName,
        participants,
      )
      await tr.wait()
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  public async setTokenContract(tokenAddress: string, pool: IPool): Promise<void> {
    this.connectionService.setLoadingStatus()
    try {
      await this.getPooledTemplateInstance(pool.contractAddress).setTokenAddress(tokenAddress)
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  public async claimToken(): Promise<void> {}

  public async dispatchPoolsData(): Promise<void> {
    if (!this.checkContract()) {
      return
    }
    this.connectionService.setLoadingStatus()

    const poolsAccounts: string[] =
      await this.trustedPoolContract.getContractAddressesByParticipant(this.userAccount)

    if (poolsAccounts.length) {
      const reqPools = poolsAccounts.map((address: string) => {
        return this.getPooledTemplateInstance(address).getPoolData(0, 10)
      })

      try {
        const res: IPoolResponse[] = await Promise.all(reqPools)
        this.stateService.patchState({
          userPools: this.poolMapper(res, poolsAccounts),
        })
      } catch (e) {
        this.showError(e)
      } finally {
        this.connectionService.setLoadingStatus(false)
      }
    } else {
      this.connectionService.setLoadingStatus(false)
    }
  }

  private poolMapper(response: IPoolResponse[], poolsAccounts: string[]): IPool[] {
    return response.map((item, i) => {
      const participants: IParticipant[] = item.participants.map((p) => ({
        ...p,
        account: p.account.toLowerCase(),
        share: p.share.toNumber(),
        claimed: p.claimed.toNumber(),
        accrued: p.accrued.toNumber(),
      }))

      return {
        contractAddress: poolsAccounts[i]?.toLowerCase(),
        name: item.name,
        tokenName: item.tokenName,
        tokenAddress: item.tokenAddress?.toLowerCase(),
        creatorAddress: item.creator?.toLowerCase(),
        status: this.convertStatus(item.status),
        filled: this.getAmount(participants, 'claimed'),
        tokenAmount: this.getAmount(participants, 'share'),
        participants,
      }
    })
  }

  private convertStatus(status: number): PoolStatuses {
    switch (status) {
      case 0:
        return PoolStatuses.Active
      case 1:
        return PoolStatuses.Finished
      default:
        return PoolStatuses.Unknown
    }
  }

  private getAmount(participants: IParticipant[], field: 'claimed' | 'share'): number {
    return participants.reduce((acc, p) => {
      return acc + p[field]
    }, 0)
  }

  private showError(e): void {
    console.error(e)
    this.notificationService.showMessage(e?.message || 'Error', StatusClasses.danger, 'main')
  }

  private checkContract(): boolean {
    if (!this.trustedPoolContract) {
      this.showError({ message: 'TrustedPoolContract is not deployed' })
      return false
    }
    return true
  }

  private getPooledTemplateInstance(address: string): PooledTemplate {
    return new ethers.Contract(address, abi, this.signer) as PooledTemplate
  }
}
