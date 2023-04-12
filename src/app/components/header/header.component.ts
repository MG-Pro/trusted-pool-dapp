import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { LogoComponent } from '@app/components/logo/logo.component'
import { IGlobalState } from '@app/types'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  standalone: true,
  imports: [CommonModule, LogoComponent, RouterLink, RouterLinkActive, TranslateModule],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() public state: IGlobalState
  @Input() public loading: boolean
  @Output() public connectWallet = new EventEmitter<void>()

  @HostBinding('class') private readonly classes = 'navbar sticky-top d-flex'

  public onConnectWallet(): void {
    this.connectWallet.emit()
  }
}
