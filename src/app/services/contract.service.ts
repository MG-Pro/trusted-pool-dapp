import { Injectable } from '@angular/core'
import { IPool, PoolStatuses } from '@app/types'

import { ConnectionService } from './connection.service'
import { GlobalStateService } from './global-state.service'

const fakePoolData: IPool[] = [
  {
    name: 'VC',
    contractAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    tokenAddress: null,
    tokenName: 'BTC',
    tokenAmount: 100_000,
    creatorAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    participants: [
      {
        share: 50_000,
        progress: 0,
        address: '0xa19Ad61447e5EA79bdDCeB037986944c41e198BC',
      },
      {
        share: 50_000,
        progress: 0,
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
    ],
    status: PoolStatuses.Active,
  },
  {
    name: 'VC',
    contractAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1191',
    tokenAddress: null,
    tokenName: 'ETH',
    tokenAmount: 100_000,
    creatorAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    participants: [
      {
        share: 50_000,
        progress: 0,
        address: '0xa19Ad61447e5EA79bdDCeB037986944c41e198BC',
      },
      {
        share: 50_000,
        progress: 0,
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
    ],
    status: PoolStatuses.Active,
  },
]

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(
    private connectionService: ConnectionService,
    private stateService: GlobalStateService,
  ) {}

  public async dispatchPoolsData(): Promise<void> {
    this.connectionService.setLoadingStatus()
    this.stateService.patchState({
      userPools: fakePoolData,
    })
    this.connectionService.setLoadingStatus(false)
  }
}
