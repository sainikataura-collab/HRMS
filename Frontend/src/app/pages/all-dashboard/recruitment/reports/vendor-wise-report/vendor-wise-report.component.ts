import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { VendorReportService } from '../services/vendor-report.service';

@Component({
  selector: 'app-vendor-wise-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './vendor-wise-report.component.html',
  styleUrls: ['./vendor-wise-report.component.scss']
})
export class VendorWiseReportComponent implements OnInit {
  filterForm!: FormGroup;
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isExporting: boolean = false;
  isLoading: boolean = false;

  // Dynamic Dropdown Lists
  vendorList: any[] = [{ label: 'All Vendors', value: '' }];
  monthList: any[] = [{ label: 'All Months', value: '' }];
  yearList: any[] = [{ label: 'All Years', value: '' }];
  departmentList: any[] = [{ label: 'All Departments', value: '' }];
  statusList: any[] = [
    { label: 'All Requisition Statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Approved', value: 'Approved' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Closed', value: 'Closed' }
  ];

  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private vendorReportService: VendorReportService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();

    // Check query params if navigated with vendorCode, month, year
    this.route.queryParams.subscribe(params => {
      if (params['vendorCode']) {
        const code = params['vendorCode'];
        this.syncVendorSelection(code);
      }
      if (params['month']) {
        this.filterForm.patchValue({ month: params['month'] });
      }
      if (params['year']) {
        this.filterForm.patchValue({ year: params['year'] });
      }
      this.applyFilters();
    });
  }

  syncVendorSelection(code: string): void {
    if (!code) return;
    const match = this.vendorList.find(v => 
      v.value === code || 
      v.code === code || 
      (v.label && (v.label.includes(`(${code})`) || v.label === code))
    );
    this.filterForm.patchValue({ vendorCode: match ? match.value : code });
  }

  loadMasterData(): void {
    this.vendorReportService.getReportMasterData().subscribe({
      next: (res: any) => {
        const isOk = res?.IsSuccess ?? res?.isSuccess;
        const data = res?.Data ?? res?.data;
        if (data) {
          const vendors = data?.Vendors ?? data?.vendors ?? [];
          if (Array.isArray(vendors)) {
            this.vendorList = [
              { label: 'All Vendors', value: '', code: '' },
              ...vendors.map((v: any) => ({
                label: v?.Label ?? v?.label ?? '',
                value: v?.Value ?? v?.value ?? '',
                code: v?.Code ?? v?.code ?? ''
              }))
            ];

            // Re-sync vendor selection if form already had a code before dropdowns loaded
            const currentCode = this.filterForm.get('vendorCode')?.value;
            if (currentCode) {
              this.syncVendorSelection(currentCode);
            }
          }

          const departments = data?.Departments ?? data?.departments ?? [];
          if (Array.isArray(departments)) {
            this.departmentList = [
              { label: 'All Departments', value: '' },
              ...departments.map((d: any) => ({
                label: d?.Label ?? d?.label ?? '',
                value: d?.Value ?? d?.value ?? ''
              }))
            ];
          }

          const months = data?.Months ?? data?.months ?? [];
          if (Array.isArray(months)) {
            this.monthList = [
              { label: 'All Months', value: '' },
              ...months.map((m: any) => ({
                label: m?.Label ?? m?.label ?? '',
                value: m?.Value ?? m?.value ?? ''
              }))
            ];
          }

          const years = data?.Years ?? data?.years ?? [];
          if (Array.isArray(years)) {
            this.yearList = [
              { label: 'All Years', value: '' },
              ...years.map((y: any) => ({
                label: y?.Label ?? y?.label ?? '',
                value: y?.Value ?? y?.value ?? ''
              }))
            ];
          }

          const statuses = data?.Statuses ?? data?.statuses ?? [];
          if (Array.isArray(statuses)) {
            this.statusList = [
              { label: 'All Requisition Statuses', value: '' },
              ...statuses.map((s: any) => ({
                label: s?.Label ?? s?.label ?? '',
                value: s?.Value ?? s?.value ?? ''
              }))
            ];
          }
        }
      },
      error: (err) => {
        console.warn('Could not load master dropdown data for vendor-wise report:', err);
      }
    });
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      vendorCode: [''],
      month: [''],
      year: [''],
      department: [''],
      status: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  applyFilters(): void {
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';
    const payload = {
      ...this.filterForm?.value,
      companyId: companyId,
      searchTerm: this.searchText.trim(),
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize
    };

    this.isLoading = true;
    this.vendorReportService.getVendorWiseReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isSuccess = res?.isSuccess ?? res?.IsSuccess ?? false;
        const data = res?.data ?? res?.Data ?? [];
        const totalCount = res?.totalCount ?? res?.TotalCount ?? (Array.isArray(data) ? data.length : 0);

        if (isSuccess && Array.isArray(data)) {
          this.filteredDataList = data;
          this.totalItems = totalCount;
        } else {
          this.filteredDataList = [];
          this.totalItems = 0;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.filteredDataList = [];
        this.totalItems = 0;
        console.error('Error loading vendor wise report:', err);
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      vendorCode: '',
      month: '',
      year: '',
      department: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
    this.searchText = '';
    this.pageIndex = 1;
    this.applyFilters();
    this.toastr.info('Filters reset successfully');
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.applyFilters();
  }

  exportToExcel(): void {
    if (this.isExporting) return;
    this.isExporting = true;

    const payload = {
      ...this.filterForm?.value,
      searchTerm: this.searchText.trim()
    };

    this.vendorReportService.downloadVendorWiseReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vendor_Wise_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.toastr.success('Vendor wise report exported successfully');
      },
      error: () => {
        this.exportClientSideExcel();
      }
    });
  }

  exportClientSideExcel(): void {
    try {
      const exportList = this.filteredDataList.map((item, index) => ({
        'Sr No.': index + 1,
        'Month': item.monthYear,
        'Vendor Code': item.vendorCode,
        'Vendor Name': item.vendorName,
        'Requisition ID': item.reqCode,
        'Job Title': item.jobTitle,
        'Department': item.department,
        'Location': item.location,
        'Target Positions': item.targetPositions,
        'Profiles Shared': item.profilesShared,
        'Screened': item.screened,
        'Interviewed': item.interviewed,
        'Offered': item.offered,
        'Joined': item.joined,
        'Rejected': item.rejected,
        'Vendor Share (%)': item.vendorSharePct + '%',
        'Avg TAT (Days)': item.avgTatDays,
        'Status': item.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor_Wise_Breakdown');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `Vendor_Wise_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      FileSaver.saveAs(blob, fileName);

      this.toastr.success('Vendor wise report exported successfully');
    } catch (error) {
      console.error('Export Excel failed:', error);
      this.toastr.error('Failed to export Excel report');
    } finally {
      this.isExporting = false;
    }
  }

  printReport(): void {
    window.print();
  }
}
