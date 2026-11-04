import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { LeaveAccrualService } from '../../payroll/services/leave-accrual.service';

@Component({
  selector: 'app-leave-accrual',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectComponent, CommonSearchComponent],
  templateUrl: './leave-accrual.component.html',
  styleUrl: './leave-accrual.component.scss'
})
export class LeaveAccrualComponent {
  EmployeeForm!: FormGroup;
  submitted = false;
  showError = false;
  showEmployeeList: boolean = false;

  id!: number;
  Isedit = false;
  ngxUILoaderService = inject(NgxUiLoaderService);

  Month: { name: string, value: string }[] = [];
  Year: { name: string, value: string }[] = [];
  Unprocessedlist: any[] = [];
  processedList: any[] = [];

  searchText1 = '';
  searchText = '';
  CostCenter: any[] = [];
  isContractApplicable = false;

  // List 1 pagination
pageIndex1 = 0;
pageSize1 = 7;
totalCount1 = 0;

// List 2 pagination
pageIndex2 = 0;
pageSize2 = 7;
totalCount2 = 0;


  constructor(private fb: FormBuilder, private toastrService: ToastrService, private router: Router, private serivce: LeaveAccrualService) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;

    this.EmployeeForm = this.fb.group({
      fk_monthId: [null, [Validators.required]],
      fk_yearId: [null, [Validators.required]],
      empCode: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [],
      SelectedDesignation: [''],
      selectedLocations: [],
      SelectedNature: [''],
      SelectedCity: [''],
      sortBy: [''],
      userId: [''],
      empStatus: [''],
      fk_costcentreid: [null],

    });

    this.getMonthlist('Month');
    this.getYearList('Year');
    this.getcostcenterList('CostCenter');
  }

  get filterProcessedData() {
    if (!this.searchText1) {
      return this.processedList;
    }
    const search = this.searchText1.toLowerCase();
    return this.processedList.filter(emp =>
      emp.empcode.toLowerCase().includes(search) ||
      emp.empname.toLowerCase().includes(search) ||
      emp.locname.toLowerCase().includes(search) ||
      emp.department.toLowerCase().includes(search) ||
      emp.designation.toLowerCase().includes(search)
    );
  }

  get filterUnprocessedData() {
    if (!this.searchText) {
      return this.Unprocessedlist;
    }
    const search = this.searchText.toLowerCase();
    return this.Unprocessedlist.filter(emp =>
      emp.empcode.toLowerCase().includes(search) ||
      emp.empname.toLowerCase().includes(search)

    );
  }






  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);
    //this.getEmployees(); // Refresh list with new filters
  }

  getMonthlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.serivce.getMonthlist(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Month = res.data.map((month: any) => ({
            name: month.name,
            value: month.value
          }));
        } else {
          this.toastrService.error("Failed to load month list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching leave list:", err);
        this.toastrService.error("Error fetching month list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  //get year list 
  getYearList(fieldName: string) {
    this.ngxUILoaderService.start(); // Start loader before API call

    this.serivce.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Year = res.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        } else {
          this.toastrService.error("Failed to load HOD list.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response

      },
      error: (err) => {
        console.error("Error fetching HOD list:", err);
        this.toastrService.error("Error fetching level list.");

      }
    });
  }

  getcostcenterList(fieldName: string) {
    this.ngxUILoaderService.start(); // Start loader before API call

    this.serivce.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.CostCenter = res.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        } else {
          this.toastrService.error("Failed to load list.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response

      },
      error: (err) => {
        console.error("Error fetching  list:", err);
        this.toastrService.error("Error fetching  list.");

      }
    });
  }

  masterSelected: boolean = false;
  Selected: boolean = false;

  selectAll() {

    for (let emp of this.Unprocessedlist) {
      emp.isSelected = this.masterSelected;
    }
  }

  AllSelectprocessed() {

    for (let emp of this.processedList) {
      emp.isSelected = this.Selected;
    }
  }


  checkIfAllSelected() {
    this.masterSelected = this.processedList.every(emp => emp.isSelected);
  }

  getList() {

    if (this.EmployeeForm.invalid) {
      // alert('please enter month & year');
      this.showError = true;
      return;
    }

    const formValues = this.EmployeeForm.value;
     const payload = {
    ...formValues,
    pageIndex1: this.pageIndex1,
    pageSize1: this.pageSize1,
    pageIndex2: this.pageIndex2,
    pageSize2: this.pageSize2
  };

    this.serivce.get_LeaveAccruallist(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) { // Ensure `res` is not undefined or null
          console.log('Data retrieved successfully:',
            res.data);
          this.processedList = res.data.leaveAccrualMst1 || [];
          this.Unprocessedlist = res.data.leaveAccrualMst || [];
             this.totalCount1 = res.data.totalCount1 || 0;
        this.totalCount2 = res.data.totalCount2 || 0;
          if (this.processedList.length === 0 && this.Unprocessedlist.length === 0) {
            this.toastrService.info('No data found for the selected month and year.');
          }


        } else {
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      }

    });
  }


  onPageChange1(newIndex: number) {
  this.pageIndex1 = newIndex;
  this.getList();
}

