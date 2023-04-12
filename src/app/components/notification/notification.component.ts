import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { map, Observable } from 'rxjs'

import { NotificationService } from '../../services/notification.service'
import { MessageData } from '../../types/notification.types'

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NotificationComponent {
  @Input() public id: string

  public messages$: Observable<MessageData[]> = this.notificationService.messageData$.pipe(
    map((messagesMap) => {
      const messages: MessageData[] = []
      messagesMap.forEach((item) => {
        if (!this.id) {
          messages.push(item)
          return
        }

        if (!item.outId || this.id === item.outId) {
          messages.push(item)
        }
      })
      return messages
    }),
  )
  constructor(private notificationService: NotificationService) {}

  public close(id: number): void {
    this.notificationService.hideMessage(id)
  }
}
