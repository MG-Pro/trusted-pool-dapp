import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { ethers } from 'ethers'

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
