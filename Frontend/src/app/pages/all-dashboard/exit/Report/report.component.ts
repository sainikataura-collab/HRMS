declare const html2pdf: any;
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { ReportService } from '../Service/report-service.service';
import { SeparationRequestService } from '../../../all-employee/emp-exit/Services/Emp_resignation.service';

@Component({
  selector: 'app-exit-report',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectComponent, CommonSearchComponent, NgxPaginationModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  ExportExcel!: FormGroup;
  isExporting = false;
  searchText: string = "";
  submitted = false;
  submittedExportType: string | null = null;
  totalCount: number = 0;
  pageIndex: number = 1;
  tableHeaders: string[] = [];
  pageSize: number = 10;

  allResignations: any[] = [];
  filteredResignations: any[] = [];
  contractors: any[] = [];

  exportTypeList = [
    { name: 'Resignation Report', value: 'resignation' },
    { name: 'Exit Interview Report', value: 'interview' },
    { name: 'Due Clearance Report', value: 'due' },
    { name: 'No Due Declaration Report', value: 'nodue' },
    { name: 'F&F Report', value: 'fnf' }
  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio,
    private reportService: ReportService,
    private separationRequestService: SeparationRequestService
  ) { }

  ngOnInit() {
    this.ExportExcel = this.fb.group({
      empCode: [''],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      exportType: [null, Validators.required],
      contractorName: [null],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: ['']
    });

    this.getContractorsList();
  }

  getContractorsList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        if (res && res.data) {
          res.data = res.data.slice(1);
          this.contractors = res.data;
        }
      }
    });
  }

  restfrom() {
    this.submitted = false;
    this.ExportExcel.reset({
      empCode: '',
      fromDate: null,
      toDate: null,
      exportType: null,
      contractorName: null,
      empCodeManual: '',
      empName: '',
      selectedDepartments: [],
      selectedDesignation: '',
      selectedLocations: [],
      selectedNature: '',
      selectedCity: '',
      sortBy: ''
    });
    this.searchText = "";
    this.allResignations = [];
    this.filteredResignations = [];
    this.totalCount = 0;
    this.pageIndex = 1;
    this.tableHeaders = [];
    this.submittedExportType = null;
  }

  handleFilters(filters: any) {
    this.ExportExcel.patchValue(filters);
  }

  onpagechange(event: number): void {
    this.pageIndex = event;
  }

  OnSubmit() {
    this.pageIndex = 1;
    this.OnView();
  }

  OnView() {
    this.submitted = true;
    if (this.ExportExcel.invalid) {
      const fromDateInvalid = this.ExportExcel.get('fromDate')?.invalid;
      const toDateInvalid = this.ExportExcel.get('toDate')?.invalid;
      const exportTypeInvalid = this.ExportExcel.get('exportType')?.invalid;

      if (fromDateInvalid || toDateInvalid) {
        this.toastrService.warning('Please select both From and To dates.');
      } else if (exportTypeInvalid) {
        this.toastrService.warning('Please select Export Type.');
      } else {
        this.toastrService.warning('Please fill in all required fields.');
      }
      return;
    }
    this.submittedExportType = this.ExportExcel.get('exportType')?.value;
    this.ngxUILoaderService.start();

    if (this.submittedExportType === 'fnf') {
      const formVals = this.ExportExcel.value;
      const requestBody = {
        pageIndex: 0,
        pageSize: 100000,
        empCode: formVals.empCode || "",
        empCodeManual: formVals.empCodeManual || "",
        empName: formVals.empName || "",
        selectedDepartments: formVals.selectedDepartments || [],
        selectedDesignation: formVals.selectedDesignation || "",
        selectedLocations: formVals.selectedLocations || [],
        selectedNature: formVals.selectedNature || "",
        selectedCity: formVals.selectedCity || "",
        sortBy: formVals.sortBy || "",
        fromdate: formVals.fromDate || "",
        todate: formVals.toDate || "",
        fk_costcentreid: formVals.contractorName || ""
      };

      this.reportService.Export_FnfReportlist(requestBody).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.allResignations = res.data;
            const keys = Object.keys(res.data[0] ?? {});
            this.setDynamicTableHeaders(keys);
            this.applyFilters();
            if (this.filteredResignations.length === 0) {
              this.toastrService.info('No Records Found');
            }
          } else {
            this.allResignations = [];
            this.filteredResignations = [];
            this.totalCount = 0;
            this.toastrService.info(res.message || 'No Records Found');
          }
          this.ngxUILoaderService.stop();
        },
        error: (error) => {
          this.ngxUILoaderService.stop();
          this.toastrService.error('Failed to retrieve FNF report list', error);
        }
      });
    } else {
      // Fetch all resignation requests from backend using Large PageSize
      this.reportService.getAdminExitReportList(0, 100000, "").subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.allResignations = (res.data || []).map((item: any) => this.normalizeKeys(item));
            const keys = Object.keys(this.allResignations[0] ?? {});
            this.setDynamicTableHeaders(keys);
            this.applyFilters();
            if (this.filteredResignations.length === 0) {
              this.toastrService.info('No Records Found');
            }
          } else {
            this.allResignations = [];
            this.filteredResignations = [];
            this.totalCount = 0;
            this.toastrService.info(res.message || 'No Records Found');
          }
          this.ngxUILoaderService.stop();
        },
        error: (error) => {
          this.ngxUILoaderService.stop();
          this.toastrService.error('Failed to retrieve resignation list', error);
        }
      });
    }
  }

  applyFilters() {
    if (this.submittedExportType === 'fnf') {
      const search = this.searchText ? this.searchText.trim().toLowerCase() : "";
      this.filteredResignations = this.allResignations.filter(item => {
        if (!search) return true;
        const code = (item['Emp Code'] || "").toString().toLowerCase();
        const name = (item['Emp Name'] || "").toString().toLowerCase();
        return code.includes(search) || name.includes(search);
      });
      this.totalCount = this.filteredResignations.length;
      return;
    }
    const formVals = this.ExportExcel.value;
    console.log('=== applyFilters debugging ===');
    console.log('formVals:', formVals);
    console.log('allResignations:', this.allResignations);

    this.filteredResignations = this.allResignations.filter(item => {
      // 1. Text Search (Employee Code, Name, Department)
      if (this.searchText) {
        const text = this.searchText.trim().toLowerCase();
        const matchesSearch =
          item.empcode?.toLowerCase().includes(text) ||
          item.empname?.toLowerCase().includes(text) ||
          item.department?.toLowerCase().includes(text);
        if (!matchesSearch) return false;
      }

      // 2. From Date Filter
      if (formVals.fromDate) {
        const fromLimit = new Date(formVals.fromDate);
        if (!item.resignationDate || new Date(item.resignationDate) < fromLimit) {
          console.log('Item filtered out by fromDate:', item.empname, 'resignationDate:', item.resignationDate, 'fromDate:', formVals.fromDate);
          return false;
        }
      }

      // 3. To Date Filter
      if (formVals.toDate) {
        const toLimit = new Date(formVals.toDate);
        toLimit.setHours(23, 59, 59, 999);
        if (!item.resignationDate || new Date(item.resignationDate) > toLimit) {
          console.log('Item filtered out by toDate:', item.empname, 'resignationDate:', item.resignationDate, 'toDate:', formVals.toDate);
          return false;
        }
      }

      // 4. Contractor Name Filter
      if (formVals.contractorName) {
        const selectedContractorObj = this.contractors.find(c => c.value?.toString() === formVals.contractorName?.toString());
        const selectedName = selectedContractorObj ? selectedContractorObj.name.toLowerCase() : '';

        const itemCostCentreId = item.fk_costcentreid?.toString();
        const filterCostCentreId = formVals.contractorName.toString();
        const itemContractorName = item.contractorName?.toLowerCase();

        const matchesId = itemCostCentreId === filterCostCentreId;
        const matchesName = itemContractorName && selectedName && itemContractorName.includes(selectedName);

        if (!matchesId && !matchesName) {
          console.log('Item filtered out by contractorName:', item.empname, 'fk_costcentreid:', item.fk_costcentreid, 'contractorName:', item.contractorName, 'filter:', formVals.contractorName);
          return false;
        }
      }

      // 5. Department Filter
      if (formVals.selectedDepartments && formVals.selectedDepartments.length > 0) {
        const depIds = formVals.selectedDepartments.map((d: any) => d.toString());
        if (!item.fk_deptid || !depIds.includes(item.fk_deptid.toString())) {
          console.log('Item filtered out by department ID:', item.empname, 'fk_deptid:', item.fk_deptid, 'filter:', formVals.selectedDepartments);
          return false;
        }
      }

      // 6. Designation Filter
      if (formVals.selectedDesignation) {
        if (!item.fk_desgid || item.fk_desgid.toString() !== formVals.selectedDesignation.toString()) {
          console.log('Item filtered out by designation ID:', item.empname, 'fk_desgid:', item.fk_desgid, 'filter:', formVals.selectedDesignation);
          return false;
        }
      }

      // 7. Location Filter
      if (formVals.selectedLocations && formVals.selectedLocations.length > 0) {
        const locIds = formVals.selectedLocations.map((l: any) => l.toString());
        if (!item.fk_locid || !locIds.includes(item.fk_locid.toString())) {
          console.log('Item filtered out by location ID:', item.empname, 'fk_locid:', item.fk_locid, 'filter:', formVals.selectedLocations);
          return false;
        }
      }

      console.log('Item passed all filters:', item.empname);
      return true;
    });

    this.totalCount = this.filteredResignations.length;
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Retain';
      case 3: return 'Withdraw';
      case 4: return 'Accepted';
      case 5: return 'Rejected';
      default: return 'Pending';
    }
  }

  downloadExcel(): void {
    this.applyFilters();
    if (this.filteredResignations.length === 0) {
      this.toastrService.warning('No data available to export');
      return;
    }

    this.isExporting = true;
    const type = this.ExportExcel.get('exportType')?.value || 'resignation';

    let formattedData: any[] = [];
    let sheetName = 'Exit Report';

    if (type === 'resignation') {
      sheetName = 'Resignation Report';
      formattedData = this.filteredResignations.map((item: any) => ({
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Notice Period (Days)': item.noticePeriod || 0,
        'Notice Period Served': item.isNoticePeriodServed ? 'Yes' : 'No',
        'Reason for Leaving': item.remarks || '',
        'Status': this.getStatusText(item.status)
      }));
    } else if (type === 'interview') {
      sheetName = 'Exit Interview Report';
      formattedData = this.filteredResignations.map((item: any) => ({
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Exit Interview Status': item.exitInterviewStatus || 'Pending'
      }));
    } else if (type === 'due') {
      sheetName = 'Due Clearance Report';
      formattedData = this.filteredResignations.map((item: any) => ({
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Due Clearance Status': item.dueClearanceStatus || 'Pending'
      }));
    } else if (type === 'nodue') {
      sheetName = 'No Due Declaration Report';
      formattedData = this.filteredResignations.map((item: any) => ({
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'No Due Declaration Status': item.noDueDeclarationStatus || 'Pending'
      }));
    } else if (type === 'fnf') {
      sheetName = 'FNF Report';
      formattedData = this.filteredResignations.map((item: any) => ({
        'Emp Code': item['Emp Code'] || '',
        'Emp Name': item['Emp Name'] || '',
        'Designation': item['Designation'] || '',
        'Department': item['Department'] || '',
        'Location': item['Location'] || '',
        'DOJ': item['DOJ'] || '',
        'Left Date': item['Left Date'] || '',
        'Days Worked': item['Days Worked'] || 0,
        'Notice Req': item['Notice Req'] || 0,
        'Notice Given': item['Notice Given'] || 0,
        'Shortfall Days': item['Shortfall Days'] || 0,
        'Net Pay': item['Net Pay'] || 0
      }));
    }

    try {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const fileName = `${sheetName.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.toastrService.success('Excel downloaded successfully.');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      this.toastrService.error('Failed to export Excel');
    } finally {
      this.isExporting = false;
    }
  }

  downloadpdf(): void {
    this.applyFilters();
    if (this.filteredResignations.length === 0) {
      this.toastrService.warning('No data available to print');
      return;
    }

    const type = this.ExportExcel.get('exportType')?.value || 'resignation';
    let docTitle = 'Exit_Report';
    if (type === 'resignation') docTitle = 'Resignation_Report';
    else if (type === 'interview') docTitle = 'Exit_Interview_Report';
    else if (type === 'due') docTitle = 'Due_Clearance_Report';
    else if (type === 'nodue') docTitle = 'No_Due_Declaration_Report';

    const element = document.getElementById('exportTable') as HTMLElement;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${docTitle}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    if (element) {
      html2pdf().from(element).set(opt).save();
    } else {
      this.toastrService.error('Report table element not found');
    }
  }

  formatHeaderLabel(key: string): string {
    if (key === 'empcode') return 'Emp Code';
    if (key === 'empname') return 'Employee Name';
    if (key === 'resignationDate') return 'Resignation Date';
    if (key === 'expectedLWD') return 'Expected LWD';
    if (key === 'noticePeriod') return 'Notice Period (Days)';
    if (key === 'isNoticePeriodServed') return 'Notice Period Served';
    if (key === 'remarks') return 'Reason for Leaving';
    if (key === 'exitInterviewStatus') return 'Exit Interview Status';
    if (key === 'dueClearanceStatus') return 'Due Clearance Status';
    if (key === 'noDueDeclarationStatus') return 'No Due Declaration Status';
    if (key === 'status') return 'Status';
    if (key === 'action') return 'Action';

    // Capitalize first letter and add space before caps for camelCase keys
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  normalizeKeys(obj: any): any {
    if (!obj) return obj;
    const mapping: { [key: string]: string } = {
      'EmpCode': 'empcode',
      'EmpName': 'empname',
      'Department': 'department',
      'Designation': 'designation',
      'Location': 'location',
      'ContractorName': 'contractorName',
      'ResignationDate': 'resignationDate',
      'ExpectedLWD': 'expectedLWD',
      'NoticePeriod': 'noticePeriod',
      'IsNoticePeriodServed': 'isNoticePeriodServed',
      'Remarks': 'remarks',
      'Status': 'status',
      'ExitInterviewStatus': 'exitInterviewStatus',
      'DueClearanceStatus': 'dueClearanceStatus',
      'NoDueDeclarationStatus': 'noDueDeclarationStatus'
    };

    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const targetKey = mapping[key] || (key.charAt(0).toLowerCase() + key.slice(1));
      newObj[targetKey] = obj[key];
    }
    return newObj;
  }

  setDynamicTableHeaders(keys: string[]): void {
    const type = this.submittedExportType;

    // 1. Globally exclude internal, pagination, and key fields
    const globalExclusions = [
      'pageindex', 'pagesize', 'searchterm', 'totalcount',
      'pkseprequestid', 'issuccessfull', 'message',
      'fk_empid', 'fk_finid', 'fk_deptid', 'fk_desgid', 'fk_locid', 'fk_costcentreid'
    ];

    if (type !== 'fnf') {
      globalExclusions.push('contractorname', 'fkempid', 'location');
    }

    let filteredKeys = keys.filter(key => {
      const lowerKey = key.toLowerCase();
      return !globalExclusions.includes(lowerKey) &&
        !lowerKey.startsWith('pk_') &&
        !lowerKey.startsWith('fk_');
    });

    // 2. Exclude type-specific status columns to keep reports focused
    if (type === 'resignation') {
      const typeExclusions = ['exitinterviewstatus', 'dueclearancestatus', 'noduedeclarationstatus'];
      filteredKeys = filteredKeys.filter(k => !typeExclusions.includes(k.toLowerCase()));
    } else if (type === 'interview') {
      const typeExclusions = ['noticeperiod', 'isnoticeperiodserved', 'remarks', 'status', 'dueclearancestatus', 'noduedeclarationstatus'];
      filteredKeys = filteredKeys.filter(k => !typeExclusions.includes(k.toLowerCase()));
    } else if (type === 'due') {
      const typeExclusions = ['noticeperiod', 'isnoticeperiodserved', 'remarks', 'status', 'exitinterviewstatus', 'noduedeclarationstatus'];
      filteredKeys = filteredKeys.filter(k => !typeExclusions.includes(k.toLowerCase()));
    } else if (type === 'nodue') {
      const typeExclusions = ['noticeperiod', 'isnoticeperiodserved', 'remarks', 'status', 'exitinterviewstatus', 'dueclearancestatus'];
      filteredKeys = filteredKeys.filter(k => !typeExclusions.includes(k.toLowerCase()));
    }

    // 3. Define the desired column order for standard columns
    const preferredOrder = [
      'empcode', 'empname', 'department', 'designation', 'location', 'doj', 'leftdate', 'daysworked', 'noticereq', 'noticegiven', 'shortfalldays', 'netpay',
      'resignationdate', 'expectedlwd', 'noticeperiod', 'isnoticeperiodserved', 'remarks',
      'exitinterviewstatus', 'dueclearancestatus', 'noduedeclarationstatus', 'status'
    ];

    const cleanKey = (k: string) => k.toLowerCase().replace(/[\s_-]/g, '');

    // Sort filtered keys: put preferred ones first in order, then any new dynamic columns
    filteredKeys.sort((a, b) => {
      const idxA = preferredOrder.indexOf(cleanKey(a));
      const idxB = preferredOrder.indexOf(cleanKey(b));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    this.tableHeaders = filteredKeys;

    if (this.tableHeaders.length > 0 && !this.tableHeaders.includes('action')) {
      this.tableHeaders.push('action');
    }
  }

  handleSingleDownload(item: any): void {
    console.log('=== handleSingleDownload Debug ===');
    console.log('Selected type:', this.submittedExportType);
    console.log('Item keys & values:', item);
    const type = this.submittedExportType || this.ExportExcel.get('exportType')?.value || 'resignation';
    if (type === 'resignation') {
      if (item.pkSepRequestId) {
        this.downloadSinglePdf(item.pkSepRequestId, 'Resignation');
      } else {
        this.toastrService.warning('Resignation PDF not available.');
      }
    } else if (type === 'fnf') {
      const empId = item.pk_empid || item.pkEmpid || item.fk_empid || item.fkEmpid || item['pk_empid'] || item['pkEmpid'];
      this.downloadSingleFnfPdf(empId, item['Emp Name'] || item['Emp Code'] || 'Employee');
    } else {
      this.downloadSingleExcel(item);
    }
  }

  downloadSingleFnfPdf(empId: string, name: string): void {
    if (!empId) {
      this.toastrService.warning('Employee ID not available for F&F Report.');
      return;
    }
    this.ngxUILoaderService.start();
    this.reportService.downloadFnfPdf(empId).subscribe({
      next: (blob: Blob) => {
        this.ngxUILoaderService.stop();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FNF_Report_${name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastrService.success(`F&F PDF Report for ${name} downloaded successfully.`);
      },
      error: (err: any) => {
        this.ngxUILoaderService.stop();
        console.error('Error downloading FNF PDF:', err);
        this.toastrService.error('Failed to download F&F PDF Report.');
      }
    });
  }

  downloadSingleExcel(item: any): void {
    const type = this.submittedExportType || this.ExportExcel.get('exportType')?.value || 'resignation';
    let formattedData: any[] = [];
    let sheetName = 'Exit Report';
    let empName = '';

    if (type === 'resignation') {
      sheetName = 'Resignation Report';
      empName = item.empname || item.empcode || 'Employee';
      formattedData = [{
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Notice Period (Days)': item.noticePeriod || 0,
        'Notice Period Served': item.isNoticePeriodServed ? 'Yes' : 'No',
        'Reason for Leaving': item.remarks || '',
        'Status': this.getStatusText(item.status)
      }];
    } else if (type === 'interview') {
      sheetName = 'Exit Interview Report';
      empName = item.empname || item.empcode || 'Employee';
      formattedData = [{
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Exit Interview Status': item.exitInterviewStatus || 'Pending'
      }];
    } else if (type === 'due') {
      sheetName = 'Due Clearance Report';
      empName = item.empname || item.empcode || 'Employee';
      formattedData = [{
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Due Clearance Status': item.dueClearanceStatus || 'Pending'
      }];
    } else if (type === 'nodue') {
      sheetName = 'No Due Declaration Report';
      empName = item.empname || item.empcode || 'Employee';
      formattedData = [{
        'Employee Code': item.empcode,
        'Employee Name': item.empname,
        'Department': item.department,
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD).toLocaleDateString('en-GB').replace(/\//g, '-')
          : '',
        'No Due Declaration Status': item.noDueDeclarationStatus || 'Pending'
      }];
    } else if (type === 'fnf') {
      sheetName = 'FNF Report';
      empName = item['Emp Name'] || item['Emp Code'] || 'Employee';
      formattedData = [{
        'Emp Code': item['Emp Code'] || '',
        'Emp Name': item['Emp Name'] || '',
        'Designation': item['Designation'] || '',
        'Department': item['Department'] || '',
        'Location': item['Location'] || '',
        'DOJ': item['DOJ'] || '',
        'Left Date': item['Left Date'] || '',
        'Days Worked': item['Days Worked'] || 0,
        'Notice Req': item['Notice Req'] || 0,
        'Notice Given': item['Notice Given'] || 0,
        'Shortfall Days': item['Shortfall Days'] || 0,
        'Net Pay': item['Net Pay'] || 0
      }];
    }

    try {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const cleanEmpName = empName.toString().replace(/\s+/g, '_');
      const fileName = `${sheetName.replace(/\s+/g, '_')}_${cleanEmpName}_${new Date().getTime()}.xlsx`;

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.toastrService.success(`Excel for ${empName} downloaded successfully.`);
    } catch (error) {
      console.error('Error exporting single Excel:', error);
      this.toastrService.error('Failed to export Excel');
    }
  }

  downloadSinglePdf(id: number, prefix: string): void {
    this.separationRequestService.downloadPdf(id).subscribe({
      next: (response: Blob) => {
        const fileURL = URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `${prefix}_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
        this.toastrService.success('PDF downloaded successfully.');
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
        this.toastrService.error('Failed to download PDF.');
      }
    });
  }


}