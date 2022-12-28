import { Injectable } from '@angular/core'
import { BehaviorSubject, interval } from 'rxjs'
import { MessageData } from '../types/notification.types'

@Injectable()
export class NotificationService {
  public messageData$ = new BehaviorSubject<Map<number, MessageData>>(new Map())
  private nextId: number = 0

  public showMessage(message: string, duration?: number, outId?: number): void {
    const msg = message.trim()

    if (!msg.length) {
      return
    }
    const map = this.messageData$.value.set(this.nextId, { message: msg, outId })

    this.messageData$.next(map)
    interval(duration || 1000 * 10).subscribe(() => {
      this.hideMessage(this.nextId)
    })
  }

  public hideMessage(id: number): void {
    this.messageData$.value.delete(id)

    this.messageData$.next(this.messageData$.value)
  }
}
