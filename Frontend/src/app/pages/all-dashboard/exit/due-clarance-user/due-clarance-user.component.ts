




import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

import { EncryptionService } from '../../../../shared/services/encryption.service';

import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { QualificationDetailService } from '../../payroll/services/employeeQualification.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { NgxMaskDirective } from 'ngx-mask';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DueckaranceServiceService } from '../Service/dueckarance-service.service';

@Component({
  selector: 'app-due-clarance-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgxPaginationModule, NgSelectModule, CommonSearchComponent],
  templateUrl: './due-clarance-user.component.html',
  styleUrl: './due-clarance-user.component.scss'
})
export class DueClaranceUserComponent implements OnInit {

  ClearanceUserForm!: FormGroup;
  clearanceList: any[] = [];

  employees: any[] = [];
  Department: any[] = [];
  
  parameters = [
    { name: 'Text', id: 1 },
    { name: 'Dropdown', id: 2 },  
  ];
  editIndex: number | null = null;

  // Array to store multiple parameter entries
  parametersList: any[] = [];
  parameterSubmitted = false;
  
  // ✅ ADD - Flag to track if main form submit was attempted
  mainFormSubmitted = false;

  showError = false;
  isEdit = false;
  pk_clearanceId: number = 0;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  
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
    empStatus: ''
  };

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private clearanceService: DueckaranceServiceService,
    private encryptionService: EncryptionService,
    private employeeMasterService: EmployeeMasterService,
    private route: ActivatedRoute,
    private router: Router,
    private qualificationService: QualificationDetailService,
    private ngxUILoaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.ClearanceUserForm = this.fb.group({
      fk_empid: ['', Validators.required],
      clearDept: ['', Validators.required],
      remarks: [''],
      isActive: [false],
      // ✅ ADD - Add required validation for parameter fields
      parameter: ['', Validators.required],
      paramRemarks: [''],
      paramIsActive: [false]
    });

    // check edit mode
    this.pk_clearanceId = Number(
      this.encryptionService.decryptText(this.route.snapshot.params['pk_DeptUserId'] ?? '').toString()
    );

    if (this.pk_clearanceId && this.pk_clearanceId > 0) {
      this.isEdit = true;
      this.getClearanceById(this.pk_clearanceId);
    }

    this.getEmployees();
    this.getDepartmentList();
  }

  getClearanceById(pk_deptUserId: number): void {
    this.ngxUILoaderService.start();
    this.clearanceService.getByIdClearanceUser(pk_deptUserId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.populateFormData(res.data);
        } else {
          this.toastrService.error(res.message || 'Failed to load clearance details.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error loading clearance data:', err);
        this.toastrService.error('Error loading clearance data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  populateFormData(data: any): void {
    if (data.clearanceDepartmentUser) {
      this.ClearanceUserForm.patchValue({
        fk_empid: data.clearanceDepartmentUser.fk_empid,
        clearDept: data.clearanceDepartmentUser.fk_deptid,
        remarks: data.clearanceDepartmentUser.remarks,
        isActive: data.clearanceDepartmentUser.isActive
      });
    }

    if (data.transactions && Array.isArray(data.transactions)) {
      this.parametersList = data.transactions.map((transaction: any) => {
        return {
          fk_depttrnid: transaction.fk_depttrnid,
          parameterName: this.getParameterName(transaction.fk_depttrnid),
          remarks: transaction.remarks || '',
          isActive: transaction.isActive
        };
      });
    }
  }

  private getParameterName(id: number): string {
    const param = this.parameters.find(p => p.id === id);
    return param ? param.name : 'Unknown';
  }

  // Get employees list
  getEmployees(): void {
    this.qualificationService.getEmpList(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.employees = res.data.map((emplyeedata: any) => ({
            name: emplyeedata.name,
            id: emplyeedata.value
          }));
        } else {
          this.employees = [];
          this.toastrService.error(res.message, 'Error');
        }
      },
      error: (error) => {
        this.employees = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }

  // Get department list
  getDepartmentList(): void {
    this.ngxUILoaderService.start();
    
    this.employeeMasterService.get_DropdownList('Department').subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Department = res.data.map((dept: any) => ({
            name: dept.name,
            value: dept.value
          }));
        } else {
          this.toastrService.error("Failed to load Department list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        this.toastrService.error("Error fetching Department list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }

  // ✅ UPDATED - Add parameter with proper validation
  addParameter(): void {
    this.parameterSubmitted = true;

    const formValues = this.ClearanceUserForm.value;

    // ✅ UPDATED - Check parameter validation and mark fields as touched
    if (!formValues.parameter) {
      this.ClearanceUserForm.get('parameter')?.markAsTouched();
      return; // Don't show toaster, let the template show validation message
    }

    // Find parameter name
    const selectedParam = this.parameters.find(p => p.id === formValues.parameter);

    // Add to parameters list
    const parameterEntry = {
      fk_depttrnid: formValues.parameter,
      parameterName: selectedParam?.name || '',
      remarks: formValues.paramRemarks || '',
      isActive: formValues.paramIsActive
    };

    if (this.editIndex !== null) {
      // Update existing row
      this.parametersList[this.editIndex] = parameterEntry;
      this.toastrService.success('Parameter updated successfully');
      this.editIndex = null;
    } else {
      // Add new
      this.parametersList.push(parameterEntry);
      this.toastrService.success('Parameter added successfully');
    }

    // Clear parameter fields only and reset parameter submission flag
    this.ClearanceUserForm.patchValue({
      parameter: '',
      paramRemarks: '',
      paramIsActive: true
    });
    this.parameterSubmitted = false; // ✅ Reset parameter validation flag
  }

  // Remove parameter from list
  removeParameter(index: number): void {
    this.parametersList.splice(index, 1);
    this.toastrService.success('Parameter removed successfully');
  }

  // Update parameter in list
  updateParameter(index: number): void {
    const paramToUpdate = this.parametersList[index];
    
    // Set form values for editing
    this.ClearanceUserForm.patchValue({
      parameter: paramToUpdate.fk_depttrnid,
      paramRemarks: paramToUpdate.remarks,
      paramIsActive: paramToUpdate.isActive
    });

    this.editIndex = index;
  }

  // ✅ UPDATED - Reset form with proper flag reset
  resetForm(): void {
    this.ClearanceUserForm.reset({
      isActive: true,
      paramIsActive: true
    });
    this.parametersList = [];
    this.isEdit = false;
    this.showError = false;
    this.editIndex = null;
    // ✅ ADD - Reset both validation flags
    this.mainFormSubmitted = false;
    this.parameterSubmitted = false;
  }

  // ✅ UPDATED - Submit form with proper validation handling
  submitForm(): void {
    // ✅ SET - Flag to show validation messages
    this.mainFormSubmitted = true;
    
    const formValues = this.ClearanceUserForm.value;

    // ✅ UPDATED - Mark main form fields as touched for validation display
    this.ClearanceUserForm.get('fk_empid')?.markAsTouched();
    this.ClearanceUserForm.get('clearDept')?.markAsTouched();

    // Validate main form fields (excluding parameter fields)
    if (!formValues.fk_empid || !formValues.clearDept) {
      return; // Don't show toaster, let template validation messages show
    }

    // Check if at least one parameter is added
    if (this.parametersList.length === 0) {
      this.toastrService.error('Please add at least one parameter');
      return;
    }

    // Create the payload
    const payload = {
      ClearanceDepartmentUser: {
        ...(this.isEdit && { pk_deptUserId: this.pk_clearanceId }),
        fk_deptid: formValues.clearDept ?? 0,
        fk_empid: formValues.fk_empid,
        remarks: formValues.remarks || '',
        isActive: formValues.isActive
      },
      Transactions: this.parametersList.map(param => ({
        ...(this.isEdit && { fk_deptUserId: this.pk_clearanceId }),
        fk_depttrnid: param.fk_depttrnid,
        remarks: param.remarks || '',
        isActive: param.isActive
      }))
    };

    console.log('Payload being sent:', payload);

    if (this.isEdit) {
      // Update existing record
      this.clearanceService.updateClearance(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message, 'Update Successful');
            this.router.navigate(['/dash/exit/exitdashboard/Due_Clearence_User_list']);
          } else {
            this.toastrService.error(res.message, 'Update Failed');
          }
        },
        error: (err) => {
          console.error('API Error:', err);
          this.toastrService.error('Something went wrong while updating!', 'Error');
        }
      });
    } else {
      // Add new record
      this.clearanceService.addClearance(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message, 'Addition Successful');
            this.router.navigate(['/dash/exit/exitdashboard/Due_Clearence_User_list']);
          } else {
            this.toastrService.error(res.message, 'Addition Failed');
          }
        },
        error: (err) => {
          console.error('API Error:', err);
          this.toastrService.error('Something went wrong while adding!', 'Error');
        }
      });
    }
  }
}
