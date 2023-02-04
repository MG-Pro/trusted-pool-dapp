import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { ConnectionService, ContractService, GlobalStateService } from '@app/services'
import { IGlobalState, IPool } from '@app/types'
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

  constructor(
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private contractService: ContractService,
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.connectionService.initConnection()
    await this.contractService.dispatchPoolsData()
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
    await this.contractService.dispatchPoolsData()
    this.onCloseNewForm()
  }

  public async onTokenAddressChange(eventData: [string, IPool]): Promise<void> {
    await this.contractService.setTokenContract(eventData[0])
  }

  public async onClaimTokens(pool: IPool): Promise<void> {
    await this.contractService.claimToken()
  }

  private patchLocalState(patch): void {
    this.localState$.next({ ...this.localState$.value, ...patch })
  }
}
