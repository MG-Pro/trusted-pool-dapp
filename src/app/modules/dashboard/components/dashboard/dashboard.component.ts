import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { Metamask } from '../../../../types/metamask'
import { ConnectionService } from '../../../../servises/connection.service'
import { Observable, tap } from 'rxjs'
import { GlobalState } from '../../../../types/global-state'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public connectionState$: Observable<GlobalState> = this.connectionService.state$.pipe(
    tap((s) => {
      console.log(s)
    })
  )
  @HostBinding('class') private readonly classes = 'main-layout d-flex h-100 mx-auto flex-column '

  constructor(private connectionService: ConnectionService) {}

  public async ngOnInit(): Promise<void> {}

  public async onConnectWallet(): Promise<void> {
    const mm: Metamask = (window as any).ethereum
    if (!mm) {
      return
    }
    this.connectionService.connect(mm)
  }
}
