import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { LeaveTransactionService } from '../../../all-dashboard/payroll/services/leave-transaction.service';
import { LeavereqService } from '../../leaves/Service/leavereq.service';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../Services/attendance.service';

@Component({
  selector: 'app-emp-od-request',
  standalone: true,
  imports: [NgSelectComponent, CommonModule, FormsModule, NgxPaginationModule, ReactiveFormsModule, CommonSearchComponent, RouterLink],
  templateUrl: './emp-od-request.component.html',
  styleUrl: './emp-od-request.component.scss'
})

export class EmpODRequestComponent {



  //leaveTransactionForm!:FormGroup;
  ODRequestForm!: FormGroup;
  submitted = false;
  id!: number;
  //Isedit=false;
  showError = false;
  leavetypeddl: { name: string, value: string }[] = [];
  leaveDetailsList: any[] = [];
  calculatedLeaveList: any[] = [];
  LeavesTakenList: any[] = [];
  leavetakenid!: string;
  searchText: string = '';
  selectedEmployeeDetails: any;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;


  showList: boolean = false;
  showLB: boolean = true;
  showLT: boolean = true;



  // filteredLocations: string[] = [...this.locations];

  constructor(private fb: FormBuilder,
    private leaveTransactionService: LeaveTransactionService,
    private leaveReqService: LeavereqService,
    private attendanceservice: AttendanceService,
    private toastrService: ToastrService,
    private router: Router) { }

  ngOnInit() {

    this.ODRequestForm = this.fb.group({
      pk_leaveappid: [0],
      fk_finid: [null],
      fk_empid: [null],
      fk_leaveid: [null, [Validators.required]],
      status: [null],
      remarks: [''],
      fromdate: ['', [Validators.required]],
      todate: ['', [Validators.required]],
      //  dates:[''] ,
      attSource: [null],
      leavetaken: [null],
      contactno: [''],
      //new columns
      fromtime: ['',[Validators.required]],
      totime: ['',[Validators.required]],
      totalhour: [''],
    });

    // for auto calculate total hours
    this.ODRequestForm.get('fromtime')?.valueChanges.subscribe(() => this.updateTotalHours());
this.ODRequestForm.get('totime')?.valueChanges.subscribe(() => this.updateTotalHours());

    this.getLeavetype('ODLeave');

  }


  // get LeaveType ddl

