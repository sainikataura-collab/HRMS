import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
@Component({
  selector: 'app-import-tax-report',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectComponent, CommonSearchComponent],
  templateUrl: './import-tax-report.component.html',
  styleUrl: './import-tax-report.component.scss'
})
export class ExportIncomeTaxReportComponent {
  ExportExcel!: FormGroup;
  searchText: string = "";
  submitted = false;
  showError = false;
  showEmployeeList: boolean = false;
  EmployeeList: any[] = [];
  tableHeaders: string[] = [];
  isContractApplicable = false;
    CostCenter: { name: string; value: string | null }[] = [];
      isExporting = false;

  // Export type dropdown
  ExportTypelist = [
    { name: 'Tax Detail', value: 1 },
    { name: 'Doc Section Declaration', value: 2 },
    { name: 'Rent Declaration', value: 3 }
  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
     private commanService: ManualPunchBio,

  ) {}

  ngOnInit() {
      this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.ExportExcel = this.fb.group({
      empCode: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      ExportType: [null, [Validators.required]],
      fromdate: [null, [Validators.required]],
      todate: [null, [Validators.required]],
       fk_costcentreid: [null]
    });
      this.getCostCenterList();
  }


  // 🔎 Handle filters from CommonSearchComponent
  handleFilters(filters: any) {
    this.ExportExcel.patchValue(filters);
  }

  // 🔄 Reset form & state
  restfrom() {
    this.EmployeeList = [];
    this.tableHeaders = [];
    this.ExportExcel.reset();
    this.searchText = "";
    this.submitted = false;
    this.showError = false;
    this.showEmployeeList = false;
  }

 getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data

      }
    })
  }

  // 📋 Filter employee list by searchText
  filteredData() {
    if (!this.searchText) {
      return this.EmployeeList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.EmployeeList.filter(res =>
      res.EmpCode?.toLowerCase().includes(searchTextLower) ||
      res.EmpName?.toLowerCase().includes(searchTextLower) ||
      res.Code?.toLowerCase().includes(searchTextLower) ||
      res.Name?.toLowerCase().includes(searchTextLower) ||
      res.Branch?.toLowerCase().includes(searchTextLower) ||
      res.zoneDescription?.toLowerCase().includes(searchTextLower) ||
      res.Department?.toLowerCase().includes(searchTextLower) ||
      res.Designation?.toLowerCase().includes(searchTextLower)
    );
  }


  private convertDateFormat(dateString: string): string {
  if (!dateString) return '';
  
  // Convert from YYYY-MM-DD to DD/MM/YYYY
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Modify your OnVeiw() method
OnVeiw() {
  this.submitted = true;
  this.ngxUILoaderService.start();

  if (this.ExportExcel.invalid) {
    this.showError = true;
    this.ngxUILoaderService.stop();
    return;
  }

  const payload = { ...this.ExportExcel.value };

  // Convert null values to empty strings
  Object.keys(payload).forEach(key => {
    if (payload[key] === null) {
      payload[key] = '';
    }
  });

  // 🔥 FIX: Convert date format for SQL Server
  if (payload.fromdate) {
    payload.fromdate = this.convertDateFormat(payload.fromdate);
  }
  if (payload.todate) {
    payload.todate = this.convertDateFormat(payload.todate);
  }

  // // 🔥 VALIDATION: Check date range
  // if (payload.fromdate && payload.todate) {
  //   const fromDate = new Date(this.ExportExcel.value.fromdate);
  //   const toDate = new Date(this.ExportExcel.value.todate);
    
  //   if (fromDate > toDate) {
  //     this.toastrService.error('From Date cannot be greater than To Date');
  //     this.ngxUILoaderService.stop();
  //     return;
  //   }
  // }

  this.httpService.Export_IncomeTaxReport(payload).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.EmployeeList = res.data;
        this.tableHeaders = Object.keys(res.data[0] ?? {});
        this.showEmployeeList = true;
        this.toastrService.success(res.message);
      } else {
        this.tableHeaders = [];
        this.EmployeeList = [];
        this.toastrService.info(res.message);
      }
      this.ngxUILoaderService.stop();
    },
    error: (error) => {
      this.toastrService.error('Failed to retrieve Income Tax Report', error);
      this.ngxUILoaderService.stop();
    }
  });
}


  // View Report
  // OnVeiw() {
  //   this.submitted = true;
  //   this.ngxUILoaderService.start();

  //   if (this.ExportExcel.invalid) {
  //     this.showError = true;
  //     this.ngxUILoaderService.stop();
  //     return;
  //   }

  //   const payload = this.ExportExcel.value;

  //   // null values ko "" me convert
  //   Object.keys(payload).forEach(key => {
  //     if (payload[key] === null) {
  //       payload[key] = '';
  //     }
  //   });

  //   this.httpService.Export_IncomeTaxReport(payload).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         this.EmployeeList = res.data;
  //         this.tableHeaders = Object.keys(res.data[0] ?? {});
  //         this.showEmployeeList = true;
  //         this.toastrService.success(res.message);
  //       } else {
  //         this.tableHeaders = [];
  //         this.EmployeeList = [];
  //         this.toastrService.info(res.message);
  //       }
  //       this.ngxUILoaderService.stop();
  //     },
  //     error: (error) => {
  //       this.toastrService.error('Failed to retrieve Income Tax Report', error);
  //       this.ngxUILoaderService.stop();
  //     }
  //   });
  // }

  // 📥 Export to Excel
  // downloadExcel(): void {
  //   let selectedReportId = this.ExportExcel.get('ExportType')?.value;
  //   let selectedReport = this.ExportTypelist.find(m => m.value === selectedReportId);
  //   let { name: Report } = { ...selectedReport! };

  //   let ReportName = Report + '.xlsx';
  //   const tableElement = document.getElementById('exportTable');

  //   if (!tableElement) {
  //     console.error('Table element not found!');
  //     return;
  //   }

  //   try {
  //     const worksheet = (window as any).XLSX.utils.table_to_sheet(tableElement);
  //     const workbook = (window as any).XLSX.utils.book_new();
  //     (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  //     const excelBuffer: any = (window as any).XLSX.write(workbook, {
  //       bookType: 'xlsx',
  //       type: 'array',
  //     });
  //     const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //     (window as any).saveAs(blob, ReportName);
  //   } catch (error) {
  //     console.error('Error exporting Excel:', error);
  //   }
  // }



   downloadExcel() {
     
   if (this.isExporting) return; // prevent double click
  this.isExporting = true;
  const payload = { ...this.ExportExcel.value };

  // Convert null values to empty strings
  Object.keys(payload).forEach(key => {
    if (payload[key] === null) {
      payload[key] = '';
    }
  });

  //🔥// FIX: Convert date format for SQL Server
  if (payload.fromdate) {
    payload.fromdate = this.convertDateFormat(payload.fromdate);
  }
  if (payload.todate) {
    payload.todate = this.convertDateFormat(payload.todate);
  }


     let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    let selectedReport = this.ExportTypelist.find(m => m.value === selectedReportId);
    let { name: Report } = { ...selectedReport! };

    let ReportName = Report + '.xlsx';

  //added for contractor name
  // Find contractor name from CostCenter list
let contractorName = '';
if (payload.fk_costcentreid) {
  const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
  contractorName = selectedContractor ? selectedContractor.name : '';
}
// Add to formData for backend
payload.contractorName = contractorName;

  

  this.httpService.downloadExport_IncomeTaxReport(payload).subscribe({
    next: (res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
     // a.download = `Canteen_${new Date().toISOString().split('T')[0]}.xlsx`; // dynamic filename
    a.download = ReportName;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.isExporting = false; // reset after download
    },
    error: (err) => {
      console.error('Download failed', err);
      this.isExporting = false; // reset even on error
    }
  });
}

}
