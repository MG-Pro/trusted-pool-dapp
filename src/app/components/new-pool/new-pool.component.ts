import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { IPool } from '@app/types'

@Component({
  selector: 'app-new-pool',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-pool.component.html',
  styleUrls: ['./new-pool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPoolComponent implements OnInit {
  @Output() public closeForm = new EventEmitter<void>()
  @Output() public saveForm = new EventEmitter<Partial<IPool>>()

  public form = this.fb.group({
    name: ['', [Validators.required]],
    tokenAddress: ['', [Validators.required]],
    tokenName: ['', [Validators.required]],
  })

  private formData: Partial<IPool>

  constructor(private fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form.valueChanges.subscribe((val) => {
      console.log(val)
    })
  }

  public save(): void {
    this.saveForm.emit(this.formData)
  }

  public close(): void {
    this.closeForm.emit()
  }
}
