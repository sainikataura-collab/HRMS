import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { SettingService } from '../service/setting.service'

import { NgxUiLoaderService } from 'ngx-ui-loader';
 

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss'
})
export class ResetpasswordComponent  {
  newPassword: string = '';
  confirmPassword: string = '';
  oldPassword:string=''
  showOldPassword:boolean=false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  resetPasswordForm!: FormGroup;
  submitted = false;
  UserType:string='';
   oldPasswordError: string = ''; // Add this for old password error
  isVerifyingOldPassword: boolean = false; // Add loading state
  
  ngxUILoaderService = inject(NgxUiLoaderService);
  constructor(
    
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute to access route params
    public settingService: SettingService
  ) {}

  
  ngOnInit(): void {
    this.ngxUILoaderService.start();
 this.UserType =sessionStorage.getItem('usertype') ||'';
          
 
    this.resetPasswordForm = this.formBuilder.group({
      //not send in db
       oldPassword: [ '',[Validators.required]],
      NewPassword: ['',[Validators.required]],
      confirmPassword: ['',[Validators.required]]
    }, { validator: this.passwordMatchValidator });
    this.ngxUILoaderService.stop(); 
  }
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('NewPassword')?.value;
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

  // Add this method to verify old password
  verifyOldPassword() {
    const oldPasswordValue = this.resetPasswordForm.get('oldPassword')?.value;
    
    if (!oldPasswordValue || oldPasswordValue.trim() === '') {
      this.oldPasswordError = '';
      return;
    }

    this.isVerifyingOldPassword = true;
    this.oldPasswordError = '';

    const verifyData = {
      oldPassword: oldPasswordValue,
      userType: this.UserType
    };

    this.settingService.verify_old_password(verifyData).subscribe({
      next: (res) => {
        this.isVerifyingOldPassword = false;
        if (!res.isSuccess) {
          this.oldPasswordError = 'Old password is incorrect';
        } else {
          this.oldPasswordError = '';
        }
      },
      error: (error) => {
        this.isVerifyingOldPassword = false;
        this.oldPasswordError = 'Error verifying password';
        console.error('Error verifying old password:', error);
      }
    });
  }



  onSubmit() {
    
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    const formData = { ...this.resetPasswordForm.value,userType:this.UserType };
    // console.log(formData);
  this.settingService.resent_password(formData).subscribe((res => {
  if(res.isSuccess){
    sessionStorage.clear()
    this.toastrService.success(res.message);
    
    this.router.navigate(['/auth/login']);
}
else{
  this.toastrService.error(res.message);
}

    }
    ))
  }

  // Easy access to form controls
  get validate() {
    return this.resetPasswordForm.controls;
  }
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }
}
