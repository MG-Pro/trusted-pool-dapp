import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { FooterModule } from '../footer/footer.module'
import { HeaderModule } from '../header/header.module'
import { NotificationModule } from '../notification/notification.module'

import { DashboardComponent } from './components/dashboard/dashboard.component'

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