onPageChange2(newIndex: number) {
  this.pageIndex2 = newIndex;
  this.getList();
}
  onViewClick() 
  {
     this.pageIndex1 = 0;
  this.pageIndex2 = 0;
    this.toggleEmployeeList();
    this.getList();
  }

  toggleEmployeeList() {
    this.showEmployeeList = true; // Show Employee List
  }

  Unprocessed() {

    const selectedEmployees = this.filterProcessedData.filter(emp => emp.isSelected);

    if (selectedEmployees.length === 0) {
      this.toastrService.warning("Please select at least one employee to unprocessed .");
      return;
    }
    const selectedEmpList = selectedEmployees.map(emp => ({
      pk_empid: emp.pk_empid   // ✅ use 'pk_empid' instead of 'fk_empid'
    }));

    const postPayload = {
      empList: selectedEmpList,
      fk_monthId: this.EmployeeForm.value.fk_monthId,
      fk_yearId: this.EmployeeForm.value.fk_yearId,
      // stopsalary: 'N'  // ⬅ Important: N for unstop
    };

    this.serivce.delete_leaveAccrual(postPayload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('Unprocessed successfully!');
          this.getList();  // refresh list
        } else {
          this.toastrService.error(res.message || 'Failed to unprocessed.');
        }
      },
      error: (err) => {
        this.toastrService.error(err.message || 'Server error while posting data');
      }
    });
  }


  Processed() {
    //const selectedEmployees = this.processedList.filter(emp => emp.isSelected);
    const selectedEmployees = this.filterUnprocessedData.filter(emp => emp.isSelected);

    console.log("hhhh", selectedEmployees)

    //cooment for all

    // if (selectedEmployees.length === 0) {
    //   this.toastrService.warning("Please select at least one employee to processed.");
    //   return;
    // }
    const selectedEmpList = selectedEmployees.map(emp => ({
      pk_empid: emp.pk_empid   //  use 'pk_empid' instead of 'fk_empid'
    }));

     const formValues = this.EmployeeForm.value;
    const postPayload = {
       ...formValues,
      empList: selectedEmpList,
      // fk_monthId: this.EmployeeForm.value.fk_monthId,
      // fk_yearId: this.EmployeeForm.value.fk_yearId,
       
      // stopsalary: 'N'  //  Important: N for unstop
    };

    this.serivce.insert_leaveAccrual(postPayload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('processed successfully!');
          this.processedList = [];  // reset the list
          this.getList();  // refresh list
        } else {
          this.toastrService.error(res.message || 'Failed to .');
        }
      },
      error: (err) => {
        this.toastrService.error(err.message || 'Server error while posting data');
      }
    });
  }


  resetForm(): void {
    this.EmployeeForm.reset();

  }

}


