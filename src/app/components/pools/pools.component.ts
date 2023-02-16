import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { EVM_ADDRESS_REGEXP } from '@app/settings'
import { IParticipant, IPool } from '@app/types'

@Component({
  selector: 'app-pools',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoolsComponent implements OnChanges {
  @Input() public pools: IPool[]
  @Input() public userAccount: string
  @Input() public loading: boolean
  @Output() public tokenAddressChange = new EventEmitter<[string, IPool]>()
  @Output() public claimTokens = new EventEmitter<IPool>()
  @Output() public nextParticipantsLoad = new EventEmitter<IPool>()

  @HostBinding('class') private readonly classes = 'row'

  public activePool: IPool
  public editTokenAddressControl = new FormControl('', [
    Validators.required,
    Validators.pattern(EVM_ADDRESS_REGEXP),
  ])
  public isEditTokenAddress = false

  public get isCreator(): boolean {
    return this.activePool?.creatorAddress === this.userAccount
  }

  public get isParticipant(): boolean {
    return this.activePool?.participants.some(({ account }) => {
      return account === this.userAccount
    })
  }

  public get disabledEditTokenAddress(): boolean {
    return !!this.activePool?.tokenAddress || this.isEditTokenAddress || !this.isParticipant
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['pools']?.currentValue?.length) {
      this.activePool = this.pools[0]
    }
  }

  public prepParticipants(participants: IParticipant[]): IParticipant[] {
    return (participants ?? []).sort((a, b) => {
      if (a.account === this.userAccount) {
        return -1
      }

      return 1
    })
  }

  public isOwnable(participant: IParticipant): boolean {
    return participant.account === this.userAccount
  }

  public canClaim(participant: IParticipant): boolean {
    return this.isOwnable(participant)
  }

  public onEditTokenAddress(): void {
    this.isEditTokenAddress = true
  }

  public cancelEditTokenAddress(): void {
    this.isEditTokenAddress = false
  }

  public saveTokenAddress(): void {
    this.tokenAddressChange.emit([this.editTokenAddressControl.value, this.activePool])
  }

  public isTabActive(pool: IPool): boolean {
    return this.activePool?.contractAddress === pool.contractAddress
  }

  public setActivePool(pool: IPool): void {
    this.activePool = pool
  }

  public claim(): void {
    this.claimTokens.emit(this.activePool)
  }

  public nextParticipants(): void {
    this.nextParticipantsLoad.emit(this.activePool)
  }
}