  getLeavetype(fieldName: string) {
    // this.ngxUILoaderService.start(); // Start loader before API call
    this.leaveReqService.getCommonDropdown(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          res.data = res.data.slice(1);
          this.leavetypeddl = res.data.map((leaveType: any) => ({
            name: leaveType.name,
            value: leaveType.value
          }));
        } else {
          this.toastrService.error("Failed to load EmpNature list.");
        }
      },
      error: (err) => {
        console.error("Error fetching EmpNature list:", err);
        this.toastrService.error("Error fetching EmpNature.");

      }
    });
  }



  //Date
  onCalculateClick(): void {
    debugger
    if (this.ODRequestForm.invalid) {
      this.showError = true;
      window.scrollTo(0, 0)
      return;
    }
    const Datefrom = this.ODRequestForm.get('fromdate')?.value;
    const Dateto = this.ODRequestForm.get('todate')?.value;
    const leaveTypeId = this.ODRequestForm.get('fk_leaveid')?.value;

    if (!Datefrom || !Dateto || !leaveTypeId) {
      this.toastrService.warning('Please fill all required fields.');
      return;
    }
    this.leaveReqService.geEmpLeavesOnDatest(leaveTypeId, Datefrom, Dateto).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.calculatedLeaveList = res.data.leaveTakenDates;
      } else {
        this.toastrService.warning(res.message || 'No leave records found.');
        this.calculatedLeaveList = [];
      }
    }, error => {
      console.error('Error:', error);
      this.toastrService.error('Failed to fetch leave data');
    });
  }


  convertToDDMMYYYY(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // "14/06/2025"
  }
  //Auto calculate of total hours

  updateTotalHours(): void {
  const fromTime = this.ODRequestForm.get('fromtime')?.value;
  const toTime = this.ODRequestForm.get('totime')?.value;

  if (fromTime && toTime) {
    const from = new Date(`1970-01-01T${fromTime}`);
    const to = new Date(`1970-01-01T${toTime}`);
    const diffMs = to.getTime() - from.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);

    this.ODRequestForm.get('totalhour')?.setValue(diffHrs > 0 ? diffHrs.toFixed(2) : '0');

    if (diffHrs <= 0) {
  this.toastrService.warning('To Time must be greater than From Time');
}
  }
  
}
  onSubmit() {

    
    if(this.calculatedLeaveList.length==0){
      this.toastrService.info("No date has been there in the request apply list.Please click on Calculate button to get the valid allowed dates for leave.")
      return;
    }

    if (this.ODRequestForm.invalid) {
      this.showError = true;
      window.scrollTo(0, 0);
      return;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedCurrentDate = `${day}/${month}/${year}`;
    const payload = {
      pk_leaveappid: this.ODRequestForm.value.pk_leaveappid || "0",
      pk_applycompoffId: "0", // set accordingly if applicable
      pk_shortLeaveId: "0",   // set accordingly if applicable
      fk_leaveid: String(this.ODRequestForm.value.fk_leaveid || ""),
      fk_empid: this.ODRequestForm.value.fk_empid || "",
      fk_finid: this.ODRequestForm.value.fk_finid || "",
      fromdate: this.convertToDDMMYYYY(this.ODRequestForm.value.fromdate),
      todate: this.convertToDDMMYYYY(this.ODRequestForm.value.todate),

      totdays: this.ODRequestForm.value.leavetaken || 0,
      reason: this.ODRequestForm.value.remarks || "", // assuming remarks = reason
      contactno: this.ODRequestForm.value.contactno || "", // Add a field in form if needed
      contactduringleave: "", // Add a field in form if needed
      //new columns 
      fromtime: this.ODRequestForm.value.fromtime || "",
      totime: this.ODRequestForm.value.totime || "",
      totalhour: this.ODRequestForm.value.totalhour || "",

      intime: "", // Add in form if needed
      outtime: "",
      totalhours: "",
      leaveBalance: 0,
      currentyearleaves: 0,
      totalleavesearned: 0,
      totalleave: 0,
      leaveavailed: 0,
      balanceLeave: 0,

      leaveDetail: this.calculatedLeaveList.map((leave, index) => ({
        dates: leave.dates,
        leaveType: leave.leaveType || '',
        ishalfday: leave.ishalfday === true || leave.ishalfday === 'true' || leave.ishalfday === 1,
        ishalfdayDes: leave.ishalfdayDes === true || leave.ishalfdayDes === 'true' || leave.ishalfdayDes === 1,
        sno: leave.cid || index + 1,
        leaveid: String(leave.fk_leaveid || leave.leaveid || ""),
        remarks: leave.remarks || '',
        halfdaystatus: leave.halfdaystatus || ''
      }))
    };

    this.attendanceservice.add_ODReq(payload).subscribe(
      res => {

        if(res.isSuccess)
        {
                this.toastrService.success(res.message);
                this.ODRequestForm.reset();
                this.showError = false;
                this.router.navigateByUrl("/dash/attendance/attendancedashboard/OD-request-list");
        }
        else
        {
                this.toastrService.error(res.message);
        }
      },
      err => {
        this.toastrService.error("Error while submitting leave");
      }
    );
  }



//new
  //for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}

  getLeavesTakenListDetails(): void {
    let fk_empid = this.ODRequestForm.get('fk_empid')?.value;

    if (!fk_empid) {
      alert('Please select an employee first!');
      return; // Stop execution if not selected
    }
    this.leaveTransactionService.get_LeaveTransaction(this.pageIndex - 1, this.pageSize, fk_empid).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.LeavesTakenList = res.data;
        this.leavetakenid = res.data[0].pk_leavetakenid;
        this.totalItems = res.totalCount;
        // ✅ Show List, Hide LB and LT
        this.showList = true;
        this.showLB = false;
        this.showLT = false;

       
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }


  showBalance: boolean = false; // Flag to toggle balance view

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
    // Toggle the flag
  }

  toggleToBalance(): void {
    this.showLB = true;
    this.showList = false;
  }


  resetForm(): void {
    this.ODRequestForm.reset();
  }

  // calculateLeaveDays(): void {
   
  //   const fromDate = new Date(this.ODRequestForm.get('fromdate')?.value);
  //   const toDate = new Date(this.ODRequestForm.get('todate')?.value);

  //   if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
  //     const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // including both dates
  //     this.ODRequestForm.get('leavetaken')?.setValue(diffDays);
  //   } else {
  //     this.ODRequestForm.get('leavetaken')?.setValue(null);
  //   }
  // }

  calculateLeaveDays(): void {
  const fromDateValue = this.ODRequestForm.get('fromdate')?.value;
  const toDateValue = this.ODRequestForm.get('todate')?.value;

  const fromDate = fromDateValue ? new Date(fromDateValue) : null;
  const toDate = toDateValue ? new Date(toDateValue) : null;

  if (fromDate && toDate) {
    // Validate: From Date should be on or before To Date
    if (fromDate > toDate) {
      this.toastrService.error('From Date must be earlier than or equal to To Date.', 'Invalid Date Range');
      this.ODRequestForm.get('leavetaken')?.setValue(null);
      return;
    }

    // Valid case: calculate days (inclusive of both dates)
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.ODRequestForm.get('leavetaken')?.setValue(diffDays);
  } else {
    // Clear if any date is missing
    this.ODRequestForm.get('leavetaken')?.setValue(null);

    // Optional: validate dependent logic
    if (toDate && !fromDate) {
      this.toastrService.error('Please select From Date before choosing To Date.', 'Missing From Date');
      return;
    }
    if (fromDate && !toDate) {
      // Optional toast if needed
      return;
    }
  }
}

  onHalfDayToggle(index: number): void {
  const leave = this.calculatedLeaveList[index];

  // Recalculate total leave taken
  let total = 0;
  for (let item of this.calculatedLeaveList) {
    if (item.ishalfday) {
      total += 0.5;
    } else {
      total += 1;
    }
  }

  // Patch the updated leave taken value to form
  this.ODRequestForm.patchValue({
    leavetaken: total
  });
}





}
