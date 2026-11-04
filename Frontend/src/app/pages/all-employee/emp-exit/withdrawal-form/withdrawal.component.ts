import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { SeparationRequestService } from '../Services/Emp_resignation.service';

import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-withdrawal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule
  ],
  templateUrl: './withdrawal.component.html',
  styleUrl: './withdrawal.component.scss'
})
export class WithdrawalComponent implements OnInit {

  withdrawalForm!: FormGroup;

  resignationId = 0;

  submitted = false;

  withdrawStatusList = [
    {
      id: 3,
      name: 'Withdraw'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private separationRequestService: SeparationRequestService,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {

    this.initializeForm();

    this.route.paramMap.subscribe(params => {

      const encryptedId = params.get('id');

      if (encryptedId) {

        const decryptedId =
          this.encryptionService.decryptText(encryptedId);

        this.resignationId = Number(decryptedId);

        this.loadData(this.resignationId);
      }

    });

  }

  initializeForm() {

    this.withdrawalForm = this.fb.group({

        resignationDate: [{ value: '', disabled: true }],
      
        expectedLWD: [{ value: '', disabled: true }],
      
        noticePeriod: [{ value: '', disabled: true }],
      
        isNoticePeriodServed: [{ value: false, disabled: true }],
      
        reason: [{ value: '', disabled: true }],
      
        remarks: [{ value: '', disabled: true }],
      
        status: [3, Validators.required],
      
        withdrawalRemarks: ['', Validators.required]

    });

  }

  loadData(id: number) {

    this.separationRequestService
      .getById(id)
      .subscribe({
  
        next: (res: any) => {
  
          if (res.isSuccess) {
  
            const data = res.data;
  
            this.withdrawalForm.patchValue({
  
              resignationDate:
                data.resignationDate
                  ? data.resignationDate.split('T')[0]
                  : '',
  
              expectedLWD:data.expectedLWD? data.expectedLWD.split('T')[0]: '',
  
              noticePeriod:data.noticePeriod,
  
              isNoticePeriodServed:data.isNoticePeriodServed,
  
              reason:data.reason,
  
              remarks:data.remarks,
  
              status: 3,
  
              withdrawalRemarks: ''
  
            });
  
          }
          else {
  
            this.toastr.error(res.message);
  
          }
  
        },
        error: () => {
  
          this.toastr.error(
            'Failed to load resignation details.'
          );
  
        }
  
      });
  
  }

  submit() {

    this.submitted = true;

    if (this.withdrawalForm.invalid) {
      return;
    }

    const payload = {

      pkSepRequestId: this.resignationId,
      // status: 3,
      withdrawalRemarks:
        this.withdrawalForm.value.withdrawalRemarks

    };

    this.separationRequestService
      .withdrawResignation(payload)
      .subscribe({

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

  reset() {

    this.submitted = false;
    this.withdrawalForm.patchValue({
      status: 3,
      withdrawalRemarks: ''
    });

  }

}