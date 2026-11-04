import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { LeaveAssessmentService } from '../../payroll/services/leaveassessment.sevice';
import { EmployeeService } from '../../payroll/services/employee.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
// import { UserMasterService } from '../../services/user-master.service';

@Component({
  selector: 'app-change-employee-password',
  standalone: true,
 imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgxPaginationModule,
    CommonSearchComponent
  ],
  templateUrl: './change-employee-password.component.html',
  styleUrl: './change-employee-password.component.scss'
})
export class ChangeEmployeePasswordComponent implements OnInit {
  empForm!: FormGroup;
  EmployeeList: { name: string; value: string }[] = [];
  ngxUILoaderService = inject(NgxUiLoaderService);
  router = inject(Router);
  showError = false;
  generatedPassword = '';
  selectedEmployeeName = ''; // Add this property to store selected employee name

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
  };

  constructor(
    private fb: FormBuilder,
    private service: LeaveAssessmentService,
    private userService: EmployeeService,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.empForm = this.fb.group({
      empcode: [null, Validators.required],
      empname: [''],
      password: [''],
      designation: [''],
      dept: [''],
      fk_empid: [null],
    });

    this.getEmployeeList();

    // Add listener for employee selection change
    this.empForm.get('empcode')?.valueChanges.subscribe(selectedValue => {
      this.onEmployeeSelectionChange(selectedValue);
    });
  }

  getEmployeeList() {
    this.ngxUILoaderService.start();
    this.service.getEmployee('Employee').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));
        } else {
          this.toastrService.error('Failed to load employee list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error('Error fetching employee list. Please try again.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  // Add this method to handle employee selection change
  onEmployeeSelectionChange(selectedValue: string) {
    if (selectedValue) {
      const selectedEmployee = this.EmployeeList.find(emp => emp.value === selectedValue);
      this.selectedEmployeeName = selectedEmployee ? selectedEmployee.name : '';
      this.empForm.patchValue({ empname: this.selectedEmployeeName });
    } else {
      this.selectedEmployeeName = '';
      this.empForm.patchValue({ empname: '' });
    }
  }

  generatePassword() {
    const length = 6;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    this.generatedPassword = password;
  }

  onSave() {
    if (this.empForm.invalid) {
      this.showError = true;
      return;
    }



    // You can use a confirmation dialog here
    const confirmMessage = `Are you sure you want to reset password for employee: ${this.selectedEmployeeName}?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    this.ngxUILoaderService.start();
    this.generatePassword();

    const formData = {
      fk_empid: this.empForm.value.empcode,
      password: this.generatedPassword
    };

    this.userService.Change_WebUser(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(`Password changed successfully for ${this.selectedEmployeeName}`);
          if (res.data) {
            this.empForm.patchValue({ password: res.data });
          }
          this.showError = false;
        } else {
          this.toastrService.error(res.message || 'Error changing password');
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error('Server error while changing password');
        this.ngxUILoaderService.stop();
      }
    });
  }

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }

  getEmployees(): void {
    this.ngxUILoaderService.start();
    this.service.get_Employees_Ddl(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));
        } else {
          this.EmployeeList = [];
          this.toastrService.error(res.message, 'Error');
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.EmployeeList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
        this.ngxUILoaderService.stop();
      }
    });
  }
}
