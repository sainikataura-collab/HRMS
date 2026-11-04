import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../common-search/common-search.component';
import { UpdateEmployeeEmailService } from '../../services/update-employee-email.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-update-employee-email',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './update-employee-email.component.html',
  styleUrl: './update-employee-email.component.scss'
})
export class UpdateEmployeeEmailComponent {
    ngxUILoaderService = inject(NgxUiLoaderService);
  
 UpdateEmployeeForm!: FormGroup;
   showEmployeeList: boolean = false;
 
   employeeEmailList: any[] = [];
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
     private updateEmployeeEmailService: UpdateEmployeeEmailService,
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
         personalEmail: [emp.personalEmail || ''],
         officialEmail: [emp.officialEmail || '']
       }));
     });
   }
 
   // Handle filter updates from common search
   handleFilters(filters: any) {
     this.employeeFilters = filters;
   }
 
   // Fetch employee mobile details
   getEmployeeEmail(): void {
    this.ngxUILoaderService.start(); 
     this.updateEmployeeEmailService.get_employeeEmail(this.employeeFilters).subscribe({
       next: (res) => {
         if (res.isSuccess) {
           this.employeeEmailList = res.data;
           this.initializeEmployees(res.data); // Populate FormArray
         } else {
           this.employeeEmailList = [];
           this.toastrService.success(res.message, 'Error');
           this.initializeEmployees(res.data);
         }
         this.ngxUILoaderService.stop(); 
       },
       error: () => {
         this.employeeEmailList = [];
         this.toastrService.error('Failed to retrieve employee email', 'Error');
       }
     });
   }
   
   resetForm(): void {
     this.UpdateEmployeeForm.reset();
     this.employees.clear(); // Clear FormArray
   }
 
   // Function to update employee mobile numbers
   updateEmployeeEmail(): void {
     if (this.UpdateEmployeeForm.invalid) {
       this.toastrService.error('Please fill all required fields', 'Validation Error');
       return;
     }
 
     const updatedData = this.UpdateEmployeeForm.value.employees;
     this.updateEmployeeEmailService.update_employeeEmail(updatedData).subscribe({
       next: (res) => {
         if (res.isSuccess) {
           this.toastrService.success('Employee email updated successfully!', 'Success');
           this.getEmployeeEmail(); // Refresh data
         } else {
           this.toastrService.success(res.message, 'Update Failed');
         }
       },
       error: () => {
         this.toastrService.error('Failed to update employee email', 'Error');
       }
     });
   }
   showListOnView() {
     this.showEmployeeList = true; // Show Employee List
     this.getEmployeeEmail(); 
   }
 }
 