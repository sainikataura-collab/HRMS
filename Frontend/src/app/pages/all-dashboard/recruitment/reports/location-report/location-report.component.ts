import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { LocationReportService } from '../services/location-report.service';

@Component({
  selector: 'app-location-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './location-report.component.html',
  styleUrls: ['./location-report.component.scss']
})
export class LocationReportComponent implements OnInit {
  filterForm!: FormGroup;
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isExporting: boolean = false;
  isLoading: boolean = false;

  // Fully Dynamic Dropdown Lists from Backend API
  locationList: any[] = [{ label: 'All Locations', value: '' }];
  monthList: any[] = [{ label: 'All Months', value: '' }];
  yearList: any[] = [{ label: 'All Years', value: '' }];
  vendorList: any[] = [{ label: 'All Vendors', value: '' }];
  statusList: any[] = [{ label: 'All Statuses', value: '' }];

  // Dynamic KPI Stats from API
  totalLocations: number = 0;
  totalOpeningJobs: number = 0;
  totalPositions: number = 0;
  totalProfilesSubmitted: number = 0;
  totalJoined: number = 0;
  totalOpenPositions: number = 0;
  overallFulfillmentRate: number = 0;

  dataList: any[] = [];
  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private locationReportService: LocationReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadMasterData();
    this.fetchLocationReport();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      locationId: [''],
      location: [''],
      vendorCode: [''],
      month: [''],
      year: [''],
      status: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  loadMasterData(): void {
    this.locationReportService.getReportMasterData().subscribe({
      next: (res: any) => {
        const isOk = res?.IsSuccess ?? res?.isSuccess;
        const data = res?.Data ?? res?.data;

        if (isOk && data) {
          if (Array.isArray(data.Vendors ?? data.vendors)) {
            const vendors = data.Vendors ?? data.vendors;
            this.vendorList = [
              { label: 'All Vendors', value: '' },
              ...vendors.map((v: any) => ({ label: v.Label ?? v.label, value: v.Value ?? v.value }))
            ];
          }

          if (Array.isArray(data.Locations ?? data.locations)) {
            const locs = data.Locations ?? data.locations;
            this.locationList = [
              { label: 'All Locations', value: '' },
              ...locs.map((l: any) => ({ label: l.Label ?? l.label, value: l.Value ?? l.value }))
            ];
          }

          if (Array.isArray(data.Months ?? data.months)) {
            const months = data.Months ?? data.months;
            this.monthList = [
              { label: 'All Months', value: '' },
              ...months.map((m: any) => ({ label: m.Label ?? m.label, value: m.Value ?? m.value }))
            ];
          }

          if (Array.isArray(data.Years ?? data.years)) {
            const years = data.Years ?? data.years;
            this.yearList = [
              { label: 'All Years', value: '' },
              ...years.map((y: any) => ({ label: y.Label ?? y.label, value: y.Value ?? y.value }))
            ];
          }

          if (Array.isArray(data.Statuses ?? data.statuses)) {
            const statuses = data.Statuses ?? data.statuses;
            this.statusList = [
              { label: 'All Statuses', value: '' },
              ...statuses.map((s: any) => ({ label: s.Label ?? s.label, value: s.Value ?? s.value }))
            ];
          }
        }
      },
      error: (err) => {
        console.warn('Error loading master dropdowns from server:', err);
      }
    });
  }

