import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-emailphoneverification',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './emailphoneverification.component.html',
  styleUrls: ['./emailphoneverification.component.scss']
})
export class EmailphoneverificationComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private toastrService: ToastrService,
    private router: Router,
    private authservice: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
  }

  reset_password_token() {
    if (this.newPassword !== this.confirmPassword) {
      this.toastrService.error('Passwords do not match.');
      return;
    }

    if (this.token && this.newPassword) {
    this.authservice.resetPassword_token(this.token, this.newPassword).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message);
          this.router.navigate(['auth/login']);
        } else {
          this.toastrService.error(res.message);
        }
      },
      error: (err) => {
        this.toastrService.error(err.message);
      }
    });
  }
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
