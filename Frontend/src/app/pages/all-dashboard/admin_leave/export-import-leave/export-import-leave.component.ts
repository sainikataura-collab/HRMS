import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';

import * as XLSX from 'xlsx'
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { ExportImportLeaveService } from '../../payroll/services/export-import-leave.service';
import { ImportAttendancePunchService } from '../../payroll/services/import-attendance-punch.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { EmployeeService } from '../../payroll/services/employee.service';

@Component({
  selector: 'app-export-import-leave',
  standalone: true,
  imports: [FormsModule, NgxPaginationModule, ReactiveFormsModule, CommonModule, NgSelectComponent, NgSelectModule, CommonSearchComponent],
  templateUrl: './export-import-leave.component.html',
  styleUrl: './export-import-leave.component.scss'
})
export class ExportImportLeaveComponent {

  EmployeeForm!: FormGroup;
  isContractApplicable = false;
  CostCenter = []
  submitted = false;
  showError = false;
  totalCount: number = 0
  pageIndex: number = 1;
  pageSize: number = 10;
  messag: string = '';
  showImportView = false
  errormessag: string = '';
  salaryHeadList: any[] = [];
  filteredData: any[] = [];
  searchtext: string = ''
  months: any[] = [];
  years: any[] = [];
  selectedFile: File | undefined;
  exportsalaryheadlist: any[] = [];
  searchControl = new FormControl('');
  leavetypeddl: { name: string, value: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: ImportAttendancePunchService, // Update service if required
    private loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private leaveServices: ExportImportLeaveService,
    private commanService: ManualPunchBio,
    private employeeService: EmployeeService
  ) { }





  ngOnInit() {
  this.getCostCenterList();
  this.getLeavetype('Leave');
  this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

  this.searchControl.valueChanges.subscribe(value => {
    this.searchtext = value?.toLowerCase() || '';
    this.filterData();
  });

  this.EmployeeForm = this.fb.group({
    empCode: [''],
    empName: [''],
    fk_costcentreid: [null],
    selectedLocations: [[]],
    selectedDepartments: [[]],
    selectedDesignation: [''],
    selectedNature: [''],
    selectedCity: [''],
    sortBy: [''],
    empStatus: [''],
    Fk_FinId: [''],
    Fk_CompanyId: [''],
    EffectiveDate: [new Date().toISOString().split('T')[0]], //  Required validation
    file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
    fk_leaveid: [null]
  });
}
  onContractorChange(event: any) {
    this.EmployeeForm.patchValue({ fk_leaveid: null });
    this.leavetypeddl = [];
    const fk_costcentreid = this.EmployeeForm.get('fk_costcentreid')?.value;
    
    if (fk_costcentreid) {
      this.LeaveTypeClientWise(fk_costcentreid);
    } else {
      this.getLeavetype('Leave');
    }
  }

  LeaveTypeClientWise(fk_costcentreid: string) {
    this.employeeService.LeaveTypeClientWise(fk_costcentreid).subscribe({
      next: (res: any) => {
        this.leavetypeddl = res?.data || [];
      },
      error: (err: any) => {
        this.leavetypeddl = [];
      }
    });
  }

