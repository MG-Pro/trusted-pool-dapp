import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { HeaderModule } from '../header/header.module'
import { FooterModule } from '../footer/footer.module'

const routes: Routes = [{ path: '', component: DashboardComponent }]

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, HeaderModule, FooterModule, RouterModule.forChild(routes)],
})
export class DashboardModule {}
