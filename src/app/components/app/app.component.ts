import { Component, HostBinding, OnDestroy } from '@angular/core'
import { ConnectionService } from '@app/services'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  @HostBinding('class') private readonly classes = 'd-flex h-100 flex-column'
  constructor(private connectionService: ConnectionService) {}

  public ngOnDestroy(): void {
    this.connectionService.destroy()
  }
}
