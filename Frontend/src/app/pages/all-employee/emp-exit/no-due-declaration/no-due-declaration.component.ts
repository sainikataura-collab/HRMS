import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NoDueDeclarationService } from '../Services/no-due-declaration.service';

@Component({
  selector: 'app-no-due-declaration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './no-due-declaration.component.html',
  styleUrl: './no-due-declaration.component.scss'
})
export class NoDueDeclarationComponent implements OnInit {
  declarationForm!: FormGroup;
  submitted = false;
  pk_noDueDeclarationId = 0;
  isViewMode = false;

  empInfo = {
    empcode: '',
    empname: '',
    department: ''
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private noDueDeclarationService: NoDueDeclarationService
  ) { }

  ngOnInit(): void {
    this.pk_noDueDeclarationId = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.isViewMode = this.pk_noDueDeclarationId > 0;

    this.declarationForm = this.fb.group({
      noSalaryAdvance: [false],
      noLoan: [false],
      noReimbursement: [false],
      noCompanyProperty: [false],
      declarationDate: ['', Validators.required],
      agreeDeclaration: [false, Validators.requiredTrue]
    });

    if (this.isViewMode) {

      const mode = this.route.snapshot.queryParamMap.get('mode');

      if (mode === 'review') {
        this.getAdminHodNoDueDeclarationById(this.pk_noDueDeclarationId);
      } else {
        this.getNoDueDeclarationById(this.pk_noDueDeclarationId);
      }

    } else {
      this.getEmpDetails();
    }
  }

  preventChangeInViewMode(event: Event): void {
    if (this.isViewMode) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  getEmpDetails(): void {
    this.noDueDeclarationService.getEmpDetails().subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          const data = res.data || res.Data;

          this.empInfo = {
            empcode: data.empcode || '',
            empname: data.empname || '',
            department: data.department || ''
          };
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to load employee details');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while loading employee details');
      }
    });
  }

  getNoDueDeclarationById(pk_noDueDeclarationId: number): void {
    this.noDueDeclarationService.getNoDueDeclarationById(pk_noDueDeclarationId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          const data = res.data || res.Data;

          this.empInfo = {
            empcode: data.empcode || '',
            empname: data.empname || '',
            department: data.department || ''
          };

          this.declarationForm.patchValue({
            noSalaryAdvance: data.noSalaryAdvance ?? false,
            noLoan: data.noLoan ?? false,
            noReimbursement: data.noReimbursement ?? false,
            noCompanyProperty: data.noCompanyProperty ?? false,
            declarationDate: data.declarationDate ? String(data.declarationDate).split('T')[0] : '',
            agreeDeclaration: data.agreeDeclaration ?? false
          });
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to load declaration details');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while loading declaration details');
      }
    });
  }

  submitForm(): void {
    this.submitted = true;

    if (this.isViewMode) {
      return;
    }

    if (this.declarationForm.invalid) {
      return;
    }

    const payload = {
      pk_noDueDeclarationId: this.pk_noDueDeclarationId,
      noSalaryAdvance: this.declarationForm.value.noSalaryAdvance,
      noLoan: this.declarationForm.value.noLoan,
      noReimbursement: this.declarationForm.value.noReimbursement,
      noCompanyProperty: this.declarationForm.value.noCompanyProperty,
      declarationDate: this.declarationForm.value.declarationDate,
      agreeDeclaration: this.declarationForm.value.agreeDeclaration
    };

    if (this.pk_noDueDeclarationId > 0) {
      this.updateNoDueDeclaration(payload);
    } else {
      this.insertNoDueDeclaration(payload);
    }
  }

  insertNoDueDeclaration(payload: any): void {
    this.noDueDeclarationService.insertNoDueDeclaration(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          this.toastr.success(res?.message || res?.Message || 'Declaration submitted successfully');
          this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration']);
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to submit declaration');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while submitting declaration');
      }
    });
  }

  updateNoDueDeclaration(payload: any): void {
    this.noDueDeclarationService.updateNoDueDeclaration(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          this.toastr.success(res?.message || res?.Message || 'Declaration updated successfully');
          this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration']);
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to update declaration');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while updating declaration');
      }
    });
  }

  resetForm(): void {
    this.submitted = false;

    this.declarationForm.reset({
      noSalaryAdvance: false,
      noLoan: false,
      noReimbursement: false,
      noCompanyProperty: false,
      declarationDate: '',
      agreeDeclaration: false
    });
  }
  goBack(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');

    if (mode === 'review') {
      this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration_review']);
      return;
    }

    this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration']);
  }
  getAdminHodNoDueDeclarationById(pk_noDueDeclarationId: number): void {
    this.noDueDeclarationService.getAdminHodNoDueDeclarationById(pk_noDueDeclarationId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {

          const data = res.data || res.Data;

          this.empInfo = {
            empcode: data.empcode || '',
            empname: data.empname || '',
            department: data.department || ''
          };

          this.declarationForm.patchValue({
            noSalaryAdvance: data.noSalaryAdvance ?? false,
            noLoan: data.noLoan ?? false,
            noReimbursement: data.noReimbursement ?? false,
            noCompanyProperty: data.noCompanyProperty ?? false,
            declarationDate: data.declarationDate
              ? String(data.declarationDate).split('T')[0]
              : '',
            agreeDeclaration: data.agreeDeclaration ?? false
          });

        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to load declaration details');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while loading declaration details');
      }
    });
  }
}