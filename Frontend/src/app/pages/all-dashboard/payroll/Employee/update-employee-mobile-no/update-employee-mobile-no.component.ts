import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { UpdateEmployeeMobileNoService } from '../../services/update-employee-mobile-no.service';
import { CommonSearchComponent } from '../common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-update-employee-mobile-no',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './update-employee-mobile-no.component.html',
  styleUrl: './update-employee-mobile-no.component.scss'
})
export class UpdateEmployeeMobileNoComponent {
      ngxUILoaderService = inject(NgxUiLoaderService);
  
  UpdateEmployeeForm!: FormGroup;
  showEmployeeList: boolean = false;

  employeeMobileList: any[] = [];
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
    empStatus: ''
  };

  constructor(
    private fb: FormBuilder,
    private updateEmployeeMobileNoService: UpdateEmployeeMobileNoService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.UpdateEmployeeForm = this.fb.group({
      employees: this.fb.array([])
    });
  }

  // Getter for employees FormArray
  get employees(): FormArray {
    return this.UpdateEmployeeForm.get('employees') as FormArray;
  }

  // Function to initialize employees in FormArray
  initializeEmployees(employeeData: any[]) {
    const employeeArray = this.employees;
    employeeArray.clear(); // Clear previous data

    employeeData.forEach(emp => {
      employeeArray.push(this.fb.group({
        fk_empid:[emp.pk_empid],
        cid: [emp.cid],
        empcode: [emp.empcode],
        empname: [emp.empname],
        depart: [emp.depart],
        personalContactno: [emp.personalContactno || ''],
        officialContactno: [emp.officialContactno || '']
      }));
    });
  }

//for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
//contact number validation
validateNumber1(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 54 || charCode >57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    //this.getEmployeeMobile(); // Refresh employee list with new filters
  }

  // Fetch employee mobile details
  getEmployeeMobile(): void {
     this.ngxUILoaderService.start(); 

    this.updateEmployeeMobileNoService.get_employeeMobile(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.employeeMobileList = res.data;
          this.initializeEmployees(res.data); // Populate FormArray
        } else {
          this.employeeMobileList = [];
          this.toastrService.success(res.message, 'Error');
          this.initializeEmployees(res.data);
        }
         this.ngxUILoaderService.stop(); 
      },
      error: () => {
        this.employeeMobileList = [];
        this.toastrService.error('Failed to retrieve employee mobile numbers', 'Error');
      }
    });
  }
  
  resetForm(): void {
    this.UpdateEmployeeForm.reset();
    this.employees.clear(); // Clear FormArray
  }

  // Function to update employee mobile numbers
  updateEmployeeMobile(): void {
    if (this.UpdateEmployeeForm.invalid) {
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      return;
    }

    const updatedData = this.UpdateEmployeeForm.value.employees;
    this.updateEmployeeMobileNoService.update_employeeMobile(updatedData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('Employee mobile numbers updated successfully!', 'Success');
          this.getEmployeeMobile(); // Refresh data
        } else {
          this.toastrService.success(res.message, 'Update Failed');
        }
      },
      error: () => {
        this.toastrService.error('Failed to update employee mobile numbers', 'Error');
      }
    });
  }
  showListOnView() {
    this.showEmployeeList = true; // Show Employee List
    this.getEmployeeMobile(); 
  }
}
