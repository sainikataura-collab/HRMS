// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-compliance-report',
//   standalone: true,
//   imports: [],
//   templateUrl: './compliance-report.component.html',
//   styleUrl: './compliance-report.component.scss'
// })
// export class ComplianceReportComponent {

// }

declare const html2pdf: any;
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-compliance-report',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule],
  templateUrl: './compliance-report.component.html',
  styleUrl: './compliance-report.component.scss'
})
export class ComplianceReportComponent {
  ExportExcel!: FormGroup;
  isExporting = false;
  searchText: string = "";
  submitted = false;
  showError = false;
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  showEmployeeList: boolean = false;
  EmployeeList: any[] = [];
  ComplainceListExcle: any[] = [];
  
  // Financial Years array (replacing months and years)
  financialYears: any[] = [];
  
  CostCenter: { name: string; value: string | null }[] = [];
  tableHeaders: string[] = [];
  isContractApplicable = false;
  
  ExportTypelist = [
   
    { name: 'Compliance Report', value: 1 },
    { name: 'Bonus Report', value: 2 },
   
  
  ];

  SalTransfer = [
    { name: 'All', value: "A" },
    { name: 'Bank', value: "B" },
    { name: 'Cash', value: "C" },
    { name: 'Stop', value: "S" }
  ];

  // Salary slip data
  salarySlipData: any[] = [];
  showPayslip: boolean = false;
  payColumns: { Fixed: string, Rate: string, Earnings: string, Arrears: string }[] = [];
  dedColumns: { Fixed: string, Amount: string }[] = [];
  LeaveList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.ExportExcel = this.fb.group({
      empCode: [''],
      fk_finid: [null, [Validators.required]], // Financial Year field
      fk_costcentreid: [null],
      EmplyeeType: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      ExportType: [null, [Validators.required]],
      SalTransfer: ['A']
    });

