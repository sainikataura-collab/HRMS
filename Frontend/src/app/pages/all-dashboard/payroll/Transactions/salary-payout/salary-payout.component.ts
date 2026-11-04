import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SalarySleepMessageService } from '../../services/salary-sleep-message.service';
import { EmployeeService } from '../../services/employee.service';
import { convertAmountToWordsIndian } from '../../../../../healpers/commonlib';

import { NgxPaginationModule } from 'ngx-pagination';

declare const html2pdf: any;

@Component({
  selector: 'app-salary-payout',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectComponent, CommonSearchComponent, NgxPaginationModule],
  templateUrl: './salary-payout.component.html',
  styleUrl: './salary-payout.component.scss'
})
export class SalaryPayoutComponent implements OnInit {

  exportingState: string | null = null;
  isPayingOut = false;

  hiddenColumns = ['CID', 'pk_empid', 'remark'];

  EmployeeForm!: FormGroup;
  isContractApplicable = false;
  CostCenter: any[] = [];
  submitted = false;
  showError = false;

  showEmployeeList = false;

  pageIndexPending = 1;
  pageSizePending = 10;
  totalItemsPending = 0;
  pageIndexPaidOut = 1;
  pageSizePaidOut = 10;
  totalItemsPaidOut = 0;


  // ── Raw lists from API ─────────────────────────────────────────────────
  pendingList: any[] = [];
  paidOutList: any[] = [];

  // ── Filtered views (search applied) ────────────────────────────────────
  filteredPendingList: any[] = [];
  filteredPaidOutList: any[] = [];

  // ── Dynamic column headers ──────────────────────────────────────────────
  pendingHeaders: string[] = [];
  paidOutHeaders: string[] = [];

  // ── Search ──────────────────────────────────────────────────────────────
  searchTextPending = '';
  searchTextPaidOut = '';

  // ── Checkbox selection (Pending) ──────────────────────────────────────────
  selectedEmpIds = new Set<string>();
  masterChecked = false;
  masterIndeterminate = false;

  // ── Batch / payout history ──────────────────────────────────────────────
  /** All payout batches for the selected month/year — for the dropdown */
  // batchList: any[] = [];

  batchList: any[] = [];
  /** Currently selected batch key in the dropdown (null = show all) */
  selectedBatchKey: string | null = null;

  /** BatchKey returned by the last payout — shown in the success toast area */
  lastBatchKey = '';

  months: any[] = [];
  years: any[] = [];
  bankList: any[] = [];

  // ── Payout Details ──────────────────────────────────────────────────────
  payoutBankId: string = '';
  payoutBankRefNo: string = '';
  payoutRemark: string = '';

  // ── Salary Slip ────────────────────────────────────────────────────────
  salarySlipData: any[] = []
  showPayslip: boolean = false;
  payColumns: { Fixed: string, Rate: string, Earnings: string, Arrears: string }[] = [];
  dedColumns: { Fixed: string, Amount: string }[] = [];
  LeaveList: any[] = [];
  combinedData: any[] = [];

  get requestBody() {
    return this.EmployeeForm.value;
  }

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private commanservice: ManualPunchBio,
    private httpservice: SalarySleepMessageService,
    private employeeService: EmployeeService,
    private Loader: NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') === 'true';

    this.EmployeeForm = this.fb.group({
      empCode: [''],
      fk_monthId: ['', [Validators.required]],
      fk_yearId: ['', [Validators.required]],
      fk_costcentreid: [null, this.isContractApplicable ? [Validators.required] : []],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      ExportType: [100],
      SalTransfer: ['A']
    });

    this.getMonthsList();
    this.getyearsList();
    this.getList();
    this.getBankList();

    this.getBatch();

  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────

  getMonthsList(): void {
    this.commanservice.getCommanList('month').subscribe({ next: r => this.months = r.data });
  }
  getyearsList(): void {
    this.commanservice.getCommanList('Year').subscribe({ next: r => this.years = r.data });
  }
  getList(): void {
    this.commanservice.getCommanList('CostCenter').subscribe({ next: r => this.CostCenter = r.data });
  }


