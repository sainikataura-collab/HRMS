import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { JobReportService } from '../services/job-report.service';

@Component({
  selector: 'app-job-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './job-report.component.html',
  styleUrls: ['./job-report.component.scss']
})
export class JobReportComponent implements OnInit {
  filterForm!: FormGroup;
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isExporting: boolean = false;
  isLoading: boolean = false;

  // Selected item for audit / workflow details modal
  selectedJob: any = null;

  // Fully Dynamic Dropdown Lists from API
  locationList: any[] = [{ label: 'All Locations', value: '' }];
  departmentList: any[] = [{ label: 'All Departments', value: '' }];
  vendorList: any[] = [{ label: 'All Vendors', value: '' }];
  monthList: any[] = [{ label: 'All Months', value: '' }];
  yearList: any[] = [{ label: 'All Years', value: '' }];
  statusList: any[] = [
    { label: 'All Job Statuses', value: '' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Closed', value: 'Closed' },
    { label: 'On Hold', value: 'On Hold' }
  ];

  // Dynamic Summary KPIs
  totalJobs: number = 0;
  totalPositions: number = 0;
  totalInWorkflow: number = 0;
  totalActive: number = 0;
  totalProfilesSubmitted: number = 0;
  totalJoined: number = 0;
  totalPendingPositions: number = 0;
  overallFulfillmentRate: number = 0;

  dataList: any[] = [];
  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private jobReportService: JobReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadMasterData();
    this.fetchJobReport();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      locationId: [''],
      department: [''],
      workflowStatus: [''],
      vendorCode: [''],
      month: [''],
      year: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  loadMasterData(): void {
    this.jobReportService.getReportMasterData().subscribe({
      next: (res: any) => {
        const isOk = res?.IsSuccess ?? res?.isSuccess;
        const data = res?.Data ?? res?.data;

        if (isOk && data) {
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

          if (Array.isArray(data.Vendors ?? data.vendors)) {
            const vends = data.Vendors ?? data.vendors;
            this.vendorList = [
              { label: 'All Vendors', value: '' },
              ...vends.map((v: any) => ({
                label: v.Label ?? v.label ?? '',
                value: v.Value ?? v.value ?? '',
                code: v.Code ?? v.code ?? ''
              }))
            ];
          }

          if (Array.isArray(data.Statuses ?? data.statuses)) {
            const statuses = data.Statuses ?? data.statuses;
            this.statusList = [
              { label: 'All Job Statuses', value: '' },
              ...statuses.map((s: any) => ({ label: s.Label ?? s.label, value: s.Value ?? s.value }))
            ];
          }
        }
      },
      error: (err) => {
        console.warn('Error loading Job Report master data:', err);
      }
    });
  }

  fetchJobReport(): void {
    this.isLoading = true;
    const formVals = this.filterForm.value;
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    const payload = {
      companyId: companyId,
      locationId: formVals.locationId || '',
      department: formVals.department || '',
      workflowStatus: formVals.workflowStatus || '',
      vendorCode: formVals.vendorCode || '',
      month: formVals.month || '',
      year: formVals.year || '',
      fromDate: formVals.fromDate || '',
      toDate: formVals.toDate || '',
      searchTerm: this.searchText || '',
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize
    };

    this.jobReportService.getJobReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isOk = res?.IsSuccess ?? res?.isSuccess;
        const dataArr = res?.Data ?? res?.data;
        const total = res?.TotalCount ?? res?.totalCount ?? 0;
        const summary = res?.Summary ?? res?.summary;

        if (isOk && Array.isArray(dataArr)) {
          this.dataList = dataArr.map((item: any) => ({
            reqId: item.ReqId ?? item.reqId ?? 0,
            reqCode: item.ReqCode ?? item.reqCode ?? '',
            jobTitle: item.JobTitle ?? item.jobTitle ?? '',
            department: item.Department ?? item.department ?? '',
            location: item.Location ?? item.location ?? '',
            locationId: item.LocationId ?? item.locationId ?? '',
            month: item.Month ?? item.month ?? '',
            year: item.Year ?? item.year ?? '',
            monthYear: item.MonthYear ?? item.monthYear ?? '',
            targetPositions: item.TargetPositions ?? item.targetPositions ?? 0,
            workflowStatus: item.WorkflowStatus ?? item.workflowStatus ?? 'Submitted',
            currentApprovalLevel: item.CurrentApprovalLevel ?? item.currentApprovalLevel ?? 1,
            vendorNames: item.VendorNames ?? item.vendorNames ?? 'Direct / Walk-In',
            vendorCount: item.VendorCount ?? item.vendorCount ?? 0,
            l1ApproverId: item.L1ApproverId ?? item.l1ApproverId ?? '',
            l1ApproverName: item.L1ApproverName ?? item.l1ApproverName ?? '',
            l1Action: item.L1Action ?? item.l1Action ?? '',
            l1ActionDate: item.L1ActionDate ?? item.l1ActionDate ?? null,
            l1Remarks: item.L1Remarks ?? item.l1Remarks ?? '',
            l2ApproverId: item.L2ApproverId ?? item.l2ApproverId ?? '',
            l2ApproverName: item.L2ApproverName ?? item.l2ApproverName ?? '',
            l2Action: item.L2Action ?? item.l2Action ?? '',
            l2ActionDate: item.L2ActionDate ?? item.l2ActionDate ?? null,
            l2Remarks: item.L2Remarks ?? item.l2Remarks ?? '',
            l3ApproverId: item.L3ApproverId ?? item.l3ApproverId ?? '',
            l3ApproverName: item.L3ApproverName ?? item.l3ApproverName ?? '',
            l3Action: item.L3Action ?? item.l3Action ?? '',
            l3ActionDate: item.L3ActionDate ?? item.l3ActionDate ?? null,
            l3Remarks: item.L3Remarks ?? item.l3Remarks ?? '',
            hiringOpenedDate: item.HiringOpenedDate ?? item.hiringOpenedDate ?? null,
            rejectedByLevel: item.RejectedByLevel ?? item.rejectedByLevel ?? '',
            rejectedByName: item.RejectedByName ?? item.rejectedByName ?? '',
            rejectedByDate: item.RejectedByDate ?? item.rejectedByDate ?? null,
            rejectionRemarks: item.RejectionRemarks ?? item.rejectionRemarks ?? '',
            profilesSubmitted: item.ProfilesSubmitted ?? item.profilesSubmitted ?? 0,
            screened: item.Screened ?? item.screened ?? 0,
            interviewed: item.Interviewed ?? item.interviewed ?? 0,
            offered: item.Offered ?? item.offered ?? 0,
            joined: item.Joined ?? item.joined ?? 0,
            rejected: item.Rejected ?? item.rejected ?? 0,
            pendingPositions: item.PendingPositions ?? item.pendingPositions ?? 0,
            fulfillmentPct: item.FulfillmentPct ?? item.fulfillmentPct ?? 0,
            avgTatDays: item.AvgTatDays ?? item.avgTatDays ?? 0
          }));

          this.totalItems = total > 0 ? total : this.dataList.length;

          if (summary) {
            this.totalJobs = summary.TotalJobs ?? summary.totalJobs ?? this.totalItems;
            this.totalPositions = summary.TotalPositions ?? summary.totalPositions ?? 0;
            this.totalInWorkflow = summary.TotalInWorkflow ?? summary.totalInWorkflow ?? 0;
            this.totalActive = summary.TotalActive ?? summary.totalActive ?? 0;
            this.totalProfilesSubmitted = summary.TotalProfilesSubmitted ?? summary.totalProfilesSubmitted ?? 0;
            this.totalJoined = summary.TotalJoined ?? summary.totalJoined ?? 0;
            this.totalPendingPositions = summary.TotalPendingPositions ?? summary.totalPendingPositions ?? 0;
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
        console.error('Error fetching jobs report:', err);
        this.dataList = [];
        this.filteredDataList = [];
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.fetchJobReport();
  }

  resetFilters(): void {
    this.filterForm.reset({
      locationId: '',
      department: '',
      workflowStatus: '',
      vendorCode: '',
      month: '',
      year: '',
      fromDate: '',
      toDate: ''
    });
    this.searchText = '';
    this.pageIndex = 1;
    this.fetchJobReport();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.fetchJobReport();
  }

  openWorkflowDetails(item: any): void {
    this.selectedJob = item;
  }

  closeWorkflowDetails(): void {
    this.selectedJob = null;
  }

  getWorkflowBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
      case 'Active':
        return 'bg-success text-white';
      case 'Submitted':
        return 'bg-primary text-white';
      case 'L1_Pending':
        return 'bg-info text-white';
      case 'L2_Pending':
      case 'L3_Pending':
        return 'bg-warning text-dark';
      case 'L1_Rejected':
      case 'L2_Rejected':
      case 'L3_Rejected':
        return 'bg-danger text-white';
      case 'Closed':
        return 'bg-dark text-white';
      case 'On Hold':
        return 'bg-warning text-dark';
      default:
        return 'bg-success text-white';
    }
  }

  getTierBadge(tier: number): string {
    if (tier === 99) return 'Fully Approved';
    if (tier === 0) return 'Rejected';
    return `Level ${tier}`;
  }

  getActionBadgeClass(action: string): string {
    const act = (action || '').toLowerCase();
    if (act.includes('approve') || act === 'approved') return 'badge-soft-approved';
    if (act.includes('reject') || act === 'rejected') return 'badge-soft-rejected';
    return 'badge-soft-pending';
  }

  exportToExcel(): void {
    this.isExporting = true;
    const formVals = this.filterForm.value;
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    const payload = {
      companyId: companyId,
      locationId: formVals.locationId || '',
      department: formVals.department || '',
      workflowStatus: formVals.workflowStatus || '',
      month: formVals.month || '',
      year: formVals.year || '',
      fromDate: formVals.fromDate || '',
      toDate: formVals.toDate || '',
      searchTerm: this.searchText || ''
    };

    this.jobReportService.downloadJobReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        this.isExporting = false;
        const filename = `Jobs_Report_${new Date().getTime()}.xlsx`;
        FileSaver.saveAs(blob, filename);
        this.toastr.success('Jobs Report exported successfully!');
      },
      error: (err: any) => {
        this.isExporting = false;
        console.warn('Backend excel error, fallback client export:', err);
        this.exportClientSideExcel();
      }
    });
  }

  private exportClientSideExcel(): void {
    const exportData = this.filteredDataList.map((item, index) => ({
      'Sr. No.': index + 1,
      'Month': item.monthYear,
      'Requisition Code': item.reqCode,
      'Job Title': item.jobTitle,
      'Vendors': item.vendorNames || 'Direct / Walk-In',
      'Department': item.department,
      'Location': item.location,
      'Target Positions': item.targetPositions,
      'Workflow Status': item.workflowStatus,
      'Current Tier': item.currentApprovalLevel === 99 ? 'Active' : item.currentApprovalLevel === 0 ? 'Rejected' : `L${item.currentApprovalLevel}`,
      'Profiles Submitted': item.profilesSubmitted,
      'Screened': item.screened,
      'Interviewed': item.interviewed,
      'Offered': item.offered,
      'Joined': item.joined,
      'Rejected': item.rejected,
      'Pending Positions': item.pendingPositions,
      'Fulfillment %': `${item.fulfillmentPct}%`,
      'Avg TAT (Days)': item.avgTatDays,
      'L1 Approver': item.l1ApproverName,
      'L1 Action': item.l1Action,
      'L1 Date': item.l1ActionDate,
      'L1 Remarks': item.l1Remarks,
      'L2 Approver': item.l2ApproverName,
      'L2 Action': item.l2Action,
      'L2 Date': item.l2ActionDate,
      'L2 Remarks': item.l2Remarks,
      'L3 Approver': item.l3ApproverName,
      'L3 Action': item.l3Action,
      'L3 Date': item.l3ActionDate,
      'L3 Remarks': item.l3Remarks,
      'Hiring Opened Date': item.hiringOpenedDate,
      'Rejection Reason': item.rejectionRemarks
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Jobs Report': worksheet },
      SheetNames: ['Jobs Report']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, `Jobs_Report_${new Date().getTime()}.xlsx`);
    this.toastr.success('Jobs Report exported successfully!');
  }
}
