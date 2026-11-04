import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { VendorEmpDocService } from '../Service/vendor-emp-doc.service';

declare var bootstrap: any;

@Component({
  selector: 'app-vendor-emp-doc-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './vendor-emp-doc-list.component.html',
  styleUrl: './vendor-emp-doc-list.component.scss'
})
export class VendorEmpDocListComponent implements OnInit {
  vendorDocService = inject(VendorEmpDocService);
  encryptionService = inject(EncryptionService);
  toastr = inject(ToastrService);
  router = inject(Router);

  employeeDocList: any[] = [];
  allEmployeeList: any[] = [];
  totalCount = 0;
  searchTerm = '';
  pageIndex = 1;
  pageSize = 10;
  isLoading = false;
  isExporting = false;
  vendorId = '';

  // Stat Card & Filter State
  activeStatFilter: string = ''; // '' | 'Uploaded' | 'NotUploaded' | 'Approved' | 'Pending' | 'Rejected'
  stats = {
    totalEmployees: 0,
    uploadedCount: 0,
    notUploadedCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  };

  // Modal State
  notUploadedModal: any;
  modalSearchTerm: string = '';

  // Document types metadata
  totalRequiredDocTypes: number = 0;

  get notUploadedEmployees(): any[] {
    return this.allEmployeeList.filter(row => this.isNotUploaded(row));
  }

  get filteredNotUploadedEmployees(): any[] {
    const term = this.modalSearchTerm.trim().toLowerCase();
    if (!term) return this.notUploadedEmployees;
    return this.notUploadedEmployees.filter(emp => {
      const code = (emp.empcode || emp.empCode || '').toLowerCase();
      const name = (emp.empname || emp.empName || '').toLowerCase();
      const loc = (emp.locationName || emp.LocationName || '').toLowerCase();
      return code.includes(term) || name.includes(term) || loc.includes(term);
    });
  }

  ngOnInit(): void {
    this.loadDocumentTypes();
    this.loadStatsAndList();
  }

