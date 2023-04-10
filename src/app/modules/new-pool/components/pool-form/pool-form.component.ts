import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { FEE_TOKEN, MAX_POOL_PARTICIPANTS, MIN_APPROVER_FEE } from '@app/settings'
import { IParticipant, IPool } from '@app/types'
import { Subject, takeUntil } from 'rxjs'

import { AppValidators } from '../../../../helpers'

@Component({
  selector: 'app-pool-form',
  templateUrl: './pool-form.component.html',
  styleUrls: ['./pool-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public readOnly = false
  @Input() public participants: IParticipant[] = []
  @Input() public participantsValidness = false

  @Output() public closeForm = new EventEmitter<void>()
  @Output() public createPool = new EventEmitter<Partial<IPool>>()

  @HostBinding('class') private readonly classes: string =
    'card text-bg-dark shadow-lg bg-opacity-75 col-8'

  public form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    tokenName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
    tokenAddress: ['', [AppValidators.isAddress]],
    approverAddress: [
      '',
      [
        AppValidators.isAddress,
        AppValidators.conditionalRequired(() => this.form.get('approvable').value),
      ],
    ],
    stableApproverFee: [MIN_APPROVER_FEE, [Validators.required, Validators.min(MIN_APPROVER_FEE)]],
    approvable: false,
    privatable: false,
  })

  public readonly FEE_TOKEN = FEE_TOKEN
  public readonly MIN_APPROVER_FEE = MIN_APPROVER_FEE
  public readonly MAX_POOL_PARTICIPANTS = MAX_POOL_PARTICIPANTS

  private formData: Partial<IPool>
  private destroyed$ = new Subject<void>()

  constructor(private fb: FormBuilder) {}

  public get tokenAmount(): number {
    return this.participants.reduce((acc, p) => {
      acc += p.share || 0
      return acc
    }, 0)
  }

  public get saveDisabled(): boolean {
    return this.form.invalid || this.form.disabled || !this.participantsValidness
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

    // test only
    this.form.patchValue({ name: 'VC2', tokenName: 'MTG' })
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('readOnly')) {
      if (this.readOnly) {
        this.form.disable()
      } else {
        this.form.enable()
      }
    }

    // console.log(this.form, this.participantsValidness)
  }

  public hasErrors(field: string): boolean {
    return this.form.get(field).dirty && this.hasFieldError(field)
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
        return this.form.hasError('isAddress', [field])
      case 'approverAddress':
        return this.form.hasError('required', [field]) || this.form.hasError('isAddress', [field])
      case 'stableApproverFee':
        return this.form.hasError('required', [field]) || this.form.hasError('min', [field])
      default:
        return false
    }
  }
}
