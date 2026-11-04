import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MrfReportService } from '../services/mrf-report.service';

@Component({
  selector: 'app-mrf-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './mrf-report.component.html',
  styleUrls: ['./mrf-report.component.scss']
})
export class MrfReportComponent implements OnInit {
  filterForm!: FormGroup;
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isExporting: boolean = false;
  isLoading: boolean = false;

  // Selected item for audit / workflow details modal
  selectedMrf: any = null;

  // Dynamic Dropdown Lists
  locationList: any[] = [{ label: 'All Locations', value: '' }];
  departmentList: any[] = [{ label: 'All Departments', value: '' }];
  vendorList: any[] = [{ label: 'All Vendors', value: '' }];
  monthList: any[] = [{ label: 'All Months', value: '' }];
  yearList: any[] = [{ label: 'All Years', value: '' }];
  statusList: any[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'L1_Pending', value: 'L1_Pending' },
    { label: 'L1_Rejected', value: 'L1_Rejected' },
    { label: 'L2_Pending', value: 'L2_Pending' },
    { label: 'L2_Rejected', value: 'L2_Rejected' },
    { label: 'L3_Pending', value: 'L3_Pending' },
    { label: 'L3_Rejected', value: 'L3_Rejected' }
  ];

  // Dynamic Summary KPIs
  totalMRFs: number = 0;
  totalPositions: number = 0;
  totalInWorkflow: number = 0;
  totalActive: number = 0;
  totalProfilesSubmitted: number = 0;
  totalJoined: number = 0;
  totalPendingPositions: number = 0;
  overallFulfillmentRate: number = 0;

  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private mrfReportService: MrfReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
    this.applyFilters();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      mrfCode: [''],
      locationId: [''],
      department: [''],
      vendorCode: [''],
      workflowStatus: [''],
      month: [''],
      year: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  loadMasterData(): void {
    this.mrfReportService.getReportMasterData().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.Data;
        if (data) {
          const vendors = data?.Vendors ?? data?.vendors ?? [];
          if (Array.isArray(vendors) && vendors.length > 0) {
            this.vendorList = [
              { label: 'All Vendors', value: '' },
              ...vendors.map((v: any) => ({
                label: v?.Label ?? v?.label ?? '',
                value: v?.Value ?? v?.value ?? ''
              }))
            ];
          }

          const locations = data?.Locations ?? data?.locations ?? [];
          if (Array.isArray(locations) && locations.length > 0) {
            this.locationList = [
              { label: 'All Locations', value: '' },
              ...locations.map((l: any) => ({
                label: l?.Label ?? l?.label ?? '',
                value: l?.Value ?? l?.value ?? ''
              }))
            ];
          }

          const departments = data?.Departments ?? data?.departments ?? [];
          if (Array.isArray(departments) && departments.length > 0) {
            this.departmentList = [
              { label: 'All Departments', value: '' },
              ...departments.map((d: any) => ({
                label: d?.Label ?? d?.label ?? '',
                value: d?.Value ?? d?.value ?? ''
              }))
            ];
          }

          const months = data?.Months ?? data?.months ?? [];
          if (Array.isArray(months) && months.length > 0) {
            this.monthList = [
              { label: 'All Months', value: '' },
              ...months.map((m: any) => ({
                label: m?.Label ?? m?.label ?? '',
                value: m?.Value ?? m?.value ?? ''
              }))
            ];
          }

          const years = data?.Years ?? data?.years ?? [];
          if (Array.isArray(years) && years.length > 0) {
            this.yearList = [
              { label: 'All Years', value: '' },
              ...years.map((y: any) => ({
                label: y?.Label ?? y?.label ?? '',
                value: y?.Value ?? y?.value ?? ''
              }))
            ];
          }

          const statuses = data?.Statuses ?? data?.statuses ?? [];
          if (Array.isArray(statuses) && statuses.length > 0) {
            this.statusList = [
              { label: 'All Statuses', value: '' },
              ...statuses.map((st: any) => ({
                label: st?.Label ?? st?.label ?? '',
                value: st?.Value ?? st?.value ?? ''
              }))
            ];
          }
        }
      },
      error: (err) => {
        console.warn('Could not load master dropdown data for MRF report:', err);
      }
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
    this.mrfReportService.getMrfReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isSuccess = res?.isSuccess ?? res?.IsSuccess ?? false;
        const data = res?.data ?? res?.Data ?? [];
        const totalCount = res?.totalCount ?? res?.TotalCount ?? (Array.isArray(data) ? data.length : 0);
        const summary = res?.summary ?? res?.Summary;

        if (isSuccess && Array.isArray(data)) {
          this.filteredDataList = data.map((d: any) => ({
            pkReqId: d.PkReqId ?? d.pkReqId ?? 0,
            mrfCode: d.MrfCode ?? d.mrfCode ?? '',
            reqCode: d.ReqCode ?? d.reqCode ?? '',
            jobTitle: d.JobTitle ?? d.jobTitle ?? '',
            designation: d.Designation ?? d.designation ?? '',
            department: d.Department ?? d.department ?? '',
            location: d.Location ?? d.location ?? '',
            raisedBy: d.RaisedBy ?? d.raisedBy ?? '',
            requirementType: d.RequirementType ?? d.requirementType ?? '',
            justification: d.Justification ?? d.justification ?? '',
            expFrom: d.ExpFrom ?? d.expFrom ?? 0,
            expTo: d.ExpTo ?? d.expTo ?? 0,
            ctcFrom: d.CtcFrom ?? d.ctcFrom ?? 0,
            ctcTo: d.CtcTo ?? d.ctcTo ?? 0,
            targetPositions: d.TargetPositions ?? d.targetPositions ?? 0,
            workflowStatus: d.WorkflowStatus ?? d.workflowStatus ?? 'Submitted',
            currentApprovalLevel: d.CurrentApprovalLevel ?? d.currentApprovalLevel ?? 1,
            month: d.Month ?? d.month ?? '',
            year: d.Year ?? d.year ?? '',
            monthYear: d.MonthYear ?? d.monthYear ?? '',
            createdDate: d.CreatedDate ?? d.createdDate,
            approvalDate: d.ApprovalDate ?? d.approvalDate,
            hiringOpenedDate: d.HiringOpenedDate ?? d.hiringOpenedDate,
            submittedDate: d.SubmittedDate ?? d.submittedDate,
            l1ApproverId: d.L1ApproverId ?? d.l1ApproverId,
            l1ApproverName: d.L1ApproverName ?? d.l1ApproverName,
            l1Action: d.L1Action ?? d.l1Action,
            l1ActionDate: d.L1ActionDate ?? d.l1ActionDate,
            l1Remarks: d.L1Remarks ?? d.l1Remarks,
            l2ApproverId: d.L2ApproverId ?? d.l2ApproverId,
            l2ApproverName: d.L2ApproverName ?? d.l2ApproverName,
            l2Action: d.L2Action ?? d.l2Action,
            l2ActionDate: d.L2ActionDate ?? d.l2ActionDate,
            l2Remarks: d.L2Remarks ?? d.l2Remarks,
            l3ApproverId: d.L3ApproverId ?? d.l3ApproverId,
            l3ApproverName: d.L3ApproverName ?? d.l3ApproverName,
            l3Action: d.L3Action ?? d.l3Action,
            l3ActionDate: d.L3ActionDate ?? d.l3ActionDate,
            l3Remarks: d.L3Remarks ?? d.l3Remarks,
            rejectedByLevel: d.RejectedByLevel ?? d.rejectedByLevel,
            rejectedByName: d.RejectedByName ?? d.rejectedByName,
            rejectedByDate: d.RejectedByDate ?? d.rejectedByDate,
            rejectionRemarks: d.RejectionRemarks ?? d.rejectionRemarks,
            profilesSubmitted: d.ProfilesSubmitted ?? d.profilesSubmitted ?? 0,
            screened: d.Screened ?? d.screened ?? 0,
            interviewed: d.Interviewed ?? d.interviewed ?? 0,
            offered: d.Offered ?? d.offered ?? 0,
            joined: d.Joined ?? d.joined ?? 0,
            rejected: d.Rejected ?? d.rejected ?? 0,
            pendingPositions: d.PendingPositions ?? d.pendingPositions ?? 0,
            fulfillmentPct: d.FulfillmentPct ?? d.fulfillmentPct ?? 0,
            avgTatDays: d.AvgTatDays ?? d.avgTatDays ?? 0
          }));

          this.totalItems = totalCount;

          if (summary) {
            this.totalMRFs = summary.TotalMRFs ?? summary.totalMRFs ?? totalCount;
            this.totalPositions = summary.TotalPositions ?? summary.totalPositions ?? 0;
            this.totalInWorkflow = summary.TotalInWorkflow ?? summary.totalInWorkflow ?? 0;
            this.totalActive = summary.TotalActive ?? summary.totalActive ?? 0;
            this.totalProfilesSubmitted = summary.TotalProfilesSubmitted ?? summary.totalProfilesSubmitted ?? 0;
            this.totalJoined = summary.TotalJoined ?? summary.totalJoined ?? 0;
            this.totalPendingPositions = summary.TotalPendingPositions ?? summary.totalPendingPositions ?? 0;
            this.overallFulfillmentRate = summary.OverallFulfillmentRate ?? summary.overallFulfillmentRate ?? 0;
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
        console.error('Error fetching MRF report:', err);
      }
    });
  }

  resetKpiStats(): void {
    this.totalMRFs = 0;
    this.totalPositions = 0;
    this.totalInWorkflow = 0;
    this.totalActive = 0;
    this.totalProfilesSubmitted = 0;
    this.totalJoined = 0;
    this.totalPendingPositions = 0;
    this.overallFulfillmentRate = 0;
  }

  resetFilters(): void {
    this.filterForm.reset({
      mrfCode: '',
      locationId: '',
      department: '',
      vendorCode: '',
      workflowStatus: '',
      month: '',
      year: '',
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

  openWorkflowDetails(item: any): void {
    this.selectedMrf = item;
  }

  closeWorkflowDetails(): void {
    this.selectedMrf = null;
  }

  getWorkflowBadgeClass(status: string): string {
    switch (status) {
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
      default:
        return 'bg-primary text-white';
    }
  }

  getTierBadge(tier: number, status?: string): string {
    if (status && (status.toLowerCase().includes('reject') || status.toLowerCase().includes('disapprov'))) {
      return 'Rejected';
    }
    if (tier === 99) return 'Fully Approved';
    if (!tier || tier <= 1) return 'Tier 1';
    return `Tier ${tier}`;
  }

  exportToExcel(): void {
    if (this.isExporting) return;
    this.isExporting = true;

    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';
    const payload = {
      ...this.filterForm?.value,
      companyId: companyId,
      searchTerm: this.searchText.trim()
    };

    this.mrfReportService.downloadMrfReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        this.isExporting = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MRF_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastr.success('MRF report downloaded successfully');
      },
      error: (err) => {
        this.isExporting = false;
        this.toastr.error('Failed to export MRF report');
        console.error('Export Excel failed:', err);
      }
    });
  }
}
