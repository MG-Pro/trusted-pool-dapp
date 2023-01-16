import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  standalone: true,
  selector: 'app-pool-item',
  templateUrl: './pool-item.component.html',
  styleUrls: ['./pool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolItemComponent {}
