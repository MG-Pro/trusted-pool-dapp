import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { EVM_ADDRESS_REGEXP, MIN_POOL_AMOUNT } from '@app/settings'
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
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    tokenAddress: ['', [Validators.required, Validators.pattern(EVM_ADDRESS_REGEXP)]],
    tokenName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
    tokenAmount: [0, [Validators.required, Validators.min(MIN_POOL_AMOUNT)]],
    participants: this.fb.array([]),
  })

  private formData: Partial<IPool>

  constructor(private fb: FormBuilder) {}

  public get participantsForm(): FormArray {
    return this.form.get('participants') as FormArray
  }

  public ngOnInit(): void {
    this.form.valueChanges.subscribe((val) => {
      // console.log(this.form.get('tokenAmount'))
    })
  }

  public hasError(field: string): boolean {
    return this.form.get(field)?.dirty && this.hasFieldError(field)
  }

  public addParticipant(): void {
    this.participantsForm.push(
      this.fb.group({
        participant: ['', Validators.required, Validators.pattern(EVM_ADDRESS_REGEXP)],
        share: [0, Validators.required],
      }),
    )
    console.log(this.form)
  }

  public deleteParticipant(id: number): void {
    this.participantsForm.removeAt(id)
  }

  public save(): void {
    this.saveForm.emit(this.formData)
  }

  public close(): void {
    this.closeForm.emit()
  }

  private hasFieldError(field: string): boolean {
    switch (field) {
      case 'tokenName':
      case 'name':
        return this.form.hasError('minlength', [field]) || this.form.hasError('maxlength', [field])
      case 'tokenAddress':
        return this.form.hasError('pattern', [field])
      case 'tokenAmount':
        return this.form.hasError('min', [field])
      default:
        return false
    }
  }
}
