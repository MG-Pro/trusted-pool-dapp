import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { HeaderComponent } from '@app/components/header/header.component'
import { IconComponent } from '@app/components/icon/icon.component'
import { NotificationComponent } from '@app/components/notification/notification.component'
import { ParticipantsComponent } from '@app/components/participants/participants.component'
import { PoolFormComponent } from '@app/modules/new-pool/components/pool-form/pool-form.component'
import { ProcessingComponent } from '@app/modules/new-pool/components/processing/processing.component'
import { NewPoolComponent } from '@app/modules/new-pool/containers/new-pool/new-pool.component'
import { TranslateModule } from '@ngx-translate/core'

const routes: Routes = [{ path: '', component: NewPoolComponent }]

@NgModule({
  declarations: [NewPoolComponent, ProcessingComponent, PoolFormComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderComponent,
    TranslateModule,
    ReactiveFormsModule,
    IconComponent,
    NotificationComponent,
    ParticipantsComponent,
  ],
})
export class NewPoolModule {}
