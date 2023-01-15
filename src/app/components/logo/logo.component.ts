import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  @Input() public size: '2' | '6' = '2'

  public get letterSize(): string {
    switch (this.size) {
      case '2':
        return '1'
      case '6':
        return '5'
      default:
        return ''
    }
  }
}
