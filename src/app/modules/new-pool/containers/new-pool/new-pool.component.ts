import { ViewportScroller } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core'
import { Router } from '@angular/router'
import { ConnectionService, ContractService, GlobalStateService, ModalService } from '@app/services'
import { MAX_POOL_PARTICIPANTS } from '@app/settings'
import { ICreatePoolRequestParams, IGlobalState, IParticipant, IPool } from '@app/types'
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, filter, first, map, Observable, tap } from 'rxjs'

import { Helpers } from '../../../../helpers'

@Component({
  selector: 'app-new-pool',
  templateUrl: './new-pool.component.html',
  styleUrls: ['./new-pool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPoolComponent {
  @HostBinding('class') private readonly classes: string = 'main-layout flex-shrink-0 flex-grow-1'

  public tsProcessing$: BehaviorSubject<[number, number]> = new BehaviorSubject([0, 0])
  public state$: Observable<IGlobalState> = this.stateService.state$.pipe(
    tap((state: IGlobalState) => {
      // console.log('state', state)
    }),
  )
  public initialized$: Observable<boolean> = this.state$.pipe(
    map((state: IGlobalState) => {
      if (state.initialized && !state.userConnected) {
        this.router.navigate(['/pools'])
        return false
      }
      return true
    }),
    filter((initialized) => initialized),
    first(),
  )

  public readonly MAX_POOL_PARTICIPANTS = MAX_POOL_PARTICIPANTS

  constructor(
    public connectionService: ConnectionService,
    private stateService: GlobalStateService,
    private modalService: ModalService,
    private translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
    private scroller: ViewportScroller,
  ) {}

  public async onCreate(poolData: Partial<IPool>): Promise<void> {
    if (poolData.participants.length > MAX_POOL_PARTICIPANTS) {
      const modalRef: NgbModalRef = this.modalService.open([
        this.translate.instant('MaxPoolParticipantTsKey', {
          max: MAX_POOL_PARTICIPANTS,
          tsCount: Math.ceil(poolData.participants.length / MAX_POOL_PARTICIPANTS),
        }),
      ])
      return modalRef.result
        .then(() => {
          this.createSplittedPool(poolData)
        })
        .catch(() => {})
    }
    poolData.finalized = true
    await this.contractService.createNewPool(
      poolData as ICreatePoolRequestParams,
      poolData.participants,
    )

    this.goToPool()
  }

  public onCloseForm(): void {
    this.goToPool()
  }

  private goToPool(): void {
    const { length } = this.stateService.value.userPools
    const activePool = length > 0 ? length - 1 : ''
    this.router.navigate(['/pools', activePool])
  }

  private async createSplittedPool(poolData: Partial<IPool>): Promise<void> {
    this.scroller.scrollToPosition([0, 0])
    const chunks: IParticipant[][] = Helpers.splitParticipants(
      poolData.participants,
      this.MAX_POOL_PARTICIPANTS,
    )
    let currentTs = 0
    const [firstPChunks, ...pChunks]: IParticipant[][] = chunks
    const tsCount = chunks.length + 1

    this.tsProcessing$.next([++currentTs, tsCount])
    poolData.finalized = false
    await this.contractService.createNewPool(poolData as ICreatePoolRequestParams, firstPChunks)

    this.tsProcessing$.next([++currentTs, tsCount])

    for (const pChunk of pChunks) {
      const success = await this.contractService.addParticipants(pChunk)
      if (!success) {
        break
      }
      this.tsProcessing$.next([++currentTs, tsCount])
    }

    await this.contractService.finalize()
    this.tsProcessing$.next([0, 0])
    this.goToPool()
  }
}
