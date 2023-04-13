import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { HeaderComponent } from '@app/components/header/header.component'
import { IconComponent } from '@app/components/icon/icon.component'
import { NotificationComponent } from '@app/components/notification/notification.component'
import { ParticipantsComponent } from '@app/components/participants/participants.component'
import { PoolActionsPanelComponent } from '@app/modules/pools/components/pool-actions-panel/pool-actions-panel.component'
import { PoolViewComponent } from '@app/modules/pools/components/pool-view/pool-view.component'
import { PoolsMenuComponent } from '@app/modules/pools/components/pools-menu/pools-menu.component'
import { TranslateModule } from '@ngx-translate/core'

import { DashboardComponent } from './containers/dashboard/dashboard.component'

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: ':id', component: DashboardComponent },
]

@NgModule({
  declarations: [
    DashboardComponent,
    PoolViewComponent,
    PoolActionsPanelComponent,
    PoolsMenuComponent,
  ],
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
