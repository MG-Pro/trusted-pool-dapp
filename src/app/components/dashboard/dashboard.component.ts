import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { ConnectionService, ContractService, GlobalStateService } from '@app/services'
import { IGlobalState, IPool, IPoolsLoadParams } from '@app/types'
import { BehaviorSubject, Observable, tap } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') private readonly classes = 'main-layout flex-shrink-0 flex-grow-1'

  public connectionState$: Observable<IGlobalState> = this.stateService.state$.pipe(
    tap((s) => {
      console.log('state', s)
    }),
  )

  public localState$ = new BehaviorSubject({ showCreatingForm: false })

  private loadParams: IPoolsLoadParams = {
    poolFirst: 0,
    poolSize: 10,
    participantFirst: 0,
    participantSize: 25,
  }

  constructor(
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private contractService: ContractService,
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.connectionService.initConnection()
    if (this.connectionService.userConnected) {
      await this.contractService.dispatchPoolsData(this.loadParams)
    }
  }

  public async onConnectWallet(): Promise<void> {
    await this.connectionService.connect()
  }

  public async showCreatingForm(): Promise<void> {
    this.patchLocalState({ showCreatingForm: true })
  }

  public onCloseNewForm(): void {
    this.patchLocalState({ showCreatingForm: false })
  }

  public async onSaveNewForm(poolData: Partial<IPool>): Promise<void> {
    await this.contractService.createNewPool(poolData)
    await this.contractService.dispatchPoolsData(this.loadParams)
    this.onCloseNewForm()
  }

  public async onTokenAddressChange(eventData: [string, IPool]): Promise<void> {
    await this.contractService.setTokenContract(eventData[0], eventData[1]).then(() => {
      this.contractService.dispatchPoolsData(this.loadParams)
    })
  }

  public async onClaimTokens(pool: IPool): Promise<void> {
    await this.contractService.claimToken()
  }

  private patchLocalState(patch): void {
    this.localState$.next({ ...this.localState$.value, ...patch })
  }
}
