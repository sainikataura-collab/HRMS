import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LeaveTypeMasterService } from '../../../all-dashboard/payroll/services/leavetype.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { LeaveTransactionService } from '../../../all-dashboard/payroll/services/leave-transaction.service';
import { LeavereqService } from '../Service/leavereq.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { formatDateForInput } from '../../../../healpers/commonlib';

@Component({
  selector: 'app-emp-leave-request',
  standalone: true,
  imports: [NgSelectComponent,CommonModule,FormsModule,NgxPaginationModule,ReactiveFormsModule,RouterLink],
  templateUrl: './emp-leave-request.component.html',
  styleUrl: './emp-leave-request.component.scss'
})
export class EmpLeaveRequestComponent {

    
message:string='';
//leaveTransactionForm!:FormGroup;
 leaveRequestForm!: FormGroup;
  submitted=false;
id!:number;
//Isedit=false;
showError =false;



leavetypeddl: { name: string, value: string }[] = [];
leaveDetailsList: any[] = [];

calculatedLeaveList: any[] = [];

LeavesTakenList: any[] = [];
leavetakenid!:string;

selectedEmployeeDetails: any;

pageIndex:number=1;
pageSize:number=10;
totalItems :number= 0;


showList: boolean = false;
showLB: boolean = true;
showLT: boolean = true;

totalBalancedLeave: number = 0; 
onProDataBasis:boolean=false;
proRatedLeaveRemaining:number = 0;


 // filteredLocations: string[] = [...this.locations];

  constructor(private fb: FormBuilder,
    private leaveTransactionService:LeaveTransactionService,
    private leaveReqService:LeavereqService,
    private  toastrService: ToastrService,
    private router: Router,  private rout: ActivatedRoute) {}

  ngOnInit() {
    
    this.leaveRequestForm = this.fb.group({
     pk_leaveappid:[0],
      fk_finid:[null],
      fk_empid:[null],
      fk_leaveid: [null,[ Validators.required]],
      totalBalancedLeave:[null],
      onProDataBasis:[false],
      proRatedLeaveRemaining:[null],
      status: [null] , 
      remarks: ['',[Validators.required]],
      fromdate: ['',[ Validators.required]],
      todate: ['',[ Validators.required]],
       dated:[''] ,
      attSource:[null],
      leavetaken: [null] , 
       });

     this.getLeavetype();

  }


  // get LeaveType ddl

