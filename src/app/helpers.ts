import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { ethers } from 'ethers'

export class Helpers {
  public static splitParticipants<T = unknown>(participants: T[], size: number): T[][] {
    const pChunks: T[][] = []
    for (let k = 0; k < participants.length; k += size) {
      const chunk = participants.slice(k, k + size)
      pChunks.push(chunk)
    }
    return pChunks
  }
}

export class AppValidators {
  public static isAddress(control: AbstractControl): ValidationErrors {
    const required = !!(
      control.validator && control.validator({} as AbstractControl)?.hasOwnProperty('required')
    )
    if (!required && !control.value) {
      return null
    }

    return !ethers.utils.isAddress(control.value.trim().toLowerCase()) ? { isAddress: true } : null
  }

  public static conditionalRequired(condition: () => boolean): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.parent) {
        return condition() ? Validators.required(control) : null
      }
      return null
    }
  }
}