  getBatch() {
    this.httpservice.getDropdownList('Batch').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.batchList = res.data;
        }
      }
    });
  }

  getBankList(): void {
    this.httpservice.getDropdownList('Bank').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.bankList = res.data;
        }
      }
    });
  }

  handleFilters(filters: any): void {
    this.EmployeeForm.patchValue(filters);
  }

  // ── Payload builder ───────────────────────────────────────────────────────

  private buildPayload(extras: any = {}): any {
    const payload = {
      ...this.EmployeeForm.value,
      ...extras,
      PendingPageIndex: this.pageIndexPending - 1,
      PendingPageSize: this.pageSizePending,
      PaidOutPageIndex: this.pageIndexPaidOut - 1,
      PaidOutPageSize: this.pageSizePaidOut,
      PendingSearchTerm: (this.searchTextPending || '').trim(),
      PaidOutSearchTerm: (this.searchTextPaidOut || '').trim()
    };
    Object.keys(payload).forEach(k => { if (payload[k] === null) payload[k] = ''; });
    return payload;
  }

  // ── View (fetch both lists) ───────────────────────────────────────────────

  searchClick(): void {
    this.pageIndexPending = 1;
    this.pageIndexPaidOut = 1;
    this.searchTextPending = '';
    this.searchTextPaidOut = '';
    this.OnVeiw();
  }

  OnVeiw(autoSelectBatchKey?: any, preserveSelection: boolean = false): void {
    this.submitted = true;
    if (this.EmployeeForm.invalid) { this.showError = true; return; }
    this.Loader.start();

    const batchToSelect = typeof autoSelectBatchKey === 'string' ? autoSelectBatchKey : null;

    // Reset batch filter when re-fetching
    this.selectedBatchKey = batchToSelect;
    const payload = this.buildPayload({ FilterBatchKey: batchToSelect });

    this.httpservice.get_SalaryPayout(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.showEmployeeList = true;
          if (!preserveSelection) {
            this.selectedEmpIds.clear();
          }

          this.pendingList = res.data.salaryPendingPayoutList || [];
          this.paidOutList = (res.data.salaryPaidOutList || []).map((x: any) => ({ ...x, remark: '' }));
          this.totalItemsPending = res.data.salaryPendingPayoutCount || 0;
          this.totalItemsPaidOut = res.data.salaryPaidOutCount || 0;

          const pendingHidden = [...this.hiddenColumns, 'SalPayoutBy', 'SalPayoutDate', 'PayoutBatchKey', 'IsSalaryPayout'];

          this.pendingHeaders = this.pendingList.length > 0
            ? Object.keys(this.pendingList[0]).filter(k => !pendingHidden.map(h => h.toLowerCase()).includes(k.toLowerCase())) : [];

          this.paidOutHeaders = this.paidOutList.length > 0
            ? Object.keys(this.paidOutList[0]).filter(k => !this.hiddenColumns.includes(k)) : [];

          this.applyFilter('pending');
          this.applyFilter('paidout');
          this.updateMasterCheck();
          this.Loader.stop();

        } else {
          this.toastrService.info(res.message);
          this.pendingList = []; this.paidOutList = []; //this.batchList = [];
          this.filteredPendingList = []; this.filteredPaidOutList = [];
          this.pendingHeaders = []; this.paidOutHeaders = [];
          this.showEmployeeList = false;
          this.Loader.stop();
        }
      },
      error: err => this.toastrService.error('Failed to retrieve data', err)
    });
  }

  // ── Batch filter dropdown ─────────────────────────────────────────────────

  /**
   * Called when user picks a batch from the dropdown.
   * Sends FilterBatchKey to backend — SP filters paid-out table by that batch.
   */
  onBatchFilterChange(): void {
    if (this.EmployeeForm.invalid) return;

    const payload = this.buildPayload({ FilterBatchKey: this.selectedBatchKey || null });

    this.httpservice.get_SalaryPayout(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.paidOutList = (res.data.salaryPaidOutList || []).map((x: any) => ({ ...x, remark: '' }));
          this.paidOutHeaders = this.paidOutList.length > 0
            ? Object.keys(this.paidOutList[0]).filter(k => !this.hiddenColumns.includes(k)) : [];
          this.searchTextPaidOut = '';
          this.pageIndexPaidOut = 1;
          this.applyFilter('paidout');
          this.Loader.stop();
        } else {
          this.paidOutList = [];
          this.filteredPaidOutList = [];
          this.Loader.stop();
        }
      }
    });
  }

  // ── Search filter ─────────────────────────────────────────────────────────

  onPendingPageChange(event: number): void {
    this.pageIndexPending = event;
    this.OnVeiw(null, true);
  }

  onPaidOutPageChange(event: number): void {
    this.pageIndexPaidOut = event;
    this.OnVeiw(null, true);
  }

  onSearchTextChanged(type: 'pending' | 'paidout'): void {
    if (type === 'pending') {
      const local = this.filterList(this.pendingList, this.searchTextPending);
      this.filteredPendingList = local;
      if (local.length === 0 && this.searchTextPending.trim()) {
        this.pageIndexPending = 1;
        this.OnVeiw(null, true);
      } else if (!this.searchTextPending.trim()) {
        this.pageIndexPending = 1;
        this.OnVeiw(null, true);
      }
    } else {
      const local = this.filterList(this.paidOutList, this.searchTextPaidOut);
      this.filteredPaidOutList = local;
      if (local.length === 0 && this.searchTextPaidOut.trim()) {
        this.pageIndexPaidOut = 1;
        this.OnVeiw(null, true);
      } else if (!this.searchTextPaidOut.trim()) {
        this.pageIndexPaidOut = 1;
        this.OnVeiw(null, true);
      }
    }
  }

  applyFilter(type: 'pending' | 'paidout'): void {
    if (type === 'pending') {
      this.filteredPendingList = this.filterList(this.pendingList, this.searchTextPending);
    } else {
      this.filteredPaidOutList = this.filterList(this.paidOutList, this.searchTextPaidOut);
    }
  }




  private filterList(list: any[], search: string): any[] {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(row => Object.values(row).some(v => v?.toString().toLowerCase().includes(s)));
  }

  // ── Checkbox logic ────────────────────────────────────────────────────────

  isChecked(item: any): boolean {
    return this.selectedEmpIds.has(item['pk_empid']);
  }

  toggleRow(item: any): void {
    const id = item['pk_empid'];
    this.selectedEmpIds.has(id) ? this.selectedEmpIds.delete(id) : this.selectedEmpIds.add(id);
    this.updateMasterCheck();
  }

  toggleMaster(): void {
    if (this.masterChecked) {
      this.filteredPendingList.forEach(i => this.selectedEmpIds.delete(i['pk_empid']));
    } else {
      this.filteredPendingList.forEach(i => this.selectedEmpIds.add(i['pk_empid']));
    }
    this.updateMasterCheck();
  }

  private updateMasterCheck(): void {
    const total = this.filteredPendingList.length;
    const selected = this.filteredPendingList.filter(i => this.selectedEmpIds.has(i['pk_empid'])).length;
    this.masterChecked = total > 0 && selected === total;
    this.masterIndeterminate = selected > 0 && selected < total;
  }

  get selectedCount(): number { return this.selectedEmpIds.size; }

  // ── Payout & Un-Payout ────────────────────────────────────────────────────

  processPayout(): void {
    this.Loader.start();
    this.submitted = true;
    if (this.EmployeeForm.invalid) { this.showError = true; this.Loader.stop(); return; }

    if (!this.payoutBankId) {
      this.toastrService.warning('Please select a Bank before processing payout.');
      this.Loader.stop(); return;
    }
    if (!this.payoutBankRefNo || this.payoutBankRefNo.trim() === '') {
      this.toastrService.warning('Please enter Bank Reference Number before processing payout.');
      this.Loader.stop(); return;
    }

    if (!this.payoutRemark || this.payoutRemark.trim() === '') {
      this.toastrService.warning('Please enter Payout Remark before processing payout.');
      this.Loader.stop(); return;
    }

    if (this.selectedEmpIds.size === 0 && !this.masterChecked) {
      this.toastrService.warning('Please select at least one employee for payout.');
      this.Loader.stop(); return;
    }

    const payload = {
      ...this.buildPayload(),
      selectedEmpIds: Array.from(this.selectedEmpIds),
      IsSelectAll: this.masterChecked,
      BankId: this.payoutBankId,
      BankRefNo: this.payoutBankRefNo,
      PayoutRemark: this.payoutRemark
    };

    this.isPayingOut = true;

    this.httpservice.processSalaryPayout(payload).subscribe({
      next: (res) => {
        this.isPayingOut = false;
        if (res.isSuccess) {
          this.lastBatchKey = res.data?.batchKey ?? '';
          this.toastrService.success(
            `${res.data?.affectedRows} employee(s) paid out. Batch: ${this.lastBatchKey}`,
            'Payout Successful', { timeOut: 6000 }
          );
          this.getBatch(); // Refresh dropdown list to include the new batch
          const newBatchId = res.data?.batchId ? res.data.batchId.toString() : this.lastBatchKey;
          this.Loader.stop();
          this.OnVeiw(newBatchId);  // full refresh — moves selected rows from pending → paid-out and selects new batch
        } else {
          this.toastrService.info(res.message);
          this.Loader.stop();
        }
      },
      error: err => {
        this.isPayingOut = false;
        this.toastrService.error('Payout failed. Please try again.', err);
        this.Loader.stop();
      }
    });
  }

  processSingleUnPayout(item: any): void {
    if (!item.remark || !item.remark.trim()) {
      item.showRemarkError = true;
      return;
    }

    this.Loader.start();
    item.isUnPayingOut = true;

    const payload = {
      fk_monthId: this.EmployeeForm.get('fk_monthId')?.value,
      fk_yearId: this.EmployeeForm.get('fk_yearId')?.value,
      Employees: [{
        pk_empid: item['pk_empid'],
        remark: item.remark.trim()
      }]
    };

    this.httpservice.processSalaryUnPayout(payload).subscribe({
      next: (res) => {
        item.isUnPayingOut = false;
        if (res.isSuccess) {
          this.toastrService.success(
            `${item.empname} un-paid out successfully.`,
            'Un-Payout Successful', { timeOut: 6000 }
          );
          this.Loader.stop();
          this.OnVeiw(this.selectedBatchKey);  // refresh list
        } else {
          this.toastrService.info(res.message);
          this.Loader.stop();
        }
      },
      error: err => {
        item.isUnPayingOut = false;
        this.toastrService.error('Un-Payout failed. Please try again.', err);
        this.Loader.stop();
      }
    });
  }

  // ── Excel export ──────────────────────────────────────────────────────────

  downloadExcel(type: 'all' | 'payout'): void {
    this.Loader.start();
    if (this.exportingState !== null) { this.Loader.stop(); return; }
    this.exportingState = type + '-excel';

    const selectedMonthId = this.EmployeeForm.get('fk_monthId')?.value;
    const monthName = this.months.find((m: any) => m.value === selectedMonthId)?.name ?? 'Month';
    const selectedYearId = this.EmployeeForm.get('fk_yearId')?.value;
    const yearName = this.years.find((y: any) => y.value === selectedYearId)?.name ?? 'Year';

    let batchSuffix = '';
    let filterKey = '';

    if (type === 'all') {
      filterKey = 'ALL';
      batchSuffix = '_AllRecords';
    } else {
      filterKey = this.selectedBatchKey || 'PAYOUT_ONLY';
      batchSuffix = this.selectedBatchKey ? `_${this.selectedBatchKey}` : '_PayoutOnly';
    }

    const reportName = `SalaryPayout_${monthName}_${yearName}${batchSuffix}.xlsx`;

    let contractorName = '';
    const ccId = this.EmployeeForm.get('fk_costcentreid')?.value;
    if (ccId) contractorName = this.CostCenter.find((c: any) => c.value === ccId)?.name ?? '';

    const payload = {
      ...this.buildPayload({ reportType: filterKey }),
      pageIndex: 0, pageSize: 99999,
      contractorName
    };

    this.httpservice.downloadSalaryPayoutReport(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = reportName;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
        this.exportingState = null;
        this.Loader.stop();
      },
      error: () => { this.exportingState = null; this.Loader.stop(); }
    });
  }

  downloadPdf(type: 'all' | 'payout'): void {
    this.Loader.start();
    if (this.exportingState !== null) { this.Loader.stop(); return; }
    this.exportingState = type + '-pdf';

    const selectedMonthId = this.EmployeeForm.get('fk_monthId')?.value;
    const monthName = this.months.find((m: any) => m.value === selectedMonthId)?.name ?? 'Month';
    const selectedYearId = this.EmployeeForm.get('fk_yearId')?.value;
    const yearName = this.years.find((y: any) => y.value === selectedYearId)?.name ?? 'Year';

    let batchSuffix = '';
    let filterKey = '';

    if (type === 'all') {
      filterKey = 'ALL';
      batchSuffix = '_AllRecords';
    } else {
      filterKey = this.selectedBatchKey || 'PAYOUT_ONLY';
      batchSuffix = this.selectedBatchKey ? `_${this.selectedBatchKey}` : '_PayoutOnly';
    }

    const reportName = `SalaryPayout_${monthName}_${yearName}${batchSuffix}.pdf`;

    let contractorName = '';
    const ccId = this.EmployeeForm.get('fk_costcentreid')?.value;
    if (ccId) contractorName = this.CostCenter.find((c: any) => c.value === ccId)?.name ?? '';

    const payload = {
      ...this.buildPayload({ reportType: filterKey }),
      pageIndex: 0, pageSize: 99999,
      contractorName
    };

    this.httpservice.downloadSalaryPayoutPdf(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = reportName;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
        this.exportingState = null;
        this.Loader.stop();
      },
      error: () => {
        this.toastrService.error('Failed to download PDF.');
        this.exportingState = null;
        this.Loader.stop();
      }
    });
  }

  // ── Salary Slip Display / Download ──────────────────────────────────────────

  viewData(requestBody: any, EmpCode: string): void {
    requestBody.empCode = EmpCode;
    this.employeeService.Download_SalarySlip(requestBody).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.salarySlipData = res.data;
          this.LeaveList = res.data[4] != null ? res.data[4]["LeaveList"] : [];

          this.salarySlipData[0].website = convertAmountToWordsIndian(this.salarySlipData[3]?.NetPay);
          this.payColumns = [];
          this.dedColumns = [];

          // For Earning
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Pay" + i] != null && res.data[1]["Pay" + i] != "" && res.data[3]["PayAmt" + i] > 0) {
              if (res.data[3]["PayAmt" + i] != 0) {
                let objPay = { Fixed: res.data[1]["Pay" + i], Rate: res.data[3]["Pay" + i], Earnings: res.data[3]["PayAmt" + i], Arrears: res.data[3]["PayAmt" + i + "_A"] };
                this.payColumns.push(objPay);
              }
            }
          }

          for (let i = 1; i <= 10; i++) {
            if (res.data[1]["PayR" + i] != null && res.data[1]["PayR" + i] != "") {
              if (res.data[3]["PayRAmt" + i] != 0) {
                var objR = { Fixed: res.data[1]["PayR" + i], Rate: res.data[3]["PayR" + i], Earnings: res.data[3]["PayRAmt" + i], Arrears: res.data[3]["PayRAmt" + i + "_A"] };
                this.payColumns.push(objR);
              }
            }
          }
          // For Deduction
          if (res.data[3]["PF"] != null && res.data[3]["PF"] != 0) {
            var objPF = { Fixed: "PF", Amount: res.data[3]["PF"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["VolPF"] != null && res.data[3]["VolPF"] != 0) {
            var objVolPF = { Fixed: "VolPF", Amount: res.data[3]["VolPF"] };
            this.dedColumns.push(objVolPF);
          }
          if (res.data[3]["ESI"] != null && res.data[3]["ESI"] != 0) {
            var objESI = { Fixed: "ESI", Amount: res.data[3]["ESI"] };
            this.dedColumns.push(objESI);
          }
          if (res.data[3]["ProfTax"] != null && res.data[3]["ProfTax"] != 0) {
            var objPT = { Fixed: "ProfTax", Amount: res.data[3]["ProfTax"] };
            this.dedColumns.push(objPT);
          }
          if (res.data[3]["IT"] != null && res.data[3]["IT"] != 0) {
            var objIT = { Fixed: "IT", Amount: res.data[3]["IT"] };
            this.dedColumns.push(objIT);
          }
          if (res.data[3]["LWF"] != null && res.data[3]["LWF"] != 0) {
            var objLWF = { Fixed: "LWF", Amount: res.data[3]["LWF"] };
            this.dedColumns.push(objLWF);
          }

          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["PayD" + i] != null && res.data[1]["PayD" + i] != "") {
              if (res.data[3]["PayDAmt" + i] != 0) {
                var objDed = { Fixed: res.data[1]["PayD" + i], Amount: res.data[3]["PayDAmt" + i] };
                this.dedColumns.push(objDed);
              }
            }
          }
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Loan" + i] != null && res.data[1]["Loan" + i] != "") {
              if (res.data[3]["LoanAmt" + i] != 0) {
                var objLoan = { Fixed: res.data[1]["Loan" + i], Amount: res.data[3]["LoanAmt" + i] };
                this.dedColumns.push(objLoan);
              }
            }
          }

          const maxLength = Math.max(this.payColumns.length, this.dedColumns.length);
          this.combinedData = Array(maxLength).fill({}).map((_, i) => ({
            pay: this.payColumns[i] || { Fixed: '', Rate: '', Earnings: '', Arrears: '' },
            ded: this.dedColumns[i] || { Fixed: '', Amount: '' }
          }));

        } else {
          this.salarySlipData = [];
        }
      },
      error: (err) => {
        console.error('Error downloading salary slip:', err);
      }
    });
  }

  downloadAndDisplaySalarySlip(requestBody: any, EmpCode: string): void {
    requestBody.empCode = EmpCode;
    this.employeeService.Download_SalarySlip(requestBody).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.salarySlipData = res.data;
          this.LeaveList = res.data[4] != null ? res.data[4]["LeaveList"] : [];
          this.salarySlipData[0].website = convertAmountToWordsIndian(this.salarySlipData[3]?.NetPay);

          this.payColumns = [];
          this.dedColumns = [];
          // For Earning
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Pay" + i] != null && res.data[1]["Pay" + i] != "" && res.data[3]["PayAmt" + i] > 0) {
              if (res.data[3]["PayAmt" + i] != 0) {
                var obj = { Fixed: res.data[1]["Pay" + i], Rate: res.data[3]["Pay" + i], Earnings: res.data[3]["PayAmt" + i], Arrears: res.data[3]["PayAmt" + i + "_A"] };
                this.payColumns.push(obj);
              }
            }
          }

          for (let i = 1; i <= 10; i++) {
            if (res.data[1]["PayR" + i] != null && res.data[1]["PayR" + i] != "") {
              if (res.data[3]["PayRAmt" + i] != 0) {
                var objR = { Fixed: res.data[1]["PayR" + i], Rate: res.data[3]["PayR" + i], Earnings: res.data[3]["PayRAmt" + i], Arrears: res.data[3]["PayRAmt" + i + "_A"] };
                this.payColumns.push(objR);
              }
            }
          }

          // For Deduction
          if (res.data[3]["PF"] != null && res.data[3]["PF"] != 0) {
            var objPF = { Fixed: "PF", Amount: res.data[3]["PF"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["VolPF"] != null && res.data[3]["VolPF"] != 0) {
            var objVolPF = { Fixed: "VolPF", Amount: res.data[3]["VolPF"] };
            this.dedColumns.push(objVolPF);
          }
          if (res.data[3]["ESI"] != null && res.data[3]["ESI"] != 0) {
            var objESI = { Fixed: "ESI", Amount: res.data[3]["ESI"] };
            this.dedColumns.push(objESI);
          }
          if (res.data[3]["ProfTax"] != null && res.data[3]["ProfTax"] != 0) {
            var objPT = { Fixed: "ProfTax", Amount: res.data[3]["ProfTax"] };
            this.dedColumns.push(objPT);
          }
          if (res.data[3]["IT"] != null && res.data[3]["IT"] != 0) {
            var objIT = { Fixed: "IT", Amount: res.data[3]["IT"] };
            this.dedColumns.push(objIT);
          }
          if (res.data[3]["LWF"] != null && res.data[3]["LWF"] != 0) {
            var objLWF = { Fixed: "LWF", Amount: res.data[3]["LWF"] };
            this.dedColumns.push(objLWF);
          }

          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["PayD" + i] != null && res.data[1]["PayD" + i] != "") {
              if (res.data[3]["PayDAmt" + i] != 0) {
                var objDed = { Fixed: res.data[1]["PayD" + i], Amount: res.data[3]["PayDAmt" + i] };
                this.dedColumns.push(objDed);
              }
            }
          }
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Loan" + i] != null && res.data[1]["Loan" + i] != "") {
              if (res.data[3]["LoanAmt" + i] != 0) {
                var objLoan = { Fixed: res.data[1]["Loan" + i], Amount: res.data[3]["LoanAmt" + i] };
                this.dedColumns.push(objLoan);
              }
            }
          }
          const maxLength = Math.max(this.payColumns.length, this.dedColumns.length);
          this.combinedData = Array(maxLength).fill({}).map((_, i) => ({
            pay: this.payColumns[i] || { Fixed: '', Rate: '', Earnings: '', Arrears: '' },
            ded: this.dedColumns[i] || { Fixed: '', Amount: '' }
          }));

          setTimeout(() => this.downloadPDF(), 500);
        }
        else {
          this.salarySlipData = []
          this.toastrService.info(res.message)
        }
      },
      error: (err) => {
        console.error('Error downloading salary slip:', err);
      }
    });
  }

  downloadPDF(): void {
    this.showPayslip = true
    const element = document.getElementById('pdf-content') as HTMLElement;

    // Ensure the page scrolls to the top before rendering
    window.scrollTo(0, 0);

    const opt = {
      margin: [0, 0, 0, 0], // top, left, bottom, right
      filename: 'Payslip.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0 // Prevent scroll-based displacement
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { avoid: 'tr' } // Optional: prevents breaks inside rows
    };

    if (element) {
      html2pdf().from(element).set(opt).save();
    } else {
      console.error("Element not found for PDF generation");
    }
  }

}