  fetchLocationReport(): void {
    this.isLoading = true;
    const formVals = this.filterForm.value;
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    const payload = {
      companyId: companyId,
      locationId: formVals.locationId || '',
      location: formVals.location || '',
      vendorCode: formVals.vendorCode || '',
      month: formVals.month || '',
      year: formVals.year || '',
      status: formVals.status || '',
      fromDate: formVals.fromDate || '',
      toDate: formVals.toDate || '',
      searchTerm: this.searchText || '',
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize
    };

    this.locationReportService.getLocationReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isOk = res?.IsSuccess ?? res?.isSuccess;
        const dataArr = res?.Data ?? res?.data;
        const total = res?.TotalCount ?? res?.totalCount ?? 0;
        const summary = res?.Summary ?? res?.summary;

        if (isOk && Array.isArray(dataArr)) {
          this.dataList = dataArr.map((item: any) => ({
            locationId: item.LocationId ?? item.locationId ?? '',
            locationCode: item.LocationCode ?? item.locationCode ?? '',
            locationName: item.LocationName ?? item.locationName ?? '',
            month: item.Month ?? item.month ?? '',
            year: item.Year ?? item.year ?? '',
            monthYear: item.MonthYear ?? item.monthYear ?? '',
            totalOpeningJobs: item.TotalOpeningJobs ?? item.totalOpeningJobs ?? 0,
            totalPositions: item.TotalPositions ?? item.totalPositions ?? 0,
            totalSubmitted: item.TotalSubmitted ?? item.totalSubmitted ?? 0,
            shortlisted: item.Shortlisted ?? item.shortlisted ?? 0,
            interviewed: item.Interviewed ?? item.interviewed ?? 0,
            selected: item.Selected ?? item.selected ?? 0,
            joined: item.Joined ?? item.joined ?? 0,
            rejected: item.Rejected ?? item.rejected ?? 0,
            openPositions: item.OpenPositions ?? item.openPositions ?? 0,
            fulfillmentRate: item.FulfillmentRate ?? item.fulfillmentRate ?? 0,
            avgTatDays: item.AvgTatDays ?? item.avgTatDays ?? 0,
            status: item.Status ?? item.status ?? 'Active'
          }));

          this.totalItems = total > 0 ? total : this.dataList.length;

          if (summary) {
            this.totalLocations = summary.TotalLocations ?? summary.totalLocations ?? this.totalItems;
            this.totalOpeningJobs = summary.TotalOpeningJobs ?? summary.totalOpeningJobs ?? 0;
            this.totalPositions = summary.TotalPositions ?? summary.totalPositions ?? 0;
            this.totalProfilesSubmitted = summary.TotalProfilesSubmitted ?? summary.totalProfilesSubmitted ?? 0;
            this.totalJoined = summary.TotalJoined ?? summary.totalJoined ?? 0;
            this.totalOpenPositions = summary.TotalOpenPositions ?? summary.totalOpenPositions ?? 0;
            this.overallFulfillmentRate = summary.OverallFulfillmentRate ?? summary.overallFulfillmentRate ?? 0;
          }

          this.filteredDataList = [...this.dataList];
        } else {
          this.dataList = [];
          this.filteredDataList = [];
          this.totalItems = 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching location report:', err);
        this.dataList = [];
        this.filteredDataList = [];
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.fetchLocationReport();
  }

  resetFilters(): void {
    this.filterForm.reset({
      locationId: '',
      location: '',
      vendorCode: '',
      month: '',
      year: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
    this.searchText = '';
    this.pageIndex = 1;
    this.fetchLocationReport();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.fetchLocationReport();
  }

  exportToExcel(): void {
    this.isExporting = true;
    const formVals = this.filterForm.value;
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    const payload = {
      companyId: companyId,
      locationId: formVals.locationId || '',
      location: formVals.location || '',
      vendorCode: formVals.vendorCode || '',
      month: formVals.month || '',
      year: formVals.year || '',
      status: formVals.status || '',
      fromDate: formVals.fromDate || '',
      toDate: formVals.toDate || '',
      searchTerm: this.searchText || ''
    };

    this.locationReportService.downloadLocationReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        this.isExporting = false;
        const filename = `Location_Report_${new Date().getTime()}.xlsx`;
        FileSaver.saveAs(blob, filename);
        this.toastr.success('Location Report exported successfully!');
      },
      error: (err: any) => {
        this.isExporting = false;
        console.warn('Backend excel download error, using fallback client export:', err);
        this.exportClientSideExcel();
      }
    });
  }

  private exportClientSideExcel(): void {
    const exportData = this.filteredDataList.map((item, index) => ({
      'Sr. No.': index + 1,
      'Month': item.monthYear,
      'Location Code': item.locationCode,
      'Location Name': item.locationName,
      'Opening Jobs': item.totalOpeningJobs,
      'Total Positions': item.totalPositions,
      'Profiles Submitted': item.totalSubmitted,
      'Shortlisted': item.shortlisted,
      'Interviewed': item.interviewed,
      'Selected': item.selected,
      'Joined': item.joined,
      'Rejected': item.rejected,
      'Open Positions': item.openPositions,
      'Fulfillment Rate %': `${item.fulfillmentRate}%`,
      'Avg TAT (Days)': item.avgTatDays,
      'Status': item.status
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Location Report': worksheet },
      SheetNames: ['Location Report']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, `Location_Report_${new Date().getTime()}.xlsx`);
    this.toastr.success('Location Report exported successfully!');
  }
}
