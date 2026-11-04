import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { VendorService } from '../Service/vendor.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-update-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './update-audit-log.component.html',
  styleUrls: ['./update-audit-log.component.scss']
})
export class UpdateAuditLogComponent implements OnInit {
  // Dropdown list for Document Codes
  documentCodeList: { code: string }[] = [];

  // Dropdown list for Document Names
  documentNameList: { name: string }[] = [];

  // Date Range Presets with live formatted dates
  dateRangePreset: string = '';
  dateRangeOptions: { value: string; label: string }[] = [];

  // Filter form model
  filter = {
    documentName: '',
    documentCode: '',
    fromDate: '',
    toDate: ''
  };

  // Audit log results
  auditLogs: any[] = [];
  filteredLogs: any[] = [];
  isLoading: boolean = false;

  // Search in table
  tableSearch: string = '';

  // Standard Pagination matching other pages
  pageIndex: number = 1;
  pageSize: number = 10;

  constructor(
    private vendorService: VendorService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildDateRangeOptions();
    this.loadDocumentNames();
    this.onSearch(); // Load initial logs and populate document codes
  }

  // Format date for display: DD-MMM-YYYY
  formatDateDisplay(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Build date range option labels including formatted dates
  buildDateRangeOptions(): void {
    const now = new Date();
    const todayStr = this.formatDateDisplay(now);

    const yest = new Date();
    yest.setDate(now.getDate() - 1);
    const yestStr = this.formatDateDisplay(yest);

    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    const thisWeekStr = `${this.formatDateDisplay(startOfWeek)} to ${todayStr}`;

    const past7 = new Date();
    past7.setDate(now.getDate() - 6);
    const last7Str = `${this.formatDateDisplay(past7)} to ${todayStr}`;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthStr = `${this.formatDateDisplay(startOfMonth)} to ${todayStr}`;

    const past30 = new Date();
    past30.setDate(now.getDate() - 29);
    const last30Str = `${this.formatDateDisplay(past30)} to ${todayStr}`;

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthStr = `${this.formatDateDisplay(startOfLastMonth)} to ${this.formatDateDisplay(endOfLastMonth)}`;

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const thisYearStr = `${this.formatDateDisplay(startOfYear)} to ${todayStr}`;

    this.dateRangeOptions = [
      { value: '', label: 'All Dates' },
      { value: 'today', label: `Today (${todayStr})` },
      { value: 'yesterday', label: `Yesterday (${yestStr})` },
      { value: 'this_week', label: `This Week (${thisWeekStr})` },
      { value: 'last_7_days', label: `Last 7 Days (${last7Str})` },
      { value: 'this_month', label: `This Month (${thisMonthStr})` },
      { value: 'last_30_days', label: `Last 30 Days (${last30Str})` },
      { value: 'last_month', label: `Last Month (${lastMonthStr})` },
      { value: 'this_year', label: `This Year (${thisYearStr})` },
      { value: 'custom', label: 'Custom Range' }
    ];
  }

  // Fetch document names for dropdown
  loadDocumentNames(): void {
    this.vendorService.getAuditLogDocumentNames().subscribe({
      next: (res: any) => {
        const list = (res && res.isSuccess && res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.documentNameList = list.map((item: any) => {
          if (typeof item === 'string') {
            return { name: item };
          }
          return { name: item.name || item.documentName || item.DocumentName || String(item) };
        });
      },
      error: (err) => {
        console.error('Error fetching document names:', err);
      }
    });
  }

  // Helper date format for payload: YYYY-MM-DD
  formatDateYMD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // When date range preset changes
  onDateRangeChange(): void {
    const now = new Date();
    switch (this.dateRangePreset) {
      case 'today': {
        const str = this.formatDateYMD(now);
        this.filter.fromDate = str;
        this.filter.toDate = str;
        break;
      }
      case 'yesterday': {
        const yest = new Date();
        yest.setDate(now.getDate() - 1);
        const str = this.formatDateYMD(yest);
        this.filter.fromDate = str;
        this.filter.toDate = str;
        break;
      }
      case 'this_week': {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
        this.filter.fromDate = this.formatDateYMD(startOfWeek);
        this.filter.toDate = this.formatDateYMD(new Date());
        break;
      }
      case 'last_7_days': {
        const past7 = new Date();
        past7.setDate(now.getDate() - 6);
        this.filter.fromDate = this.formatDateYMD(past7);
        this.filter.toDate = this.formatDateYMD(new Date());
        break;
      }
      case 'this_month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.filter.fromDate = this.formatDateYMD(startOfMonth);
        this.filter.toDate = this.formatDateYMD(new Date());
        break;
      }
      case 'last_30_days': {
        const past30 = new Date();
        past30.setDate(now.getDate() - 29);
        this.filter.fromDate = this.formatDateYMD(past30);
        this.filter.toDate = this.formatDateYMD(new Date());
        break;
      }
      case 'last_month': {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        this.filter.fromDate = this.formatDateYMD(startOfLastMonth);
        this.filter.toDate = this.formatDateYMD(endOfLastMonth);
        break;
      }
      case 'this_year': {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        this.filter.fromDate = this.formatDateYMD(startOfYear);
        this.filter.toDate = this.formatDateYMD(new Date());
        break;
      }
      case 'custom': {
        break;
      }
      default: {
        this.filter.fromDate = '';
        this.filter.toDate = '';
        break;
      }
    }
  }

  // Search button click
  onSearch(): void {
    this.isLoading = true;
    const payload = {
      DocumentName: this.filter.documentName ? this.filter.documentName : null,
      DocumentCode: this.filter.documentCode ? this.filter.documentCode.trim() : null,
      FromDate: this.filter.fromDate ? this.filter.fromDate : null,
      ToDate: this.filter.toDate ? this.filter.toDate : null
    };

    this.vendorService.getAuditLogs(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.isSuccess && res.data) {
          this.auditLogs = res.data;
        } else if (Array.isArray(res)) {
          this.auditLogs = res;
        } else {
          this.auditLogs = [];
        }
        this.extractDocumentCodes();
        this.applyTableFilter();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching audit logs:', err);
        this.toastr.error('Failed to fetch audit logs', 'Error');
      }
    });
  }

  // Populate distinct document codes from logs for dropdown
  extractDocumentCodes(): void {
    if (this.auditLogs && this.auditLogs.length > 0) {
      const distinctCodes = Array.from(
        new Set(
          this.auditLogs
            .map(item => item.documentCode || item.DocumentCode)
            .filter(code => !!code && String(code).trim() !== '')
        )
      );
      if (this.documentCodeList.length === 0 || distinctCodes.length > this.documentCodeList.length) {
        this.documentCodeList = distinctCodes.map(code => ({ code }));
      }
    }
  }

  // Reset filters
  onReset(): void {
    this.dateRangePreset = '';
    this.filter = {
      documentName: '',
      documentCode: '',
      fromDate: '',
      toDate: ''
    };
    this.tableSearch = '';
    this.onSearch();
  }

  // Client-side quick filter in table
  applyTableFilter(): void {
    if (!this.tableSearch.trim()) {
      this.filteredLogs = [...this.auditLogs];
    } else {
      const q = this.tableSearch.toLowerCase().trim();
      this.filteredLogs = this.auditLogs.filter(item =>
        (item.documentName && item.documentName.toLowerCase().includes(q)) ||
        (item.documentCode && item.documentCode.toLowerCase().includes(q)) ||
        (item.fieldName && item.fieldName.toLowerCase().includes(q)) ||
        (item.previousValue && item.previousValue.toLowerCase().includes(q)) ||
        (item.currentValue && item.currentValue.toLowerCase().includes(q)) ||
        (item.entryByName && item.entryByName.toLowerCase().includes(q)) ||
        (item.entryBy && item.entryBy.toLowerCase().includes(q))
      );
    }
    this.pageIndex = 1;
  }

  // Page change event for ngx-pagination
  onPageChange(event: any): void {
    this.pageIndex = event;
  }

  // Export to Excel
  exportToExcel(): void {
    if (!this.filteredLogs || this.filteredLogs.length === 0) {
      this.toastr.warning('No data available to export', 'Warning');
      return;
    }

    const exportData = this.filteredLogs.map((item, index) => ({
      'S.No.': index + 1,
      'Document Name': item.documentName || '',
      'Document Code': item.documentCode || '',
      'Field Name': item.fieldName || '',
      'Previous Value': item.previousValue || '',
      'Current Value': item.currentValue || '',
      'Updated By': item.entryByName || item.entryBy || '',
      'Updated Date': item.entryDate ? new Date(item.entryDate).toLocaleString() : ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Audit Logs': worksheet }, SheetNames: ['Audit Logs'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, `Update_Audit_Log_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.toastr.success('Excel exported successfully', 'Success');
  }
}
