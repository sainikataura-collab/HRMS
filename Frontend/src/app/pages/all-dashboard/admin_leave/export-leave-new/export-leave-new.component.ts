import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { EmployeeService } from '../../payroll/services/employee.service';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';

@Component({
  selector: 'app-export-leave-new',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectModule, NgxPaginationModule, CommonSearchComponent],
  templateUrl: './export-leave-new.component.html',
  styleUrl: './export-leave-new.component.scss'
})
export class ExportLeaveNewComponent {

  ExportExcel!: FormGroup;
  submitted = false;
  showError = false;
  showEmployeeList: boolean = false;
  isContractApplicable = false;
  CostCenter: { name: string; value: string | null }[] = [];
  selectedCostCenters: string[] = [];
  EmployeeList: any[] = [];
  months = [];
  years = [];
  leavetypeddl: { name: string, value: string }[] = [];
  tableHeaders: string[] = [];
  showErroronProcess = false;
  isExporting = false;

  // ── Pagination & Search (same pattern as employee-list) ──────────────────
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  searchText: string = '';
  private hasSearched: boolean = false; // guard: only allow paging after first View click

  ExportTypelist = [
    { name: 'Leave Balance', value: 1 },
    { name: 'Leave Taken Detail', value: 2 },
    { name: 'Leave Month wise  Detail', value: 3 },
    { name: 'Leave Pending for approval', value: 4 }
  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio,
    private leaveTransactionService: LeaveTransactionService) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.ExportExcel = this.fb.group({
      empCode: [''],
      fk_monthId: [null],
      fk_yearId: [null],
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
      fk_leaveid: [null],
      fromdate: [null],
      todate: [null],
      fk_costcentreid: [[]],
      searchTerm: ['']
    });

    this.getCostCenterList();
  }


  // ── Contractor / Leave Type ──────────────────────────────────────────────

  onContractorChange() {
    // Reset leave type whenever contractor changes
    this.ExportExcel.patchValue({ fk_leaveid: null });
    this.leavetypeddl = [];

    const fk_costcentreid = this.selectedCostCenters.filter(v => v !== '__select_all__').join(',');
    if (fk_costcentreid) {
      this.LeaveTypeClientWise(fk_costcentreid);
    }
  }

  LeaveTypeClientWise(fk_costcentreid: string) {
    this.httpService.LeaveTypeClientWise(fk_costcentreid).subscribe(res => {
      this.leavetypeddl = res?.data || [];
    });
  }


  // ── Dropdown helpers ─────────────────────────────────────────────────────

  restfrom() {
    this.EmployeeList = [];
    this.totalItems = 0;
    this.pageIndex = 1;
    this.searchText = '';
    this.hasSearched = false;
    this.showEmployeeList = false;
    this.tableHeaders = [];
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...res.data.slice(1)
        ];
      }
    });
  }

  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.ExportExcel.patchValue(filters);
  }


  // ── Local filter (on current page) ───────────────────────────────────────

  filteredData() {
    if (!this.searchText) {
      return this.EmployeeList;
    }
    const q = this.searchText.toLowerCase();

    // Dynamically search across all properties of the row
    return this.EmployeeList.filter(res => {
      return Object.values(res).some(val =>
        val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
      );
    });
  }

  // Search box change handler — mirrors employee-list pattern
  onSearchTextChanged() {
    const localFilteredData = this.filteredData();
    if (!this.searchText) {
      // If search is cleared, fetch fresh records
      this.pageIndex = 1;
      this.ExportExcel.get('searchTerm')?.setValue('');
      this.loadData();
    } else if (localFilteredData.length === 0) {
      // If no matching records in current list, reset to page 1 and fetch from API
      this.pageIndex = 1;
      this.ExportExcel.get('searchTerm')?.setValue(this.searchText);
      this.loadData();
    }
  }


  // ── Pagination ───────────────────────────────────────────────────────────

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadData();
  }


  // ── View (validate + trigger first page load) ────────────────────────────

  OnVeiw() {
    this.submitted = true;

    if (this.ExportExcel.invalid) {
      this.showError = true;
      return;
    }

    this.ngxUILoaderService.start();

    if (this.ExportExcel.value.ExportType != 1) {
      if (this.ExportExcel.value.fromdate == null) {
        this.toastrService.error('Please select from date', '');
        this.ngxUILoaderService.stop();
        return;
      }

      if (this.ExportExcel.value.todate == null) {
        this.toastrService.error('Please select to date', '');
        this.ngxUILoaderService.stop();
        return;
      }
    }

    // Reset to first page on each new search
    this.pageIndex = 1;
    this.searchText = '';
    this.hasSearched = true;
    this.loadData();
  }


  // ── Core data loader (used by View, paging, and search) ──────────────────

  loadData() {
    this.ngxUILoaderService.start();

    const payload = { ...this.ExportExcel.value };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    // Pass searchTerm from the search box form control
    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;

    this.httpService.Export_Leavelist(payload, this.pageIndex - 1, this.pageSize, searchTerm).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data;
          this.totalItems = res.totalCount ?? res.data?.length ?? 0;
          this.tableHeaders = Object.keys(res.data[0] ?? {});
          this.showEmployeeList = true;
          this.toastrService.success(res.message);
        } else {
          this.tableHeaders = [];
          this.EmployeeList = [];
          this.totalItems = 0;
          this.toastrService.info(res.message);
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {
        this.toastrService.error('Failed to retrieve data', error);
        this.ngxUILoaderService.stop();
      }
    });
  }


  // ── Excel Download (all data — no pagination) ────────────────────────────

  downloadExcel() {
    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const payload = { ...this.ExportExcel.value };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    let selectedReport: { name: string, value: number } | undefined = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
    let { name: Report, value: Reportvalue } = { ...selectedReport! };
    let ReportName = Report + '.xlsx';

    // Find contractor name from CostCenter list
    // let contractorName = '';
    // if (payload.fk_costcentreid) {
    //   contractorName = this.getCostCenterDisplayText();
    // }
    // payload.contractorName = contractorName;
    payload.ReportName = Report;

    this.httpService.downloadViewLeaveReportlist(payload).subscribe({
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
      }
    });
  }

  toggleSelectAllCostCenters(event: any) {
    const isChecked = event.target.checked;
    const realValues = this.CostCenter
      .filter(c => c.value !== '__select_all__')
      .map(c => c.value);
    this.selectedCostCenters = isChecked ? (realValues as string[]) : [];
    this.ExportExcel.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
    this.onContractorChange();
  }

  toggleCostCenter(costCenter: string) {
    const index = this.selectedCostCenters.indexOf(costCenter);
    if (index === -1) {
      this.selectedCostCenters.push(costCenter);
    } else {
      this.selectedCostCenters.splice(index, 1);
    }
    this.ExportExcel.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
    this.onContractorChange();
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
    this.onContractorChange();
  }

}