import { Component, AfterViewInit, OnDestroy, OnInit, PLATFORM_ID, Inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, DoughnutController, BarController, LineController, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AttendanceDashboardService, AttendanceDashboardFilterRequest } from '../service/attendance-dashboard.service';
import { CommonSearchService } from '../../payroll/services/common-search.service';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { environment } from '../../../../../environments/environment';

Chart.register(
  DoughnutController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-admin-attendance-dash',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, NgSelectComponent, NgxPaginationModule],
  templateUrl: './admin-attendance-dash.component.html',
  styleUrl: './admin-attendance-dash.component.scss'
})
export class AdminAttendanceDashComponent implements OnInit, AfterViewInit, OnDestroy {

  protected readonly Math = Math;

  filterForm!: FormGroup;

  departments: any[] = [];
  locations: any[] = [];
  months: any[] = [];
  years: any[] = [];

  // Static display text
  selectedMonthName = 'Selected Month';
  shortMonthName = '';
  selectedYearName = '';

  // Summary KPIs & Breakdown
  kpiSummary: any = {
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    onLeaveCount: 0,
    avgAttendancePercent: 0,
    totalPresentDays: 0,
    totalAbsentDays: 0
  };

  monthlySummary: any = {
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 0,
    halfDays: 0
  };

  totalMonthlyDays = 1;
  presentPct = 0;
  absentPct = 0;
  latePct = 0;
  leavePct = 0;
  halfDayPct = 0;

  // Live Action Highlights
  liveHighlights: any[] = [];
  displayedHighlights: any[] = [];
  activeHighlightTab: string = 'all'; // 'all', 'Late', 'HalfDay', 'Leave', 'Mobile'

  trendData: any[] = [];
  monthDaysList: { day: number; label: string; formattedDate: string; weekday: string; isSunday: boolean }[] = [];

  // Grid & Pagination
  employeeList: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginationRange: number[] = [];
  isGridLoading = false;

  // Active Interactive Filters
  activeStatusFilter = ''; // 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave' | ''
  activeDayFilter = 0;
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Modal State for Selfie Lightbox
  selectedEmployeeForModal: any = null;
  selectedSelfieType: 'both' | 'in' | 'out' = 'both';
  isSelfieModalOpen = false;

  // Chart Instances
  private donutChart: Chart | null = null;
  private trendChart: Chart | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private attendanceDashboardService: AttendanceDashboardService,
    private commonSearchService: CommonSearchService,
    private monthlyRentDetailService: MonthlyRentDetailService,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const today = new Date();
    const curMonth = today.getMonth() + 1;
    const curYear = today.getFullYear();
    const curDay = today.getDate();

    this.filterForm = this.fb.group({
      departmentId: ['0'],
      locationId: ['0'],
      monthId: [curMonth],
      yearId: [curYear]
    });

    this.activeDayFilter = curDay;

