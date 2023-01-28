import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { PoolItemComponent } from '@app/components/pool-item/pool-item.component'
import { IPool } from '@app/types'

@Component({
  selector: 'app-pools',
  standalone: true,
  imports: [CommonModule, PoolItemComponent],
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolsComponent implements OnChanges {
  @Input() public pools: IPool[]

  @HostBinding('class') private readonly classes = 'row'

  public activePool: IPool

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['pools'].currentValue?.length) {
      this.activePool = this.pools[0]
    }
  }

  public isTabActive(pool: IPool): boolean {
    return this.activePool?.contractAddress === pool.contractAddress
  }

  public setActivePool(pool: IPool): void {
    this.activePool = pool
  }
}
