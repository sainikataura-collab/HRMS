import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  captcha: string = '';
  captchaInput: string = '';
  captchaError: string = '';
  submitted = false;
  public registerForm!: FormGroup;
  ngxUILoaderService = inject(NgxUiLoaderService);
  constructor(private formBuilder: FormBuilder,private toastrService: ToastrService, private router:Router ,public authservice: AuthService,){
    
  }
  ngOnInit(): void {
    this.ngxUILoaderService.start();
   
    this.generateCaptcha();
    this.registerForm = this.formBuilder.group({
      customerFirstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      customerLastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      emailId: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(/^[\w!#$%&'*+\-/=?^_`{|}~]+(\.[\w!#$%&'*+\-/=?^_`{|}~]+)*@((([\-\w]+\.)+[a-zA-Z]{2,4})|(([0-9]{1,3}\.){3}[0-9]{1,3}))$/)
      ]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^(?!0)([6789]\d{9})$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#.,])[A-Za-z\\d@$!%*?&#.,]{8,}$')
      ]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    });
  
    // Set the validator function explicitly on the form group
    this.registerForm.setValidators(this.passwordMatchValidator);
    this.ngxUILoaderService.stop(); 
  }
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPasswordControl = control.get('confirmPassword');
    if (!confirmPasswordControl) return null;
    if (!confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ required: true });
      return null;
    }
    // Check for mismatch error
    if (password !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ mismatch: true });
    } else {
      confirmPasswordControl.setErrors(null); // Clear errors if passwords match
    } 
    return null;
  }
  
get validate() {
  return this.registerForm.controls;
}
register(){
    this.submitted = true;

    if (!this.captchaInput) {
      this.captchaError = 'CAPTCHA is required.'; 
      return; 
    }
    // Validate CAPTCHA before form submission
    if (!this.validateCaptcha()) {
       return;
      }
      if (this.registerForm.invalid){
       return
      }
  
this.authservice.registerCustomer(this.registerForm.value).subscribe({
  next: (res) => {
   
    if (res.isSuccess) {
      //this.toastrService.success(res.message);
       this.toastrService.success(`Message: ${res.message}, Document No: ${res.documentNo}`);
      const registerId = res.documentId;
      sessionStorage.setItem('registerId', registerId);
      //this.router.navigate(['/auth/otp', 'register']);
 
    } else {
      this.toastrService.error(res.message);
    }
  },
  error: (err) => {
    // console.error('Error occurred: ', err);
    this.toastrService.error('An error occurred while processing your request. Please try again.');
  }
});

    this.generateCaptcha();
  }

  restrictNonNumeric(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!allowedKeys.includes(event.key) && isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }
  
  formatInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
  }


  //captcha
  generateCaptcha(): void {

    this.captcha = this.authservice.generateCaptcha();
    this.captchaError = '';
    this.captchaInput = ''; // Reset the input field
  
  }
  validateCaptcha(): boolean {
  
    if (!this.authservice.validateCaptcha(this.captchaInput)) {
      this.captchaError = 'Invalid CAPTCHA. Please try again.';
      this.generateCaptcha();
      this.toastrService.error('Invalid CAPTCHA. Please try again.')
      return false;
    }
    this.captchaError = '';
    return true;
  }

  showPassword: boolean = false;
  NewshowPassword: boolean = false;

  // Toggle the visibility of the password
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  NewPasswordVisibility():void{
    this.NewshowPassword=!this.NewshowPassword;
  }
}
