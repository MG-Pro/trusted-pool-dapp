import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  TrackByFunction,
} from '@angular/core'
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { ConnectionService, ContractService, GlobalStateService, ModalService } from '@app/services'
import {
  EVM_ADDRESS_REGEXP,
  FEE_TOKEN,
  MAX_POOL_PARTICIPANTS,
  MIN_APPROVER_FEE,
  MIN_SHARE_AMOUNT,
} from '@app/settings'
import { ICreatePoolRequestParams, IGlobalState, IParticipant, IPool } from '@app/types'
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref'
import { TranslateService } from '@ngx-translate/core'
import { ethers } from 'ethers'
import { Observable, Subject, takeUntil, tap } from 'rxjs'

import { Helpers } from '../../../../helpers'

@Component({
  selector: 'app-new-pool',
  templateUrl: './new-pool.component.html',
  styleUrls: ['./new-pool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPoolComponent implements OnInit, OnDestroy {
  @HostBinding('class') private readonly classes = 'main-layout flex-shrink-0 flex-grow-1'

  public state$: Observable<IGlobalState> = this.stateService.state$.pipe(
    tap((state: IGlobalState) => {
      // console.log('state', state)
    }),
  )

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

  public readonly MIN_APPROVER_FEE = MIN_APPROVER_FEE
  public readonly MAX_POOL_PARTICIPANTS = MAX_POOL_PARTICIPANTS
  public readonly FEE_TOKEN = FEE_TOKEN
  public readonly participantItemHeight = 160

  private formData: Partial<IPool>
  private destroyed$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private modalService: ModalService,
    private translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
  ) {}

  public get participantsForm(): FormArray {
    return this.form.get('participants') as FormArray
  }

  public get participantViewportHeight(): number {
    const viewportHeight = this.participantItemHeight * 3
    const h = this.participantsForm.length * this.participantItemHeight
    return h > viewportHeight ? viewportHeight : h
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
    //
    this.fillTestForm(5)
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

  public async save(): Promise<void> {
    if (this.form.participants.length > MAX_POOL_PARTICIPANTS) {
      const modalRef: NgbModalRef = this.modalService.open([
        this.translate.instant('MaxPoolParticipantTsKey', {
          max: MAX_POOL_PARTICIPANTS,
          tsCount: Math.ceil(this.form.participants.length / MAX_POOL_PARTICIPANTS),
        }),
      ])
      return modalRef.result
        .then(() => {
          this.createSplittedPool(this.form)
        })
        .catch(() => {})
    }
    this.form.finalized = true
    await this.contractService.createNewPool(
      this.form as ICreatePoolRequestParams,
      this.form.participants,
    )

    this.goToPool()
  }

  public close(): void {
    this.goToPool()
  }

  public trackById(_, fg: FormGroup): TrackByFunction<unknown> {
    return fg.get('account')?.value
  }

  private goToPool(): void {
    const { length } = this.stateService.value.userPools
    const activePool = length > 0 ? length - 1 : ''
    this.router.navigate(['/pools', activePool])
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

  private participantsUniqValidator(control: AbstractControl): ValidationErrors {
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

  private async createSplittedPool(poolData: Partial<IPool>): Promise<void> {
    poolData.finalized = false
    const [firstPChunks, ...pChunks]: IParticipant[][] = Helpers.splitParticipants(
      poolData.participants,
      this.MAX_POOL_PARTICIPANTS,
    )
    console.log(firstPChunks, pChunks)

    await this.contractService.createNewPool(poolData as ICreatePoolRequestParams, firstPChunks)
    for (const pChunk of pChunks) {
      await this.contractService.addParticipants(pChunk)
    }
  }
}
