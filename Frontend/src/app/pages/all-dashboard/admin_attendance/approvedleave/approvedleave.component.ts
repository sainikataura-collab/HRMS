import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';

@Component({
  selector: 'app-approvedleave',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './approvedleave.component.html',
  styleUrl: './approvedleave.component.scss'
})
export class ApprovedleaveComponent {
 leaveForm!: FormGroup;
  submitted = false;
EmployeeList: { name: string; value: string }[] = [];
//leave: { name: string; value: string }[] = [];

  leaveList: any[] = [];   // final list from API
  showList: boolean = false;

  leave: { name: string; value: string | null }[] = [
 { name: 'Attendance Regularization', value: '3' },
  { name: 'Comp Off', value: '2' },
   { name: 'Short Leave', value: '1' }
 
];


  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private leaveService: LeaveTransactionService
  ) {}

  ngOnInit() {
    this.leaveForm = this.fb.group({
      fk_leaveId: [null, Validators.required],
      fk_empid: [null, Validators.required],
      fromDate: [''],
      toDate: ['']
    });

    
   

     this.getEmployeelist('Employee');
  }



  

  getEmployeelist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.leaveService.getEmployee(fieldName).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            console.log(res.data)
            this.EmployeeList= res.data.map((Emp: any) => ({
              name: Emp.name,
              value: Emp.value
            }));
          } else {
            this.toastr.error("Failed to load employee list.");
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error("Error fetching employee list:", err);
          this.toastr.error("Error fetching employee list. Please try again.");
          this.ngxUILoaderService.stop();
        }
      });
    }



  getList() {
  if (this.leaveForm.invalid) {
    this.toastr.warning('Please select all required fields.');
    this.submitted=true;
      this.showList = false;
    return;
  }

  const { fk_leaveId, fk_empid, fromDate, toDate } = this.leaveForm.value;

  this.ngxUILoaderService.start();

  this.leaveService.getApprovedList(fk_leaveId, fk_empid, fromDate, toDate).subscribe({
    next: (res) => {
      try {
        if (res?.isSuccess) {
          this.leaveList = res.data || [];
          this.showList = this.leaveList.length > 0;
          if (!this.showList) {
            this.toastr.info("No records found.");
          }
        } else {
          this.leaveList = [];
          this.showList = false;
          this.toastr.error(res?.message || "No records found.");
        }
      } catch (e) {
        console.error("Error processing response:", e);
        this.toastr.error("Unexpected error while processing list.");
        this.leaveList = [];
        this.showList = false;
      } finally {
        this.ngxUILoaderService.stop();
      }
    },
    error: (err) => {
      console.error("Error fetching list:", err);
      this.toastr.error("Something went wrong while fetching list.");
      this.leaveList = [];
      this.showList = false;
      this.ngxUILoaderService.stop();
    }
  });
}


rejectLeave(emp: any) {
  if (!emp || !emp.LeaveType || !emp.pk_shortLeaveId && !emp.pk_applycompoffId && !emp.pk_inoutid) {
    this.toastr.warning("Invalid leave record selected.");
    return;
  }

  let requestType = '';
  let requestId = '';

  // Determine requestType and requestId based on LeaveType
  switch(emp.LeaveType) {
    case 'Short Leave':
      requestType = 'ShortLeave';
      requestId = emp.pk_shortLeaveId;
      break;
    case 'Comp Off':
      requestType = 'CompOff';
      requestId = emp.pk_applycompoffId;
      break;
    case 'In-Out Regularisation':
      requestType = 'Attendance';
      requestId = emp.pk_inoutid;
      break;
    default:
      this.toastr.warning("Unknown leave type.");
      return;
  }

  if(!confirm("Are you sure you want to reject this leave?")) return;

  this.ngxUILoaderService.start();

  this.leaveService.RejectLeave(requestType, requestId).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message);
        // remove rejected leave from list
        this.leaveList = this.leaveList.filter(l => l !== emp);
        this.showList = this.leaveList.length > 0;
      } else {
        this.toastr.error(res.message || "Failed to reject leave.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error(err);
      this.toastr.error("Server error while rejecting leave.");
      this.ngxUILoaderService.stop();
    }
  });
}


  resetForm() {
    this.leaveForm.reset();
    this.leaveList = [];
    this.showList = false;
  }

  








     

}
