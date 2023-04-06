import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TrackByFunction,
} from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import {
  EVM_ADDRESS_REGEXP,
  FEE_TOKEN,
  MAX_POOL_PARTICIPANTS,
  MIN_APPROVER_FEE,
  MIN_SHARE_AMOUNT,
} from '@app/settings'
import { IPool } from '@app/types'
import { ethers } from 'ethers'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-pool-form',
  templateUrl: './pool-form.component.html',
  styleUrls: ['./pool-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolFormComponent implements OnInit, OnDestroy {
  @Input() public readOnly = false

  @Output() public closeForm = new EventEmitter<void>()
  @Output() public createPool = new EventEmitter<Partial<IPool>>()

  @HostBinding('class') private readonly classes: string =
    'card text-bg-dark shadow-lg bg-opacity-75 col-8'

  public form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    tokenName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
    tokenAddress: ['', [Validators.pattern(EVM_ADDRESS_REGEXP)]],
    approverAddress: [
      '',
      [
        Validators.pattern(EVM_ADDRESS_REGEXP),
        this.conditionalRequired(() => this.form.get('approvable').value),
      ],
    ],
    stableApproverFee: [MIN_APPROVER_FEE, [Validators.required, Validators.min(MIN_APPROVER_FEE)]],
    approvable: false,
    privatable: false,
    participants: this.fb.array([], [this.participantNumberValidator]),
  })

  public readonly participantItemHeight = 160
  protected readonly FEE_TOKEN = FEE_TOKEN
  protected readonly MIN_APPROVER_FEE = MIN_APPROVER_FEE
  protected readonly MAX_POOL_PARTICIPANTS = MAX_POOL_PARTICIPANTS
  private formData: Partial<IPool>
  private destroyed$ = new Subject<void>()

  constructor(private fb: FormBuilder) {}

  public get participantViewportHeight(): number {
    const viewportHeight = this.participantItemHeight * 3
    const h = this.participantsForm.length * this.participantItemHeight
    return h > viewportHeight ? viewportHeight : h
  }

  public get participantsForm(): FormArray {
    return this.form.get('participants') as FormArray
  }

  public get tokenAmount(): number {
    return this.participantsForm.controls.reduce((acc, form) => {
      acc += parseInt(form.get('share').value || 0, 10)
      return acc
    }, 0)
  }

  public ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
      this.formData = val as Partial<IPool>
    })

    this.form
      .get('approvable')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.form.get('approverAddress').updateValueAndValidity()
        this.form.get('stableApproverFee').updateValueAndValidity()
      })

    this.fillTestForm(15)
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public hasErrors(field: string): boolean {
    return this.form.get(field).dirty && this.hasFieldError(field)
  }

  public hasFormArrayError(field: string, id: number): boolean {
    const form = this.participantsForm.at(id)
    switch (field) {
      case 'address':
        return form.hasError('pattern', [field]) || form.hasError('participantsUniq', [field])
      case 'share':
        return form.hasError('min', [field])
      default:
        return false
    }
  }

  public addParticipant(): void {
    this.participantsForm.push(
      this.fb.group({
        account: [
          '',
          [
            Validators.required,
            Validators.pattern(EVM_ADDRESS_REGEXP),
            this.participantsUniqValidator,
          ],
        ],
        share: [null, [Validators.required, Validators.min(MIN_SHARE_AMOUNT)]],
      }),
    )

    this.participantsFormUp()
  }

  public deleteParticipant(id: number): void {
    this.participantsForm.removeAt(id)
    this.participantsFormUp()
  }

  public trackById(_, fg: FormGroup): TrackByFunction<unknown> {
    return fg.get('account')?.value
  }

  public onClose(): void {
    this.closeForm.emit()
  }

  public onSave(): void {
    this.createPool.emit({ ...this.formData })
  }

  private hasFieldError(field: string): boolean {
    switch (field) {
      case 'tokenName':
      case 'name':
        return (
          this.form.hasError('required', [field]) ||
          this.form.hasError('minlength', [field]) ||
          this.form.hasError('maxlength', [field])
        )
      case 'tokenAddress':
        return this.form.hasError('pattern', [field])
      case 'approverAddress':
        return this.form.hasError('required', [field]) || this.form.hasError('pattern', [field])
      case 'stableApproverFee':
        return this.form.hasError('required', [field]) || this.form.hasError('min', [field])
      default:
        return false
    }
  }

  private participantNumberValidator(formArray: FormArray): ValidationErrors {
    return !formArray.length ? { participantNumber: true } : null
  }

  private participantsUniqValidator(control: FormControl): ValidationErrors {
    const formArray = control.parent?.parent as FormArray
    const isUniq =
      formArray?.controls.some((formGroup) => formGroup.get('address')?.value === control.value) ||
      true
    return !isUniq ? { participantsUniq: true } : null
  }

  private conditionalRequired(condition: () => boolean): ValidatorFn {
    return (control: FormControl) => {
      if (control.parent) {
        return condition() ? Validators.required(control) : null
      }
      return null
    }
  }

  private participantsFormUp(): void {
    this.form.markAsDirty()
    this.participantsForm.controls = [...this.participantsForm.controls]
  }

  private fillTestForm(pCount = 10): void {
    this.form.patchValue({ name: 'VC2', tokenName: 'MTG' })
    this.participantsForm.push(
      this.fb.group({
        account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        share: 5000,
      }),
    )

    Array(pCount - 1)
      .fill(null)
      .forEach((_, i) => {
        this.participantsForm.push(
          this.fb.group({
            account: ethers.Wallet.createRandom().address,
            share: 5000 + i * 100,
          }),
        )
      })
  }
}
