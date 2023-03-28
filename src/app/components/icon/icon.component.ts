import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [NgbTooltip],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() public toolTipText = ''
  @Input() public icon = ''
  @Input() public pointer = true
}
