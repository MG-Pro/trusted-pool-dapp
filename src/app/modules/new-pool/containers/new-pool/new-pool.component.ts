import { ViewportScroller } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core'
import { Router } from '@angular/router'
import { ICreatingPoolProcessing } from '@app/modules/new-pool/new-pool.types'
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

  public tsProcessing$: BehaviorSubject<ICreatingPoolProcessing> = new BehaviorSubject({
    active: false,
    pending: false,
    currentTs: 0,
    countTS: 0,
    tsCalls: [],
  })
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
  public formDisabled$ = new BehaviorSubject<boolean>(false)
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

  public onNextTs(): void {
    this.processingNextCall()
  }

  public onCancelTs(): void {
    this.processingStop()
  }

  private goToPool(): void {
    const { length } = this.stateService.value.userPools
    const activePool = length > 0 ? length - 1 : ''
    this.router.navigate(['/pools', activePool])
  }

  private async createSplittedPool(poolData: Partial<IPool>): Promise<void> {
    this.formDisabled$.next(true)
    this.scroller.scrollToPosition([0, 0])
    const chunks: IParticipant[][] = Helpers.splitParticipants(
      poolData.participants,
      this.MAX_POOL_PARTICIPANTS,
    )

    const [firstPChunks, ...pChunks]: IParticipant[][] = chunks
    const countTS = chunks.length + 1
    const tsCalls: Promise<boolean>[] = []

    tsCalls.push(
      this.contractService.createNewPool(
        { ...poolData, finalized: false } as ICreatePoolRequestParams,
        firstPChunks,
      ),
    )

    for (const pChunk of pChunks) {
      tsCalls.push(this.contractService.addParticipants(pChunk))
    }

    tsCalls.push(this.contractService.finalize())

    this.processingSetQueue({ tsCalls, countTS, currentTs: 0, active: true, pending: false })

    // this.goToPool()
  }

  private processingSetQueue(p: ICreatingPoolProcessing): void {
    this.tsProcessing$.next(p)
  }

  private async processingNextCall(): Promise<void> {
    const { currentTs, countTS, tsCalls } = this.tsProcessing$.value

    if (currentTs + 1 > countTS) {
      this.processingStop()
    }
    this.tsProcessing$.next({
      ...this.tsProcessing$.value,
      pending: true,
    })
    console.log(tsCalls[currentTs])
    await tsCalls[currentTs]
    this.tsProcessing$.next({
      ...this.tsProcessing$.value,
      currentTs: currentTs + 1,
      pending: false,
    })
  }

  private processingStop(): void {
    this.tsProcessing$.next({
      active: false,
      pending: false,
      currentTs: 0,
      countTS: 0,
      tsCalls: [],
    })
  }
}
