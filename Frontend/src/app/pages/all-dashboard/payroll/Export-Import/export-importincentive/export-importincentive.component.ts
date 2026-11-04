import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx'
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ImportAttendancePunchService } from '../../services/import-attendance-punch.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';

@Component({
  selector: 'app-export-importincentive',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule],
  templateUrl: './export-importincentive.component.html',
  styleUrl: './export-importincentive.component.scss'
})
export class ExportImportincentiveComponent {

   EmployeeForm!: FormGroup;
    isExporting = false;
    isImporting = false;
    CostCenter = []
    isContractApplicable = false;
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
     isViewing = false;
    constructor(
      private fb: FormBuilder,
      private toastrService: ToastrService,
      private router: Router,
      private httpservice: ImportAttendancePunchService, // Update service if required
      private loader: NgxUiLoaderService,
      private dropdownService: DropdownService,
      private commanService: ManualPunchBio,
    ) { }
  
    ngOnInit() {
      this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;
  
      this.searchControl.valueChanges.subscribe(value => {
        this.searchtext = value?.toLowerCase() || '';
        this.filterData();
      });
      this.EmployeeForm = this.fb.group({
        empCode: [''],
        empName: [''],
        selectedLocations: [[]],
        selectedDepartments: [[]],
        selectedDesignation: [''],
        selectedNature: [''],
        selectedCity: [''],
        sortBy: [''],
        empStatus: [''],
        Fk_FinId: [''],
        Fk_CompanyId: [''],
        EffectiveDate: [Date,Validators.required],
        file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
        headType: ['E,R'],
        fk_costcentreid: [null],
      });
  
      this.getCostCenterList();
    }
  
  
  
    exportTemplate() {
      if (this.isExporting) return; // prevent double click
      this.isExporting = true;
      debugger
      const formData = { ...this.EmployeeForm.value };
  
      Object.keys(formData).forEach(key => {
        if (formData[key] === null) {
          formData[key] = '';
        }
      });
      this.httpservice.ExportincentiveHead(formData).subscribe({
        next: (res) => {
           this.isExporting = false; 
          this.exportsalaryheadlist = res.data
  
          this.downloadExcel();
          
        }
      })
    }
    downloadExcel(): void {
      const filteredData = this.exportsalaryheadlist;
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Salary List');
      XLSX.writeFile(wb, 'HeadData.xlsx');
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
       if (this.isViewing) return; // prevent double click
    
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
    this.isViewing = true;
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
      this.httpservice.GetincentiveExportImport(payload).subscribe({
        next: (res: any) => {
           this.isViewing = false;
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
           this.isViewing = false;
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
  
  
    Import() {
        if (this.isImporting) return;
  
  
      if (this.EmployeeForm.invalid) {
        this.EmployeeForm.markAllAsTouched();
        return;
      }
  
      if (this.selectedFile) {
            this.isImporting = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile!, this.selectedFile!.name);
        formData.append('EffectiveDate', this.EmployeeForm.get('EffectiveDate')?.value);
        // formData.append('FkYearId', this.EmployeeForm.get('FkYearId')?.value);
  
        this.loader.start();
        this.httpservice.IncentiveHead_ForImport(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messag = res.message; //  corrected
              this.errormessag = '';      // clear error message
            } else {
              this.errormessag = res.message; // corrected
              this.messag = '';               // clear success message
            }
              this.isImporting = false;
            this.loader.stop();
          }
        });
      }
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
