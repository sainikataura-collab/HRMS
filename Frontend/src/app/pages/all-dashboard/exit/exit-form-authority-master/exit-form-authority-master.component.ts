








import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { QualificationDetailService } from '../../payroll/services/employeeQualification.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { ExitFormAutorityService } from '../Service/exit-form-autority.service';


@Component({
  selector: 'app-exit-form-authority-master',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgSelectModule, CommonSearchComponent],
  templateUrl: './exit-form-authority-master.component.html',
  styleUrl: './exit-form-authority-master.component.scss'
})
export class ExitFormAuthorityMasterComponent implements OnInit {
  AuthorityForm!: FormGroup;

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

  selects = [
    { name: "Reporting Manager", value: 1 },
    { name: "Branch Manager", value: 2 },
    { name: "Zone HR", value: 3 },
    { name: "Sr. Manager", value: 4 },
    { name: "HOD", value: 5 },
    { name: "Cross Functional Reporting", value: 6 },
    { name: "HR OD", value: 7 },
    { name: "Sr. Manager-OD/Sr. Manager-HR", value: 8 },
    { name: "Head HR / CPO", value: 9 },
    { name: "ED/Chairman/CEO", value: 10 },
    { name: "MD", value: 11 }
  ];

  employees: { name: string, value: string }[] = [];
  authorityList: any[] = [];   // list for table
  isEdit = false;
  editIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toasteservice: ToastrService,
    private qualificationService: QualificationDetailService,
    private toastrService: ToastrService,
    private Service: ExitFormAutorityService,
    private router: Router

  ) { }

  ngOnInit() {
    // Updated form with correct field names matching HTML
    this.AuthorityForm = this.fb.group({
      fk_empid: [null, Validators.required],           // Employee Code
      fk_approvedbyid: [null, Validators.required],   // Senior Code
      orderno: [null, Validators.required]          // Approval Level
    });

    this.getEmployees(); // Load employees on component initialization
  }

  saveAuthority() {
    if (this.AuthorityForm.invalid) {
      this.AuthorityForm.markAllAsTouched();
      return;
    }

    const formValue = this.AuthorityForm.value;

    // Get employee details 
    const selectedEmployee = this.employees.find(emp => emp.value === formValue.fk_empid);
    const selectedSenior = this.employees.find(emp => emp.value === formValue.fk_approvedbyid);

    // Get approval level details
    const approvalObj = this.selects.find(s => s.value === formValue.orderno);

    const record = {
      code: selectedEmployee ? selectedEmployee.value : formValue.fk_empid,
      name: selectedEmployee ? selectedEmployee.name : '',
      seniorCode: selectedSenior ? selectedSenior.value : formValue.fk_approvedbyid,
      seniorName: selectedSenior ? selectedSenior.name : '',
      approvalLevel: formValue.orderno, // This will store the value (1, 2, 3, etc.)
      approvalLevelName: approvalObj ? approvalObj.name : '',
      fk_empid: formValue.fk_empid,
      fk_approvedbyid: formValue.fk_approvedbyid,
      orderno: formValue.orderno
    };

    if (this.isEdit && this.editIndex !== null) {
      this.authorityList[this.editIndex] = record;
      this.isEdit = false;
      this.editIndex = null;
      this.toastrService.success('Authority updated successfully', 'Success');
    } else {
      this.authorityList.push(record);
      this.toastrService.success('Authority added successfully', 'Success');
    }

    this.AuthorityForm.reset();
  }

  editAuthority(item: any, index: number) {
    this.AuthorityForm.patchValue({
      fk_empid: item.fk_empid,
      fk_approvedbyid: item.fk_approvedbyid,
      orderno: item.orderno
    });
    this.isEdit = true;
    this.editIndex = index;
  }

  deleteAuthority(index: number) {
    this.authorityList.splice(index, 1);
    this.toastrService.success('Authority deleted successfully', 'Success');
  }

  resetForm() {
    this.AuthorityForm.reset();
    this.isEdit = false;
    this.editIndex = null;
  }

  getEmployees(): void {
    this.qualificationService.getEmpList(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.employees = res.data.map((employeeData: any) => ({
            name: employeeData.name,
            value: employeeData.value
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

  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }

  // Handle employee selection
  onEmployeeSelect(employeeCode: string): void {
    const selectedEmployee = this.employees.find(emp => emp.value === employeeCode);
    if (selectedEmployee) {
      // You can perform additional logic here if needed
      console.log('Selected Employee:', selectedEmployee);
    }
  }

  // Handle senior employee selection
  getSeniorEmployees(seniorCode: string): void {
    const selectedSenior = this.employees.find(emp => emp.value === seniorCode);
    if (selectedSenior) {
      // You can perform additional logic here if needed
      console.log('Selected Senior:', selectedSenior);
    }
  }





  finalSubmit(): void {
    if (this.authorityList.length === 0) {
      if (this.AuthorityForm.invalid) {
        this.AuthorityForm.markAllAsTouched();
        return;
      }
    }




    // Transform the data to match API expectations
    const payload = {
      details: this.authorityList.map(authority => ({
        fk_empid: authority.fk_empid,
        fk_approvedbyid: authority.fk_approvedbyid,
        orderno: authority.orderno
      }))
    };

    console.log('Payload being sent:', payload); // For debugging

    this.Service.saveExitAuthority(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Exit Authority saved successfully!', 'Success');
          this.authorityList = [];
          this.AuthorityForm.reset();
          this.router.navigate(['/dash/exit/exitdashboard/exitformauthority']);
        } else {
          this.toastrService.error(res.message || 'Save failed', 'Error');
        }
      },
      error: (err) => {
        console.error('API Error:', err); // For debugging
        this.toastrService.error('API Error: ' + (err?.error?.message || err?.message || 'Unknown error'), 'Error');
      }
    });
  }

}
