import { Component, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,Validators,ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { SeparationRequestService } from '../Services/Emp_resignation.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-resignation-approval',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterLink,NgSelectModule],
  templateUrl:'./resignation-approval.component.html',
  styleUrl:'./resignation-approval.component.scss'
})
export class ResignationApprovalComponent
  implements OnInit {
  approvalForm!: FormGroup;
  resignationId = 0;
  submitted = false;
  approvalStatusList = [
    {id: 2,name: 'Retain'},
    {id: 4,name: 'Accept'},
    {id: 5,name: 'Reject'}
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
      const encryptedId =params.get('id');

      if (encryptedId) {
        const decryptedId =
          this.encryptionService
            .decryptText(encryptedId);

        this.resignationId =Number(decryptedId);
        this.loadData(this.resignationId);
      }
    });
  }

  initializeForm() {

    this.approvalForm =
      this.fb.group({
        resignationDate:[{ value: '', disabled: true }],
        expectedLWD:[{ value: '', disabled: true }],
        noticePeriod:[{ value: '', disabled: true }],
        isNoticePeriodServed:[{ value: false, disabled: true }],
        reason:[{ value: '', disabled: true }],
        remarks:[{ value: '', disabled: true }],
        status:['', Validators.required],
        approvalRemarks:['', Validators.required]
      });
  }

  loadData(id: number) {

    this.separationRequestService
      .getById(id)
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            const data =res.data;

            this.approvalForm.patchValue({
              resignationDate:
                data.resignationDate
                  ? new Date(data.resignationDate)
                    .toLocaleDateString('en-GB')
                  : '',

              expectedLWD:
                data.expectedLWD
                  ? new Date(data.expectedLWD)
                    .toLocaleDateString('en-GB')
                  : '',
              noticePeriod:data.noticePeriod,
              isNoticePeriodServed:data.isNoticePeriodServed,
              reason:data.reason,
              remarks:data.remarks
            });
          }
        }
      });
  }

  submit() {

    this.submitted = true;
    if (this.approvalForm.invalid) {
      return;
    }

    const payload = {
      pkSepRequestId:
        this.resignationId,

      status:
        this.approvalForm.value.status,

      approvalRemarks:
        this.approvalForm.value
          .approvalRemarks
    };

    this.separationRequestService
      .approveResignation(payload)
      .subscribe({

        next: (res: any) => {
          if (res.isSuccess) {
            this.toastr.success(
              res.message
            );

            this.router.navigate([
              '/dash/emp-exit/emp-exitdashboard/resignation_approval_list'
            ]);
          }
          else {
            this.toastr.error(
              res.message
            );
          }
        }
      });
  }
}