  exportTemplate() {
    
    const formData = { ...this.EmployeeForm.value };
    // Validate that fk_leaveid is selected
    if (!formData.fk_leaveid) {
      this.toastrService.error('Please select Leave Type');
      return;
    }
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });
    this.leaveServices.ExportLeave(formData).subscribe({
      next: (res) => {
        this.exportsalaryheadlist = res.data
        this.downloadExcel();
      }
    })
  }
  downloadExcel(): void {
    debugger
    const filteredData = this.exportsalaryheadlist;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ExportLeave');
    XLSX.writeFile(wb, 'ExportLeave.xlsx');
  }


  getLeavetype(fieldName: string) {
    // this.ngxUILoaderService.start(); // Start loader before API call
    this.leaveServices.getCommonDropdown(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.leavetypeddl = res.data.map((leaveType: any) => ({
            name: leaveType.name,
            value: leaveType.value
          }));
        } else {
          this.toastrService.error("Failed to load  list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching .");
      }
    });
  }


  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data

      }
    })
  }



  onSubmit() {
    debugger
    this.submitted = true;
    this.showError = true;
    this.EmployeeForm.get('file')?.clearValidators();
    this.EmployeeForm.get('file')?.updateValueAndValidity();
    if (this.EmployeeForm.invalid) return;

    const formValues = this.EmployeeForm.value;

    if (!formValues.sortBy) {
      this.toastrService.warning('Please select Sort By');
      return;
    }
    if (!formValues.selectedDepartments.length) {
      this.toastrService.warning('Please select at least one Department');
      return;
    }
    if (!formValues.selectedLocations.length) {
      this.toastrService.warning('Please select at least one Location');
      return;
    }

    this.getSalaryHeadData();
    this.EmployeeForm.get('file')?.setValidators([Validators.required, Validators.pattern(/\.(xlsx)$/i)]);
    this.EmployeeForm.get('file')?.updateValueAndValidity();
  }

  getSalaryHeadData() {
    const formData = { ...this.EmployeeForm.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) formData[key] = '';
    });

    const payload = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      ...formData
    };

    this.loader.start();
    this.leaveServices.ExportImportleaveList(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res.isSuccess) {

          this.salaryHeadList = res.data || [];
          this.totalCount = res.totalCount
          this.filteredData = [...this.salaryHeadList];
        } else {
          this.salaryHeadList = [];
          this.toastrService.info(res.message || 'No data found');
        }
      },
      error: (err) => {
        this.loader.stop();
        this.toastrService.error(err.message || 'Failed to fetch data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getSalaryHeadData();
  }

  filterData() {
    const lowerText = this.searchtext.toLowerCase();
    this.filteredData = this.salaryHeadList.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      )
    );
  }

  handleFilters(filters: any) {

    this.EmployeeForm.patchValue(filters);


  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
      this.EmployeeForm.get('file')?.setValue(file); // Set value to form control
    } else {
      this.EmployeeForm.get('file')?.setErrors({ pattern: true });
    }
  }


  // Import() {
  //   const formData1 = { ...this.EmployeeForm.value };

  //   if (this.EmployeeForm.invalid) {
  //     this.EmployeeForm.markAllAsTouched();
  //     return;
  //   }
    
  //   if (this.selectedFile) {
  //     const formData = new FormData();
  //     formData.append('file', this.selectedFile!, this.selectedFile!.name);
  //     formData.append('EffectiveDate', this.EmployeeForm.get('EffectiveDate')?.value);
  //     // formData.append('FkYearId', this.EmployeeForm.get('FkYearId')?.value);

  //     this.loader.start();
  //     this.leaveServices.Leave_ForImport(formData).subscribe({
  //       next: (res) => {
  //         if (res.isSuccess) {
  //           this.messag = res.message; //  corrected
  //           this.errormessag = '';      // clear error message
  //         } else {
  //           this.errormessag = res.message; //  corrected
  //           this.messag = '';               // clear success message
  //         }
  //         this.loader.stop();
  //       }
  //     });
  //   }
  // }






Import() {
  // Validate form
  if (this.EmployeeForm.invalid) {
    this.EmployeeForm.markAllAsTouched();
    return;
  }
  
  if (!this.selectedFile) {
    this.toastrService.error('Please select a file');
    return;
  }

  const effectiveDateValue = this.EmployeeForm.get('EffectiveDate')?.value;
  if (!effectiveDateValue) {
    this.toastrService.error('Please select Effective Date');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', this.selectedFile, this.selectedFile.name);
  
  //  Convert date to proper string format
  let dateString = '';
  if (effectiveDateValue instanceof Date) {
    dateString = effectiveDateValue.toISOString().split('T')[0];
  } else {
    dateString = effectiveDateValue.toString();
  }
  
  formData.append('EffectiveDate', dateString);
  
  // Debug logs
  console.log('File:', this.selectedFile);
  console.log('EffectiveDate:', dateString);
  
  this.loader.start();
  this.leaveServices.Leave_ForImport(formData).subscribe({
    next: (res) => {
      this.loader.stop();
      if (res.isSuccess) {
        this.messag = res.message;
        this.errormessag = '';
        this.toastrService.success('Data imported successfully');
      } else {
        this.errormessag = res.message;
        this.messag = '';
        this.toastrService.error(res.message);
      }
    },
    error: (err) => {
      this.loader.stop();
      this.errormessag = 'Import failed: ' + (err.error?.message || err.message);
      this.messag = '';
      console.error('Import error:', err);
      this.toastrService.error('Import failed');
    }
  });
}






  toggleImportView(): void {
    this.messag = '';
    this.errormessag = '';
    this.showImportView = !this.showImportView;
    // Clear the file
    this.selectedFile = undefined;
    this.EmployeeForm.get('file')?.reset();
  }


}


