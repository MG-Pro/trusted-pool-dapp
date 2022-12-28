import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NotificationComponent } from './components/notification/notification.component'
import { NotificationService } from './services/notification.service'

@NgModule({
  declarations: [NotificationComponent],
  imports: [CommonModule],
  providers: [NotificationService],
  exports: [NotificationComponent],
})
export class NotificationModule {}
