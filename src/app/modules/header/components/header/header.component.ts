import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @HostBinding('class') classes = 'navbar sticky-top d-flex'

  public onConnectWallet(): void {}
}
