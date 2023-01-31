import { Injectable } from '@angular/core'
import { IPool } from '@app/types'

import { fakePoolData } from '../../fakeData/fakePools'

import { ConnectionService } from './connection.service'
import { GlobalStateService } from './global-state.service'

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
      userPools: fakePoolData as IPool[],
    })
    this.connectionService.setLoadingStatus(false)
  }
}
