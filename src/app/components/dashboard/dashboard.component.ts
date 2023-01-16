import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { ConnectionService } from '@app/services'
import { IGlobalState } from '@app/types'
import { BehaviorSubject, Observable, tap } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') private readonly classes = 'main-layout d-flex h-100 mx-auto flex-column '

  public connectionState$: Observable<IGlobalState> = this.connectionService.state$.pipe(
    tap((s) => {
      console.log('state', s)
    }),
  )

  public localState$ = new BehaviorSubject({ showCreatingForm: false })

  constructor(private connectionService: ConnectionService) {}

  public async ngOnInit(): Promise<void> {
    console.log()
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

  private patchLocalState(patch): void {
    this.localState$.next({ ...this.localState$.value, ...patch })
  }
}
