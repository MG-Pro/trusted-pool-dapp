import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { HeaderComponent } from '@app/components/header/header.component'
import { IconComponent } from '@app/components/icon/icon.component'
import { NotificationComponent } from '@app/components/notification/notification.component'
import { ParticipantsComponent } from '@app/components/participants/participants.component'
import { PoolActionsPanelComponent } from '@app/modules/pools/components/pool-actions-panel/pool-actions-panel.component'
import { PoolsComponent } from '@app/modules/pools/components/pools/pools.component'
import { TranslateModule } from '@ngx-translate/core'

import { DashboardComponent } from './containers/dashboard/dashboard.component'

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: ':id', component: DashboardComponent },
]

@NgModule({
  declarations: [DashboardComponent, PoolsComponent, PoolActionsPanelComponent],
  imports: [
    CommonModule,
    HeaderComponent,
    RouterModule.forChild(routes),
    TranslateModule,
    ReactiveFormsModule,
    IconComponent,
    NotificationComponent,
    ParticipantsComponent,
  ],
  providers: [],
})
export class PoolsModule {}
