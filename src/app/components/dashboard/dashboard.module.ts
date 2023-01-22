import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FooterComponent } from '@app/components/footer/footer.component'
import { HeaderComponent } from '@app/components/header/header.component'
import { NewPoolComponent } from '@app/components/new-pool/new-pool.component'
import { PoolsComponent } from '@app/components/pools/pools.component'
import { NotificationModule } from '@app/modules/notification/notification.module'

import { DashboardComponent } from './dashboard.component'

const routes: Routes = [{ path: '', component: DashboardComponent }]

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule.forChild(routes),
    NotificationModule,
    PoolsComponent,
    NewPoolComponent,
  ],
})
export class DashboardModule {}
