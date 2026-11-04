import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmailConfigrationService } from '../../services/email-configration.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-e-mail-configration-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './e-mail-configration-settings.component.html',
  styleUrl: './e-mail-configration-settings.component.scss'
})
export class EMailConfigrationSettingsComponent {

  EmailConfigrationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailConfigrationService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.EmailConfigrationForm = this.fb.group({
      host: ['', Validators.required],
      port: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      tdsemail: ['', [Validators.required, Validators.email]],
      userName: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      fromEmailAddress: ['', Validators.required],
      sslEnabled: [false]
    });

    this.loadEmailConfig(); // 👈 Load data initially
  }

  loadEmailConfig() {
    this.emailService.getEmailConfigList().subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const data = res.data;
  
          // 👇 Patching form with API response
          this.EmailConfigrationForm.patchValue({
            host: data.host,
            port: data.port,
            tdsemail: data.tdsemail,
            userName: data.userName,
            password: data.password,
            fromEmailAddress: data.fromEmailAddress,
            sslEnabled: data.sslEnabled
          });
  
          console.log("Form patched successfully:", this.EmailConfigrationForm.value);
          this.toastrService.success('Email configuration loaded.');
        } else {
          this.toastrService.error('Failed to fetch email configuration.');
        }
      },
      error: (err) => {
        console.error('Error fetching email config:', err);
        this.toastrService.error('Something went wrong while loading configuration.');
      }
    });
  }
  

  resetForm() {
    this.EmailConfigrationForm.reset();
  }

  update() {
    if (this.EmailConfigrationForm.invalid) {
      this.toastrService.error('Please fill all required fields.');
      return;
    }

    const payload = this.EmailConfigrationForm.value;

    this.emailService.updateEmailConfig(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastrService.success('Email configuration updated successfully.');
        } else {
          this.toastrService.error(res?.message || 'Failed to update email configuration.');
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.toastrService.error('An error occurred while updating email configuration.');
      }
    });
  }
}
