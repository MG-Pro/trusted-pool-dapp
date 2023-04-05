import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core'

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingComponent {
  @Input() public transactions: [number, number] = [0, 0]

  @HostBinding('class') private readonly classes: string =
    'card text-bg-dark shadow-lg bg-opacity-75 col-8 '
}
