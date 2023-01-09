import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core'

@Component({
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
