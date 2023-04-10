import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core'
import {
  FormArray,
  FormBuilder,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { MIN_SHARE_AMOUNT } from '@app/settings'
import { IParticipant } from '@app/types'
import { TranslateModule } from '@ngx-translate/core'
import { ethers } from 'ethers'
import { Subject, takeUntil } from 'rxjs'

import { AppValidators } from '../../helpers'

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ScrollingModule],
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public participants: IParticipant[] = []
  @Input() public readOnly = false

  @Output() public participantsChanges = new EventEmitter<IParticipant[]>()
  @Output() public validnessChanges = new EventEmitter<boolean>()

  public form: FormGroup = this.fb.group({
    participants: this.fb.array([]),
  })

  public readonly MIN_SHARE_AMOUNT = MIN_SHARE_AMOUNT
  public readonly participantItemHeight = 160
  private destroyed$ = new Subject<void>()

  constructor(private fb: FormBuilder) {}

  public get participantsForm(): FormArray {
    return this.form.get('participants') as FormArray
  }

  public get participantViewportHeight(): number {
    const viewportHeight = this.participantItemHeight * 3
    const h = this.participantsForm.length * this.participantItemHeight
    return h > viewportHeight ? viewportHeight : h
  }

  public ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
      this.participantsChanges.emit(val?.participants || [])
    })

    this.form.statusChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((status: FormControlStatus) => {
        this.validnessChanges.emit(status === 'VALID')
      })

    this.fillTestForm(15)
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('participants')) {
      this.participantsForm.patchValue(this.participants)
    }

    if (changes.hasOwnProperty('readOnly')) {
      if (this.readOnly) {
        this.form.disable()
      } else {
        this.form.enable()
      }
    }
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public hasErrors(field: string, id: number): boolean {
    const form: FormGroup = this.participantsForm.at(id) as FormGroup
    const dirty = form.get(field)?.dirty ?? false
    switch (field) {
      case 'account':
        return dirty
          ? form.hasError('isAddress', [field]) || form.hasError('participantsUniq')
          : false
      case 'share':
        return dirty ? form.hasError('min', [field]) : false
      default:
        return false
    }
  }

  public addParticipant(): void {
    this.participantsForm.push(
      this.fb.group(
        {
          id: 'id' + this.participantsForm.length + 1,
          account: ['', [Validators.required, AppValidators.isAddress]],
          share: [null, [Validators.required, Validators.min(MIN_SHARE_AMOUNT)]],
        },
        { validators: [this.participantsUniqValidator] },
      ),
    )

    this.participantsFormUp()
  }

  public trackById(_, fg: FormGroup): TrackByFunction<unknown> {
    return fg.get('account')?.value
  }

  public deleteParticipant(id: number): void {
    this.participantsForm.removeAt(id)
    this.participantsFormUp()
  }

  private participantsFormUp(): void {
    this.participantsForm.markAsDirty()
    this.participantsForm.controls = [...this.participantsForm.controls]
  }

  private participantsUniqValidator(group: FormGroup): ValidationErrors {
    const formArray = group.parent as FormArray
    const value = group.get('account').value.trim().toLowerCase()
    const id = group.get('id').value

    const accs: string[] = formArray?.controls.reduce((acc, c) => {
      if (c.get('id').value !== id) {
        acc.push(c.get('account').value.trim().toLowerCase())
      }
      return acc
    }, [])

    const notUniq = accs?.some((v) => {
      return v === value
    })

    return notUniq ? { participantsUniq: true } : null
  }

  private fillTestForm(pCount = 10): void {
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
