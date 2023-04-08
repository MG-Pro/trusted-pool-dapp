import { Injectable } from '@angular/core'
import { IGlobalState } from '@app/types'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  public state$: BehaviorSubject<IGlobalState> = new BehaviorSubject<IGlobalState>({
    networkConnected: false,
    initialized: false,
    userPools: [],
    canCreatePool: false,
  })

  public get value(): IGlobalState {
    return this.state$.value
  }

  public patchState(state: Partial<IGlobalState>): void {
    this.state$.next({ ...this.state$.value, ...state })
  }
}
