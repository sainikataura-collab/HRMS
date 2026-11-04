import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { LocationReportService } from '../services/location-report.service';

@Component({
  selector: 'app-location-wise-jobs-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './location-wise-jobs-report.component.html',
  styleUrls: ['./location-wise-jobs-report.component.scss']
})
export class LocationWiseJobsReportComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isExporting: boolean = false;
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;
  private fetchSub?: Subscription;

  // Fully Dynamic Dropdown Lists from API
  locationList: any[] = [{ label: 'All Locations', value: '' }];
  monthList: any[] = [{ label: 'All Months', value: '' }];
  yearList: any[] = [{ label: 'All Years', value: '' }];
  departmentList: any[] = [{ label: 'All Departments', value: '' }];
  vendorList: any[] = [{ label: 'All Vendors', value: '' }];
  statusList: any[] = [{ label: 'All Statuses', value: '' }];

  dataList: any[] = [];
  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private locationReportService: LocationReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadMasterData();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchText = term;
      this.applyFilters();
    });

    this.route.queryParams.subscribe((params) => {
      if (params['locationId']) {
        this.filterForm.patchValue({ locationId: params['locationId'] });
      }
      if (params['month']) {
        this.filterForm.patchValue({ month: params['month'] });
      }
      if (params['year']) {
        this.filterForm.patchValue({ year: params['year'] });
      }
      this.fetchLocationWiseJobsReport();
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.fetchSub?.unsubscribe();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      locationId: [''],
      department: [''],
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

          if (Array.isArray(data.Departments ?? data.departments)) {
            const depts = data.Departments ?? data.departments;
            this.departmentList = [
              { label: 'All Departments', value: '' },
              ...depts.map((d: any) => ({ label: d.Label ?? d.label, value: d.Value ?? d.value }))
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
        console.warn('Master data load error:', err);
      }
    });
  }

  fetchLocationWiseJobsReport(): void {
    this.isLoading = true;
    const formVals = this.filterForm.value;
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    const payload = {
      companyId: companyId,
      locationId: formVals.locationId || '',
      department: formVals.department || '',
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

    this.fetchSub?.unsubscribe();
    this.fetchSub = this.locationReportService.getLocationWiseJobsReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isOk = res?.IsSuccess ?? res?.isSuccess;
        const dataArr = res?.Data ?? res?.data;
        const total = res?.TotalCount ?? res?.totalCount ?? 0;

        if (isOk && Array.isArray(dataArr)) {
          this.dataList = dataArr.map((item: any) => ({
            locationId: item.LocationId ?? item.locationId ?? '',
            locationCode: item.LocationCode ?? item.locationCode ?? '',
            locationName: item.LocationName ?? item.locationName ?? '',
            reqId: item.ReqId ?? item.reqId ?? '',
            reqCode: item.ReqCode ?? item.reqCode ?? '',
            jobTitle: item.JobTitle ?? item.jobTitle ?? '',
            department: item.Department ?? item.department ?? '',
            month: item.Month ?? item.month ?? '',
            year: item.Year ?? item.year ?? '',
            monthYear: item.MonthYear ?? item.monthYear ?? '',
            targetPositions: item.TargetPositions ?? item.targetPositions ?? 0,
            profilesShared: item.ProfilesShared ?? item.profilesShared ?? 0,
            screened: item.Screened ?? item.screened ?? 0,
            interviewed: item.Interviewed ?? item.interviewed ?? 0,
            offered: item.Offered ?? item.offered ?? 0,
            joined: item.Joined ?? item.joined ?? 0,
            rejected: item.Rejected ?? item.rejected ?? 0,
            pendingPositions: item.PendingPositions ?? item.pendingPositions ?? 0,
            fulfillmentPct: item.FulfillmentPct ?? item.fulfillmentPct ?? 0,
            avgTatDays: item.AvgTatDays ?? item.avgTatDays ?? 0,
            status: item.Status ?? item.status ?? 'Active'
          }));

          this.totalItems = total > 0 ? total : this.dataList.length;
          this.filteredDataList = [...this.dataList];
        } else {
          this.dataList = [];
          this.filteredDataList = [];
          this.totalItems = 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error fetching location wise jobs report:', err);
        this.dataList = [];
        this.filteredDataList = [];
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.fetchLocationWiseJobsReport();
  }

  resetFilters(): void {
    this.filterForm.reset({
      locationId: '',
      department: '',
      vendorCode: '',
      month: '',
      year: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
    this.searchText = '';
    this.pageIndex = 1;
    this.fetchLocationWiseJobsReport();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.fetchLocationWiseJobsReport();
  }

  exportToExcel(): void {
    this.isExporting = true;
    const formVals = this.filterForm.value;
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    const payload = {
      companyId: companyId,
      locationId: formVals.locationId || '',
      department: formVals.department || '',
      vendorCode: formVals.vendorCode || '',
      month: formVals.month || '',
      year: formVals.year || '',
      status: formVals.status || '',
      fromDate: formVals.fromDate || '',
      toDate: formVals.toDate || '',
      searchTerm: this.searchText || ''
    };

    this.locationReportService.downloadLocationWiseJobsReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        this.isExporting = false;
        const filename = `Location_Wise_Jobs_Report_${new Date().getTime()}.xlsx`;
        FileSaver.saveAs(blob, filename);
        this.toastr.success('Location Wise Jobs Report exported successfully!');
      },
      error: (err: any) => {
        this.isExporting = false;
        console.warn('Backend excel download error, fallback client export:', err);
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
      'Requisition ID': item.reqCode,
      'Job Title': item.jobTitle,
      'Department': item.department,
      'Target Positions': item.targetPositions,
      'Profiles Shared': item.profilesShared,
      'Screened': item.screened,
      'Interviewed': item.interviewed,
      'Offered': item.offered,
      'Joined': item.joined,
      'Rejected': item.rejected,
      'Pending Positions': item.pendingPositions,
      'Fulfillment %': `${item.fulfillmentPct}%`,
      'Avg TAT (Days)': item.avgTatDays,
      'Status': item.status
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Location Wise Jobs': worksheet },
      SheetNames: ['Location Wise Jobs']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, `Location_Wise_Jobs_Report_${new Date().getTime()}.xlsx`);
    this.toastr.success('Location Wise Jobs Report exported successfully!');
  }
}