    this.getFinancialYearsList();
    this.getCostCenterList();
  }

  // Get Financial Years List
  getFinancialYearsList() {
    this.commanService.getCommanList('FinanceYear').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.financialYears = res.data;
      },
      error: (err) => {
        // If API doesn't have FinancialYear, create default list
        this.financialYears = [
          { name: '2019-2020', value: 1 },
          { name: '2020-2021', value: 2 },
          { name: '2021-2022', value: 3 },
          { name: '2022-2023', value: 4 },
          { name: '2023-2024', value: 5 },
          { name: '2024-2025', value: 6 },
          { name: '2025-2026', value: 7 }
        ];
      }
    });
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data;
      }
    });
  }

  get isPdfExport(): boolean {
    return this.ExportExcel?.value?.ExportType === 1;
  }

  // get isPdfExport1(): boolean {
  //   const type = this.ExportExcel?.value?.ExportType;
  //   return type === 2 || type === 51;
  // }

  get requestBody() {
    return this.ExportExcel.value;
  }

  restfrom() {
    this.ExportExcel.reset();
    this.EmployeeList = [];
    this.tableHeaders = [];
    this.submitted = false;
    this.showError = false;
    this.searchText = '';
  }

  handleFilters(filters: any) {
    this.ExportExcel.patchValue(filters);
  }

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

  onpagechange(event: number): void {
    this.pageIndex = event;
    this.OnVeiw();
  }

  OnSubmit() {
    debugger;
    this.pageIndex = 1;
    this.totalCount = 0;
    this.OnVeiw();
  }

  OnVeiw() {
    this.submitted = true;
    this.ngxUILoaderService.start();
    
    if (this.ExportExcel.invalid) {
      this.showError = true;
      this.ngxUILoaderService.stop();
      this.toastrService.error('Please fill all required fields', 'Error');
      return;
    }

    const exportType = this.ExportExcel.value.ExportType;

    const payload = {
      ...this.ExportExcel.value,
      ExportType: exportType,
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.ComplainceListExcle=[];
      this.httpService.Export_Compliancelist(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.EmployeeList = res.data;
            this.totalCount=res.totalCount
            //console.log( this.totalCount)
            this.tableHeaders = Object.keys(res.data[0] ?? {});
            this.showEmployeeList = true  

           
            // this.toastrService.success(res.message)        
          } else {
            this.tableHeaders =[]
            this.EmployeeList =[]
            this.totalCount=0
           this.toastrService.info(res.message)
          }
          this.ngxUILoaderService.stop();
        },
        error: (error) => {
        this.ngxUILoaderService.stop();
          this.toastrService.error('Failed to retrieve employees', error);
        }
       

      });
   
  }

  downloadExcel() {
    if (this.isExporting) return;
    this.isExporting = true;

    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,
      pageSize: 10000
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    let selectedFinYearId = this.ExportExcel.get('fk_finid')?.value;
    let selectedFinYear: { name: string, value: string } | undefined = this.financialYears.find((m: { name: string, value: string }) => m.value === selectedFinYearId);
    let { name: finYear, value } = { ...selectedFinYear! };

    let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    let selectedReport: { name: string, value: number } | undefined = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
    let { name: Report, value: Reportvalue } = { ...selectedReport! };

    let ReportName = Report + '_' + finYear + '.xlsx';

    // Find contractor name from CostCenter list
    let contractorName = '';
    if (payload.fk_costcentreid) {
      const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
      contractorName = selectedContractor ? selectedContractor.name : '';
    }
    payload.contractorName = contractorName;

    this.httpService.DownloadcomplianceReport(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ReportName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Download failed', err);
        this.isExporting = false;
        this.toastrService.error('Failed to download Excel');
      }
    });
  }

  downloadpdf(): void {
    const payload = {
      ...this.ExportExcel.value
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.httpService.Export_pdf(payload).subscribe({
      next: (file: Blob) => {
        const blob = new Blob([file], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.ngxUILoaderService.stop();
      },
      error: (error) => {
        if (error.status === 500) {
          this.toastrService.warning('Record not found');
        } else {
          this.toastrService.error('Failed to download PDF');
        }
        this.ngxUILoaderService.stop();
      }
    });
  }

 

  downloadPDF(): void {
    this.showPayslip = true;
    const element = document.getElementById('pdf-content') as HTMLElement;
    window.scrollTo(0, 0);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: 'Payslip.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { avoid: 'tr' }
    };

    if (element) {
      html2pdf().from(element).set(opt).save();
    } else {
      console.error("Element not found for PDF generation");
    }
  }

  // downloadPdffile() {
  //   const payload = {
  //     ...this.ExportExcel.value,
  //     pageIndex: 0,
  //     pageSize: 100
  //   };

  //   Object.keys(payload).forEach(key => {
  //     if (payload[key] === null) {
  //       payload[key] = '';
  //     }
  //   });

  //   this.httpService.DownloadPdfFile(payload).subscribe((res: Blob) => {
  //     const blob = new Blob([res], { type: 'application/pdf' });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'SalaryRegister.pdf';
  //     a.click();
  //   });
  // }

  downloadPFForm3() {
    const payload = {
      ...this.ExportExcel.value
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.httpService.DownloadPFForm3(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PFForm3A.pdf';
      a.click();
    });
  }

  GenerateBonusRegisterPdf() {
    const payload = {
      ...this.ExportExcel.value,
       pageIndex: 0,      // ✅ added
      pageSize: 1000000
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });
    this.httpService.GenerateBonusRegisterPdf(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // ✅ Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generate BonusRegister C.pdf';  // file ka naam
      a.click();

      // ✅ Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }
 

  onExportClick() {
    const exportType = this.ExportExcel.get('ExportType')?.value;

    if (exportType === 1) {
      this.downloadPFForm3();
    } 
    else if(exportType === 2)
    {
        this.GenerateBonusRegisterPdf();  
    }
    else {
      this.downloadpdf();
    }
  }

 

 
}

