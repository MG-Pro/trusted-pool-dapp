import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IDashboardLocalState } from '@app/modules/pools/pools.types'
import { ConnectionService, ContractService, GlobalStateService } from '@app/services'
import { MAX_POOL_PARTICIPANTS } from '@app/settings'
import {
  IDataLoadParams,
  IGlobalState,
  IParticipant,
  IParticipantLoadParams,
  IPool,
} from '@app/types'
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  first,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  @HostBinding('class') private readonly classes = 'main-layout flex-shrink-0 flex-grow-1'

  public state$: Observable<IGlobalState> = this.stateService.state$.pipe(
    tap((state: IGlobalState) => {
      // console.log('state', state)
    }),
  )

  public userPools$: Observable<IPool[]> = this.state$.pipe(
    map((s) => s.userPools),
    filter((userPools) => !!userPools?.length),
    tap((pools) => {
      if (this.localState$.value.activePool) {
        const activePool = pools.find(
          ({ contractAddress }) =>
            contractAddress === this.localState$.value.activePool.contractAddress,
        )
        this.patchLocalState({ activePool })
      }
    }),
  )

  public readonly MAX_POOL_PARTICIPANTS = MAX_POOL_PARTICIPANTS

  public localState$ = new BehaviorSubject<IDashboardLocalState>({
    activePool: null,
    showParticipantsForm: false,
    participants: [],
  })
  private readonly defaultPLoadParams: IParticipantLoadParams = {
    first: 0,
    size: 25,
    mergeMode: false,
  }
  private readonly defaultPDataLoadParams: IDataLoadParams = {
    first: 0,
    size: 50,
    mergeMode: false,
  }
  private pLoadParams: IParticipantLoadParams = { ...this.defaultPLoadParams }
  private dLoadParams: IDataLoadParams = { ...this.defaultPDataLoadParams }

  private destroyed$ = new Subject<void>()

  constructor(
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private contractService: ContractService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public get isOverParticipants(): boolean {
    return this.localState$.value.participants.length > MAX_POOL_PARTICIPANTS
  }

  public async ngOnInit(): Promise<void> {
    this.state$
      .pipe(
        filter(({ userConnected }) => userConnected),
        first(),
      )
      .subscribe(() => {
        this.loadData()
      })

    combineLatest([this.route.params, this.userPools$])
      .pipe(
        distinctUntilChanged(([prevParams], [curParams]) => {
          return prevParams.id === curParams.id
        }),
        filter(([_, userPools]) => !!userPools.length),
        takeUntil(this.destroyed$),
      )
      .subscribe(([params, userPools]) => {
        const activePoolId = params.id ? +params.id : 0
        if (userPools[activePoolId]) {
          this.activePoolChange(userPools[activePoolId])
        } else {
          this.goToPool(0)
        }
      })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public async showCreatingForm(): Promise<void> {
    this.router.navigate(['/new-pool'])
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

  public goToPool(activePool: number): void {
    this.router.navigate(['/pools', activePool])
  }

  public async nextParticipants(pool: IPool): Promise<void> {
    this.pLoadParams = {
      ...this.pLoadParams,
      first: this.pLoadParams.first + this.pLoadParams.size,
      mergeMode: true,
    }
    await this.contractService.dispatchParticipants(pool, this.pLoadParams)
  }

  public nextPools(): void {
    const params = {
      ...this.defaultPDataLoadParams,
      first: this.dLoadParams.first + this.defaultPDataLoadParams.size,
      mergeMode: true,
    }
    this.loadData(params)
  }

  public async finalizePool(): Promise<void> {
    await this.contractService.finalize()
    await this.loadData()
  }

  public async showParticipantsForm(): Promise<void> {
    this.patchLocalState({ showParticipantsForm: true })
  }

  public async closeParticipantsForm(): Promise<void> {
    this.patchLocalState({ showParticipantsForm: false })
  }

  public async addToPool(): Promise<void> {
    await this.contractService.addParticipants(this.localState$.value.participants)
    this.patchLocalState({ participants: [], showParticipantsForm: false })
    await this.loadData()
  }

  public onParticipantsChanges(participants: IParticipant[]): void {
    this.patchLocalState({ participants })
  }

  public onValidnessChanges(participantsValidness: boolean): void {
    this.patchLocalState({ participantsValidness })
  }

  public mapToAccount(participants: IParticipant[] = []): string[] {
    return participants.map((p) => p.account)
  }

  public tokenAmount(participants: IParticipant[]): number {
    return participants.reduce((acc, p) => {
      acc += p.share || 0
      return acc
    }, 0)
  }

  private patchLocalState(patch: Partial<IDashboardLocalState>): void {
    this.localState$.next({ ...this.localState$.value, ...patch })
  }

  private async loadData(params: IDataLoadParams = this.defaultPDataLoadParams): Promise<void> {
    this.dLoadParams = { ...this.dLoadParams, ...params }
    await this.contractService.dispatchPoolsData(this.dLoadParams)
  }
}
