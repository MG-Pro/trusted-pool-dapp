import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { IPool } from '@app/types'

@Component({
  selector: 'app-pool-actions-panel',
  templateUrl: './pool-actions-panel.component.html',
  styleUrls: ['./pool-actions-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolActionsPanelComponent {
  @Input() public activePool: IPool
  @Input() public isCreator: boolean

  @Output() public finalize = new EventEmitter<IPool>()
  @Output() public addParticipants = new EventEmitter<void>()

  public onFinalizePool(): void {
    this.finalize.emit(this.activePool)
  }

  public onAddParticipants(): void {
    this.addParticipants.emit()
  }
}
