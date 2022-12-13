import { Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @HostBinding('class') classes = 'd-flex p-3'
  @Input() public contactsLink: string = '/'
}
