import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { IPool } from '@app/types'

@Component({
  selector: 'app-pools-menu',
  templateUrl: './pools-menu.component.html',
  styleUrls: ['./pools-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolsMenuComponent {
  @Input() public pools: IPool[]
  @Input() public activePool: IPool
  @Input() public isLastPools: boolean

  @Output() public nextPools = new EventEmitter<void>()
  @Output() public activePoolChange = new EventEmitter<number>()

  public isTabActive(pool: IPool): boolean {
    return this.activePool?.contractAddress === pool.contractAddress
  }

  public onNextPools(): void {
    this.nextPools.emit()
  }

  public onActivePool(id: number): void {
    this.activePoolChange.emit(id)
  }
}
