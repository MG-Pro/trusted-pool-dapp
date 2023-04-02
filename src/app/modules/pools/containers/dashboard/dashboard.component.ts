import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IDashboardLocalState } from '@app/modules/pools/pools.types'
import { ConnectionService, ContractService, GlobalStateService, ModalService } from '@app/services'
import { MAX_POOL_PARTICIPANTS } from '@app/settings'
import {
  ICreatePoolRequestParams,
  IDataLoadParams,
  IGlobalState,
  IParticipantLoadParams,
  IPool,
} from '@app/types'
import { TranslateService } from '@ngx-translate/core'
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
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
  )

  public localState$ = new BehaviorSubject<IDashboardLocalState>({
    showCreatingForm: false,
    activePool: null,
  })

  private readonly defaultPLoadParams: IParticipantLoadParams = {
    first: 0,
    size: 25,
    mergeMode: false,
  }

  private readonly defaultPDataLoadParams: IDataLoadParams = {
    first: 0,
    size: 2,
  }

  private pLoadParams: IParticipantLoadParams = { ...this.defaultPLoadParams }
  private dLoadParams: IDataLoadParams = { ...this.defaultPDataLoadParams }
  private destroyed$ = new Subject<void>()

  constructor(
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private contractService: ContractService,
    private modalService: ModalService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.connectionService.initConnection()
    if (this.connectionService.userConnected) {
      await this.loadData()
    }

    combineLatest([this.route.params, this.userPools$])
      .pipe(
        distinctUntilChanged(([prevParams], [curParams]) => {
          return prevParams.id === curParams.id
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(([params, userPools]) => {
        if (userPools.length) {
          if (params.id) {
            const activePoolId = params.id ? +params.id : 0
            if (userPools[activePoolId]) {
              this.activePoolChange(userPools[activePoolId])
            } else {
              this.router.navigate(['/0'])
            }
          } else {
            this.router.navigate(['/0'])
          }
        }
      })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
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
    if (poolData.participants.length > MAX_POOL_PARTICIPANTS) {
      const tsCount = Math.ceil(poolData.participants.length / MAX_POOL_PARTICIPANTS)
      this.modalService
        .open(
          this.translate.instant('MaxPoolParticipantTsKey', {
            max: MAX_POOL_PARTICIPANTS,
            tsCount,
          }),
        )
        .result.then((res) => {
          console.log(res)
        })
        .catch(() => {})
      return
    }
    poolData.finalized = true
    await this.contractService.createNewPool(
      poolData as ICreatePoolRequestParams,
      poolData.participants,
    )
    await this.loadData()
    this.closeNewForm()
    this.goToActivePool(this.stateService.value.userPools.length - 1)
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

  public goToActivePool(activePool: number): void {
    this.router.navigate(['/', activePool + ''])
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
    console.log(params)
    this.loadData(params)
  }

  private patchLocalState(patch: Partial<IDashboardLocalState>): void {
    this.localState$.next({ ...this.localState$.value, ...patch })
  }

  private async loadData(params: IDataLoadParams = this.defaultPDataLoadParams): Promise<void> {
    this.dLoadParams = { ...this.dLoadParams, ...params }
    await this.contractService.dispatchPoolsData(this.dLoadParams)
  }
}
