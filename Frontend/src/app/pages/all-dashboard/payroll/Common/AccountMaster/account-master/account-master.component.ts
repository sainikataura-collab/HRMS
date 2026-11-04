import { HttpClient } from '@angular/common/http';
import { Component, inject, NgModule } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../services/account.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-account-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './account-master.component.html',
  styleUrl: './account-master.component.scss',
})
export class AccountMasterComponent {
  departmentForm!: FormGroup;
  account_id: string = '';
  isEditMode: boolean = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  showError = false;
  regligionFrom: any;
  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastrService: ToastrService,
    private encryptService:EncryptionService
  ) {}

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });

    this.departmentForm.get('name')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkOperationalAvailability(value);
      }
    });

    // Check if ID is provided in the route
    this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_account_id');

      if (id) {
        this.account_id = this.encryptService.decryptText(id.toString());
        this.isEditMode = true;
        this.getAccountById(this.account_id);
      }
    });
  }


  checkOperationalAvailability(name: string): void {
    const fieldName = 'AccountName';
    const fieldValue = name;
    const generalId = this.account_id || '';

    this.accountService.checkDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.departmentForm.get('name')?.setErrors({ duplicate: response.message });
        } else {
          this.departmentForm.get('name')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.departmentForm.get('name')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }




  getAccountById(id: string) {
    this.accountService.getAccountById(id).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.departmentForm.patchValue({
            code: response.data.code,
            name: response.data.name,
          });
        } else {
          console.error('Failed to fetch account:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching account:', error);
      }
    );
  }

  
  resetForm() {
    this.departmentForm.reset();
  }

  view() {
    this.router.navigateByUrl(
      '/dash/payroll/payrolldashboard/AccountMasterList'
    );
  }

  onSubmit(): void {
    debugger;
    if (this.departmentForm.invalid) {
      this.showError = true;
    }
    const formData = this.departmentForm.value;
    if (this.isEditMode && this.account_id) {
      // Update existing account
      this.accountService
        .updateAccount({ pk_account_id: this.account_id, ...formData })
        .subscribe((response) => {
          if (response.isSuccess) {
            // alert('Account updated successfully!');
            this.toastrService.success(
              response.message || 'AccountMaster updated successfully!'
            );
            this.router.navigate(['dash/payroll/payrolldashboard/AccountMasterList']);
          } else {
            // alert(response.message);
          }
        });
    } else {
      // Create new account
      this.accountService.submitAccountData(formData).subscribe((response) => {
        if (response.isSuccess) {
          // alert('Account created successfully!');
          this.toastrService.success(
            response.message || 'AccountMaster Insert successfully!'
          );
          this.router.navigate([
            'dash/payroll/payrolldashboard/AccountMasterList',
          ]);
        } else {
          // alert(response.message);
        }
      });
    }
  }
}
