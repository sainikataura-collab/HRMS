import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HttpErrorResponse } from '@angular/common/http';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { EmployeeService } from '../../payroll/services/employee.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { WorkflowNavigationService } from '../../../../shared/services/workflow-navigation.service';

import { WorkflowSidebarComponent } from '../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-export-attendance',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, WorkflowSidebarComponent],
  templateUrl: './export-attendance.component.html',
  styleUrl: './export-attendance.component.scss'
})


export class ExportAttendanceComponent {
  ExportExcel!: FormGroup;
  imageUrls: { [key: string]: string } = {};
  searchText: string = "";
  submitted = false;
  showError = false;
  showEmployeeList: boolean = false;
  EmployeeList: any[] = []
  isContractApplicable = false;
  months = []
  years = []
  CostCenter: { name: string; value: string | null }[] = [];
  selectedCostCenters: string[] = [];
  isExporting = false;
  tableHeaders: string[] = []
  ExportTypelist = [
    { name: 'Attendance Roster ', value: 1 },
    { name: 'Attendance Sheet', value: 2 },
    { name: 'Attendance Time Sheet', value: 3 },
    { name: 'Attendance Geo tagging', value: 4 },
    { name: 'Monthly Attendance Detail', value: 5 },
    // {name:'Daily Attendance Roster',value:7},
    { name: 'late Coming Register', value: 8 },
    { name: 'Absent Register', value: 9 },
    { name: 'Missed Punch Register', value: 10 },
    { name: 'OT Register', value: 11 },
    { name: 'Form 12 ', value: 12 },
    //  {name:'Canteen Attendance',value:6}, 
  ]
  currentPage: number = 1;
  pageSize: number = 10;
  totalCount: any;
  
  // Origin tracking for smart return
  returnUrl: string = '';
  returnLabel: string = '';

