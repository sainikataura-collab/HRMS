// mobileValidation.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MobileValidationService {
  constructor() {}

  // Method to restrict non-numeric input
  restrictNonNumeric(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!allowedKeys.includes(event.key) && isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }

  // Method to format input by removing non-numeric characters
  formatInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  // Method to validate mobile number
  validateMobileNumber(mobileNumber: string): boolean {
    const mobileNumberPattern = /^\d{10}$/; // Example for 10-digit mobile number
    return mobileNumberPattern.test(mobileNumber);
  }
}
