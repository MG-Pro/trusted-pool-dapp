import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { EVM_ADDRESS_REGEXP } from '@app/settings'
import { IParticipant, IPool } from '@app/types'

@Component({
  selector: 'app-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolsComponent {
  @Input() public userAccount: string
  @Input() public activePool: IPool
  @Input() public loading: boolean
  @Input() public participants: IParticipant[]
  @Output() public tokenAddressChange = new EventEmitter<[string, IPool]>()
  @Output() public claimTokens = new EventEmitter<IPool>()
  @Output() public nextParticipantsLoad = new EventEmitter<IPool>()
  @Output() public nextPoolsLoad = new EventEmitter<void>()
  @Output() public activePoolChange = new EventEmitter<number>()
  @Output() public finalize = new EventEmitter<IPool>()
  @Output() public addParticipants = new EventEmitter<void>()

  public editTokenAddressControl = new FormControl('', [
    Validators.required,
    Validators.pattern(EVM_ADDRESS_REGEXP),
  ])
  public isEditTokenAddress = false

  public get isCreator(): boolean {
    return this.activePool?.adminAddress === this.userAccount
  }

  public get isLastParticipants(): boolean {
    return this.participants.length >= this.activePool?.participantsCount
  }

  public get disabledEditTokenAddress(): boolean {
    return (
      !!this.activePool?.tokenAddress ||
      this.isEditTokenAddress ||
      !this.isCreator ||
      !this.activePool.finalized
    )
  }

  public prepParticipants(participants: IParticipant[]): IParticipant[] {
    return (participants ?? []).sort((a, b) => {
      if (a.account === this.userAccount) {
        return -1
      }

      return 1
    })
  }

  public isOwner(participant: IParticipant): boolean {
    return participant.account === this.userAccount
  }

  public canClaim(participant: IParticipant): boolean {
    return this.isOwner(participant) && !!participant.accrued
  }

  public onEditTokenAddress(): void {
    this.isEditTokenAddress = true
  }

  public cancelEditTokenAddress(): void {
    this.isEditTokenAddress = false
  }

  public saveTokenAddress(): void {
    this.tokenAddressChange.emit([this.editTokenAddressControl.value, this.activePool])
    this.cancelEditTokenAddress()
  }

  public claim(): void {
    this.claimTokens.emit(this.activePool)
  }

  public nextParticipants(): void {
    this.nextParticipantsLoad.emit(this.activePool)
  }

  public finalizePool(): void {
    this.finalize.emit(this.activePool)
  }

  public onAddParticipants(): void {
    this.addParticipants.emit()
  }
}
