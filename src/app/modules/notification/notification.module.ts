import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { NotificationComponent } from './components/notification/notification.component'

@NgModule({
  declarations: [NotificationComponent],
  imports: [CommonModule],
  exports: [NotificationComponent],
})
export class NotificationModule {}
