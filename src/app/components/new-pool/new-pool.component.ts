import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-new-pool',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-pool.component.html',
  styleUrls: ['./new-pool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPoolComponent {}
