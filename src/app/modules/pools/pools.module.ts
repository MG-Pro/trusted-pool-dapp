import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { FooterComponent } from '@app/components/footer/footer.component'
import { HeaderComponent } from '@app/components/header/header.component'
import { IconComponent } from '@app/components/icon/icon.component'
import { NotificationComponent } from '@app/components/notification/notification.component'
import { NewPoolComponent } from '@app/modules/pools/components/new-pool/new-pool.component'
import { PoolsComponent } from '@app/modules/pools/components/pools/pools.component'
import { TranslateModule } from '@ngx-translate/core'

import { DashboardComponent } from './containers/dashboard/dashboard.component'

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: ':id', component: DashboardComponent },
]

@NgModule({
  declarations: [DashboardComponent, NewPoolComponent, PoolsComponent],
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterModule.forChild(routes),
    TranslateModule,
    ReactiveFormsModule,
    IconComponent,
    NotificationComponent,
    ScrollingModule,
  ],
  providers: [],
})
export class PoolsModule {}