 getLeavetype() {
    // this.ngxUILoaderService.start(); // Start loader before API call
    this.leaveReqService.getleavelist().subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                 res.data=res.data.slice(1);

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


  onLeaveTypeSelect(fk_leaveid:any): void {
  
   this.calculatedLeaveList=[]
    const empId = sessionStorage.getItem('UserId');
    const selectedLeaveTypeId = this.leaveRequestForm.get('fk_leaveid')?.value;
  
    if (!selectedLeaveTypeId) {
      return;
    }
  
   this.leaveReqService.getLeaveBalance(selectedLeaveTypeId).subscribe(res => {
      if (res.isSuccess && res.data) {
        const data = res.data.leaveBalance;
           this.leaveRequestForm.patchValue({
           totalBalancedLeave: data.totalleavebal,
           onProDataBasis:data.onProDataBasis,
      proRatedLeaveRemaining:data.proRatedLeaveRemaining,
            
        });
          // Optionally store it in a variable if needed
        this.totalBalancedLeave = data.totalleavebal;
        this.onProDataBasis=data.onProDataBasis;
        this.proRatedLeaveRemaining=data.proRatedLeaveRemaining;
           // console.log("",totalBalancedLeave)
      } else {
        this.leaveRequestForm.patchValue({
          currentLeave: '',
          earnedLeave: '',
          totalBalancedLeave: '',
          onProDataBasis:false,
          proRatedLeaveRemaining:''
        });
      }
    }, error => {
      console.error('Error fetching leave balance:', error);
      this.toastrService.error('Failed to fetch leave balance', 'Error');
    });
  }
  

  //added code LR starts  
  onHalfDayToggle(index: number): void {
 // const leave = this.calculatedLeaveList[index];

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
  this.leaveRequestForm.patchValue({
    leavetaken: total
  });
}
  //added code LR ends

async validatbalance(): Promise<boolean> {
  const appliedLeave = this.leaveRequestForm.get('leavetaken')?.value;
  const selectedLeaveTypeId = this.leaveRequestForm.get('fk_leaveid')?.value;
  debugger;

  if (!appliedLeave || !selectedLeaveTypeId) return false;

  try {
    const res = await this.leaveReqService.validate_leavebalance(selectedLeaveTypeId, appliedLeave).toPromise();
    if (res.isSuccess) {
      //this.toastrService.success(res.message);
      return true;
    } else {
      this.toastrService.warning(res.message); // show warning message
      return false;
    }
  } catch (error) {
    console.error('Error validating balance', error);
    this.toastrService.error('Validation failed. Please try again.');
    return false;
  }
}

  async onCalculateClick(): Promise<void> {

  if (this.leaveRequestForm.invalid) {
    this.showError = true;
    window.scrollTo(0, 0);
    return;
  }

  const Datefrom = this.leaveRequestForm.get('fromdate')?.value;
  const Dateto = this.leaveRequestForm.get('todate')?.value;
  const leaveTypeId = this.leaveRequestForm.get('fk_leaveid')?.value;

   

  if (!Datefrom || !Dateto || !leaveTypeId) {
    this.toastrService.warning('Please fill all required fields.');
    return;
  }

  
  const isValidBalance = await this.validatbalance();
  if (!isValidBalance) {
    // Show warning already handled inside validatbalance
    return;
  }

  this.leaveReqService.geEmpLeavesOnDatest(leaveTypeId, Datefrom, Dateto).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.calculatedLeaveList = res.data.leaveTakenDates;
        this.onHalfDayToggle(0);
        // Optionally call this.calculateLeaveDays();
      } else {
        this.toastrService.warning(res.message || 'No leave records found.');
        this.calculatedLeaveList = [];
      }
    },
    error: (error) => {
      console.error('Error:', error);
      this.toastrService.error('Failed to fetch leave data');
    }
  });
}



  onSubmit() {

    
    if(this.calculatedLeaveList.length==0){
      this.toastrService.info("No date has been there in the leave apply list.Please click on Calculate button to get the valid allowed dates for leave.")
      return;
    }
 
    if (this.leaveRequestForm.invalid) {
      this.showError=true;
      window.scrollTo(0,0)
      return;
    }

    const isProData = this.leaveRequestForm.get('onProDataBasis')?.value;
  const proRatedRemaining = this.leaveRequestForm.get('proRatedLeaveRemaining')?.value;
  const leaveTaken = this.leaveRequestForm.get('leavetaken')?.value;
    if (isProData && leaveTaken > proRatedRemaining) {
      if(proRatedRemaining==0){
        this.toastrService.error(`You dont have any prorated leave balance left.Current pro-rated leave balance ${proRatedRemaining} days.`);
      }else{
        this.toastrService.error(`You cannot take more than ${proRatedRemaining} pro-rated leave days.`);
      }    
    return;
  }


      const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const formattedCurrentDate = `${year}/${month}/${day}T00:00:00+05:30`;
    const payload = {
      
       attSource:'W',
       sAL_Leave_Apply: {
        dated: formattedCurrentDate,  // ✅ Use current date here
        fk_empid: this.leaveRequestForm.value.fk_empid||'',
        fk_finid: this.leaveRequestForm.value.fk_finid||'',
        pk_leavetakenid:this.leavetakenid,
        pk_leaveappid:  this.leaveRequestForm.value.pk_leaveappid||0,
        fk_leaveid:this.leaveRequestForm.value.fk_leaveid,
        fromdate: this.leaveRequestForm.value.fromdate,
        todate: this.leaveRequestForm.value.todate,
        totdays:this.leaveRequestForm.value.leavetaken,
        remarks: this.leaveRequestForm.value.remarks,
        status:'',
      
      },
  
      sAL_Leave_Apply_Details: this.calculatedLeaveList.map(leave => {

         const formattedDate = formatDateForInput(leave.dates);
        return {
          sno: leave.cid,
          //fk_leaveid: leave.fk_leaveid, // ✅ FIXED here
         // fk_leaveid: leave.leaveid ? +leave.leaveid : null,
         fk_leaveid: leave.fk_leaveid ? String(leave.fk_leaveid) : (leave.leaveid ? String(leave.leaveid) : ''),

          fk_leaveappid: leave.fk_leaveappid||0,
          // fk_leaveid: +leave.fk_leaveid,  // Ensure it's a number
          dated: formattedDate,
          clubcase: leave.clubcase || '',
          covercase: leave.covercase || '',
          isHalfDay: leave.ishalfday === true || leave.ishalfday === "true" || leave.ishalfday === 1 || leave.ishalfday === "1",
          remarks: leave.remarks || '',
          halfdaystatus: leave.halfdaystatus || '',
          halfdayclub: leave.halfdayclub || ''
        };
      }),
  
      // Fk_LocID: sessionStorage.getItem('locationID'),
      // Fk_UserID: sessionStorage.getItem('fk_UserID')
    };
    
    console.log("payload",payload)

  
    this.leaveReqService.add_LeaveReq(payload).subscribe(
      res => {


       
        if(res.isSuccess==true)
        {
             this.toastrService.success(res.message); 
                this.leaveRequestForm.reset();
                 this.router.navigateByUrl("/dash/leaves/leavesdashboard/leavereqlist");

        }
        else{
             this.toastrService.error(res.message); 
          return ;
        }

        

     
        // this.calculatedLeaveList = [];
        // this.leaveDetailsList = [];                    // ✅ Clear leave detail list
       
        this.showError = false;
      },
      err => {
        this.toastrService.error("Error while submitting leave");
      }
    );

  }
  


  getLeavesTakenListDetails():void {
    let fk_empid=this.leaveRequestForm.get('fk_empid')?.value;

    if (!fk_empid) {
      alert('Please select an employee first!');
      return; // Stop execution if not selected
    }
    this.leaveTransactionService.get_LeaveTransaction(this.pageIndex-1,this.pageSize,fk_empid).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.LeavesTakenList = res.data;
            this.leavetakenid = res.data[0].pk_leavetakenid;
            this.totalItems = res.totalCount;
             // ✅ Show List, Hide LB and LT
              this.showList = true;
              this.showLB = false;
              this.showLT = false;
           
            console.log(this.totalItems, 'this is total items retrieveddfgdfgdfg',this.leavetakenid,'yhoisdjfijdf',this.LeavesTakenList,'sdfyyyyyy',res.data.pk_leavetakenid);
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
    this.leaveRequestForm.reset();
  }

  // calculateLeaveDays(): void {


  //   const fromDate = new Date(this.leaveRequestForm.get('fromdate')?.value);
  //   const toDate = new Date(this.leaveRequestForm.get('todate')?.value);
  
  //   if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
  //     const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // including both dates
  //     this.leaveRequestForm.get('leavetaken')?.setValue(diffDays);
  //   } else {
  //     this.leaveRequestForm.get('leavetaken')?.setValue(null);
  //   }
  // }
  
  calculateLeaveDays(): void {
  const fromDateValue = this.leaveRequestForm.get('fromdate')?.value;
  const toDateValue = this.leaveRequestForm.get('todate')?.value;

  const fromDate = fromDateValue ? new Date(fromDateValue) : null;
  const toDate = toDateValue ? new Date(toDateValue) : null;

  if (fromDate && toDate) {
    // Validate: From Date should be on or before To Date
    if (fromDate > toDate) {
      this.toastrService.error('From Date must be earlier than or equal to To Date.', 'Invalid Date Range');
      this.leaveRequestForm.get('leavetaken')?.setValue(null);
      return;
    }

    // Valid case: calculate days (inclusive of both dates)
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.leaveRequestForm.get('leavetaken')?.setValue(diffDays);
  } else {
    // Clear if any date is missing
    this.leaveRequestForm.get('leavetaken')?.setValue(null);

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


  fk_leaveid!:number;

//getById
onEditClick(pk_leavetakenid: string) {
  this.isEditMode = true;
  window.scrollTo(0,0);
  this.leaveTransactionService.getById(pk_leavetakenid).subscribe((res) => {
    if (res?.isSuccess && res.data) {
      const emp = res.data.employee;
      const master = res.data.leaveTakemMster;
      const details = res.data.leaveTakenDetails;
      // Fix: Extract fk_leaveid from first item

      this.fk_leaveid = details[0]?.fk_leaveid || '';
      // Patch form data
      this.leaveRequestForm.patchValue({
        fk_empid: master.fk_empid,
        fk_leaveid: master.fk_leaveid?.toString() || '',
        fromdate: this.convertToDate(master.fromdate),
        todate: this.convertToDate(master.todate),
        leavetaken: master.leavetaken,
        remarks: master.remarks
      });
        // Map leaveTakenDetails to calculatedLeaveList for the table
        this.calculatedLeaveList = details.map((leave: any) => ({
          cid: leave.cid,
          fk_leaveid: leave.fk_leaveid,  // ✅ Use correct field
          dates: leave.dates,
          leaveType: leave.leavetype,
          ishalfday: leave.ishalfday,
         // halpdaystatus: leave.halpdaystatus,
         halfdaystatus: leave.halfdaystatus,

          halfdayclub: leave.halfdayclub,
          remarks: leave.remarks
        }));

       

      // Optional: Patch a table/list of leaveTakenDetails
      //this.leaveDetailsList = res.data.leaveTakenDetails;
      // this.onCalculateClick();

      // Optional: Show form if it's hidden or scroll to it
      // this.isFormVisible = true;
    }
  });
}

convertToDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/'); // "02/04/2025" → ["02", "04", "2025"]
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // → "2025-04-02"
}

deleteLeaveTransaction(pk_leavetakenid:string) {
  debugger

  if (confirm('Are you sure you want to delete this record?')) {
      this.leaveTransactionService.delete_LeaveTransaction(pk_leavetakenid ).subscribe(
        (response: any) => {
          if (response.isSuccess) {
  
            this.toastrService.success(response.message || 'Record deleted successfully');
  
              //alert('Record deleted successfully');
              this.getLeavesTakenListDetails(); // Refresh the list
          } else {
            this.toastrService.error(response.message, 'Error');
          }
      },
      (errorMessage) => {
          console.error('Error deleting record', errorMessage);
          this.toastrService.error(errorMessage, 'Error');
         
      }
      );
  }
  }







  


isEditMode: boolean = false;
     
}