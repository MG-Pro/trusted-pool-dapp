import { Injectable } from '@angular/core'
import { BehaviorSubject, first, timer } from 'rxjs'

import { MessageData, StatusClasses } from '../types/notification.types'

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public messageData$ = new BehaviorSubject<Map<number, MessageData>>(new Map())
  private nextMsgId = 0
  private DEFAULT_DURATION = 1000 * 5

  public showMessage(
    message: string,
    status: StatusClasses = StatusClasses.success,
    outId: string = null,
    duration?: number,
  ): void {
    const msg = message.trim()

    if (!msg.length) {
      return
    }

    const map = this.messageData$.value.set(this.nextMsgId, {
      id: this.nextMsgId,
      message: msg,
      outId,
      statusClass: status,
    })

    this.messageData$.next(map)
    this.autoHide(this.nextMsgId, duration)
    this.nextMsgId++
  }

  public hideMessage(id: number): void {
    this.messageData$.value.delete(id)
    this.messageData$.next(this.messageData$.value)
  }

  private autoHide(id: number, duration: number): void {
    timer(duration || this.DEFAULT_DURATION)
      .pipe(first())
      .subscribe(() => {
        this.hideMessage(id)
      })
  }
}