  // OT Details Modal State
  isOtModalOpen: boolean = false;
  otDetailsList: any[] = [];
  otDetailsHeaders: string[] = [];
  otModalEmpCode: string = '';
  otModalEmpName: string = '';
  otModalMonth: string = '';
  otModalYear: string = '';
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public workflowNav: WorkflowNavigationService,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio,) { }
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      this.returnLabel = params['returnLabel'] || '';
    });
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;
    this.ExportExcel = this.fb.group({
      empCode: [''],
      fk_monthId: [null, Validators.required],
      fk_yearId: [null, Validators.required],
      fk_costcentreid: [[]],
      EmplyeeType: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      ExportType: [null, Validators.required]
    });

    this.ngxUILoaderService.start();
    forkJoin([
      this.commanService.getCommanList('month'),
      this.commanService.getCommanList('Year'),
      this.commanService.getCommanList('CostCenter')
    ]).subscribe({
      next: ([monthRes, yearRes, costCenterRes]) => {
        this.months = monthRes?.data?.slice(1) || [];
        this.years = yearRes?.data?.slice(1) || [];
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...(costCenterRes?.data?.slice(1) || [])
        ];
        this.ngxUILoaderService.stop();

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        if (this.workflowNav.applyContextIfFromWorkflow(this.ExportExcel, this.months, this.years, this.CostCenter)) {
          const cc = this.ExportExcel.get('fk_costcentreid')?.value;
          if (Array.isArray(cc)) {
            this.selectedCostCenters = [...cc];
          }
        }
      },
      error: () => {
        this.ngxUILoaderService.stop();
      }
    });
  }

  getPayrollContext = () => ({
    month: this.ExportExcel.get('fk_monthId')?.value,
    year: this.ExportExcel.get('fk_yearId')?.value,
    costCentre: this.ExportExcel.get('fk_costcentreid')?.value
  });

  getMonthsList() {
    this.commanService.getCommanList('month').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.months = res.data

      }
    })
  }
  getyearsList() {
    this.commanService.getCommanList('Year').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.years = res.data
      }
    })
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...res.data.slice(1)
        ];
      }
    })
  }

  restfrom() {
    this.EmployeeList = [];
  }
  // Handle filter updates from common search
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
      res.empcode?.toLowerCase().includes(searchTextLower) ||
      res.empname?.toLowerCase().includes(searchTextLower) ||
      res.Department?.toLowerCase().includes(searchTextLower) ||
      res.Designation?.toLowerCase().includes(searchTextLower),);
  }


  OnVeiw() {
    this.submitted = true;
    this.ngxUILoaderService.start();
    if (this.ExportExcel.invalid) {
      this.showError = true;
      this.ngxUILoaderService.stop();
      return;
    }

    const payload = this.ExportExcel.value


    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    if (this.ExportExcel.get('ExportType')?.value == '1') {
      payload['paginationRequired'] = true,
        payload['PageIndex'] = this.currentPage;
      payload['PageSize'] = this.pageSize;

    }

    this.httpService.Export_Attendancelist(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data;
          this.totalCount = res.data[0]?.TotalCount ?? 0;
          // this.tableHeaders = Object.keys(res.data[0] ?? {});
          this.tableHeaders = Object.keys(res.data[0] ?? {}).filter(key => key !== 'TotalCount');

          // for  image
       if(this.EmployeeList.length > 0 && this.EmployeeList[0].hasOwnProperty('Picture')){
          this.EmployeeList.forEach((item: any) => {
            this.httpService.getImage(item.Picture).subscribe({
              next: (blob: any) => {
                item.Picture = `<img src="${blob.type.includes('application/json')
                  ? 'assets/img/users/user-6.png'
                  : URL.createObjectURL(blob)
                  }" width="30"  height="30"  class="at rounded-pill" >`;
              }
            });
          });
        }
          
          // end

          this.showEmployeeList = true

          this.toastrService.success(res.message)
        } else {
          this.tableHeaders = []
          this.EmployeeList = []
          this.toastrService.info(res.message)
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {

        this.toastrService.error('Failed to retrieve employees', error);
      }


    });
  }
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  //     downloadExcel(): void {
  //       let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
  //       let selectedMonth: {name: string, value: string} | undefined = this.months.find((m: {name: string, value: string}) => m.value === selectedMonthId);
  //       let {name : month,value}={...selectedMonth!}

  //       let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
  //       let selectedYear: {name: string, value: string} | undefined = this.years.find((m: {name: string, value: string}) => m.value === selectedYearId);
  //       let {name : Year,value : Yearvalue}={...selectedYear!}

  //       let selectedReportId = this.ExportExcel.get('ExportType')?.value;
  //       let selectedReport: {name: string, value: number} | undefined = this.ExportTypelist.find((m: {name: string, value: number}) => m.value === selectedReportId);
  //       let {name : Report,value : Reportvalue}={...selectedReport!}

  //       let ReportName =Report +'_'+ month+'_'+Year+'.xlsx';

  //       //const tableElement = document.getElementById('exportTable');

  //       const tableElement = document.getElementById('exportTable') as HTMLTableElement;


  //       if (!tableElement) {
  //         console.error('Table element not found!');
  //         return;
  //       }

  //     // Clone the table so we don’t overwrite original
  // const clonedTable = tableElement.cloneNode(true) as HTMLTableElement;
  //       const rows = clonedTable.rows;

  //       for (let i = 0; i < rows.length; i++) {
  //         const cells = rows[i].cells;
  //         for (let j = 0; j < cells.length; j++) {
  //           const cleanText = this.stripHtmlTags(cells[j].innerHTML);
  //           cells[j].innerText = cleanText;   // replaces content with cleaned text
  //           // OR
  //           // cells[j].innerHTML = cleanText; // if you want HTML safe replacement
  //         }
  //       }

  //       try {
  //         // Convert the HTML table to a worksheet
  //         const worksheet = (window as any).XLSX.utils.table_to_sheet(clonedTable);

  //         // Create a new workbook and append the worksheet
  //         const workbook = (window as any).XLSX.utils.book_new();
  //         (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  //         // Write the workbook to an Excel file buffer
  //         const excelBuffer: any = (window as any).XLSX.write(workbook, {
  //           bookType: 'xlsx',
  //           type: 'array',
  //         });

  //         // Create a blob from the buffer
  //         const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  //         // Save the Excel file with a custom name
  //         (window as any).saveAs(blob, ReportName);
  //       } catch (error) {
  //         console.error('Error exporting Excel:', error);
  //       }
  //     }
  downloadExcel() {

    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const payload = this.ExportExcel.value


    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }


    if (this.ExportExcel.get('ExportType')?.value == '1') {
      payload['paginationRequired'] = false

    }

    let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
    let selectedMonth: { name: string, value: string } | undefined = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
    let { name: month, value } = { ...selectedMonth! }

    let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
    let selectedYear: { name: string, value: string } | undefined = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
    let { name: Year, value: Yearvalue } = { ...selectedYear! }

    let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    let selectedReport: { name: string, value: number } | undefined = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
    let { name: Report, value: Reportvalue } = { ...selectedReport! }

    let ReportName = Report + '_' + month + '_' + Year + '.xlsx';



    //added for contractor name
    // Find contractor name from CostCenter list
    let contractorName = '';
    if (payload.fk_costcentreid) {
      contractorName = this.getCostCenterDisplayText();
    }
    // Add to formData for backend
    // payload.contractorName = contractorName;
    payload.ReportName = Report;



    this.httpService.downloadViewAttendanceReportlist(payload).subscribe({
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



  downloadform12Excel() {

    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const payload = this.ExportExcel.value


    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }


    let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
    let selectedMonth: { name: string, value: string } | undefined = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
    let { name: month, value } = { ...selectedMonth! }

    let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
    let selectedYear: { name: string, value: string } | undefined = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
    let { name: Year, value: Yearvalue } = { ...selectedYear! }

    let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    let selectedReport: { name: string, value: number } | undefined = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
    let { name: Report, value: Reportvalue } = { ...selectedReport! }

    let ReportName = Report + '_' + month + '_' + Year + '.xlsx';



    //added for contractor name
    // Find contractor name from CostCenter list
    let contractorName = '';
    if (payload.fk_costcentreid) {
      contractorName = this.getCostCenterDisplayText();
    }
    // Add to formData for backend
    // payload.contractorName = contractorName;
    payload.ReportName = Report;



    this.httpService.downloadForm12Reportlist(payload).subscribe({
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

  onExportClick(): void {
    const exportType = this.ExportExcel.get('ExportType')?.value;

    if (exportType === 12) {
      this.downloadform12Excel();   // Form 12
    } else {
      this.downloadExcel();        // All other exports
    }
  }

  onPDFClick() {
    const exportType = this.ExportExcel.get('ExportType')?.value;
    if (exportType === 1) {
      this.downloadpdf(); // For 'Attendance Roster'
    } else if (exportType === 11) {
      this.downloadPdffile(); // For 'OT'
    } else {
      this.toastrService.info('PDF export not available for this type.');
    }
  }

  downloadpdf(): void {
    const payload = { ...this.ExportExcel.value };

    // Replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.Export_pdf(payload).subscribe({
      next: (file: Blob) => {
        const blob = new Blob([file], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Overtime.pdf'; // Customize filename as needed
        a.click();

        window.URL.revokeObjectURL(url);
        this.ngxUILoaderService.stop();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 500) {
          this.toastrService.warning('Record not found');
        } else {
          this.toastrService.error('Failed to download PDF');
        }
        this.ngxUILoaderService.stop();
      }
    });
  }

  // Download PDF file (e.g., for attendance registers)
  downloadPdffile() {
    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,
      pageSize: 100
    };

    // Replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.DownloadOverTimePdf(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'overTime.pdf'; // Customize filename
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }


  onPageChange(event: number): void {
  this.currentPage = event;
  this.OnVeiw();
}

  toggleSelectAllCostCenters(event: any) {
    const isChecked = event.target.checked;
    const realValues = this.CostCenter
      .filter(c => c.value !== '__select_all__')
      .map(c => c.value);
    this.selectedCostCenters = isChecked ? (realValues as string[]) : [];
    this.ExportExcel.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
  }

  toggleCostCenter(costCenter: string) {
    const index = this.selectedCostCenters.indexOf(costCenter);
    if (index === -1) {
      this.selectedCostCenters.push(costCenter);
    } else {
      this.selectedCostCenters.splice(index, 1);
    }
    this.ExportExcel.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
  }

  isAllCostCentersSelected(): boolean {
    const realCostCenters = this.CostCenter.filter(item => item.value !== '__select_all__');
    return (
      this.selectedCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => this.selectedCostCenters.includes(c.value as string))
    );
  }

  getCostCenterDisplayText(): string {
    const realCostCenters = this.CostCenter.filter(c => c.value !== '__select_all__');
    const selectedRealCostCenters = this.selectedCostCenters.filter(value => value !== '__select_all__');

    if (
      selectedRealCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => selectedRealCostCenters.includes(c.value as string))
    ) {
      return "All Selected";
    } else if (this.selectedCostCenters.length === 1) {
      return this.CostCenter.find(item => item.value === this.selectedCostCenters[0])?.name || "--Select --";
    } else if (this.selectedCostCenters.length > 1) {
      const firstSelected = this.CostCenter.find(item => item.value === this.selectedCostCenters[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select --";
    } else {
      return "--Select --";
    }
  }

  clearCostCenters() {
    this.selectedCostCenters = [];
    this.ExportExcel.controls['fk_costcentreid'].setValue([]);
  }

  openOTDetails(item: any) {
    if (!item.empcode && !item.EmpCode) {
      this.toastrService.error('Employee code not found');
      return;
    }

    this.otModalEmpCode = item.empcode || item.EmpCode || '';
    this.otModalEmpName = item.empname || item.EmpName || item.Name || '';
    
    let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
    let monthObj = this.months.find((m: any) => m.value === selectedMonthId);
    this.otModalMonth = monthObj ? (monthObj as any).name : '';

    let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
    let yearObj = this.years.find((m: any) => m.value === selectedYearId);
    this.otModalYear = yearObj ? (yearObj as any).name : '';

    this.ngxUILoaderService.start();
    
    // Use ExportType 3 (Time Sheet) to get details as specified in SAL_Employee_MonthlyAttendance_TimeSheet
    const payload = {
      ...this.ExportExcel.value,
      empCode: item.empcode || item.EmpCode,
      ExportType: 3
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.Export_Attendancelist(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Filter to only include rows where OT Hours > 0
          this.otDetailsList = res.data.filter((d: any) => {
            const ot = d['OT Hours'] || d.OTHours || d.OTHrs || '';
            return ot && ot !== '0' && ot !== '0:00' && ot !== '00:00' && ot !== '0.00';
          });
          
          if (this.otDetailsList.length > 0) {
            const excludeKeys = [
              'totalcount', 'empcode', 'empname', 'month', 'year',
              'late coming', 'latecoming lapsed', 'short time',
              'day status', 'day description', 'shift name', 'shiftname'
            ];
            this.otDetailsHeaders = Object.keys(this.otDetailsList[0]).filter(key => {
              return !excludeKeys.includes(key.toLowerCase());
            });
          } else {
            this.otDetailsHeaders = [];
          }
          this.isOtModalOpen = true;
        } else {
          this.otDetailsList = [];
          this.otDetailsHeaders = [];
          this.toastrService.info(res.message || 'No details found');
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {
        this.toastrService.error('Failed to retrieve OT details', error);
        this.ngxUILoaderService.stop();
      }
    });
  }

  closeOTDetails() {
    this.isOtModalOpen = false;
    this.otDetailsList = [];
    this.otDetailsHeaders = [];
  }

  goBack() {
    this.workflowNav.returnToOrigin(this.returnUrl, this.workflowNav.ROUTES.MONTHLY_ATTENDANCE);
  }

}

