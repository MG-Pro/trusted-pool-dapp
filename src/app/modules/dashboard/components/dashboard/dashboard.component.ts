import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  @HostBinding('class') classes = 'main-layout d-flex h-100 mx-auto flex-column '
}