    this.updateDateLabels();
    this.updateMonthDaysList();
    this.initSearchDebounce();
    this.loadFilterDropdowns();
  }

  ngAfterViewInit(): void {
    // Charts initialize safely after data loads
  }

  private initSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.fetchEmployeeGrid();
    });
  }

  onSearchInput(event: any): void {
    const val = event.target?.value || '';
    this.searchSubject.next(val);
  }

  private updateDateLabels(): void {
    const mId = this.filterForm?.get('monthId')?.value;
    const yId = this.filterForm?.get('yearId')?.value;

    const foundMonth = this.months.find(m => m.value?.toString() === mId?.toString() || +m.value === +mId);
    this.selectedMonthName = foundMonth?.name || (mId ? `Month ${mId}` : 'Selected Month');
    this.shortMonthName = this.selectedMonthName.substring(0, 3);

    const foundYear = this.years.find(y => y.value?.toString() === yId?.toString() || +y.value === +yId);
    this.selectedYearName = foundYear?.name || (yId ? yId.toString() : '');
  }

  private updateMonthDaysList(): void {
    const mId = +this.filterForm?.get('monthId')?.value || (new Date().getMonth() + 1);
    const yId = +this.filterForm?.get('yearId')?.value || (new Date().getFullYear());
    const totalDays = new Date(yId, mId, 0).getDate();
    const days: { day: number; label: string; formattedDate: string; weekday: string; isSunday: boolean }[] = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 1; i <= totalDays; i++) {
      const dt = new Date(yId, mId - 1, i);
      const wd = weekdays[dt.getDay()];
      const dayStr = String(i).padStart(2, '0');
      days.push({
        day: i,
        label: `${dayStr} ${this.shortMonthName} (${wd})`,
        formattedDate: `${dayStr} ${this.shortMonthName} ${yId}`,
        weekday: wd,
        isSunday: dt.getDay() === 0
      });
    }
    this.monthDaysList = days;
  }

  private updatePaginationRange(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize) || 1;
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    this.paginationRange = pages;
  }

  private calculatePercentages(): void {
    const p = this.kpiSummary.totalPresentDays || 0;
    const a = this.kpiSummary.totalAbsentDays || 0;
    const l = this.kpiSummary.totalLeaveDays || 0;
    const lt = this.kpiSummary.totalLateDays || 0;
    const h = this.kpiSummary.totalHalfDays || 0;

    this.totalMonthlyDays = (p + a + l) || 1;
    this.presentPct = Math.round((p / this.totalMonthlyDays) * 100);
    this.absentPct = Math.round((a / this.totalMonthlyDays) * 100);
    this.latePct = Math.round((lt / this.totalMonthlyDays) * 100);
    this.leavePct = Math.round((l / this.totalMonthlyDays) * 100);
    this.halfDayPct = Math.round((h / this.totalMonthlyDays) * 100);
  }

  loadFilterDropdowns(): void {
    this.loader.start();
    forkJoin({
      depts: this.commonSearchService.getCommonDdl('Department'),
      locs: this.commonSearchService.getLocationdl(),
      months: this.monthlyRentDetailService.getCommanList('Month'),
      years: this.monthlyRentDetailService.getCommanList('Year')
    }).subscribe({
      next: (res: any) => {
        this.loader.stop();

        // Departments
        const deptList = res.depts?.data || res.depts || [];
        this.departments = [{ name: 'All Departments', value: '0' }, ...deptList.map((d: any) => ({
          name: d.name || d.description || d.DepartmentName,
          value: d.value || d.pk_deptid || d.DepartmentId
        }))];

        // Locations (Authorized for User)
        const locList = res.locs?.data || res.locs || [];
        this.locations = [{ name: 'All Locations', value: '0' }, ...locList.map((l: any) => ({
          name: l.name || l.locname || l.LocationName,
          value: l.value || l.pk_locid || l.LocationId
        }))];

        // Months & Years
        this.months = (res.months?.data || []).slice(1);
        this.years = (res.years?.data || []).slice(1);

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const currentDay = new Date().getDate();

        const monthMatch = this.months.find((m: any) => +m.value === currentMonth || m.name?.toString().toUpperCase() === new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()).toUpperCase());
        const yearMatch = this.years.find((y: any) => +y.value === currentYear || y.name?.toString().includes(currentYear.toString()));

        const selMonthId = monthMatch ? monthMatch.value : (this.months[0]?.value || currentMonth);
        const selYearId = yearMatch ? yearMatch.value : (this.years[0]?.value || currentYear);

        this.filterForm.patchValue({
          monthId: selMonthId,
          yearId: selYearId
        }, { emitEvent: false });

        if (+selMonthId === currentMonth && +selYearId === currentYear) {
          this.activeDayFilter = currentDay;
        } else {
          this.activeDayFilter = 0;
        }

        this.updateDateLabels();
        this.updateMonthDaysList();
        this.fetchDashboardData();
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to load filter options');
        this.fetchDashboardData();
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.activeStatusFilter = '';

    const today = new Date();
    const curMonth = today.getMonth() + 1;
    const curYear = today.getFullYear();
    const formVals = this.filterForm.value;

    if (+formVals.monthId === curMonth && +formVals.yearId === curYear) {
      this.activeDayFilter = today.getDate();
    } else {
      this.activeDayFilter = 0;
    }

    this.updateDateLabels();
    this.updateMonthDaysList();
    this.fetchDashboardData();
  }

  getDayFormatted(day: number): string {
    if (!day) return '';
    const dayStr = String(day).padStart(2, '0');
    return `${dayStr} ${this.shortMonthName} ${this.selectedYearName}`;
  }

  onDaySelectChange(val: any): void {
    const day = (typeof val === 'object' && val?.target) ? +val.target.value : +val;
    this.activeDayFilter = day || 0;
    this.currentPage = 1;
    this.fetchDashboardData();
  }

  get currentPayload(): AttendanceDashboardFilterRequest {
    const formVals = this.filterForm.value;
    return {
      fk_DepartmentId: (!formVals.departmentId || formVals.departmentId === '0') ? '' : formVals.departmentId,
      fk_LocationId: (!formVals.locationId || formVals.locationId === '0') ? '' : formVals.locationId,
      fk_MonthId: +formVals.monthId || 0,
      fk_YearId: +formVals.yearId || 0,
      selectedDate: '',
      statusFilter: this.activeStatusFilter,
      dayFilter: this.activeDayFilter,
      searchTerm: this.searchTerm,
      pageNo: this.currentPage,
      pageSize: this.pageSize
    };
  }

  fetchDashboardData(): void {
    this.loader.start();
    const payload = this.currentPayload;

    forkJoin({
      overview: this.attendanceDashboardService.getKPIs(payload),
      grid: this.attendanceDashboardService.getEmployeeGrid(payload)
    }).subscribe({
      next: ({ overview, grid }: any) => {
        this.loader.stop();

        // 1. Overview KPIs & Summary
        const ovData = overview?.data || overview?.Data;
        if (ovData) {
          const rawKpis = ovData.kpIs || ovData.kpis || ovData.KPIs || {};
          this.kpiSummary = {
            totalEmployees: rawKpis.totalEmployees ?? rawKpis.TotalEmployees ?? 0,
            presentCount: rawKpis.presentCount ?? rawKpis.PresentCount ?? 0,
            absentCount: rawKpis.absentCount ?? rawKpis.AbsentCount ?? 0,
            lateCount: rawKpis.lateCount ?? rawKpis.LateCount ?? 0,
            halfDayCount: rawKpis.halfDayCount ?? rawKpis.HalfDayCount ?? 0,
            onLeaveCount: rawKpis.onLeaveCount ?? rawKpis.OnLeaveCount ?? 0,
            avgAttendancePercent: rawKpis.avgAttendancePercent ?? rawKpis.AvgAttendancePercent ?? 0,
            totalPresentDays: rawKpis.totalPresentDays ?? rawKpis.TotalPresentDays ?? 0,
            totalAbsentDays: rawKpis.totalAbsentDays ?? rawKpis.TotalAbsentDays ?? 0,
            totalLateDays: rawKpis.totalLateDays ?? rawKpis.TotalLateDays ?? 0,
            totalHalfDays: rawKpis.totalHalfDays ?? rawKpis.TotalHalfDays ?? 0,
            totalLeaveDays: rawKpis.totalLeaveDays ?? rawKpis.TotalLeaveDays ?? 0
          };

          this.calculatePercentages();
          this.liveHighlights = ovData.liveHighlights || ovData.LiveHighlights || [];
          this.updateDisplayedHighlights();
          this.trendData = ovData.trends || ovData.Trends || [];
        }

        // 2. Employee Grid
        const grData = grid?.data || grid?.Data;
        if (grData) {
          this.employeeList = grData.records || grData.Records || [];
          this.totalRecords = grData.totalRecords ?? grData.TotalRecords ?? 0;
          this.updatePaginationRange();
          this.preloadEmployeeImages(this.employeeList);
        }

        this.cdr.detectChanges();

        // 3. Render Charts safely outside angular change detection
        if (isPlatformBrowser(this.platformId)) {
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.renderDonutChart();
              this.renderTrendChart();
            }, 50);
          });
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to load attendance dashboard');
      }
    });
  }

  fetchEmployeeGrid(): void {
    this.isGridLoading = true;
    this.loader.start();
    const payload = this.currentPayload;
    this.attendanceDashboardService.getEmployeeGrid(payload).subscribe({
      next: (res: any) => {
        this.isGridLoading = false;
        this.loader.stop();
        const grData = res?.data || res?.Data;
        if (grData) {
          this.employeeList = grData.records || grData.Records || [];
          this.totalRecords = grData.totalRecords ?? grData.TotalRecords ?? 0;
          this.updatePaginationRange();
          this.preloadEmployeeImages(this.employeeList);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isGridLoading = false;
        this.loader.stop();
        this.toastr.error('Failed to fetch employee list');
      }
    });
  }

  // ===================== ACTIONABLE DRILL-DOWNS =====================
  toggleStatusFilter(status: string): void {
    this.activeStatusFilter = (this.activeStatusFilter === status) ? '' : status;
    this.currentPage = 1;
    this.fetchEmployeeGrid();
  }

  clearDrillDownFilters(): void {
    this.activeStatusFilter = '';
    this.currentPage = 1;
    this.fetchEmployeeGrid();
  }

  parseDates(dateStr: string): string[] {
    if (!dateStr) return [];
    return dateStr.split(',').map(s => s.trim()).filter(Boolean);
  }

  // ===================== OCCURRENCE DRILLDOWN & MODAL =====================
  selectedEmployeeForOccurrences: any = null;
  employeeOccurrencesList: any[] = [];
  isOccurrencesModalOpen = false;
  isOccurrencesLoading = false;
  occurrenceModalFilter: string = '';

  expandedEmpCodes: { [empCode: string]: boolean } = {};
  expandedEmpOccurrences: { [empCode: string]: any[] } = {};
  expandedEmpLoading: { [empCode: string]: boolean } = {};

  openOccurrencesModal(emp: any, filterStatus: string = ''): void {
    this.selectedEmployeeForOccurrences = emp;
    this.occurrenceModalFilter = filterStatus || this.activeStatusFilter || '';
    this.isOccurrencesModalOpen = true;
    this.isOccurrencesLoading = true;
    this.employeeOccurrencesList = [];

    const monthId = +this.filterForm?.get('monthId')?.value || (new Date().getMonth() + 1);
    const yearId = +this.filterForm?.get('yearId')?.value || (new Date().getFullYear());
    const empCode = emp.empcode || emp.Empcode || '';
    const empId = emp.pk_empid || emp.Pk_empid || '';

    this.attendanceDashboardService.getEmployeeOccurrences(empCode, empId, monthId, yearId, this.occurrenceModalFilter).subscribe({
      next: (res: any) => {
        this.isOccurrencesLoading = false;
        this.employeeOccurrencesList = res?.data || res?.Data || [];
        this.preloadOccurrenceImages(this.employeeOccurrencesList);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isOccurrencesLoading = false;
        this.toastr.error('Failed to load employee occurrence details');
        this.cdr.detectChanges();
      }
    });
  }

  closeOccurrencesModal(): void {
    this.isOccurrencesModalOpen = false;
    this.selectedEmployeeForOccurrences = null;
    this.employeeOccurrencesList = [];
    this.occurrenceModalFilter = '';
  }

  setOccurrenceModalFilter(status: string): void {
    this.occurrenceModalFilter = status;
    if (this.selectedEmployeeForOccurrences) {
      this.openOccurrencesModal(this.selectedEmployeeForOccurrences, status);
    }
  }

  exportOccurrencesPdf(): void {
    if (!this.selectedEmployeeForOccurrences || this.employeeOccurrencesList.length === 0) {
      this.toastr.warning('No occurrence records found to export.');
      return;
    }

    const emp = this.selectedEmployeeForOccurrences;
    const mId = +this.filterForm?.get('monthId')?.value || (new Date().getMonth() + 1);
    const yId = +this.filterForm?.get('yearId')?.value || new Date().getFullYear();

    const payload = {
      empCode: emp.empcode || emp.Empcode || '',
      empId: emp.pk_empid || emp.Pk_empid || emp.fk_empid || emp.empid || '',
      empName: emp.empname || emp.Empname || 'Employee',
      department: emp.department || emp.Department || '-',
      monthId: mId,
      yearId: yId,
      monthName: this.selectedMonthName,
      statusFilter: this.occurrenceModalFilter || '',
      items: this.employeeOccurrencesList || []
    };

    this.attendanceDashboardService.exportOccurrencesPdf(payload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeEmpCode = (payload.empCode || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
        const safeMonth = this.selectedMonthName.replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = 'Attendance_Report_' + safeEmpCode + '_' + safeMonth + '_' + this.selectedYearName + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastr.success('PDF exported successfully.');
      },
      error: (err: any) => {
        console.error('Failed to export occurrences PDF', err);
        this.toastr.error('Failed to export PDF. Please try again.');
      }
    });
  }

  toggleRowExpansion(emp: any): void {
    const empCode = emp.empcode || emp.Empcode;
    if (!empCode) return;

    this.expandedEmpCodes[empCode] = !this.expandedEmpCodes[empCode];
    if (this.expandedEmpCodes[empCode] && !this.expandedEmpOccurrences[empCode]) {
      this.loadRowOccurrences(emp);
    }
  }

  loadRowOccurrences(emp: any): void {
    const empCode = emp.empcode || emp.Empcode || '';
    const empId = emp.pk_empid || emp.Pk_empid || '';
    const monthId = +this.filterForm?.get('monthId')?.value || (new Date().getMonth() + 1);
    const yearId = +this.filterForm?.get('yearId')?.value || (new Date().getFullYear());
    const filterStatus = this.activeStatusFilter || '';

    this.expandedEmpLoading[empCode] = true;
    this.attendanceDashboardService.getEmployeeOccurrences(empCode, empId, monthId, yearId, filterStatus).subscribe({
      next: (res: any) => {
        this.expandedEmpLoading[empCode] = false;
        this.expandedEmpOccurrences[empCode] = res?.data || res?.Data || [];
        this.preloadOccurrenceImages(this.expandedEmpOccurrences[empCode]);
        this.cdr.detectChanges();
      },
      error: () => {
        this.expandedEmpLoading[empCode] = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDayBadgeClick(dateStr: string, emp?: any, status?: string): void {
    if (emp) {
      this.openOccurrencesModal(emp, status || this.activeStatusFilter || '');
      return;
    }
    if (!dateStr) return;
    const match = dateStr.match(/^(\d{1,2})/);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      if (dayNum > 0 && dayNum <= 31) {
        this.onDaySelectChange(dayNum);
      }
    }
  }

  // ===================== CHARTS IMPLEMENTATION =====================
  private renderDonutChart(): void {
    const canvas = document.getElementById('todayAttendanceDonut') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.donutChart) {
      this.donutChart.destroy();
      this.donutChart = null;
    }

    const isDayView = this.activeDayFilter > 0;
    const present = isDayView ? (this.kpiSummary.presentCount || 0) : (this.kpiSummary.totalPresentDays || 0);
    const absent = isDayView ? (this.kpiSummary.absentCount || 0) : (this.kpiSummary.totalAbsentDays || 0);
    const late = isDayView ? (this.kpiSummary.lateCount || 0) : (this.kpiSummary.totalLateDays || 0);
    const halfDay = isDayView ? (this.kpiSummary.halfDayCount || 0) : (this.kpiSummary.totalHalfDays || 0);
    const leave = isDayView ? (this.kpiSummary.onLeaveCount || 0) : (this.kpiSummary.totalLeaveDays || 0);

    const dataValues = [present, absent, late, halfDay, leave];

    this.donutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent', 'Late Coming', 'Half Day', 'On Leave'],
        datasets: [{
          data: dataValues,
          backgroundColor: ['#28a745', '#dc3545', '#fd7e14', '#6f42c1', '#0dcaf0'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = dataValues.reduce((a, b) => a + b, 0) || 1;
                const val = ctx.parsed || 0;
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${val} (${pct}%)`;
              }
            }
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const labels = ['Present', 'Absent', 'Late', 'Half Day', 'Leave'];
            this.ngZone.run(() => {
              this.toggleStatusFilter(labels[idx]);
            });
          }
        },
        animation: false
      }
    });
  }

  private renderTrendChart(): void {
    const canvas = document.getElementById('dailyAttendanceTrend') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }

    const dataToDisplay = this.trendData || [];
    const labels = dataToDisplay.map(t => {
      const day = t.day || t.Day;
      const dayStr = String(day).padStart(2, '0');
      return `${dayStr} ${this.shortMonthName}`;
    });
    const dayNumbers = dataToDisplay.map(t => t.day || t.Day);
    const presentSeries = dataToDisplay.map(t => t.present || t.Present || 0);
    const absentSeries = dataToDisplay.map(t => t.absent || t.Absent || 0);
    const lateSeries = dataToDisplay.map(t => t.late || t.Late || 0);
    const halfDaySeries = dataToDisplay.map(t => t.halfDay || t.HalfDay || 0);
    const leaveSeries = dataToDisplay.map(t => t.leave || t.Leave || 0);

    const isDaySelected = this.activeDayFilter > 0;

    this.trendChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: 'Present',
            data: presentSeries,
            borderColor: '#28a745',
            backgroundColor: '#28a745',
            borderWidth: 2,
            pointRadius: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? 7 : 3;
            },
            pointHoverRadius: 6,
            pointBackgroundColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#3080e8' : '#28a745';
            },
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            tension: 0.3
          },
          {
            type: 'bar',
            label: 'Absent',
            data: absentSeries,
            backgroundColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#dc3545' : (isDaySelected ? 'rgba(220, 53, 69, 0.45)' : '#dc3545');
            },
            borderColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#111827' : 'transparent';
            },
            borderWidth: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? 2 : 0;
            },
            borderRadius: 2
          },
          {
            type: 'bar',
            label: 'Late',
            data: lateSeries,
            backgroundColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#fd7e14' : (isDaySelected ? 'rgba(253, 126, 20, 0.45)' : '#fd7e14');
            },
            borderColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#111827' : 'transparent';
            },
            borderWidth: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? 2 : 0;
            },
            borderRadius: 2
          },
          {
            type: 'bar',
            label: 'Half Day',
            data: halfDaySeries,
            backgroundColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#6f42c1' : (isDaySelected ? 'rgba(111, 66, 193, 0.45)' : '#6f42c1');
            },
            borderColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#111827' : 'transparent';
            },
            borderWidth: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? 2 : 0;
            },
            borderRadius: 2
          },
          {
            type: 'bar',
            label: 'On Leave',
            data: leaveSeries,
            backgroundColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#0dcaf0' : (isDaySelected ? 'rgba(13, 202, 240, 0.45)' : '#0dcaf0');
            },
            borderColor: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? '#111827' : 'transparent';
            },
            borderWidth: (ctx: any) => {
              const day = dayNumbers[ctx.dataIndex];
              return isDaySelected && day === this.activeDayFilter ? 2 : 0;
            },
            borderRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: (ctx: any) => {
                const day = dayNumbers[ctx.index];
                return {
                  size: 9,
                  weight: (isDaySelected && day === this.activeDayFilter ? 'bold' : 'normal') as any
                };
              },
              color: (ctx: any) => {
                const day = dayNumbers[ctx.index];
                return isDaySelected && day === this.activeDayFilter ? '#3080e8' : '#6c757d';
              },
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 10 }, precision: 0 }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              title: (items: any) => {
                const idx = items[0].dataIndex;
                const d = dataToDisplay[idx];
                const day = dayNumbers[idx];
                const isCur = day === this.activeDayFilter;
                return `${d?.date || labels[idx]} ${isCur ? '(Selected Ã¢â‚¬â€ Click to reset)' : 'Ã¢â‚¬â€ Click to filter'}`;
              }
            }
          }
        },
        onHover: (event: any) => {
          if (event?.native?.target) {
            (event.native.target as HTMLElement).style.cursor = 'pointer';
          }
        },
        onClick: (event: any, elements: any, chart: any) => {
          let targetIndex = -1;
          let clickedStatus = '';

          if (elements && elements.length > 0) {
            targetIndex = elements[0].index;
            const dsIndex = elements[0].datasetIndex;
            const statusMap = ['Present', 'Absent', 'Late', 'Half Day', 'Leave'];
            if (dsIndex >= 0 && dsIndex < statusMap.length) {
              clickedStatus = statusMap[dsIndex];
            }
          } else if (chart) {
            // 1. Try index mode event matching
            const nativeEvt = event.native || event;
            const pts = chart.getElementsAtEventForMode(nativeEvt, 'index', { intersect: false }, false);
            if (pts && pts.length > 0) {
              targetIndex = pts[0].index;
              const dsIndex = pts[0].datasetIndex;
              const statusMap = ['Present', 'Absent', 'Late', 'Half Day', 'Leave'];
              if (dsIndex >= 0 && dsIndex < statusMap.length) {
                clickedStatus = statusMap[dsIndex];
              }
            } else {
              // 2. Scale coordinate matching (directly maps X-axis date labels)
              const xScale = chart.scales['x'];
              const rect = chart.canvas.getBoundingClientRect();
              const clickX = event.x ?? (nativeEvt.clientX != null ? (nativeEvt.clientX - rect.left) : nativeEvt.offsetX);
              if (xScale && clickX != null) {
                const idx = xScale.getValueForPixel(clickX);
                if (idx != null && idx >= 0 && idx < dayNumbers.length) {
                  targetIndex = Math.round(idx);
                }
              }
            }
          }

          if (targetIndex >= 0 && targetIndex < dayNumbers.length) {
            const clickedDay = dayNumbers[targetIndex];
            this.ngZone.run(() => {
              if (clickedStatus) {
                this.activeDayFilter = clickedDay;
                this.activeStatusFilter = (this.activeStatusFilter === clickedStatus && this.activeDayFilter === clickedDay) ? '' : clickedStatus;
              } else {
                const nextDay = (this.activeDayFilter === clickedDay) ? 0 : clickedDay;
                this.activeDayFilter = nextDay;
              }
              this.currentPage = 1;
              this.fetchDashboardData();
            });
          }
        },
        animation: false
      }
    });
  }

  // ===================== PAGINATION =====================
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginationRange();
    this.fetchEmployeeGrid();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginationRange();
      this.fetchEmployeeGrid();
    }
  }

  trackByDay(index: number, item: any): number {
    return item.day;
  }

  trackByEmp(index: number, item: any): any {
    return item.empcode || item.Empcode || index;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }

  // ===================== LIVE HIGHLIGHTS CONTROLS =====================
  highlightCurrentPage = 1;
  highlightPageSize = 5;
  highlightTotalPages = 1;
  highlightPaginationRange: number[] = [];
  paginatedHighlights: any[] = [];

  setHighlightTab(tab: string): void {
    this.activeHighlightTab = tab;
    this.highlightCurrentPage = 1;
    this.updateDisplayedHighlights();
  }

  updateDisplayedHighlights(): void {
    if (this.activeHighlightTab === 'all') {
      this.displayedHighlights = this.liveHighlights;
    } else {
      this.displayedHighlights = this.liveHighlights.filter(h => (h.type || h.Type) === this.activeHighlightTab);
    }
    this.updateHighlightPagination();
  }

  updateHighlightPagination(): void {
    this.highlightTotalPages = Math.ceil(this.displayedHighlights.length / this.highlightPageSize) || 1;
    const pages: number[] = [];
    for (let i = 1; i <= this.highlightTotalPages; i++) {
      pages.push(i);
    }
    this.highlightPaginationRange = pages;
    this.updatePaginatedHighlights();
  }

  updatePaginatedHighlights(): void {
    const start = (this.highlightCurrentPage - 1) * this.highlightPageSize;
    this.paginatedHighlights = this.displayedHighlights.slice(start, start + this.highlightPageSize);
  }

  goToHighlightPage(page: number): void {
    if (page >= 1 && page <= this.highlightTotalPages && page !== this.highlightCurrentPage) {
      this.highlightCurrentPage = page;
      this.updatePaginatedHighlights();
    }
  }

  get lateHighlightsCount(): number {
    return this.liveHighlights.filter(h => (h.type || h.Type) === 'Late').length;
  }

  get leaveHighlightsCount(): number {
    return this.liveHighlights.filter(h => (h.type || h.Type) === 'Leave').length;
  }

  get halfDayHighlightsCount(): number {
    return this.liveHighlights.filter(h => (h.type || h.Type) === 'HalfDay').length;
  }

  get mobileHighlightsCount(): number {
    return this.liveHighlights.filter(h => (h.type || h.Type) === 'Mobile').length;
  }

  trackByHighlight(index: number, item: any): any {
    return (item.empCode || item.EmpCode) + '_' + index;
  }

  // ===================== SELFIE MODAL =====================
  openSelfieModal(emp: any, type: 'both' | 'in' | 'out' = 'both'): void {
    this.selectedEmployeeForModal = emp;
    this.selectedSelfieType = type;
    this.isSelfieModalOpen = true;

    const inImg = emp.punchInImageUrl || emp.PunchInImageUrl || emp.punchImageUrl || emp.PunchImageUrl || emp.in_image_path;
    const outImg = emp.punchOutImageUrl || emp.PunchOutImageUrl || emp.out_image_path;
    if (inImg) this.loadSelfieBlob(inImg.split(/[\\/]/).pop() || inImg);
    if (outImg) this.loadSelfieBlob(outImg.split(/[\\/]/).pop() || outImg);
  }

  closeSelfieModal(): void {
    this.isSelfieModalOpen = false;
    this.selectedEmployeeForModal = null;
    this.selectedSelfieType = 'both';
  }

  formatTimeWithSeconds(timeStr: string): string {
    if (!timeStr) return '';
    const clean = timeStr.trim();
    if (/^\d{1,2}:\d{2}$/.test(clean)) {
      return `${clean}:00`;
    }
    return clean;
  }

  formatLateDetails(details: string): string {
    if (!details) return 'Late';
    const clean = details.trim();
    if (clean.toLowerCase().startsWith('late by ')) {
      const timePart = clean.substring(8).trim();
      return `Late by ${this.formatTimeWithSeconds(timePart)}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(clean)) {
      return `Late by ${this.formatTimeWithSeconds(clean)}`;
    }
    return clean;
  }

  // Authenticated Image Blob Cache
  selfieBlobUrls: { [key: string]: string } = {};
  private loadingSelfies = new Set<string>();

  getSelfieUrl(filename: string | null | undefined): string {
    if (!filename) return 'assets/img/user.png';

    const cleanName = filename.split(/[\\/]/).pop() || filename;
    if (this.selfieBlobUrls[cleanName]) {
      return this.selfieBlobUrls[cleanName];
    }

    this.loadSelfieBlob(cleanName);
    return 'assets/img/user.png';
  }

  loadSelfieBlob(cleanName: string): void {
    if (!cleanName || this.loadingSelfies.has(cleanName)) return;
    this.loadingSelfies.add(cleanName);

    this.attendanceDashboardService.getImage(cleanName).subscribe({
      next: (blob: Blob) => {
        if (blob && !blob.type.includes('application/json')) {
          this.selfieBlobUrls[cleanName] = URL.createObjectURL(blob);
          this.cdr.detectChanges();
        } else {
          this.selfieBlobUrls[cleanName] = 'assets/img/user.png';
        }
      },
      error: () => {
        this.selfieBlobUrls[cleanName] = 'assets/img/user.png';
      }
    });
  }

  private preloadEmployeeImages(list: any[]): void {
    if (!list || !list.length) return;
    list.forEach(emp => {
      const inImg = emp.punchInImageUrl || emp.PunchInImageUrl || emp.punchImageUrl || emp.PunchImageUrl || emp.in_image_path;
      const outImg = emp.punchOutImageUrl || emp.PunchOutImageUrl || emp.out_image_path;
      if (inImg) {
        const clean = inImg.split(/[\\/]/).pop() || inImg;
        this.loadSelfieBlob(clean);
      }
      if (outImg) {
        const clean = outImg.split(/[\\/]/).pop() || outImg;
        this.loadSelfieBlob(clean);
      }
    });
  }

  private preloadOccurrenceImages(list: any[]): void {
    if (!list || !list.length) return;
    list.forEach(occ => {
      const inImg = occ.punchInImageUrl || occ.PunchInImageUrl;
      const outImg = occ.punchOutImageUrl || occ.PunchOutImageUrl;
      if (inImg) {
        const clean = inImg.split(/[\\/]/).pop() || inImg;
        this.loadSelfieBlob(clean);
      }
      if (outImg) {
        const clean = outImg.split(/[\\/]/).pop() || outImg;
        this.loadSelfieBlob(clean);
      }
    });
  }

  avatarColor(name: string): string {
    const colors = [
      'bg-primary text-white',
      'bg-success text-white',
      'bg-warning text-dark',
      'bg-info text-white',
      'bg-danger text-white'
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  // ===================== EXPORT TO EXCEL =====================
  exportToExcel(): void {
    this.loader.start();
    const payload = this.currentPayload;
    this.attendanceDashboardService.exportToExcel(payload).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `Attendance_Report_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastr.success('Attendance report exported with photos successfully.');
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to export attendance report');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.donutChart) {
      this.donutChart.destroy();
      this.donutChart = null;
    }
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    Object.values(this.selfieBlobUrls).forEach(url => {
      if (url && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch { }
      }
    });
  }
}