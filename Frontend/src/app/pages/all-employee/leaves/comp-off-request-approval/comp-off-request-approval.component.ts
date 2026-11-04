import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LeavereqService } from '../Service/leavereq.service';
import { formatDateForInput } from '../../../../healpers/commonlib';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-comp-off-request-approval',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,NgSelectModule],
  templateUrl: './comp-off-request-approval.component.html',
  styleUrl: './comp-off-request-approval.component.scss',
})
export class CompOffRequestApprovalComponent {
  ShortLeaveForm!: FormGroup;
  showError = false;
  IsEdit = false;
  pk_applycompoffId: number | null = null;
  shortLeaveData: any; // Define the type based on your API response
   StatusList = [
    { value: '1', name: 'Disapproved' },
    { value: '2', name: 'Approved' }
  ];

  constructor(
    private fb: FormBuilder,
    private httpAttendanceService: LeavereqService,
    private toastr: ToastrService,
    private router: Router,
    private activateRoute: ActivatedRoute,public encryptionService:EncryptionService
  ) {}

  ngOnInit(): void {
    //this.pk_applycompoffId = this.activateRoute.snapshot.paramMap.get('pk_applycompoffId') ?.toString() ?? '';
     this.pk_applycompoffId = Number.parseInt(this.encryptionService.decryptText(this.activateRoute.snapshot.params['pk_applycompoffId']));


    this.ShortLeaveForm = this.fb.group({
      compoffdate: ['', Validators.required],
      intime: ['', Validators.required],
      outtime: ['', Validators.required],
      totalhours: [''],
      totdays: ['1'],
      Remarks: [''],
      ApprovalRemarks: [''],
      ApprovalStatus: ['', Validators.required],
    });

    if (this.pk_applycompoffId) {
      this.getShortLeaveById(+this.pk_applycompoffId); // Cast to number
      this.IsEdit = true;
    }
  }

  onSubmit(): void {
    this.showError = true;
    if (this.ShortLeaveForm.invalid) {
      return;
    }

    const payload = {
      ...this.ShortLeaveForm.value,
      pk_applycompoffId: Number(this.pk_applycompoffId || 0), // Ensure pk_applycompoffId is a number 
    };

    this.httpAttendanceService.insertCompOffApproval(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(
            res.message || 'Short leave request submitted successfully'
          );
          this.ShortLeaveForm.reset();
          this.router.navigate([
            '/dash/leaves/leavesdashboard/CompOffRequestApprovallist',
          ]);
        } else {
          this.toastr.error(
            res.message || 'Failed to submit short leave request'
          );
        }
      },
    });
  }

  getShortLeaveById(id: number): void {
    this.httpAttendanceService.getCompOffApprovalById(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.shortLeaveData = res.data;

          this.ShortLeaveForm.patchValue({
            compoffdate: formatDateForInput(this.shortLeaveData.compoffdate),
            intime: this.shortLeaveData.intime,
            outtime: this.shortLeaveData.outtime,
            totalhours: this.shortLeaveData.totalhours,
            totdays: this.shortLeaveData.totdays || '1',
            Remarks: this.shortLeaveData.remarks,
          });
          console.log('ApprovalStatus:', this.shortLeaveData);
        } else {
          console.error('Failed to fetch short leave data:', res.message);
        }
      },
      error: (err) => {
        console.error('Error fetching short leave data:', err);
      },
    });
  }
}