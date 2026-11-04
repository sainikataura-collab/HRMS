

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink ,Router,ActivatedRoute} from '@angular/router';
import { LeavereqService } from '../Service/leavereq.service';
import { ToastrService } from 'ngx-toastr';
import { formatDateForInput } from '../../../../healpers/commonlib';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-approval-short-leave',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink,NgSelectModule],
  templateUrl: './approval-short-leave.component.html',
  styleUrl: './approval-short-leave.component.scss'
})
export class ApprovalShortLeaveComponent {
  ShortLeaveForm!: FormGroup;
  showError = false;
  IsEdit = false;
  pk_shortLeaveId: string = '';
  shortLeaveData: any; // Define the type based on your API response
   StatusList = [
    { value: '1', name: 'Disapproved' },
    { value: '2', name: 'Approved' }
  ];

  constructor(private fb: FormBuilder,
     private httpAttendanceService: LeavereqService,
         private toastr: ToastrService,
         private router: Router,
        private  activateRoute: ActivatedRoute,
        public encryption:EncryptionService,
        private route: ActivatedRoute
  ) {}

ngOnInit(): void {
  this.pk_shortLeaveId = this.activateRoute.snapshot.paramMap.get('pk_shortLeaveId')?.toString() ?? '';

  this.ShortLeaveForm = this.fb.group({
    shortLeavedate: ['', Validators.required],
    intime: ['', Validators.required],
    outtime: ['', Validators.required],
    totalhours: [''],
    totdays: ['1'],
    Remarks: [''],
    ApprovalRemarks:[''],
    ApprovalStatus: [null, Validators.required]
  });



  // if (this.pk_shortLeaveId) {
  //   this.getShortLeaveById(+this.pk_shortLeaveId); // Cast to number
  //   this.IsEdit = true;
  // }
  this.pk_shortLeaveId = this.encryption.decryptText(this.route.snapshot.params['pk_shortLeaveId']);
  if (this.pk_shortLeaveId) {
 this.getShortLeaveById(+this.pk_shortLeaveId);
   this.IsEdit = true;
}
}


 
 
  onSubmit(): void {
    this.showError = true;

    if (this.ShortLeaveForm.invalid) {
      return;
    }

    const payload = {...this.ShortLeaveForm.value,
      pk_shortLeaveId: this.pk_shortLeaveId || 0, // Ensure pk_shortLeaveId is a number
    
    };

    this.httpAttendanceService.Isnert_ApprovalShortLeaveRequest(payload).subscribe({
     next: (res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message || 'Short leave request submitted successfully');
        this.ShortLeaveForm.reset();
        this.router.navigate(['/dash/leaves/leavesdashboard/ApprovalShortLeaveList']);

      } else {
        this.toastr.error(res.message || 'Failed to submit short leave request');
      }
    }
  });

  }

 getShortLeaveById(id: number): void {
  this.httpAttendanceService.getShortLeaveById(id).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.shortLeaveData = res.data;
      
        this.ShortLeaveForm.patchValue({
          shortLeavedate:formatDateForInput(this.shortLeaveData.shortLeaveDate) ,
          intime: this.shortLeaveData.inTime,
          outtime: this.shortLeaveData.outTime,
          totalhours: this.shortLeaveData.totalHours,
          totdays: this.shortLeaveData.totdays || '1',
          Remarks: this.shortLeaveData.remarks
        });

      } else {
        console.error('Failed to fetch short leave data:', res.message);
      }
    },
    error: (err) => {
      console.error('Error fetching short leave data:', err);
    }
  });
}



  }
