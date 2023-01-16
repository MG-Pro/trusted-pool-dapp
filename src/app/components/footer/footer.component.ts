import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'
import { LogoComponent } from '@app/components/logo/logo.component'

@Component({
  standalone: true,
  imports: [LogoComponent],
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Input() public contactsLink = '/'

  @HostBinding('class') private readonly classes = 'd-flex p-3'
}
