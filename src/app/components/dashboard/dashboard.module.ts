import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FooterModule } from '@app/components/footer/footer.module'
import { HeaderModule } from '@app/components/header/header.module'
import { NotificationModule } from '@app/modules/notification/notification.module'

import { DashboardComponent } from './dashboard.component'

const routes: Routes = [{ path: '', component: DashboardComponent }]

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    HeaderModule,
    FooterModule,
    RouterModule.forChild(routes),
    NotificationModule,
  ],
})
export class DashboardModule {}
