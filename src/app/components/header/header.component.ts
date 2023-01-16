import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core'
import { LogoComponent } from '@app/components/logo/logo.component'

@Component({
  standalone: true,
  imports: [CommonModule, LogoComponent],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() public connected = false
  @Output() public connectWallet = new EventEmitter<void>()

  @HostBinding('class') private readonly classes = 'navbar sticky-top d-flex'

  public onConnectWallet(): void {
    this.connectWallet.emit()
  }
}
