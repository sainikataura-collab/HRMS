import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CandidateReportService } from '../services/candidate-report.service';

@Component({
  selector: 'app-candidate-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule, RouterLink],
  templateUrl: './candidate-report.component.html',
  styleUrls: ['./candidate-report.component.scss']
})
export class CandidateReportComponent implements OnInit {
  filterForm!: FormGroup;
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isExporting: boolean = false;
  isLoading: boolean = false;

  // Selected item for details modal
  selectedCandidate: any = null;

  // Dynamic Dropdown Lists
  jobList: any[] = [{ label: 'All Jobs', value: '' }];
  locationList: any[] = [{ label: 'All Locations', value: '' }];
  departmentList: any[] = [{ label: 'All Departments', value: '' }];
  sourceList: any[] = [{ label: 'All Sources', value: '' }];
  statusList: any[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Applied', value: 'Applied' },
    { label: 'Screened', value: 'Screened' },
    { label: 'Interviewed', value: 'Interviewed' },
    { label: 'Offered', value: 'Offered' },
    { label: 'Joined', value: 'Joined' },
    { label: 'Rejected', value: 'Rejected' }
  ];
  monthList: any[] = [{ label: 'All Months', value: '' }];
  yearList: any[] = [{ label: 'All Years', value: '' }];

  // Dynamic Summary KPIs
  totalCandidates: number = 0;
  totalScreened: number = 0;
  totalInterviewed: number = 0;
  totalOffered: number = 0;
  totalJoined: number = 0;
  totalRejected: number = 0;
  conversionRate: number = 0;

  filteredDataList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private candidateReportService: CandidateReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
    this.applyFilters();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      jobId: [''],
      locationId: [''],
      department: [''],
      source: [''],
      status: [''],
      month: [''],
      year: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  loadMasterData(): void {
    this.candidateReportService.getReportMasterData().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.Data;
        if (data) {
          const jobs = data?.Jobs ?? data?.jobs ?? [];
          if (Array.isArray(jobs) && jobs.length > 0) {
            this.jobList = [
              { label: 'All Jobs', value: '' },
              ...jobs.map((j: any) => ({
                label: j?.Label ?? j?.label ?? '',
                value: j?.Value ?? j?.value ?? ''
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

          const sources = data?.Sources ?? data?.sources ?? [];
          if (Array.isArray(sources) && sources.length > 0) {
            this.sourceList = [
              { label: 'All Sources', value: '' },
              ...sources.map((s: any) => ({
                label: s?.Label ?? s?.label ?? '',
                value: s?.Value ?? s?.value ?? ''
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
        }
      },
      error: (err) => {
        console.warn('Could not load master dropdown data for Candidate report:', err);
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
    this.candidateReportService.getCandidateReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const isSuccess = res?.isSuccess ?? res?.IsSuccess ?? false;
        const data = res?.data ?? res?.Data ?? [];
        const totalCount = res?.totalCount ?? res?.TotalCount ?? (Array.isArray(data) ? data.length : 0);
        const summary = res?.summary ?? res?.Summary;

        if (isSuccess && Array.isArray(data)) {
          this.filteredDataList = data.map((d: any) => ({
            pkRecId: d.PkRecId ?? d.pkRecId ?? '',
            candidateName: d.CandidateName ?? d.candidateName ?? 'Unknown Candidate',
            email: d.Email ?? d.email ?? '',
            mobile: d.Mobile ?? d.mobile ?? '',
            gender: d.Gender ?? d.gender ?? '',
            education: d.Education ?? d.education ?? '',
            experience: d.Experience ?? d.experience ?? '0',
            currentCtc: d.CurrentCtc ?? d.currentCtc ?? '0',
            expectedCtc: d.ExpectedCtc ?? d.expectedCtc ?? '0',
            noticePeriod: d.NoticePeriod ?? d.noticePeriod ?? 'Immediate',
            keySkills: d.KeySkills ?? d.keySkills ?? '',
            address: d.Address ?? d.address ?? '',
            source: d.Source ?? d.source ?? 'Direct / Walk-In',
            vendorCode: d.VendorCode ?? d.vendorCode ?? '',
            jobId: d.JobId ?? d.jobId ?? '',
            mrfCode: d.MrfCode ?? d.mrfCode ?? '',
            jobTitle: d.JobTitle ?? d.jobTitle ?? 'Unassigned Position',
            department: d.Department ?? d.department ?? '',
            location: d.Location ?? d.location ?? '',
            displayStatus: d.DisplayStatus ?? d.displayStatus ?? 'Applied',
            rawStatus: d.RawStatus ?? d.rawStatus ?? '1',
            appliedDate: d.AppliedDate ?? d.appliedDate,
            month: d.Month ?? d.month ?? '',
            year: d.Year ?? d.year ?? '',
            monthYear: d.MonthYear ?? d.monthYear ?? '',
            shortlistStatus: d.ShortlistStatus ?? d.shortlistStatus ?? false,
            interviewRound: d.InterviewRound ?? d.interviewRound ?? 0,
            finalSelectionStatus: d.FinalSelectionStatus ?? d.finalSelectionStatus ?? false,
            isOnboardingDone: d.IsOnboardingDone ?? d.isOnboardingDone ?? false,
            onboardCompletionDate: d.OnboardCompletionDate ?? d.onboardCompletionDate
          }));
          this.totalItems = totalCount;

          if (summary) {
            this.totalCandidates = summary.TotalCandidates ?? summary.totalCandidates ?? totalCount;
            this.totalScreened = summary.TotalScreened ?? summary.totalScreened ?? 0;
            this.totalInterviewed = summary.TotalInterviewed ?? summary.totalInterviewed ?? 0;
            this.totalOffered = summary.TotalOffered ?? summary.totalOffered ?? 0;
            this.totalJoined = summary.TotalJoined ?? summary.totalJoined ?? 0;
            this.totalRejected = summary.TotalRejected ?? summary.totalRejected ?? 0;
            this.conversionRate = summary.ConversionRate ?? summary.conversionRate ?? 0;
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
        console.error('Error fetching candidate report:', err);
      }
    });
  }

  resetKpiStats(): void {
    this.totalCandidates = 0;
    this.totalScreened = 0;
    this.totalInterviewed = 0;
    this.totalOffered = 0;
    this.totalJoined = 0;
    this.totalRejected = 0;
    this.conversionRate = 0;
  }

  resetFilters(): void {
    this.filterForm.reset({
      jobId: '',
      locationId: '',
      department: '',
      source: '',
      status: '',
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

  openCandidateDetails(item: any): void {
    this.selectedCandidate = item;
  }

  closeCandidateDetails(): void {
    this.selectedCandidate = null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Joined':
        return 'bg-success text-white';
      case 'Offered':
        return 'bg-primary text-white';
      case 'Interviewed':
        return 'bg-warning text-dark';
      case 'Screened':
        return 'bg-info text-white';
      case 'Rejected':
        return 'bg-danger text-white';
      case 'Applied':
      default:
        return 'bg-primary text-white';
    }
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

    this.candidateReportService.downloadCandidateReportExcel(payload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Candidate_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
        this.toastr.success('Candidate report downloaded successfully');
      },
      error: (err) => {
        this.isExporting = false;
        this.toastr.error('Failed to export candidate report');
        console.error('Export Excel failed:', err);
      }
    });
  }
}
