import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { Guards } from './guards'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pools',
    pathMatch: 'full',
  },
  {
    path: 'pools',
    loadChildren: () => import('../pools/pools.module').then((m) => m.PoolsModule),
  },
  {
    path: 'new-pool',
    canActivate: [Guards.newPool],
    loadChildren: () => import('../new-pool/new-pool.module').then((m) => m.NewPoolModule),
  },
  {
    path: 'account',
    loadChildren: () => import('../account/account.module').then((m) => m.AccountModule),
  },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      paramsInheritanceStrategy: 'always',
      onSameUrlNavigation: 'ignore',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
