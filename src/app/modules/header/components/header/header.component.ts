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
  @HostBinding('class') private classes = 'navbar sticky-top d-flex'
  @Input() public connected = false
  @Output() public connectWallet = new EventEmitter<void>()

  public onConnectWallet(): void {
    this.connectWallet.emit()
  }
}
