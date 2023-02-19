import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { LocalState } from '@app/components/dashboard/dashboard.types'
import { ConnectionService, ContractService, GlobalStateService } from '@app/services'
import { IGlobalState, IParticipantLoadParams, IPool } from '@app/types'
import { BehaviorSubject, filter, map, Observable, tap } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') private readonly classes = 'main-layout flex-shrink-0 flex-grow-1'

  public state$: Observable<IGlobalState> = this.stateService.state$.pipe(
    tap((state: IGlobalState) => {
      // console.log('state', state)
    }),
  )

  public userPools$: Observable<IPool[]> = this.state$.pipe(
    map((s) => s.userPools),
    filter((userPools) => !!userPools?.length),
    tap((userPools: IPool[]) => {
      console.log('userPools', userPools)
      const activePool = userPools.find(
        ({ contractAddress }) =>
          this.localState$.value.activePool?.contractAddress === contractAddress,
      )
      if (activePool) {
        this.patchLocalState({ activePool })
      }
    }),
  )

  public localState$ = new BehaviorSubject<LocalState>({
    showCreatingForm: false,
    activePool: null,
  })

  private readonly defaultPLoadParams: IParticipantLoadParams = {
    first: 0,
    size: 9,
    mergeMode: false,
  }

  private pLoadParams: IParticipantLoadParams = { ...this.defaultPLoadParams }

  constructor(
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private contractService: ContractService,
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.connectionService.initConnection()
    if (this.connectionService.userConnected) {
      await this.loadData()
    }
  }

  public async onConnectWallet(): Promise<void> {
    await this.connectionService.connect()
  }

  public async showCreatingForm(): Promise<void> {
    this.patchLocalState({ showCreatingForm: true })
  }

  public closeNewForm(): void {
    this.patchLocalState({ showCreatingForm: false })
  }

  public async saveNewForm(poolData: Partial<IPool>): Promise<void> {
    await this.contractService.createNewPool(poolData)
    await this.loadData()
    this.closeNewForm()
  }

  public async tokenAddressChange(eventData: [string, IPool]): Promise<void> {
    await this.contractService.setTokenContract(eventData[0], eventData[1])
    await this.loadData()
  }

  public async claimTokens(pool: IPool): Promise<void> {
    await this.contractService.claimToken(pool)
    await this.loadData()
  }

  public activePoolChange(activePool: IPool): void {
    this.patchLocalState({ activePool })
    this.pLoadParams = { ...this.defaultPLoadParams }
    this.contractService.dispatchParticipants(activePool, this.pLoadParams)
  }

  public async nextParticipants(pool: IPool): Promise<void> {
    this.pLoadParams = {
      ...this.pLoadParams,
      first: this.pLoadParams.first + this.pLoadParams.size,
      mergeMode: true,
    }
    await this.contractService.dispatchParticipants(pool, this.pLoadParams)
  }

  private patchLocalState(patch: Partial<LocalState>): void {
    this.localState$.next({ ...this.localState$.value, ...patch })
  }

  private async loadData(): Promise<void> {
    await this.contractService.dispatchPoolsData()

    if (this.stateService.value.userPools.length) {
      this.activePoolChange(this.stateService.value.userPools[0])
    }
  }
}
