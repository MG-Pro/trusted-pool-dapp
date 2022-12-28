import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { NotificationService } from '../../services/notification.service'
import { filter, map, Observable } from 'rxjs'
import { MessageData } from '../../types/notification.types'

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  @Input() id: number

  public messages$: Observable<string[]> = this.notificationService.messageData$.pipe(
    map((data) => {
      return Array.from(data).map((value) => value[1])
    }),
    filter((messageData: MessageData[]) => {
      return messageData.some((item) => {
        if (!this.id) {
          return true
        } else if (this.id === item.outId) {
          return true
        }
        return false
      })
    }),
    map((data) => data.map(({ message }) => message))
  )
  constructor(private notificationService: NotificationService) {}
}
