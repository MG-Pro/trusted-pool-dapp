import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { EVM_ADDRESS_REGEXP } from '@app/settings'
import { IPool } from '@app/types'
import { Subject } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-pool-item',
  templateUrl: './pool-item.component.html',
  styleUrls: ['./pool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class PoolItemComponent implements OnInit, OnDestroy {
  @Input() public pool: IPool
  @Input() public isCreator = true
  @Output() public tokenAddressChange = new EventEmitter<[string, IPool]>()

  public editTokenAddressControl = new FormControl('', [
    Validators.required,
    Validators.pattern(EVM_ADDRESS_REGEXP),
  ])
  public isEditTokenAddress = false
  private destroyed$ = new Subject<void>()

  public get disabledEditTokenAddress(): boolean {
    return !!this.pool?.tokenAddress || this.isEditTokenAddress || !this.isCreator
  }

  public ngOnInit(): void {
    console.log()
  }

  public ngOnDestroy(): void {
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public onEditTokenAddress(): void {
    this.isEditTokenAddress = true
  }

  public cancelEditTokenAddress(): void {
    this.isEditTokenAddress = false
  }

  public saveTokenAddress(): void {
    this.tokenAddressChange.emit([this.editTokenAddressControl.value, this.pool])
  }
}
