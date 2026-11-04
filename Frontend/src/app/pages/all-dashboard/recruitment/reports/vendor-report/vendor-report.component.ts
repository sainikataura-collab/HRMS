import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { VendorReportService } from '../services/vendor-report.service';

@Component({
  selector: 'app-vendor-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './vendor-report.component.html',
  styleUrls: ['./vendor-report.component.scss']
})
export class VendorReportComponent implements OnInit {
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
  statusList: any[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Approved', value: 'Approved' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Closed', value: 'Closed' }
  ];
  locationList: any[] = [{ label: 'All Locations', value: '' }];

  // Dynamic KPI stats (loaded from API)
  totalVendors: number = 0;
  totalProfilesSubmitted: number = 0;
  totalShortlisted: number = 0;
  totalJoined: number = 0;
  overallConversionRate: number = 0;

  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private vendorReportService: VendorReportService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
    this.applyFilters();
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
          }

          const locations = data?.Locations ?? data?.locations ?? [];
          if (Array.isArray(locations)) {
            this.locationList = [
              { label: 'All Locations', value: '' },
              ...locations.map((l: any) => ({
                label: l?.Label ?? l?.label ?? '',
                value: l?.Value ?? l?.value ?? ''
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
              { label: 'All Statuses', value: '' },
              ...statuses.map((s: any) => ({
                label: s?.Label ?? s?.label ?? '',
                value: s?.Value ?? s?.value ?? ''
              }))
            ];
          }
        }
      },
      error: (err) => {
        console.warn('Could not load master dropdown data, using defaults:', err);
      }
    });
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      vendorCode: [''],
      month: [''],
      year: [''],
      status: [''],
      location: [''],
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
    this.vendorReportService.getVendorReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isSuccess = res?.isSuccess ?? res?.IsSuccess ?? false;
        const data = res?.data ?? res?.Data ?? [];
        const totalCount = res?.totalCount ?? res?.TotalCount ?? (Array.isArray(data) ? data.length : 0);
        const summary = res?.summary ?? res?.Summary;

        if (isSuccess && Array.isArray(data)) {
          this.filteredDataList = data;
          this.totalItems = totalCount;
          if (summary) {
            this.totalVendors = summary.totalVendors ?? summary.TotalVendors ?? this.totalItems;
            this.totalProfilesSubmitted = summary.totalProfilesSubmitted ?? summary.TotalProfilesSubmitted ?? 0;
            this.totalShortlisted = summary.totalShortlisted ?? summary.TotalShortlisted ?? 0;
            this.totalJoined = summary.totalJoined ?? summary.TotalJoined ?? 0;
            this.overallConversionRate = summary.overallConversionRate ?? summary.OverallConversionRate ?? 0;
          }
        } else {
          this.filteredDataList = [];
          this.totalItems = 0;
          this.resetKpiStats();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.filteredDataList = [];
        this.totalItems = 0;
        this.resetKpiStats();
        console.error('Error loading vendor report:', err);
      }
    });
  }

  resetKpiStats(): void {
    this.totalVendors = 0;
    this.totalProfilesSubmitted = 0;
    this.totalShortlisted = 0;
    this.totalJoined = 0;
    this.overallConversionRate = 0;
  }

  resetFilters(): void {
    this.filterForm.reset({
      vendorCode: '',
      month: '',
      year: '',
      status: '',
      location: '',
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

    this.vendorReportService.downloadVendorReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vendor_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.toastr.success('Vendor report downloaded successfully');
      },
      error: () => {
        // Fallback client-side Excel export
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
        'Contact Person': item.contactPerson,
        'Email': item.email,
        'Phone': item.phone,
        'Location': item.location,
        'Assigned Jobs': item.activeJobsAssigned,
        'Profiles Submitted': item.totalSubmitted,
        'Shortlisted': item.shortlisted,
        'Interviewed': item.interviewed,
        'Selected': item.selected,
        'Joined': item.joined,
        'Conversion Rate (%)': item.conversionRate + '%',
        'Avg TAT (Days)': item.avgTatDays,
        'Status': item.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor_Report');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `Vendor_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      FileSaver.saveAs(blob, fileName);

      this.toastr.success('Vendor report downloaded successfully');
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
