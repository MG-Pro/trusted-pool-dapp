import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import {
  EVM_ADDRESS_REGEXP,
  MAX_POOL_PARTICIPANTS,
  MIN_POOL_AMOUNT,
  MIN_SHARE_AMOUNT,
} from '@app/settings'
import { IPool } from '@app/types'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-new-pool',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-pool.component.html',
  styleUrls: ['./new-pool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPoolComponent implements OnInit, OnDestroy {
  @Output() public closeForm = new EventEmitter<void>()
  @Output() public saveForm = new EventEmitter<Partial<IPool>>()

  public form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    tokenAddress: ['', [Validators.pattern(EVM_ADDRESS_REGEXP)]],
    tokenName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
    tokenAmount: [null, [Validators.required, Validators.min(MIN_POOL_AMOUNT)]],
    participants: this.fb.array(
      [],
      [this.participantNumberValidator, this.participantsAmountValidator],
    ),
  })

  private formData: Partial<IPool>
  private destroyed$ = new Subject<void>()

  constructor(private fb: FormBuilder) {}

  public get participantsForm(): FormArray {
    return this.form.get('participants') as FormArray
  }

  public get addingDisabled(): boolean {
    return this.participantsForm.length >= MAX_POOL_PARTICIPANTS
  }

  public ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
      this.formData = val as Partial<IPool>
    })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public hasErrors(field: string): boolean {
    return this.form.get(field)?.dirty && this.hasFieldError(field)
  }

  public hasFormArrayError(field: string, id: number): boolean {
    const form = this.participantsForm.at(id)
    switch (field) {
      case 'address':
        return form.hasError('pattern', [field])
      case 'share':
        return form.hasError('min', [field])
      default:
        return false
    }
  }

  public addParticipant(): void {
    this.participantsForm.push(
      this.fb.group({
        address: [
          '',
          [
            Validators.required,
            Validators.pattern(EVM_ADDRESS_REGEXP),
            this.participantsUniqValidator,
          ],
        ],
        share: [null, [Validators.required, Validators.min(MIN_SHARE_AMOUNT)]],
        telegramId: '',
        twitterId: '',
      }),
    )
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
      case 'participants':
        return this.form.hasError('participantsAmount', [field])
      default:
        return false
    }
  }

  private participantNumberValidator(formArray: FormArray): ValidationErrors {
    return !formArray.length ? { participantNumber: true } : null
  }

  private participantsAmountValidator(formArray: FormArray): ValidationErrors {
    const tokenAmount = formArray.parent?.get('tokenAmount')?.value || 0
    const amount = formArray.controls.reduce((acc, form) => {
      acc += parseInt(form.get('share').value || 0, 10)
      return acc
    }, 0)
    return tokenAmount !== amount ? { participantsAmount: true } : null
  }

  private participantsUniqValidator(control: AbstractControl): ValidationErrors {
    const formArray = control.parent?.parent as FormArray
    const isUniq =
      formArray?.controls.some((formGroup) => formGroup.get('address')?.value === control.value) ||
      true
    console.log(isUniq)
    return !isUniq ? { participantsAmount: true } : null
  }
}
