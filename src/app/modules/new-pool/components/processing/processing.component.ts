import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core'
import { ICreatingPoolProcessing } from '@app/modules/new-pool/new-pool.types'

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingComponent {
  @Input() public tsProcessing: ICreatingPoolProcessing
  @Output() public nextTs = new EventEmitter<void>()
  @Output() public cancel = new EventEmitter<void>()

  @HostBinding('class') private readonly classes: string =
    'card text-bg-dark shadow-lg bg-opacity-75 col-8 '

  public onNextTs(): void {
    this.nextTs.emit()
  }

  public onCancel(): void {
    this.cancel.emit()
  }
}
