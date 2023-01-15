import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { LogoModule } from '../logo/logo.module'

import { FooterComponent } from './footer.component'

@NgModule({
  declarations: [FooterComponent],
  imports: [CommonModule, LogoModule],
  exports: [FooterComponent],
})
export class FooterModule {}
