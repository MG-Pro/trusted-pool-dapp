import { Component, OnDestroy } from '@angular/core'

import { ConnectionService } from '../../../../services/connection.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  constructor(private connectionService: ConnectionService) {}

  public ngOnDestroy(): void {
    this.connectionService.destroy()
  }
}
