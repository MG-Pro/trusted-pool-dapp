import { Injectable } from '@angular/core'
import abi from '@app/contracts/abi/contracts/PoolTemplate.sol/PoolTemplate.json'
import { NotificationService, StatusClasses } from '@app/modules/notification'
import {
  ICreatePoolRequestParams,
  IPageParams,
  IParticipant,
  IParticipantLoadParams,
  IParticipantResponse,
  IPool,
  IPoolResponse,
  PoolStatuses,
} from '@app/types'
import { TransactionResponse } from '@ethersproject/abstract-provider/src.ts'
import { Contract, ethers, Signer } from 'ethers'

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

  private get poolFactoryContract(): Contract {
    return this.stateService.state$.value?.poolFactoryContract
  }

  private get signer(): Signer {
    return this.stateService.state$.value?.signer
  }

  private get userAccount(): string {
    return this.stateService.state$.value?.userAccount
  }

  public async createNewPool(
    poolData: ICreatePoolRequestParams,
    participants: Partial<IParticipant>[],
  ): Promise<void> {
    if (!this.checkContract()) {
      return
    }
    this.connectionService.setLoadingStatus()

    const tokenAddress = poolData.tokenAddress
      ? poolData.tokenAddress
      : ethers.constants.AddressZero

    const approver = poolData.approverAddress
      ? poolData.approverAddress
      : ethers.constants.AddressZero

    try {
      const tr: TransactionResponse = await this.poolFactoryContract.createPoolContract(
        {
          approver,
          tokenAddress,
          name: poolData.name,
          tokenName: poolData.tokenName,
          privatable: poolData.privatable,
          finalized: poolData.finalized,
          stableApproverFee: poolData.stableApproverFee,
        },
        participants.map(({ account }) => account),
        participants.map(({ share }) => share),
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
      const tr: TransactionResponse = await this.getPoolTemplateInstance(
        pool.contractAddress,
      ).setTokenAddress(tokenAddress)
      await tr.wait()
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  public async claimToken(pool: IPool): Promise<void> {
    this.connectionService.setLoadingStatus()
    try {
      const tr: TransactionResponse = await this.getPoolTemplateInstance(
        pool.contractAddress,
      ).claimTokens()
      await tr.wait()
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  public async dispatchPoolsData(params: IPageParams): Promise<void> {
    if (!this.checkContract()) {
      return
    }
    this.connectionService.setLoadingStatus()

    try {
      const poolsAccounts: string[] = await this.loadPoolAddresses(params)

      if (poolsAccounts.length) {
        const reqPools = poolsAccounts.map((poolAccount: string) => {
          return this.loadPoolData(poolAccount)
        })
        const userPools: IPool[] = await Promise.all(reqPools)

        this.stateService.patchState({
          userPools,
        })
      }
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  public async dispatchParticipants(
    { contractAddress }: IPool,
    params: IParticipantLoadParams,
  ): Promise<void> {
    this.connectionService.setLoadingStatus(true)
    try {
      const participants: IParticipantResponse[] = await this.getPoolTemplateInstance(
        contractAddress,
      ).getParticipants(params.first, params.size)

      this.stateService.patchState({
        userPools: this.stateService.state$.value.userPools.map((poolItem: IPool) => {
          if (poolItem.contractAddress === contractAddress) {
            const ps: IParticipant[] = participants.map((p) => this.participantMapper(p))

            poolItem.participants = params.mergeMode ? [...poolItem.participants, ...ps] : ps
          }
          return poolItem
        }),
      })
    } catch (e) {
      this.showError(e)
    } finally {
      this.connectionService.setLoadingStatus(false)
    }
  }

  private async loadPoolData(poolAccount: string): Promise<IPool> {
    const poolTemplateInstance: Contract = this.getPoolTemplateInstance(poolAccount)
    const res: IPoolResponse = await poolTemplateInstance.getPoolData()
    const finalized: boolean = await poolTemplateInstance.finalized()
    return this.poolMapper(res, finalized, poolAccount)
  }

  private async loadPoolAddresses(params: IPageParams): Promise<string[]> {
    return this.poolFactoryContract.findPoolsByParticipant(
      this.userAccount,
      params.first,
      params.size,
    )
  }

  private poolMapper(item: IPoolResponse, finalized: boolean, poolAccount: string): IPool {
    const tokenAddress =
      item.tokenAddress !== ethers.constants.AddressZero ? item.tokenAddress?.toLowerCase() : null

    return {
      finalized,
      name: ethers.utils.parseBytes32String(item.name),
      contractAddress: poolAccount?.toLowerCase(),
      tokenAddress,
      tokenName: ethers.utils.parseBytes32String(item.tokenName),
      filledAmount: item.filledAmount.toNumber(),
      adminAddress: item.admin?.toLowerCase(),
      approved: item.approved,
      approverAddress: item.approver,
      privatable: item.privatable,
      status: this.convertStatus(item.filledAmount.toNumber(), item.tokenAmount.toNumber()),
      tokenAmount: item.tokenAmount.toNumber(),

      participantsCount: item.participantsCount.toNumber(),
      participants: [],
    }
  }

  private participantMapper(p: IParticipantResponse): IParticipant {
    return {
      ...p,
      account: p.account.toLowerCase(),
      share: p.share.toNumber(),
      claimed: p.claimed.toNumber(),
      accrued: p.accrued.toNumber(),
    }
  }

  private convertStatus(filledAmount: number, tokenAmount: number): PoolStatuses {
    return tokenAmount > filledAmount ? PoolStatuses.Active : PoolStatuses.Filled
  }

  private showError(e): void {
    console.error(e)
    this.notificationService.showMessage(e?.message || 'Error', StatusClasses.danger, 'main')
  }

  private checkContract(): boolean {
    if (!this.poolFactoryContract) {
      this.showError({ message: 'TrustedPoolContract is not deployed' })
      return false
    }
    return true
  }

  private getPoolTemplateInstance(address: string): Contract {
    return new Contract(address, abi, this.signer)
  }
}
