import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { response } from 'express';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';

@Component({
  selector: 'app-leave-transaction',
  standalone: true,
  imports: [NgSelectComponent, CommonModule, FormsModule, NgxPaginationModule, ReactiveFormsModule, CommonSearchComponent],
  templateUrl: './leave-transaction.component.html',
  styleUrl: './leave-transaction.component.scss'
})
export class LeaveTransactionComponent {
  leaveTransactionForm!: FormGroup;
  submitted = false;
  id!: number;
  Isedit = false;
  showError = false;

  pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;
  // selects = [
  //   { name: 'Ahemadabad', value: 'Ahemadabad' },
  //   { name: 'Alwar', value: 'Alwar' },
  //   { name: 'Ankleshwar', value: 'Ankleshwar' },
  //   { name: 'Ambala', value: 'Ambala' }
  // ];


  employees: { name: string, value: string }[] = [];



  leavetypeddl: { name: string, value: string }[] = [];
  leaveDetailsList: any[] = [];

  calculatedLeaveList: any[] = [];

  LeavesTakenList: any[] = [];
  leavetakenid!: string;

  selectedEmployeeDetails: any;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;



  showList: boolean = false;
  showLB: boolean = true;
  showLT: boolean = true;



  // Default filter structure
  employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    userId: '',
    empStatus: '',
    search: '',
    pageNo: 1,
    pageSizes: 100
  };

  // filteredLocations: string[] = [...this.locations];

  constructor(private fb: FormBuilder, private leaveTransactionService: LeaveTransactionService, private toastrService: ToastrService, private router: Router) { }

  ngOnInit() {

    this.leaveTransactionForm = this.fb.group({
      // pk_leavetakenid:[null],
      fk_empid: [null, Validators.required],
      fk_leaveid: [null, [Validators.required]],
      totalBalancedLeave: [null],
      // leavetaken: [{ value: '', disabled: true }] , 
      leavetaken: [null],
      remarks: [''],
      datefrom: ['', [Validators.required],],
      dateto: ['', [Validators.required]],
      isLateComing: false,
    });

    //this. getEmployees();
    this.getLeavetype('Leave');

  }

  // added new 15/6/2026
  getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.leaveTransactionService
      .getEmpList(this.employeeFilters)
      .subscribe({

        next: (res) => {


          if (res.isSuccess) {

            this.employees =
              res.data.map((emp: any) => ({

                name: emp.name,

                value: emp.value

              }));

            if (!this.currentSearch) {

              this.initialEmployeeList =
                [
                  ...this.employees
                ];

            }
          }

          this.loadingEmployees = false;

        },

        error: () => {

          this.loadingEmployees = false;

          this.employees = [];

        }

      });

  }
  onEmployeeSearch(event: any) {

    const search =
      (event.term || '')
        .trim()
        .toLowerCase();

    clearTimeout(
      this.searchTimer
    );

    // blank
    if (!search) {
      this.employees =
        [
          ...this.initialEmployeeList
        ];

         this.loadingEmployees = false;
      return;

    }

    // local check
    const local =
      this.initialEmployeeList
        .filter(x =>

          x.name
            .toLowerCase()
            .includes(search)

        );

    if (local.length > 0) {

      this.employees =
        local;
      this.loadingEmployees = false;
      return;

    }

    // not found
      this.loadingEmployees = true;
    this.searchTimer =
      setTimeout(() => {
        this.currentSearch = search;
        this.pageNo = 1;
        this.getEmployees();

      }, 1000);

  }

 // added new 15/6/2026 end 
  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }


  //  Get LeaveTaken List Base on select emp


  onEmployeeSelect(employeeCode: string): void {
    const selectedEmployee = this.leaveTransactionForm.get('fk_empid')?.value;

    if (!selectedEmployee) {
      this.toastrService.error('Please select an employee', 'Error');
      return;
    }

    this.leaveTransactionService.getLeaveTakenDetailsById(selectedEmployee).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);

        // Assign leave details to be shown in the table
        this.leaveDetailsList = res.data.leaveDetails;

        // Optional: assign employee details if you want to show them elsewhere
        this.selectedEmployeeDetails = res.data.employee;


        // console.log(this.leaveDetailsList, 'Leave details');
      } else {
        console.error('Failed to retrieve data:', res.message);
        this.toastrService.error(res.message, 'Error');
      }
    }, error => {
      console.error('API Error:', error);
      this.toastrService.error('Something went wrong while fetching data', 'Error');
    });
  }



  // get LeaveType ddl

  getLeavetype(fieldName: string) {
    // this.ngxUILoaderService.start(); // Start loader before API call
    this.leaveTransactionService.getCommonDropdown(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
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


  onLeaveTypeSelect(): void {

    const empId = this.leaveTransactionForm.get('fk_empid')?.value;
    const selectedLeaveTypeId = this.leaveTransactionForm.get('fk_leaveid')?.value;

    if (!empId || !selectedLeaveTypeId) {
      return;
    }

    this.leaveTransactionService.getLeaveBalance(empId, selectedLeaveTypeId).subscribe(res => {
      if (res.isSuccess && res.data) {
        const data = res.data.leaveBalance;

        this.leaveTransactionForm.patchValue({
          // currentLeave: data.currentyearleaves,
          // earnedLeave: data.totalleavesearned,
          totalBalancedLeave: data.totalleavebal
        });
      } else {
        this.toastrService.warning('No leave balance found for selected leave type', 'Info');
        this.leaveTransactionForm.patchValue({
          currentLeave: '',
          earnedLeave: '',
          totalBalancedLeave: ''
        });
      }
    }, error => {
      console.error('Error fetching leave balance:', error);
      this.toastrService.error('Failed to fetch leave balance', 'Error');
    });
  }



  //Date
  onCalculateClick(): void {
    if (this.leaveTransactionForm.invalid) {
      this.showError = true;
      window.scrollTo(0, 0)
      return;
    }
    const empId = this.leaveTransactionForm.get('fk_empid')?.value;
    const fromDate = this.leaveTransactionForm.get('datefrom')?.value;
    const toDate = this.leaveTransactionForm.get('dateto')?.value;
    const leaveTypeId = this.leaveTransactionForm.get('fk_leaveid')?.value;

    if (!empId || !fromDate || !toDate || !leaveTypeId) {
      this.toastrService.warning('Please fill all required fields.');
      return;
    }

    this.leaveTransactionService.geEmpLeavesOnDatest(empId, leaveTypeId, fromDate, toDate).subscribe(res => {
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

  // formatDateForInput(dateStr: string): string | null {
  //   if (!dateStr) return null;
  //   const date = new Date(dateStr);
  //   const offset = date.getTimezoneOffset(); // Handle timezones correctly
  //   const localDate = new Date(date.getTime() - offset * 60 * 1000);
  //   return localDate.toISOString().split('T')[0]; // "yyyy-MM-dd"
  // }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];

    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD directly
  }
  //added code LR starts  
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
    this.leaveTransactionForm.patchValue({
      leavetaken: total
    });
  }
  //added code LR ends

  onSubmit() {

    if (this.leaveTransactionForm.invalid) {
      this.showError = true;
      window.scrollTo(0, 0)
      return;
    }

    if (this.calculatedLeaveList.length == 0) {
      this.toastrService.info("No leave details entered.Please ensure at least one leave is there to save.")
      return;
    }



    const payload = {
      leavesTakenMasters: {
        fk_empid: this.leaveTransactionForm.value.fk_empid,
        pk_leavetakenid: this.leavetakenid,
        fk_leaveappid: '',
        fk_leaveid: this.leaveTransactionForm.value.fk_leaveid,
        fromdate: this.leaveTransactionForm.value.datefrom,
        todate: this.leaveTransactionForm.value.dateto,
        leavetaken: this.leaveTransactionForm.value.leavetaken,
        remarks: this.leaveTransactionForm.value.remarks,
        isLateComing: this.leaveTransactionForm.value.isLateComing,
      },

      leaveTakenDetails: this.calculatedLeaveList.map(leave => {
        // const dateObj = new Date(leave.dates);
        // const formattedDate = isNaN(dateObj.getTime())? null: dateObj.toLocaleDateString('sv-SE'); // 👈 formats as 'YYYY-MM-DD'

        // const formattedDate = leave.dates? new Date(leave.dates).toISOString().split('T')[0]: null;

        const formattedDate = this.formatDateForInput(leave.dates);
        return {
          sno: leave.cid,
          //fk_leaveid: leave.fk_leaveid, // ✅ FIXED here
          // fk_leaveid: leave.leaveid ? +leave.leaveid : null,
          fk_leaveid: leave.fk_leaveid ? +leave.fk_leaveid : (leave.leaveid ? +leave.leaveid : null),

          // fk_leaveid: +leave.fk_leaveid,  // Ensure it's a number
          dated: formattedDate,
          clubcase: leave.clubcase || '',
          covercase: leave.covercase || '',
          isHalfDay: leave.ishalfday || false,
          remarks: leave.remarks || '',
          halfdaystatus: leave.halfdaystatus || '',
          halfdayclub: leave.halfdayclub || ''
        };
      }),

      Fk_LocID: sessionStorage.getItem('locationID'),
      Fk_UserID: sessionStorage.getItem('fk_UserID')
    };



    if (this.isEditMode) {
      this.leaveTransactionService.update_LeaveTransaction(payload).subscribe(
        res => {
          this.toastrService.success(res.message || 'Leave updated successfully');
          this.leaveTransactionForm.reset();
          this.calculatedLeaveList = [];                 // ✅ Clear calculated list
          this.leaveDetailsList = [];                    // ✅ Clear leave detail list
          this.showError = false;


        },
        err => {
          this.toastrService.error('Error while updating leave');
        }
      );

    }

    this.leaveTransactionService.add_LeaveTransaction(payload).subscribe(
      res => {

        if (res.isSuccess) {
          this.toastrService.success(res.message);
          const currentEmpId = this.leaveTransactionForm.get('fk_empid')?.value;
          //   this.leaveTransactionForm.reset();
          this.leaveTransactionForm.reset({
            fk_empid: currentEmpId   // keep employee selected
          });

          this.calculatedLeaveList = [];
          this.leaveDetailsList = [];
          this.getLeavesTakenListDetails();
          this.onEmployeeSelect(currentEmpId);                  // ✅ Clear leave detail list
          this.showError = false;
        }
        else {
          this.toastrService.error(res.message);
        }
      },
      err => {
        this.toastrService.error("Error while submitting leave");
      }
    );

  }



  getLeavesTakenListDetails(): void {
    let fk_empid = this.leaveTransactionForm.get('fk_empid')?.value;

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

        console.log(this.totalItems, 'this is total items retrieveddfgdfgdfg', this.leavetakenid, 'yhoisdjfijdf', this.LeavesTakenList, 'sdfyyyyyy', res.data.pk_leavetakenid);
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
        this.LeavesTakenList = []; // clear list when no employee selected
        this.totalItems = 0;
      }
    });
  }


  // for pagination
  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getLeavesTakenListDetails();
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
    this.leaveTransactionForm.reset();
  }

  calculateLeaveDays(): void {
    const fromDate = new Date(this.leaveTransactionForm.get('datefrom')?.value);
    const toDate = new Date(this.leaveTransactionForm.get('dateto')?.value);

    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // including both dates
      this.leaveTransactionForm.get('leavetaken')?.setValue(diffDays);
    } else {
      this.leaveTransactionForm.get('leavetaken')?.setValue(null);
    }
  }


  fk_leaveid!: number;

  //getById
  onEditClick(pk_leavetakenid: string) {
    this.isEditMode = true;
    window.scrollTo(0, 0);
    this.leaveTransactionService.getById(pk_leavetakenid).subscribe((res) => {
      if (res?.isSuccess && res.data) {
        const emp = res.data.employee;
        const master = res.data.leaveTakemMster;
        const details = res.data.leaveTakenDetails;
        // Fix: Extract fk_leaveid from first item

        this.fk_leaveid = details[0]?.fk_leaveid || '';
        // Patch form data
        this.leaveTransactionForm.patchValue({
          fk_empid: master.fk_empid,
          fk_leaveid: master.fk_leaveid?.toString() || '',
          datefrom: this.convertToDate(master.fromdate),
          dateto: this.convertToDate(master.todate),
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

  deleteLeaveTransaction(pk_leavetakenid: string) {
    debugger

    if (confirm('Are you sure you want to delete this record?')) {
      this.leaveTransactionService.delete_LeaveTransaction(pk_leavetakenid).subscribe(
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
