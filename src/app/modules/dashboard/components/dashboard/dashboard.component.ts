import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core'
import { Observable, tap } from 'rxjs'

import { ConnectionService } from '../../../../servises/connection.service'
import { GlobalState } from '../../../../types/global-state'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') private readonly classes = 'main-layout d-flex h-100 mx-auto flex-column '

  public connectionState$: Observable<GlobalState> = this.connectionService.state$.pipe(
    tap((s) => {
      console.log('f', s.provider)
    }),
  )

  constructor(private connectionService: ConnectionService) {}

  public async ngOnInit(): Promise<void> {
    console.log()
  }

  public async onConnectWallet(): Promise<void> {
    this.connectionService.connect()
  }
}