  loadDocumentTypes(): void {
    this.vendorDocService.getDocumentTypes().subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data && Array.isArray(res.data)) {
          this.totalRequiredDocTypes = res.data.length;
          this.computeStats();
          this.applyFilterAndPagination();
        }
      }
    });
  }

  loadStatsAndList(): void {
    this.isLoading = true;
    // Load full list once (or large page) to compute stats
    this.vendorDocService.getVendorEmpDocList('', 0, 10000, this.vendorId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.allEmployeeList = res.data.list || [];
          if (res.data.vendorId) {
            this.vendorId = res.data.vendorId;
          }
          this.computeStats();
          this.applyFilterAndPagination();
        } else {
          this.allEmployeeList = [];
          this.employeeDocList = [];
          this.totalCount = 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.allEmployeeList = [];
        this.employeeDocList = [];
        this.totalCount = 0;
        this.toastr.error('Failed to load vendor employee documents.', 'Error');
      }
    });
  }

  computeStats(): void {
    let total = this.allEmployeeList.length;
    let uploaded = 0;
    let notUploaded = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const row of this.allEmployeeList) {
      const status = this.getRowStatus(row);
      const isFull = this.isFullyUploaded(row);

      if (isFull) {
        uploaded++;
      } else {
        notUploaded++;
      }

      if (status === 'Completed' || status === 'Approved') {
        approved++;
      } else if (status === 'Rejected') {
        rejected++;
      } else {
        pending++;
      }
    }

    this.stats = {
      totalEmployees: total,
      uploadedCount: uploaded,
      notUploadedCount: notUploaded,
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected
    };
  }

  getCompliancePercentage(): number {
    if (!this.stats.totalEmployees || this.stats.totalEmployees === 0) return 0;
    return Math.round((this.stats.uploadedCount / this.stats.totalEmployees) * 100);
  }

  isFullyUploaded(row: any): boolean {
    const prog = (row.docProgress || row.DocProgress || '').toString();
    if (prog.includes('/')) {
      const parts = prog.split('/');
      const uploaded = parseInt(parts[0], 10) || 0;
      const total = parseInt(parts[1], 10) || 0;
      if (total > 0) {
        return uploaded >= total;
      }
    }

    const totalUploaded = row.totalDocs || row.TotalDocs || 0;
    if (this.totalRequiredDocTypes > 0) {
      return totalUploaded >= this.totalRequiredDocTypes;
    }

    return false;
  }

  isNotUploaded(row: any): boolean {
    return !this.isFullyUploaded(row);
  }

  setStatFilter(filter: string): void {
    if (this.activeStatFilter === filter) {
      this.activeStatFilter = '';
    } else {
      this.activeStatFilter = filter;
    }
    this.pageIndex = 1;
    this.applyFilterAndPagination();
  }

  applyFilterAndPagination(): void {
    let filtered = [...this.allEmployeeList];

    // Search text filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(row => {
        const code = (row.empcode || row.empCode || '').toLowerCase();
        const name = (row.empname || row.empName || '').toLowerCase();
        const loc = (row.locationName || row.LocationName || '').toLowerCase();
        return code.includes(term) || name.includes(term) || loc.includes(term);
      });
    }

    // Active Card Filter
    if (this.activeStatFilter === 'Uploaded') {
      filtered = filtered.filter(row => this.isFullyUploaded(row));
    } else if (this.activeStatFilter === 'NotUploaded') {
      filtered = filtered.filter(row => this.isNotUploaded(row));
    } else if (this.activeStatFilter === 'Approved') {
      filtered = filtered.filter(row => this.getRowStatus(row) === 'Completed' || this.getRowStatus(row) === 'Approved');
    } else if (this.activeStatFilter === 'Pending') {
      filtered = filtered.filter(row => this.getRowStatus(row) === 'Pending');
    } else if (this.activeStatFilter === 'Rejected') {
      filtered = filtered.filter(row => this.getRowStatus(row) === 'Rejected');
    }

    this.totalCount = filtered.length;
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    this.employeeDocList = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.applyFilterAndPagination();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.applyFilterAndPagination();
  }

  openNotUploadedModal(): void {
    this.modalSearchTerm = '';
    const modalEl = document.getElementById('notUploadedModal');
    if (modalEl) {
      this.notUploadedModal = new bootstrap.Modal(modalEl);
      this.notUploadedModal.show();
    }
  }

  openUploadFromModal(emp: any): void {
    if (this.notUploadedModal) {
      this.notUploadedModal.hide();
    }
    const empId = emp.pk_empid || emp.fk_empId || emp.empId;
    this.openUploadForm(empId);
  }

  openUploadForm(empId?: string): void {
    if (empId) {
      const encryptedId = this.encryptionService.encryptText(empId.toString());
      this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_emp_doc_form', encryptedId]);
    } else {
      this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_emp_doc_form']);
    }
  }

  getUploadedCount(row: any): number {
    const prog = (row.docProgress || row.DocProgress || '').toString();
    if (prog.includes('/')) {
      const parts = prog.split('/');
      return parseInt(parts[0], 10) || 0;
    }
    return row.totalDocs || row.TotalDocs || 0;
  }

  getTotalRequiredCount(row: any): number {
    const prog = (row.docProgress || row.DocProgress || '').toString();
    if (prog.includes('/')) {
      const parts = prog.split('/');
      const total = parseInt(parts[1], 10) || 0;
      if (total > 0) return total;
    }
    return this.totalRequiredDocTypes || 3;
  }

  getRemainingDocsCount(row: any): number {
    const total = this.getTotalRequiredCount(row);
    const uploaded = this.getUploadedCount(row);
    return Math.max(0, total - uploaded);
  }

  getProgressPercent(row: any): number {
    const uploaded = this.getUploadedCount(row);
    const total = this.getTotalRequiredCount(row);
    if (total > 0) {
      return Math.min(100, Math.round((uploaded / total) * 100));
    }
    return 0;
  }

  getRowStatus(row: any): string {
    const status = (row.status || row.Status || '').trim();
    const total = row.totalDocs || row.TotalDocs || 0;
    const approved = row.approvedDocs || row.ApprovedDocs || 0;
    const rejected = row.rejectedDocs || row.RejectedDocs || 0;

    if (status.toLowerCase() === 'approved' || (total > 0 && approved === total)) {
      return 'Completed';
    }
    if (status.toLowerCase() === 'rejected' || rejected > 0) {
      return 'Rejected';
    }
    return 'Pending';
  }

  // ── EXPORT TO 2-TAB EXCEL (UPLOADED & PENDING UPLOAD) ─────────────────────────
  exportToExcel(): void {
    if (this.isExporting) return;
    this.isExporting = true;

    const vId = this.vendorId || '';
    const term = this.searchTerm || '';

    this.vendorDocService.exportHREmpDocList(vId, '', '', term).subscribe({
      next: (res: any) => {
        this.isExporting = false;
        const allData: any[] = res?.data || this.allEmployeeList;
        if (!allData || allData.length === 0) {
          this.toastr.warning('No records found to export.', 'Warning');
          return;
        }

        // 1. Uploaded Tab: Fully uploaded employees (or total docs >= required)
        const uploadedList = allData.filter((item: any) => {
          const isFull = item.isFullyUploaded === 1 || item.IsFullyUploaded === 1 || this.isFullyUploaded(item);
          const total = item.totalDocs ?? item.TotalDocs ?? this.getUploadedCount(item);
          const req = item.requiredDocs ?? item.RequiredDocs ?? this.getTotalRequiredCount(item);
          return isFull || (req > 0 && total >= req);
        });

        // 2. Pending Upload Tab: Employees with missing/pending uploads
        const pendingUploadList = allData.filter((item: any) => {
          const isFull = item.isFullyUploaded === 1 || item.IsFullyUploaded === 1 || this.isFullyUploaded(item);
          const total = item.totalDocs ?? item.TotalDocs ?? this.getUploadedCount(item);
          const req = item.requiredDocs ?? item.RequiredDocs ?? this.getTotalRequiredCount(item);
          return !isFull && (req > 0 && total < req);
        });

        const workbook = XLSX.utils.book_new();

        this.addUploadedSheet(workbook, 'Uploaded', uploadedList);
        this.addPendingUploadSheet(workbook, 'Pending Upload', pendingUploadList);

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(blob, `Vendor_Employee_Documents_${new Date().toISOString().slice(0, 10)}.xlsx`);
        this.toastr.success('Excel file exported with Uploaded & Pending Upload tabs.', 'Success');
      },
      error: () => {
        this.isExporting = false;
        this.toastr.error('Failed to export Excel file.', 'Error');
      }
    });
  }

  private addUploadedSheet(workbook: any, sheetName: string, items: any[]): void {
    const headers = [
      'Sr. No',
      'Emp Code',
      'Employee Name',
      'Location',
      'Vendor Name',
      'Vendor Code',
      'Total Uploaded',
      'Approved Docs',
      'Pending Review',
      'Rejected Docs',
      'Uploaded Documents & Verification Status',
      'HR Review Status'
    ];

    const wsData: any[][] = [headers];

    if (items.length === 0) {
      wsData.push(['No records found', '', '', '', '', '', '', '', '', '', '', '']);
    } else {
      items.forEach((item, index) => {
        wsData.push([
          index + 1,
          item.empcode || item.empCode || item.EmpCode || '',
          item.empname || item.empName || item.EmpName || '',
          item.locationName || item.LocationName || item.Location || '',
          item.vendor_Name || item.Vendor_Name || item.vendorName || '',
          item.vendor_Code || item.Vendor_Code || item.vendorCode || '',
          item.totalDocs ?? item.TotalDocs ?? this.getUploadedCount(item),
          item.approvedDocs ?? item.ApprovedDocs ?? 0,
          item.pendingDocs ?? item.PendingDocs ?? 0,
          item.rejectedDocs ?? item.RejectedDocs ?? 0,
          item.documentNames || item.DocumentNames || '-',
          item.status || item.Status || this.getRowStatus(item)
        ]);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    this.applySheetStyles(worksheet, headers, wsData, '15803D', 10);
    worksheet['!cols'] = [
      { wch: 8 },   // Sr. No
      { wch: 14 },  // Emp Code
      { wch: 26 },  // Employee Name
      { wch: 20 },  // Location
      { wch: 32 },  // Vendor Name
      { wch: 15 },  // Vendor Code
      { wch: 16 },  // Total Uploaded
      { wch: 16 },  // Approved Docs
      { wch: 16 },  // Pending Review
      { wch: 16 },  // Rejected Docs
      { wch: 55 },  // Uploaded Documents & Verification Status
      { wch: 18 }   // HR Review Status
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  private addPendingUploadSheet(workbook: any, sheetName: string, items: any[]): void {
    const headers = [
      'Sr. No',
      'Emp Code',
      'Employee Name',
      'Location',
      'Vendor Name',
      'Vendor Code',
      'Uploaded Count',
      'Required Count',
      'Missing Documents Count',
      'Uploaded Documents So Far',
      'Upload Status'
    ];

    const wsData: any[][] = [headers];

    if (items.length === 0) {
      wsData.push(['No records found', '', '', '', '', '', '', '', '', '', '']);
    } else {
      items.forEach((item, index) => {
        const total = item.totalDocs ?? item.TotalDocs ?? this.getUploadedCount(item);
        const req = item.requiredDocs ?? item.RequiredDocs ?? this.getTotalRequiredCount(item);
        const missing = Math.max(0, req - total);

        wsData.push([
          index + 1,
          item.empcode || item.empCode || item.EmpCode || '',
          item.empname || item.empName || item.EmpName || '',
          item.locationName || item.LocationName || item.Location || '',
          item.vendor_Name || item.Vendor_Name || item.vendorName || '',
          item.vendor_Code || item.Vendor_Code || item.vendorCode || '',
          total,
          req,
          missing,
          item.documentNames || item.DocumentNames || 'None',
          'Pending Upload'
        ]);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    this.applySheetStyles(worksheet, headers, wsData, 'DC2626', 9);
    worksheet['!cols'] = [
      { wch: 8 },   // Sr. No
      { wch: 14 },  // Emp Code
      { wch: 26 },  // Employee Name
      { wch: 20 },  // Location
      { wch: 32 },  // Vendor Name
      { wch: 15 },  // Vendor Code
      { wch: 16 },  // Uploaded Count
      { wch: 16 },  // Required Count
      { wch: 24 },  // Missing Documents Count
      { wch: 45 },  // Uploaded Documents So Far
      { wch: 18 }   // Upload Status
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  private applySheetStyles(worksheet: any, headers: string[], wsData: any[][], headerColorHex: string, wrapColIndex: number): void {
    // Style Header Row
    headers.forEach((_, colIdx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: headerColorHex } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'medium', color: { rgb: '374151' } },
            left: { style: 'thin', color: { rgb: 'D1D5DB' } },
            right: { style: 'thin', color: { rgb: 'D1D5DB' } }
          }
        };
      }
    });

    // Style Data Rows
    for (let r = 1; r < wsData.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (worksheet[cellAddress]) {
          const isNumCol = c === 0 || (c >= 6 && c <= 8);
          worksheet[cellAddress].s = {
            alignment: {
              horizontal: isNumCol ? 'center' : 'left',
              vertical: 'center',
              wrapText: c === wrapColIndex
            },
            border: {
              top: { style: 'thin', color: { rgb: 'E5E7EB' } },
              bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
              left: { style: 'thin', color: { rgb: 'E5E7EB' } },
              right: { style: 'thin', color: { rgb: 'E5E7EB' } }
            },
            fill: { fgColor: { rgb: r % 2 === 0 ? 'F9FAFB' : 'FFFFFF' } }
          };
        }
      }
    }
  }
}
