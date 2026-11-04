import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DebitCardMappingService } from '../../services/debit-card-mapping.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-debit-card-mapping',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './debit-card-mapping.component.html',
  styleUrl: './debit-card-mapping.component.scss'
})
export class DebitCardMappingComponent {
    ngxUILoaderService = inject(NgxUiLoaderService);
  
  UpdateEmployeeForm!: FormGroup;
  showEmployeeList: boolean = false;

  employeeDebitCardList: any[] = [];
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
    private debitCardMappingService: DebitCardMappingService,
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
        debit_Card: [emp.debit_Card || ''],
        advance_Limit: [emp.advance_Limit || 0],
      }));
    });
  }


  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    
  }

  // Fetch employee mobile details
  getEmployeeDebitCard(): void {
    this.ngxUILoaderService.start(); 
    this.debitCardMappingService.get_debitCard(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.employeeDebitCardList = res.data;
          this.initializeEmployees(res.data); // Populate FormArray
        } else {
          this.employeeDebitCardList = [];
          this.toastrService.success(res.message, 'Error');
          this.initializeEmployees(res.data);
        }
        this.ngxUILoaderService.stop(); 
      },
      error: () => {
        this.employeeDebitCardList = [];
        this.toastrService.error('Failed to retrieve Debit Card Mapping', 'Error');
      }
    });
  }
  
  resetForm(): void {
    this.UpdateEmployeeForm.reset();
    this.employees.clear(); // Clear FormArray
  }

  // Function to update employee mobile numbers
  updateEmployeeDebitCard(): void {
    if (this.UpdateEmployeeForm.invalid) {
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      return;
    }

    const updatedData = this.UpdateEmployeeForm.value.employees;
    this.debitCardMappingService.update_debitCard(updatedData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('Debit Card Mapping updated successfully!', 'Success');
          this.getEmployeeDebitCard(); // Refresh data
        } else {
          this.toastrService.success(res.message, 'Update Failed');
        }
      },
      error: () => {
        this.toastrService.error('Failed to update Debit Card Mapping', 'Error');
      }
    });
  }
  showListOnView() {
    this.showEmployeeList = true; // Show Employee List
    this.getEmployeeDebitCard(); 
  }
  restrictInput(event: KeyboardEvent) {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;
  
    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent invalid characters from being typed
    }
  }
}
