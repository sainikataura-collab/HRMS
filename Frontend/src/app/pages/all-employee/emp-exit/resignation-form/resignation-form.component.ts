import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { SeparationRequestService } from '../Services/Emp_resignation.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-resignation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './resignation-form.component.html',
  styleUrl: './resignation-form.component.scss'
})
export class ResignationFormComponent implements OnInit {
  resignationForm!: FormGroup;
  submitted = false;
  isEdit = false;
  resignationId: number | null = null;

  reasonOptions = [
    { name: 'Better Opportunity', value: 'Better Opportunity' },
    { name: 'Higher Salary', value: 'Higher Salary' },
    { name: 'Personal Reasons', value: 'Personal Reasons' },
    { name: 'Health Issues', value: 'Health Issues' },
    { name: 'Relocation', value: 'Relocation' },
    { name: 'Higher Education', value: 'Higher Education' },
    { name: 'Work Environment', value: 'Work Environment' },
    { name: 'Work-Life Balance', value: 'Work-Life Balance' },
    { name: 'Retirement', value: 'Retirement' },
    { name: 'Other', value: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private separationRequestService: SeparationRequestService,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadEmployeeDetails();
    this.route.paramMap.subscribe(params => {

      const encryptedId = params.get('id');

      if (encryptedId) {

        this.isEdit = true;

        const decryptedId =
          this.encryptionService.decryptText(encryptedId);

        this.resignationId = Number(decryptedId);

        this.loadResignationData(this.resignationId);
      }
    });
  }

  initForm(): void {
    this.resignationForm = this.fb.group({
      resignationDate: ['', Validators.required],
      expectedLWD: ['', Validators.required],
      noticePeriod: [{ value: '', disabled: true }],
      isNoticePeriodServed: [false],
      reason: [null, Validators.required],
      remarks: ['', Validators.required]
    });
  }

  loadEmployeeDetails(): void {

    this.separationRequestService
      .getNoticePeriod()
      .subscribe({
        next: (res: any) => {

          if (res.isSuccess) {

            this.resignationForm.patchValue({
              noticePeriod: res.data
            });
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Unable to load notice period');
        }
      });
  }

  loadResignationData(id: number): void {

    this.separationRequestService
      .getById(id)
      .subscribe({
        next: (res: any) => {

          if (res.isSuccess) {

            const data = res.data;

            this.resignationForm.patchValue({
              resignationDate: data.resignationDate
                ? data.resignationDate.split('T')[0]
                : '',

              expectedLWD: data.expectedLWD
                ? data.expectedLWD.split('T')[0]
                : '',

              noticePeriod: data.noticePeriod,
              isNoticePeriodServed: data.isNoticePeriodServed,
              reason: data.reason,
              remarks: data.remarks
            });
          }
        }
      });
  }

  submitForm(): void {

    this.submitted = true;

    if (this.resignationForm.invalid) {
      return;
    }

    const payload 
    = this.resignationForm.getRawValue();
    payload.resignationDate =
  this.formatDateForApi(payload.resignationDate);

payload.expectedLWD =
  this.formatDateForApi(payload.expectedLWD);

    
    if (this.isEdit && this.resignationId) {
      payload.pkSepRequestId = this.resignationId;
    }



    const apiCall = this.isEdit
      ? this.separationRequestService.update(payload)
      : this.separationRequestService.insert(payload);

    apiCall.subscribe({
      next: (res: any) => {

        if (res.isSuccess) {

          this.toastr.success(res.message);

          this.router.navigate([
            '/dash/emp-exit/emp-exitdashboard/resignation_list'
          ]);
        }
        else {
          this.toastr.error(res.message);
        }
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.resignationForm.reset({ isNoticePeriodServed: false });
    this.loadEmployeeDetails();
  }
formatDateForApi(date: string | null): string {

  if (!date) {
    return '';
  }

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

  
}


