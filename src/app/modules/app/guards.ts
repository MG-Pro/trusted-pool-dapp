import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { ConnectionService } from '@app/services'

export class Guards {
  public static newPool = (): Promise<boolean> | boolean => {
    const router = inject(Router)
    const service = inject(ConnectionService)
    return !service.userConnected ? router.navigate(['/pools']) : true
  }
}
