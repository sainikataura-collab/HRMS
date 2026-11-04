declare const html2pdf: any;
declare var bootstrap: any;
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { WorkflowNavigationService } from '../../../../../shared/services/workflow-navigation.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import { convertAmountToWordsIndian } from '../../../../../healpers/commonlib';
import { HttpErrorResponse } from '@angular/common/http';
import { CompanyConfig } from '../../../../../on_boarding/services/company-config.service';
import { CompanyParameterService } from '../../services/company-parameter.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { WorkflowSidebarComponent } from '../../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

Chart.register(...registerables);

@Component({
  selector: 'app-export-excel',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, WorkflowSidebarComponent],
  templateUrl: './export-excel.component.html',
  styleUrl: './export-excel.component.scss'
})
export class ExportExcelComponent implements OnDestroy {
  combinedData: any[] = [];
  ExportExcel!: FormGroup;
  isExporting = false;
  isCapturingImage = false;
  searchText: string = "";
  submitted = false;
  showError = false;
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  showEmployeeList: boolean = false;
  EmployeeList: any[] = []
  EmployeeListExcle: any[] = [];
  months: any[] = [];
  years: any[] = [];
  // CostCenter=[]
  CostCenter: { name: string; value: string | null }[] = [];
  selectedCostCenters: string[] = [];
  tableHeaders: string[] = [];
  isContractApplicable = false;
  activeTab: 'report' | 'comparison' = 'report';

  // Comparison Tab State
  comparisonList: any[] = [];
  comparisonHeaders: string[] = [];
  comparisonTotalCount: number = 0;
  pageIndexComp: number = 1;
  pageSizeComp: number = 10;
  searchTextComp: string = '';
  isExportingComp: boolean = false;
  showComparisonList: boolean = false;
  isViewTriggered: boolean = false;

  // Comparison Dashboard Summary & Charts
  compSummary = {
    currGross: 0,
    prevGross: 0,
    diffGross: 0,
    pctGross: 0,
    currNet: 0,
    prevNet: 0,
    diffNet: 0,
    pctNet: 0,
    currDeductions: 0,
    prevDeductions: 0,
    diffDeductions: 0,
    pctDeductions: 0,
    totalEmployees: 0,
    increasedCount: 0,
    decreasedCount: 0,
    unchangedCount: 0
  };
  private compPieChartInstance: any = null;
  private compBarChartInstance: any = null;

  ExportTypelist = [
    //{name: '--select Grade --', Value:0},
    //{name:'Employee Details',value:0},
    { name: 'Employees Salary', value: 2 },
    { name: 'Bank Salary Statement', value: 1 },
    { name: 'New Joinees Salary', value: 3 },
    { name: 'Left Employees Salary', value: 4 },
    { name: 'Stoped Salary Details', value: 9 },
    { name: 'Pay Stoped Salary Details', value: 10 },
    { name: 'OT Statement', value: 31 },
    { name: 'Monthly PF Statement', value: 5 },
    { name: 'Monthly ESI Statement', value: 6 },
    { name: 'Monthly LWF Statement', value: 11 },
    { name: 'Monthly Prof. Tax Statement', value: 12 },
    //{ name: 'Monthly Loan/Advance Details', value: 13 },
    // {name:'Employee Increment Details',value:8},
    // { name: 'Monthly Salary Slip', value: 35 },
    //added code PP 17AUG2025
    { name: 'Monthly PF Challan', value: 36 },
    { name: 'Monthly ESI Challan', value: 37 },
    // {name:'Monthly LWF Challan',value:38},
    { name: 'PF Form  10', value: 39 },
    { name: 'PF Form  5', value: 40 },
    { name: 'PF Form 12A', value: 41 },
    { name: 'Muster Roll Form A', value: 51 },
    { name: 'Form D', value: 52 },
    // { name: 'PF Statement Detail', value: 42 },
    // { name: 'ESI Statement Detail', value: 43 },
    { name: 'Bonus Statement', value: 50 },
    { name: 'LTA Statement', value: 55 },
    { name: 'Incentive Statement', value: 56 },

    //{ name: 'NAV Account Posting', value: 53 },
    { name: 'Gratuity', value: 54 },

    { name: 'Leave Encashment Statement', value: 27 },
    { name: 'Arrear  Statement', value: 57 }
  ];

  previewPdfUrl: SafeResourceUrl | null = null; // Stores sanitized blob URL with params for iframe
previewBlobUrl: string = '';                  // Stores raw blob URL for cleanup/revocation

  SalTransfer = [
    { name: 'All', value: "A" },
    { name: 'Bank', value: "B" },
    { name: 'Cash', value: "C" },
    { name: 'Stop', value: "S" }
  ];


  companyLogo: String =
    'assets/Image/Logo/empower.jpg';

  // Origin tracking for smart return
  returnUrl: string = '';
  returnLabel: string = '';

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public workflowNav: WorkflowNavigationService,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio,
    private service: CompanyParameterService, private sanitizer: DomSanitizer
) { }

  get isEmployeeSalarySelected(): boolean {
    const exportType = this.ExportExcel?.get('ExportType')?.value;
    return exportType !== null && exportType !== undefined && Number(exportType) === 2;
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      this.returnLabel = params['returnLabel'] || '';
    });
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.ExportExcel = this.fb.group({
      empCode: [''],
      fk_monthId: [null],
      fk_yearId: [null],
      fk_costcentreid: [[]],
      EmplyeeType: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      ExportType: [null],
      SalTransfer: ['A']
    });

    this.ExportExcel.get('ExportType')?.valueChanges.subscribe((val) => {
      this.isViewTriggered = false;
      this.activeTab = 'report';
      this.comparisonList = [];
      this.showComparisonList = false;
      this.EmployeeList = [];
      this.showEmployeeList = false;
    });

    this.ngxUILoaderService.start();
    forkJoin([
      this.commanService.getCommanList('month'),
      this.commanService.getCommanList('Year'),
      this.commanService.getCommanList('CostCenter')
    ]).subscribe({
      next: ([monthRes, yearRes, costCenterRes]) => {
        this.months = monthRes?.data?.slice(1) || [];
        this.years = yearRes?.data?.slice(1) || [];
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...(costCenterRes?.data?.slice(1) || [])
        ];
        this.ngxUILoaderService.stop();

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        if (this.workflowNav.applyContextIfFromWorkflow(this.ExportExcel, this.months, this.years, this.CostCenter)) {
          const cc = this.ExportExcel.get('fk_costcentreid')?.value;
          if (Array.isArray(cc)) {
            this.selectedCostCenters = [...cc];
          }
        }
      },
      error: () => {
        this.ngxUILoaderService.stop();
      }
    });
  }

  getPayrollContext = () => ({
    month: this.ExportExcel.get('fk_monthId')?.value,
    year: this.ExportExcel.get('fk_yearId')?.value,
    costCentre: this.ExportExcel.get('fk_costcentreid')?.value
  });

  getMonthsList() {
    this.commanService.getCommanList('month').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.months = res.data

      }
    })
  }
  getyearsList() {
    this.commanService.getCommanList('Year').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.years = res.data
      }
    })
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...res.data.slice(1)
        ];
      }
    })
  }


  // added new pp 3/9/2025

  get isPdfExport(): boolean {
    return this.ExportExcel?.value?.ExportType === 2;
  }
  restfrom() {
    this.EmployeeList = [];
    this.comparisonList = [];
    this.showEmployeeList = false;
    this.showComparisonList = false;
    this.activeTab = 'report';
    this.isViewTriggered = false;
  }

  setTab(tab: 'report' | 'comparison') {
    this.activeTab = tab;
    if (tab === 'comparison') {
      if (this.comparisonList.length === 0 && this.ExportExcel.get('fk_monthId')?.value && this.ExportExcel.get('fk_yearId')?.value) {
        this.pageIndexComp = 1;
        this.loadComparisonData();
      } else if (this.comparisonList.length > 0) {
        setTimeout(() => this.initComparisonCharts(), 150);
      }
    }
  }
  // Handle filter updates from common search
  handleFilters(filters: any) {

    this.ExportExcel.patchValue(filters);
  }
  filteredData() {
    if (!this.searchText) {
      return this.EmployeeList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.EmployeeList.filter(res =>
      res.EmpCode?.toLowerCase().includes(searchTextLower) ||
      res.EmpName?.toLowerCase().includes(searchTextLower) ||
      res.Code?.toLowerCase().includes(searchTextLower) ||
      res.Name?.toLowerCase().includes(searchTextLower) ||
      res.Branch?.toLowerCase().includes(searchTextLower) ||
      res.zoneDescription?.toLowerCase().includes(searchTextLower) ||
      res.Department?.toLowerCase().includes(searchTextLower) ||
      res.Designation?.toLowerCase().includes(searchTextLower),);
  }


  isNumeric(val: any): boolean {
    if (val === null || val === undefined || val === '') return false;
    return !isNaN(Number(val));
  }

  isAmountColumn(col: string): boolean {
    if (!col) return false;
    const amountCols = [
      'RateGross', 'EarnGross', 'GrossTotal', 'NetPay', 'TotalDeductions', 
      'PF', 'ESI', 'LWF', 'ProfTax', 'IT', 'OT', 'NHAmt', 'Basic', 'HRA', 'DA', 'Conveyance'
    ];
    return amountCols.includes(col) || col.toLowerCase().includes('gross') || col.toLowerCase().includes('pay') || col.toLowerCase().includes('amt') || col.toLowerCase().includes('deduction');
  }

  getDiffValue(item: any, col: string): number {
    if (!item || !col) return 0;
    const diffCol = col.startsWith('Diff_') ? col : 'Diff_' + col;
    if (item[diffCol] !== undefined && item[diffCol] !== null && item[diffCol] !== '') {
      return parseFloat(item[diffCol]) || 0;
    }
    return 0;
  }

  hasDiff(item: any, col: string): boolean {
    if (!item || !col) return false;
    const diffCol = col.startsWith('Diff_') ? col : 'Diff_' + col;
    return item[diffCol] !== undefined && item[diffCol] !== null && item[diffCol] !== '' && !isNaN(parseFloat(item[diffCol]));
  }

  formatColumnHeader(col: string): string {
    if (!col) return '';
    const map: { [key: string]: string } = {
      'EmpCode': 'Emp Code',
      'empcode': 'Emp Code',
      'EmpName': 'Emp Name',
      'empname': 'Emp Name',
      'RateGross': 'Rate Gross',
      'EarnGross': 'Earn Gross',
      'GrossTotal': 'Gross Total',
      'PF': 'PF',
      'VolPF': 'Vol PF',
      'ESI': 'ESI',
      'LWF': 'LWF',
      'ProfTax': 'Prof Tax',
      'IT': 'IT',
      'OT': 'OT',
      'OTHrs': 'OT Hrs',
      'NHAmt': 'NH Amt',
      'DoubleNH': 'Double NH',
      'LWP': 'LWP',
      'PaidDays': 'Paid Days',
      'PresentDays': 'Present Days',
      'WeeklyOff': 'Weekly Off',
      'Holiday': 'Holiday',
      'TotalDeductions': 'Total Deductions',
      'NetPay': 'Net Pay',
      'SalTransfer': 'Sal Transfer',
      'BankAccNo': 'Bank Acc No',
      'BankName': 'Bank Name',
      'IFSCCode': 'IFSC Code'
    };
    if (map[col]) return map[col];

    return col.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim();
  }

  onpagechange(event: number): void {
    debugger
    this.pageIndex = event;
    this.OnVeiw();
  }

  OnSubmit() {
    this.isViewTriggered = true;
    if (this.activeTab === 'comparison' && this.isEmployeeSalarySelected) {
      this.pageIndexComp = 1;
      this.comparisonTotalCount = 0;
      this.loadComparisonData();
    } else {
      this.pageIndex = 1;
      this.totalCount = 0;
      this.OnVeiw();
    }
  }

  loadComparisonData() {
    if (!this.ExportExcel.get('fk_monthId')?.value || !this.ExportExcel.get('fk_yearId')?.value) {
      this.toastrService.warning('Please select Month and Year to view Comparison Sheet.');
      this.isViewTriggered = false;
      return;
    }

    this.ngxUILoaderService.start();

    const payload = {
      ...this.ExportExcel.value,
      ExportType: 58, // Salary Comparison Sheet
      pageIndex: 0,
      pageSize: 10000
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.Export_Employeelist(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.comparisonList = res.data || [];
          this.comparisonTotalCount = this.comparisonList.length;
          this.comparisonHeaders = this.comparisonList.length > 0 
            ? Object.keys(this.comparisonList[0]).filter(k => !k.startsWith('Diff_') && !k.startsWith('Diff ')) 
            : [];
          this.calculateComparisonSummary(this.comparisonList);
          this.showComparisonList = true;
        } else {
          this.comparisonList = [];
          this.comparisonHeaders = [];
          this.comparisonTotalCount = 0;
          this.showComparisonList = false;
          this.resetComparisonSummary();
          this.toastrService.info(res.message);
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('Failed to retrieve comparison data', error);
      }
    });
  }

  calculateComparisonSummary(data: any[]): void {
    let currGross = 0;
    let prevGross = 0;
    let diffGross = 0;

    let currNet = 0;
    let prevNet = 0;
    let diffNet = 0;

    let currDeductions = 0;
    let prevDeductions = 0;
    let diffDeductions = 0;

    let increasedCount = 0;
    let decreasedCount = 0;
    let unchangedCount = 0;

    data.forEach(item => {
      const g = parseFloat(item.GrossTotal) || 0;
      const dg = parseFloat(item.Diff_GrossTotal) || 0;
      currGross += g;
      diffGross += dg;
      prevGross += (g - dg);

      const n = parseFloat(item.NetPay) || 0;
      const dn = parseFloat(item.Diff_NetPay) || 0;
      currNet += n;
      diffNet += dn;
      prevNet += (n - dn);

      const d = parseFloat(item.TotalDeductions) || 0;
      const dd = parseFloat(item.Diff_TotalDeductions) || 0;
      currDeductions += d;
      diffDeductions += dd;
      prevDeductions += (d - dd);

      if (dn > 0 || (dn === 0 && dg > 0)) {
        increasedCount++;
      } else if (dn < 0 || (dn === 0 && dg < 0)) {
        decreasedCount++;
      } else {
        unchangedCount++;
      }
    });

    const pctGross = prevGross !== 0 ? ((diffGross / Math.abs(prevGross)) * 100) : 0;
    const pctNet = prevNet !== 0 ? ((diffNet / Math.abs(prevNet)) * 100) : 0;
    const pctDeductions = prevDeductions !== 0 ? ((diffDeductions / Math.abs(prevDeductions)) * 100) : 0;

    this.compSummary = {
      currGross,
      prevGross,
      diffGross,
      pctGross,
      currNet,
      prevNet,
      diffNet,
      pctNet,
      currDeductions,
      prevDeductions,
      diffDeductions,
      pctDeductions,
      totalEmployees: data.length,
      increasedCount,
      decreasedCount,
      unchangedCount
    };

    setTimeout(() => {
      this.initComparisonCharts();
    }, 200);
  }

  resetComparisonSummary(): void {
    this.compSummary = {
      currGross: 0,
      prevGross: 0,
      diffGross: 0,
      pctGross: 0,
      currNet: 0,
      prevNet: 0,
      diffNet: 0,
      pctNet: 0,
      currDeductions: 0,
      prevDeductions: 0,
      diffDeductions: 0,
      pctDeductions: 0,
      totalEmployees: 0,
      increasedCount: 0,
      decreasedCount: 0,
      unchangedCount: 0
    };
    if (this.compPieChartInstance) {
      this.compPieChartInstance.destroy();
      this.compPieChartInstance = null;
    }
    if (this.compBarChartInstance) {
      this.compBarChartInstance.destroy();
      this.compBarChartInstance = null;
    }
  }

  initComparisonCharts(): void {
    if (this.compPieChartInstance) {
      this.compPieChartInstance.destroy();
      this.compPieChartInstance = null;
    }
    if (this.compBarChartInstance) {
      this.compBarChartInstance.destroy();
      this.compBarChartInstance = null;
    }

    const pieCanvas = document.getElementById('compPieChartCanvas') as HTMLCanvasElement;
    if (pieCanvas && (this.compSummary.increasedCount > 0 || this.compSummary.decreasedCount > 0)) {
      const data = [
        this.compSummary.increasedCount,
        this.compSummary.decreasedCount
      ];
      const total = data.reduce((s, v) => s + v, 0);

      this.compPieChartInstance = new Chart(pieCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Salary Increased', 'Salary Decreased'],
          datasets: [{
            data: data,
            backgroundColor: ['#54ca68', '#e35b5d'],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const val = ctx.parsed || 0;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                  return ` ${ctx.label}: ${val} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    const barCanvas = document.getElementById('compBarChartCanvas') as HTMLCanvasElement;
    if (barCanvas && this.compSummary.totalEmployees > 0) {
      this.compBarChartInstance = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: ['Gross Salary', 'Total Deductions', 'Net In-Hand'],
          datasets: [
            {
              label: 'Current Month',
              data: [
                this.compSummary.currGross,
                this.compSummary.currDeductions,
                this.compSummary.currNet
              ],
              backgroundColor: '#3080e8',
              borderRadius: 3,
              maxBarThickness: 32
            },
            {
              label: 'Previous Month',
              data: [
                this.compSummary.prevGross,
                this.compSummary.prevDeductions,
                this.compSummary.prevNet
              ],
              backgroundColor: '#adb5bd',
              borderRadius: 3,
              maxBarThickness: 32
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val: any) => {
                  if (val >= 10000000) return '₹' + (val / 10000000).toFixed(1) + 'Cr';
                  if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
                  if (val >= 1000) return '₹' + (val / 1000).toFixed(1) + 'k';
                  return '₹' + val;
                },
                font: { size: 10 }
              },
              grid: {
                color: '#f1f5f9'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: { size: 11, weight: 'bold' }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const val = ctx.parsed.y || 0;
                  return ` ${ctx.dataset.label}: ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
              }
            }
          }
        }
      });
    }
  }

  onpagechangeComp(event: number): void {
    this.pageIndexComp = event;
  }

  filteredComparisonData(): any[] {
    if (!this.searchTextComp) {
      return this.comparisonList;
    }
    const search = this.searchTextComp.toLowerCase();
    return this.comparisonList.filter(row =>
      Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(search)
      )
    );
  }

  ngOnDestroy(): void {
    if (this.compPieChartInstance) {
      this.compPieChartInstance.destroy();
    }
    if (this.compBarChartInstance) {
      this.compBarChartInstance.destroy();
    }
  }

  async captureFullPageAsImage(): Promise<void> {
    if (this.isCapturingImage) return;

    const element = document.getElementById('salaryReportFullPageContainer');
    if (!element) {
      this.toastrService.error('Report container element not found');
      return;
    }

    this.isCapturingImage = true;
    this.toastrService.info('Generating image snapshot...', 'Please Wait');

    try {
      // Small pause to ensure UI repaint settles
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 5000,
        ignoreElements: (el) => {
          return el.classList?.contains('ngx-ui-loader') || 
                 el.classList?.contains('modal') || 
                 el.classList?.contains('modal-backdrop');
        },
        onclone: (clonedDoc, clonedEl) => {
          // Copy Chart.js canvases from original DOM to cloned DOM
          const origCanvases = element.querySelectorAll('canvas');
          const clonedCanvases = clonedEl.querySelectorAll('canvas');
          origCanvases.forEach((origCanvas: HTMLCanvasElement, idx: number) => {
            const clonedCanvas = clonedCanvases[idx] as HTMLCanvasElement;
            if (clonedCanvas && origCanvas.width > 0 && origCanvas.height > 0) {
              clonedCanvas.width = origCanvas.width;
              clonedCanvas.height = origCanvas.height;
              const ctx = clonedCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(origCanvas, 0, 0);
              }
            }
          });
        }
      });

      const selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
      const monthName = this.months.find(m => m.value === selectedMonthId)?.name || 'Month';
      const selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
      const yearName = this.years.find(y => y.value === selectedYearId)?.name || 'Year';
      const viewMode = this.activeTab === 'comparison' ? 'Salary_Comparison_Sheet' : 'Salary_Report';
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `${viewMode}_${monthName}_${yearName}_${timestamp}.png`;

      // Use FileSaver with Blob to reliably trigger browser file download to Downloads folder
      await new Promise<void>((resolve, reject) => {
        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (blob) {
              FileSaver.saveAs(blob, fileName);
              this.toastrService.success('Snapshot saved to Downloads folder!');
              resolve();
            } else {
              try {
                const dataUrl = canvas.toDataURL('image/png');
                const byteString = atob(dataUrl.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }
                const fallbackBlob = new Blob([ab], { type: 'image/png' });
                FileSaver.saveAs(fallbackBlob, fileName);
                this.toastrService.success('Snapshot saved to Downloads folder!');
                resolve();
              } catch (fallbackErr) {
                reject(fallbackErr);
              }
            }
          }, 'image/png');
        } else {
          try {
            const dataUrl = canvas.toDataURL('image/png');
            const byteString = atob(dataUrl.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const fallbackBlob = new Blob([ab], { type: 'image/png' });
            FileSaver.saveAs(fallbackBlob, fileName);
            this.toastrService.success('Snapshot saved to Downloads folder!');
            resolve();
          } catch (fallbackErr) {
            reject(fallbackErr);
          }
        }
      });

    } catch (error: any) {
      console.error('Error capturing page image:', error);
      this.toastrService.error('Failed to save screen as image');
    } finally {
      this.isCapturingImage = false;
    }
  }

  buildComparisonWorksheet(wb: ExcelJS.Workbook, compData: any[], month: string, year: string): void {
    if (!compData || compData.length === 0) return;

    const headers = Object.keys(compData[0]).filter(k => !k.startsWith('Diff_') && !k.startsWith('Diff '));
    if (headers.length === 0) return;

    const ws = wb.addWorksheet('Comparison Dashboard', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 5, showGridLines: true }]
    });

    const companyName = sessionStorage.getItem('companyName') || localStorage.getItem('companyName') || 'CJ Darcl Logistics Limited';

    // ── Row 1: Company Name (Bold Black, Size 13, Left aligned, No fill) ──
    const r1 = ws.getCell('A1');
    r1.value = companyName;
    r1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF000000' } };
    r1.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(1).height = 20;

    // ── Row 2: Report Title (Bold Black, Size 10.5, Left aligned, No fill) ──
    const r2 = ws.getCell('A2');
    r2.value = 'Employees Salary Comparison';
    r2.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF000000' } };
    r2.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(2).height = 18;

    // ── Row 3: Month & Year (Bold Black, Size 10, Left aligned, No fill) ──
    const r3 = ws.getCell('A3');
    r3.value = `For the month of ${month} ${year}`.trim();
    r3.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
    r3.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(3).height = 18;

    // ── Row 4: Blank separator row ──
    ws.getRow(4).height = 10;

    // ── Row 5: Column Headers (Soft Blue Fill #BDD7EE, Bold Black text, Thin borders) ──
    const headerRow = ws.getRow(5);
    headerRow.height = 22;
    const headerBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    headers.forEach((colKey, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = this.formatColumnHeader(colKey);
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = headerBorder;
    });

    // ── Row 6 onwards: Data Rows ──
    const cellBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF7F7F7F' } },
      bottom: { style: 'thin', color: { argb: 'FF7F7F7F' } },
      left: { style: 'thin', color: { argb: 'FF7F7F7F' } },
      right: { style: 'thin', color: { argb: 'FF7F7F7F' } }
    };

    compData.forEach((item, rIdx) => {
      const rowNum = 6 + rIdx;
      const row = ws.getRow(rowNum);
      row.height = 26;

      headers.forEach((colKey, cIdx) => {
        const cell = row.getCell(cIdx + 1);
        const val = item[colKey];
        cell.border = cellBorder;

        if (this.isAmountColumn(colKey)) {
          const numVal = parseFloat(val) || 0;
          const diffVal = this.getDiffValue(item, colKey);

          if (diffVal !== 0) {
            const sign = diffVal > 0 ? '↑ +' : '↓ -';
            const diffArgb = diffVal > 0 ? 'FF15803D' : 'FFB91C1C';
            cell.value = {
              richText: [
                { text: `₹ ${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`, font: { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } } },
                { text: `${sign}₹${Math.abs(diffVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, font: { name: 'Calibri', size: 8.5, bold: true, color: { argb: diffArgb } } }
              ]
            };
          } else if (numVal !== 0) {
            cell.value = `₹ ${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF000000' } };
          } else {
            cell.value = '0.00';
            cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF000000' } };
          }
          cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
        } else {
          cell.value = (val !== null && val !== undefined) ? String(val) : '';
          cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF000000' } };
          cell.alignment = { horizontal: colKey.toLowerCase().includes('code') || colKey.toLowerCase().includes('date') || colKey.toLowerCase().includes('status') ? 'center' : 'left', vertical: 'middle' };
        }
      });
    });

    // Auto adjust column widths
    headers.forEach((colKey, idx) => {
      const col = ws.getColumn(idx + 1);
      if (this.isAmountColumn(colKey)) {
        col.width = 15;
      } else {
        let maxLen = this.formatColumnHeader(colKey).length;
        for (let i = 0; i < Math.min(compData.length, 50); i++) {
          const v = compData[i][colKey];
          if (v) maxLen = Math.max(maxLen, String(v).length);
        }
        col.width = Math.min(Math.max(maxLen + 3, 12), 35);
      }
    });
  }

  async downloadComparisonExcel(): Promise<void> {
    if (this.isExportingComp) return;
    this.isExportingComp = true;

    const payload = {
      ...this.ExportExcel.value,
      ExportType: 58,
      pageIndex: 0,
      pageSize: 10000
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    const selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
    const selectedMonth = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
    const month = selectedMonth?.name || '';

    const selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
    const selectedYear = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
    const year = selectedYear?.name || '';

    const reportName = 'Salary_Comparison_' + month + '_' + year + '.xlsx';

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    try {
      let compData = this.comparisonList;
      if (!compData || compData.length === 0) {
        const res = await new Promise<any>((resolve, reject) => {
          this.httpService.Export_Employeelist(payload).subscribe({
            next: resolve,
            error: reject
          });
        });
        if (res && res.isSuccess && res.data) {
          compData = res.data;
        }
      }

      if (!compData || compData.length === 0) {
        this.toastrService.warning('No comparison records available to export.');
        this.isExportingComp = false;
        return;
      }

      const wb = new ExcelJS.Workbook();
      this.buildComparisonWorksheet(wb, compData, month, year);

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, reportName);
      this.toastrService.success('Salary Comparison Sheet exported successfully!');
    } catch (err) {
      console.error('Download comparison Excel failed', err);
      this.toastrService.error('Failed to export Salary Comparison Sheet');
    } finally {
      this.isExportingComp = false;
    }
  }

  OnVeiw() {
    this.submitted = true;
    this.ngxUILoaderService.start();
    if (this.ExportExcel.invalid) {
      this.showError = true;
      this.isViewTriggered = false;
      this.ngxUILoaderService.stop();
      return;
    }


    const exportType = this.ExportExcel.value.ExportType;
    //const foreignTypes = [11, 12, 36, 37, 42,43];

    const payload = {
      ...this.ExportExcel.value,
      // ExportType: foreignTypes.includes(exportType) ? 2 : exportType, // ✅ override if in list

      ExportType: exportType, //  override if in list
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize
    };


    //     const payload = {
    //   ...this.ExportExcel.value,  
    //   pageIndex: this.pageIndex - 1,  
    //   pageSize: this.pageSize
    // };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    })

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.EmployeeListExcle = [];
    this.httpService.Export_Employeelist(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data;
          this.totalCount = res.totalCount
          //console.log( this.totalCount)
          this.tableHeaders = Object.keys(res.data[0] ?? {});
          this.showEmployeeList = true


          // this.toastrService.success(res.message)        
        } else {
          this.tableHeaders = []
          this.EmployeeList = []
          this.totalCount = 0
          this.toastrService.info(res.message)
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('Failed to retrieve employees', error);
      }


    });
  }

  //    downloadExcel(): void {
  //       const payload = {
  //     ...this.ExportExcel.value,
  //     pageIndex: 0,
  //     pageSize: 10000
  //   };

  //   Object.keys(payload).forEach(key => {
  //     if (payload[key] === null) {
  //       payload[key] = '';
  //     }
  //   });

  //   this.httpService.Export_Employeelist(payload).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         this.EmployeeListExcle = res.data;


  //       let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
  //       let selectedMonth: {name: string, value: string} | undefined = this.months.find((m: {name: string, value: string}) => m.value === selectedMonthId);
  //       let {name : month,value}={...selectedMonth!}

  //       let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
  //       let selectedYear: {name: string, value: string} | undefined = this.years.find((m: {name: string, value: string}) => m.value === selectedYearId);
  //       let {name : Year,value : Yearvalue}={...selectedYear!}

  //       let selectedReportId = this.ExportExcel.get('ExportType')?.value;
  //       let selectedReport: {name: string, value: number} | undefined = this.ExportTypelist.find((m: {name: string, value: number}) => m.value === selectedReportId);
  //       let {name : Report,value : Reportvalue}={...selectedReport!}

  //       let ReportName =Report +'_'+ month+'_'+Year+'.xlsx';

  //      try {
  //     const worksheet = XLSX.utils.json_to_sheet(this.EmployeeListExcle);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  //     const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //     const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //     FileSaver.saveAs(blob, ReportName);
  //    } catch (error) {
  //           console.error('Error exporting Excel:', error);
  //           this.toastrService.error('Failed to export Excel');
  //         }
  //       } else {
  //         this.EmployeeListExcle = [];
  //         this.toastrService.info(res.message);
  //       }
  //       this.ngxUILoaderService.stop();
  //     },
  //     error: (error) => {
  //       this.toastrService.error('Failed to retrieve employees', error);
  //       this.ngxUILoaderService.stop();
  //     }
  //   });
  // }

  Exceldownload() {
    const exportType = this.ExportExcel.get('ExportType')?.value;

    if (exportType == 2) {
      this.downloadExcelforexporttype1();
    } else {
      this.downloadExcel();
    }
  }

  downloadExcel() {

    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,
      pageSize: 10000
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });
    let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
    let selectedMonth: { name: string, value: string } | undefined = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
    let { name: month, value } = { ...selectedMonth! }

    let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
    let selectedYear: { name: string, value: string } | undefined = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
    let { name: Year, value: Yearvalue } = { ...selectedYear! }

    let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    let selectedReport: { name: string, value: number } | undefined = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
    let { name: Report, value: Reportvalue } = { ...selectedReport! }

    let ReportName = Report + '_' + month + '_' + Year + '.xlsx';

    //added for contractor name
    // Find contractor name from CostCenter list
    // let contractorName = '';
    // if (payload.fk_costcentreid) {
    //   const selectedIds = Array.isArray(payload.fk_costcentreid) ? payload.fk_costcentreid : [payload.fk_costcentreid];
    //   const selectedContractors = this.CostCenter.filter(c => selectedIds.includes(c.value));
    //   contractorName = selectedContractors.map(c => c.name).join(', ');
    // }
    // Add to formData for backend
    // payload.contractorName = contractorName;
    payload.ReportName = Report;

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.downloadViewSalaryReportlist(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // a.download = `Canteen_${new Date().toISOString().split('T')[0]}.xlsx`; // dynamic filename
        a.download = ReportName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false; // reset after download
      },
      error: (err) => {
        console.error('Download failed', err);
        this.isExporting = false; // reset even on error
      }
    });
  }


  // async downloadExcelforexporttype1(): Promise<void> {
  //   if (this.isExporting) return; // prevent double click
  //   this.isExporting = true;

  //   const payload = {
  //     ...this.ExportExcel.value,
  //     pageIndex: 0,
  //     pageSize: 10000
  //   };

  //   Object.keys(payload).forEach(key => {
  //     if (payload[key] === null) {
  //       payload[key] = '';
  //     }
  //   });

  //   const selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
  //   const selectedMonth = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
  //   const month = selectedMonth?.name || '';

  //   const selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
  //   const selectedYear = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
  //   const year = selectedYear?.name || '';

  //   const selectedReportId = this.ExportExcel.get('ExportType')?.value;
  //   const selectedReport = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
  //   const reportNameBase = selectedReport?.name || 'Employees Salary';

  //   const reportFileName = `${reportNameBase}_${month}_${year}.xlsx`;
  //   payload.ReportName = reportNameBase;

  //   if (Array.isArray(payload.fk_costcentreid)) {
  //     payload.fk_costcentreid = payload.fk_costcentreid.join(',');
  //   }

  //   try {
  //     // 1. Request standard Salary Register Excel blob from backend
  //     const blob: Blob = await new Promise((resolve, reject) => {
  //       this.httpService.downloadViewSalaryReportlistforexportype1(payload).subscribe({
  //         next: resolve,
  //         error: reject
  //       });
  //     });

  //     // 2. Fetch Comparison dataset if not already loaded
  //     let compData: any[] = this.comparisonList;
  //     if (!compData || compData.length === 0) {
  //       try {
  //         const compPayload = {
  //           ...payload,
  //           ExportType: 58,
  //           pageIndex: 0,
  //           pageSize: 10000
  //         };
  //         const compRes = await new Promise<any>((resolve, reject) => {
  //           this.httpService.Export_Employeelist(compPayload).subscribe({
  //             next: resolve,
  //             error: reject
  //           });
  //         });
  //         if (compRes && compRes.isSuccess && compRes.data) {
  //           compData = compRes.data;
  //         }
  //       } catch (compErr) {
  //         console.warn('Comparison data fetch failed, continuing with single sheet', compErr);
  //       }
  //     }

  //     // 3. Load backend Salary Register Excel into ExcelJS Workbook
  //     const arrayBuffer = await blob.arrayBuffer();
  //     const wb = new ExcelJS.Workbook();
  //     await wb.xlsx.load(arrayBuffer);

  //     if (wb.worksheets.length > 0) {
  //       wb.worksheets[0].name = 'Salary Register';
  //     }

  //     // 4. Append Sheet 2: Comparison Dashboard with rich-text variance formatting
  //     if (compData && compData.length > 0) {
  //       this.buildComparisonWorksheet(wb, compData, month, year);
  //     }

  //     // 5. Generate and download final 2-sheet Excel workbook
  //     const buffer = await wb.xlsx.writeBuffer();
  //     const finalBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     FileSaver.saveAs(finalBlob, reportFileName);

  //     this.toastrService.success('Salary Report with Comparison Dashboard exported successfully!');
  //   } catch (err) {
  //     console.error('Download multi-sheet Excel failed:', err);
  //     this.toastrService.error('Failed to export Excel report');
  //   } finally {
  //     this.isExporting = false;
  //   }
  // }

  async downloadExcelforexporttype1(): Promise<void> {

  if (this.isExporting) return; // prevent double click
  this.isExporting = true;

  const payload = {
    ...this.ExportExcel.value,
    pageIndex: 0,
    pageSize: 10000
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === null) {
      payload[key] = '';
    }
  });

  // Month
  const selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;

  const selectedMonth: { name: string, value: string } | undefined =
    this.months.find(
      (m: { name: string, value: string }) =>
        m.value === selectedMonthId
    );

  const month = selectedMonth?.name || '';

  // Year
  const selectedYearId = this.ExportExcel.get('fk_yearId')?.value;

  const selectedYear: { name: string, value: string } | undefined =
    this.years.find(
      (y: { name: string, value: string }) =>
        y.value === selectedYearId
    );

  const Year = selectedYear?.name || '';

  // Report Type
  const selectedReportId = this.ExportExcel.get('ExportType')?.value;

  const selectedReport: { name: string, value: number } | undefined =
    this.ExportTypelist.find(
      (r: { name: string, value: number }) =>
        r.value === selectedReportId
    );

  const Report = selectedReport?.name || 'Employees Salary';

  // File name
  const ReportName = `${Report}_${month}_${Year}.xlsx`;

  // Backend ReportName
  payload.ReportName = Report;

  // Cost Centre
  if (Array.isArray(payload.fk_costcentreid)) {
    payload.fk_costcentreid =
      payload.fk_costcentreid.join(',');
  }

  this.httpService.downloadViewSalaryReportlistforexportype1(payload).subscribe({

    next: (res: Blob) => {

      const blob = new Blob(
        [res],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;
      a.download = ReportName;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);

      this.isExporting = false;
    },

    error: (err) => {

      console.error('Download failed', err);

      this.toastrService.error(
        'Failed to export Excel report'
      );

      this.isExporting = false;
    }

  });
}

  downloadpdf(): void {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.Export_pdf(payload).subscribe({
      next: (file: Blob) => {

        const blob = new Blob([file], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Report.pdf'; // 👉 this is the filename shown in downloads
        a.click();

        window.URL.revokeObjectURL(url);
        this.ngxUILoaderService.stop();
      },


      error: (error) => {



        if (error.status === 500) {
          this.toastrService.warning('Record not found');
        } else {
          this.toastrService.error('Failed to download PDF');
        }
        this.ngxUILoaderService.stop();
      }
    });
  }



  //Salry Slip
  salarySlipData: any[] = []
  showPayslip: boolean = false;
  payColumns: { Fixed: string, Rate: string, Earnings: string, Arrears: string }[] = [];
  dedColumns: { Fixed: string, Amount: string }[] = [];
  LeaveList: any[] = [];

  get requestBody() {
  const payload = this.ExportExcel.value;

  if (Array.isArray(payload.fk_costcentreid)) {
    payload.fk_costcentreid = payload.fk_costcentreid.join(',');
  }

  return payload;
}

  viewData(requestBody: any, EmpCode: string): void {
    requestBody.empCode = EmpCode;
    this.httpService.Download_SalarySlip(requestBody).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.salarySlipData = res.data;
          this.loadCompanyLogo(
            this.salarySlipData?.[0]?.company_logopath
          );
          this.LeaveList = res.data[4] != null ? res.data[4]["LeaveList"] : [];


          this.salarySlipData[0].website = convertAmountToWordsIndian(this.salarySlipData[3]?.NetPay);
          this.payColumns = [];
          this.dedColumns = [];

          // For Earning

          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Pay" + i] != null && res.data[1]["Pay" + i] != "" && res.data[3]["PayAmt" + i] > 0) {

              if (res.data[3]["PayAmt" + i] != 0) {
                let objPay = { Fixed: res.data[1]["Pay" + i], Rate: res.data[3]["Pay" + i], Earnings: res.data[3]["PayAmt" + i], Arrears: res.data[3]["PayAmt" + i + "_A"] };
                this.payColumns.push(objPay);
              }


            }
          }


          for (let i = 1; i <= 10; i++) {
            if (res.data[1]["PayR" + i] != null && res.data[1]["PayR" + i] != "") {
              if (res.data[3]["PayRAmt" + i] != 0) {
                var objR = { Fixed: res.data[1]["PayR" + i], Rate: res.data[3]["PayR" + i], Earnings: res.data[3]["PayRAmt" + i], Arrears: res.data[3]["PayRAmt" + i + "_A"] };
                this.payColumns.push(objR);
              }

            }
          }
          // For Deduction
          if (res.data[3]["PF"] != null && res.data[3]["PF"] != 0) {
            var objPF = { Fixed: "PF", Amount: res.data[3]["PF"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["VolPF"] != null && res.data[3]["VolPF"] != 0) {
            var objPF = { Fixed: "VolPF", Amount: res.data[3]["VolPF"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["ESI"] != null && res.data[3]["ESI"] != 0) {
            var objPF = { Fixed: "ESI", Amount: res.data[3]["ESI"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["ProfTax"] != null && res.data[3]["ProfTax"] != 0) {
            var objPF = { Fixed: "ProfTax", Amount: res.data[3]["ProfTax"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["IT"] != null && res.data[3]["IT"] != 0) {
            var objPF = { Fixed: "IT", Amount: res.data[3]["IT"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["LWF"] != null && res.data[3]["LWF"] != 0) {
            var objPF = { Fixed: "LWF", Amount: res.data[3]["LWF"] };
            this.dedColumns.push(objPF);
          }



          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["PayD" + i] != null && res.data[1]["PayD" + i] != "") {
              if (res.data[3]["PayDAmt" + i] != 0) {
                var objDed = { Fixed: res.data[1]["PayD" + i], Amount: res.data[3]["PayDAmt" + i] };
                this.dedColumns.push(objDed);
              }
            }
          }
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Loan" + i] != null && res.data[1]["Loan" + i] != "") {
              if (res.data[3]["LoanAmt" + i] != 0) {
                var objLoan = { Fixed: res.data[1]["Loan" + i], Amount: res.data[3]["LoanAmt" + i] };
                this.dedColumns.push(objLoan);
              }
            }
          }

          const maxLength = Math.max(this.payColumns.length, this.dedColumns.length);
          this.combinedData = Array(maxLength).fill({}).map((_, i) => ({
            pay: this.payColumns[i] || { Fixed: '', Rate: '', Earnings: '', Arrears: '' },
            ded: this.dedColumns[i] || { Fixed: '', Amount: '' }
          }));


        } else {
          this.salarySlipData = [];
        }
      },
      error: (err) => {
        console.error('Error downloading salary slip:', err);
      }
    });
  }

  downloadAndDisplaySalarySlip(requestBody: any, EmpCode: string): void {
    requestBody.empCode = EmpCode;
    this.httpService.Download_SalarySlip(requestBody).subscribe({
      next: (res) => {

        if (res.isSuccess) {
          this.salarySlipData = res.data;
          this.loadCompanyLogo(
            this.salarySlipData?.[0]?.company_logopath
          );

          this.LeaveList = res.data[4] != null ? res.data[4]["LeaveList"] : [];
          this.salarySlipData[0].website = convertAmountToWordsIndian(this.salarySlipData[3]?.NetPay);

          this.payColumns = [];
          this.dedColumns = [];
          // For Earning
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Pay" + i] != null && res.data[1]["Pay" + i] != "" && res.data[3]["PayAmt" + i] > 0) {
              //console.log("downlaod",res.data[3]["PayAmt"+i]);
              if (res.data[3]["PayAmt" + i] != 0) {
                var obj = { Fixed: res.data[1]["Pay" + i], Rate: res.data[3]["Pay" + i], Earnings: res.data[3]["PayAmt" + i], Arrears: res.data[3]["PayAmt" + i + "_A"] };
                this.payColumns.push(obj);
              }
            }
          }

          for (let i = 1; i <= 10; i++) {
            if (res.data[1]["PayR" + i] != null && res.data[1]["PayR" + i] != "") {
              if (res.data[3]["PayRAmt" + i] != 0) {
                var objR = { Fixed: res.data[1]["PayR" + i], Rate: res.data[3]["PayR" + i], Earnings: res.data[3]["PayRAmt" + i], Arrears: res.data[3]["PayRAmt" + i + "_A"] };
                this.payColumns.push(objR);
              }
            }
          }

          // For Deduction
          if (res.data[3]["PF"] != null && res.data[3]["PF"] != 0) {
            var objPF = { Fixed: "PF", Amount: res.data[3]["PF"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["VolPF"] != null && res.data[3]["VolPF"] != 0) {
            var objPF = { Fixed: "VolPF", Amount: res.data[3]["VolPF"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["ESI"] != null && res.data[3]["ESI"] != 0) {
            var objPF = { Fixed: "ESI", Amount: res.data[3]["ESI"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["ProfTax"] != null && res.data[3]["ProfTax"] != 0) {
            var objPF = { Fixed: "ProfTax", Amount: res.data[3]["ProfTax"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["IT"] != null && res.data[3]["IT"] != 0) {
            var objPF = { Fixed: "IT", Amount: res.data[3]["IT"] };
            this.dedColumns.push(objPF);
          }
          if (res.data[3]["LWF"] != null && res.data[3]["LWF"] != 0) {
            var objPF = { Fixed: "LWF", Amount: res.data[3]["LWF"] };
            this.dedColumns.push(objPF);
          }



          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["PayD" + i] != null && res.data[1]["PayD" + i] != "") {
              if (res.data[3]["PayDAmt" + i] != 0) {
                var objDed = { Fixed: res.data[1]["PayD" + i], Amount: res.data[3]["PayDAmt" + i] };
                this.dedColumns.push(objDed);
              }
            }
          }
          for (let i = 1; i <= 15; i++) {
            if (res.data[1]["Loan" + i] != null && res.data[1]["Loan" + i] != "") {
              if (res.data[3]["LoanAmt" + i] != 0) {
                var objLoan = { Fixed: res.data[1]["Loan" + i], Amount: res.data[3]["LoanAmt" + i] };
                this.dedColumns.push(objLoan);
              }
            }
          }
          const maxLength = Math.max(this.payColumns.length, this.dedColumns.length);
          this.combinedData = Array(maxLength).fill({}).map((_, i) => ({
            pay: this.payColumns[i] || { Fixed: '', Rate: '', Earnings: '', Arrears: '' },
            ded: this.dedColumns[i] || { Fixed: '', Amount: '' }
          }));


          setTimeout(() => this.downloadPDF(), 500);
        }
        else {
          this.salarySlipData = []
          this.toastrService.info(res.message)
        }
      },
      error: (err) => {
        console.error('Error downloading salary slip:', err);
      }
    });
  }

  downloadPDF(): void {
    this.showPayslip = true
    const element = document.getElementById('pdf-content') as HTMLElement;

    // Ensure the page scrolls to the top before rendering
    window.scrollTo(0, 0);

    const opt = {
      margin: [0, 0, 0, 0], // top, left, bottom, right
      filename: 'Payslip.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0 // Prevent scroll-based displacement
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { avoid: 'tr' } // Optional: prevents breaks inside rows
    };

    if (element) {
      html2pdf().from(element).set(opt).save();
    } else {
      console.error("Element not found for PDF generation");
    }
  }



  downloadPdffile() {
    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,      //  added
      pageSize: 100
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.DownloadPdfFile(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SalaryRegister.pdf';  // file ka naam
      a.click();

      //  Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }

  //added

   downloadPdffileV2() {
    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,      //  added
      pageSize: 9999999
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

     this.httpService.DownloadPdfFileV2(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SalaryRegister.pdf';  
      a.click();

    });
  }


  downloadPFform5() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.DownloadForm5(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      //  Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generate Form 5.pdf';  // file ka naam
      a.click();

      //  Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }

  downloadPFform10() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.DownloadForm10(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      //  Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generate Form 10.pdf';  // file ka naam
      a.click();

      //  Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }
  GeneratePFStatement() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.GeneratePFStatement(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      //  Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GeneratePFStatement.pdf';  // file ka naam
      a.click();

      //  Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }


  // esi statement

  GenerateESIStatement() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.GenerateESIStatement(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      //  Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generate ESI Statement.pdf';  // file ka naam
      a.click();

      //  Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }

  GeneratePFform12A() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.GeneratePFform12A(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // ✅ Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PF form 12A.pdf';  // file ka naam
      a.click();

      // ✅ Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }
  onExportClick() {
    const exportType = this.ExportExcel.get('ExportType')?.value;

    if (exportType === 40) {
      this.downloadPFform5();
    }
    else if (exportType === 39) {
      this.downloadPFform10();
    }

    else if (exportType === 41) {
      this.GeneratePFform12A();
    }
    else if (exportType === 5) {
      this.GeneratePFStatement();
    }

    else if (exportType === 6) {
      this.GenerateESIStatement();
    }
    else if (exportType === 51) {
      this.DownloadMusterRollPdf();
    }
    else if (exportType === 52) {
      this.DownloadFORMDPdf();
    }
    else if (exportType === 54) {
      this.GenerateGratuityPdf();
    }
    else {
      this.downloadpdf();
    }

  }


  GenerateGratuityPdf() {
    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,
      pageSize: 10000000
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.GenerateGratuityPdf(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generate Gratuity.pdf';  // file ka naam
      a.click();

      //  Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }





  DownloadMusterRollPdf() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.DownloadMusterRollPdf(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);


      const a = document.createElement('a');
      a.href = url;
      a.download = 'Generate MusterRollPdf.pdf';  // file ka naam
      a.click();

      // ✅ Option 2: New Tab me open karne ke liye
      // window.open(url);
    });
  }


  DownloadFORMDPdf() {
    const payload = {
      ...this.ExportExcel.value
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.DownloadFORMDPdf(payload).subscribe((res: Blob) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      //  Option 1: Auto Download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Form D.pdf';  // file ka naam
      a.click();


      // window.open(url);
    });
  }


private buildExportPayload(pageIndex: number, pageSize: number) {
    const payload = {
      ...this.ExportExcel.value,
      pageIndex,
      pageSize
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });
      if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    return payload;
  
  
 }

  
  downloadTxtWrapper() {
    const exportType = this.ExportExcel.get('ExportType')?.value;

    if (exportType !== 36 && exportType !== 37) {
      this.toastrService.warning('Please select PF or ESI Challan');
      return;
    }

    this.ngxUILoaderService.start();

    // 🔥 Call API with LARGE pageSize
    const payload = this.buildExportPayload(0, 100000);

    this.httpService.Export_Employeelist(payload).subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();

        if (!res.isSuccess || !res.data || res.data.length === 0) {
          this.toastrService.warning('No data available for download');
          return;
        }

        //  Use FULL DATA
        if (exportType === 36) {
          this.generatePFTxt(res.data);
        } else {
          this.generateESITxt(res.data);
        }
      },
      error: () => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('Failed to download TXT data');
      }
    });
  }
  // generatePFTxt(employeeList: any[]) {
  //   let txtContent = '';

  //   employeeList.forEach(emp => {

  //     const pfWages = Math.min(emp['Current Salary'] || 0, 15000);
  //     const employeePF = +(pfWages * 0.12).toFixed(2);
  //     const employerPF = +(pfWages * 0.0367).toFixed(2);
  //     const eps = +(pfWages * 0.0833).toFixed(2);

  //     const row = [
  //       emp['EmpCode'] || '',
  //       emp['EmpName'] || '',
  //       emp['UANNO'] || '',
  //       emp['Pfno'] || '',
  //       emp['DOB'] || '',
  //       emp['DOJ'] || '',
  //       emp['Gender'] || '',
  //       emp['Current Salary'] || 0,
  //       pfWages,
  //       employeePF,
  //       employerPF,
  //       eps
  //     ].join('#');

  //     txtContent += row + '\n';
  //   });

  //   this.downloadTxtFile(txtContent);
  // }
  generatePFTxt(employeeList: any[]) {
    let txtContent = '';

    employeeList.forEach(emp => {

      const row = [
        emp['UAN'] || '',
        emp['Member Name'] || '',
        emp['GROSS WAGES'] || 0,
        emp['EPF Wages'] || 0,
        emp['EPS Wages'] || 0,
        emp['EDLI WAGES'] || 0,
        emp['EPF CONTRI REMITTED'] || 0,
        emp['EPS CONTRI REMITTED'] || 0,
        emp['EPF EPS DIFF REMITTED'] || 0,
        emp['NCP DAYS'] || 0,
        emp['REFUND OF ADVANCES'] || 0
      ].join('#');

      txtContent += row + '\n';
    });

    this.downloadTxtFile(txtContent);
  }

  // generateESITxt(employeeList: any[]) {
  //   let txtContent = '';

  //   employeeList.forEach(emp => {
  //     const grossSalary = emp['Current Salary'] || 0;

  //     const employeeESI = +(grossSalary * 0.0075).toFixed(2);
  //     const employerESI = +(grossSalary * 0.0325).toFixed(2);

  //     const row = [
  //       emp['EmpCode'] || '',
  //       emp['EmpName'] || '',
  //       emp['FatherName'] || '',
  //       emp['Gender'] || '',
  //       emp['DOB'] || '',
  //       emp['DOJ'] || '',
  //       emp['Esino'] || '',
  //       grossSalary,
  //       employeeESI,
  //       employerESI
  //     ].join('#');

  //     txtContent += row + '\n';
  //   });

  //   this.downloadTxtFile(txtContent);
  // }

  generateESITxt(employeeList: any[]) {
    let txtContent = '';

    employeeList.forEach(emp => {

      const row = [
        emp['IP Number'] || '',
        emp['IP Name'] || '',
        emp['No of Days for which wages paid/payable during the month'] || 0,
        emp['Total Monthly Wages'] || 0,
        emp[' Reason Code for Zero workings days(numeric only; provide 0 for all other reasons- Click on the link for reference)'] || 0,
        emp['Last Working Day'] || ''
      ].join('#');

      txtContent += row + '\n';
    });

    this.downloadTxtFile(txtContent);
  }

  downloadTxtFile(content: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.getTxtFileName();
    a.click();

    window.URL.revokeObjectURL(url);
  }

  getTxtFileName(): string {
    const exportType = this.ExportExcel.get('ExportType')?.value;
    const month = this.ExportExcel.get('fk_monthId')?.value;
    const year = this.ExportExcel.get('fk_yearId')?.value;

    if (exportType === 36) {
      return `PF_Challan_${month}_${year}.txt`;
    }

    if (exportType === 37) {
      return `ESI_Challan_${month}_${year}.txt`;
    }

    return `Salary_Report_${month}_${year}.txt`;
  }






  loadCompanyLogo(filename: string) {

    if (!filename) {
      this.companyLogo =
        'assets/Image/Logo/empower.jpg';
      return;
    }

    this.service.getImage(filename)
      .subscribe({

        next: (blob) => {
          const reader =
            new FileReader();

          reader.onload = () => {
            this.companyLogo = reader.result as string;

          };

          reader.readAsDataURL(blob);

        },

        error: (err) => {



          this.companyLogo =
            'assets/Image/Logo/empower.jpg';

        }

      });

  }

  onCostCenterChange() {
    let selectedValues = this.ExportExcel.controls['fk_costcentreid'].value || [];
    if (!Array.isArray(selectedValues)) {
      selectedValues = [selectedValues];
    }

    if (selectedValues.includes('__select_all__')) {
       if (this.isAllCostCentersSelected()) {
          this.selectedCostCenters = [];
       } else {
          const realValues = this.CostCenter
             .filter(c => c.value !== '__select_all__')
             .map(c => c.value);
          this.selectedCostCenters = realValues as string[];
       }
       this.ExportExcel.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
    } else {
       this.selectedCostCenters = selectedValues;
    }
  }

  onCostCenterSearch(event: { term: string }) {
    if (event.term && event.term.trim().length > 0) {
      const term = event.term.toLowerCase();
      const filtered = this.CostCenter.filter(c => 
         c.value !== '__select_all__' && 
         c.name.toLowerCase().includes(term)
      );
      this.selectedCostCenters = filtered.map(c => c.value as string);
      this.ExportExcel.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
    }
  }

  isAllCostCentersSelected(): boolean {
    const realCostCenters = this.CostCenter.filter(item => item.value !== '__select_all__');
    return (
      this.selectedCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => this.selectedCostCenters.includes(c.value as string))
    );
  }

  getCostCenterDisplayText(): string {
    const realCostCenters = this.CostCenter.filter(c => c.value !== '__select_all__');
    const selectedRealCostCenters = this.selectedCostCenters.filter(value => value !== '__select_all__');

    if (
      selectedRealCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => selectedRealCostCenters.includes(c.value as string))
    ) {
      return "All Selected";
    } else if (this.selectedCostCenters.length === 1) {
      return this.CostCenter.find(item => item.value === this.selectedCostCenters[0])?.name || "--Select --";
    } else if (this.selectedCostCenters.length > 1) {
      const firstSelected = this.CostCenter.find(item => item.value === this.selectedCostCenters[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select --";
    } else {
      return "--Select --";
    }
  }

  clearCostCenters() {
    this.selectedCostCenters = [];
    this.ExportExcel.controls['fk_costcentreid'].setValue([]);
  }

    downloadSalarySlipPdf() {
    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,
      pageSize: 99999
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.ngxUILoaderService.start();
    this.httpService.DownloadSalarySlipPdf(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const selectedMonth = payload.fk_monthId || 'Month';
        const selectedYear = payload.fk_yearId || 'Year';
        a.download = `SalarySlip_${selectedMonth}_${selectedYear}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        this.toastrService.error('Error downloading salary slip PDF.');
        this.ngxUILoaderService.stop();
      }
    });
  }
  downloadEmployeeSalarySlipPdf(empCode: string) {
    const payload = {
      ...this.ExportExcel.value,
      ExportType: 2,
      pageIndex: 0,
      pageSize: 1,
      EmpCode: empCode,
      empCode: empCode
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.ngxUILoaderService.start();
    this.httpService.DownloadSalarySlipPdf(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const selectedMonth = payload.fk_monthId || 'Month';
        const selectedYear = payload.fk_yearId || 'Year';
        a.download = `SalarySlip_${empCode}_${selectedMonth}_${selectedYear}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        this.toastrService.error('Error downloading salary slip PDF.');
        this.ngxUILoaderService.stop();
      }
    });
  }


   viewSalarySlipPdf(empCode: string) {
    const payload = {
      ...this.ExportExcel.value,
      ExportType: 2,
      pageIndex: 0,
      pageSize: 1,
      EmpCode: empCode,
      empCode: empCode
    };

    // replace null with ''
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.ngxUILoaderService.start();
    this.httpService.DownloadSalarySlipPdf(payload).subscribe({
      next: async (res: Blob) => {
        if (res.type === 'application/json') {
          try {
            const text = await res.text();
            const errObj = JSON.parse(text);
            this.toastrService.warning(errObj.message || errObj.Message || 'No salary slip record found.');
          } catch {
            this.toastrService.error('Failed to load salary slip PDF.');
          }
          this.ngxUILoaderService.stop();
          return;
        }

        const blob = new Blob([res], { type: 'application/pdf' });
        if (this.previewBlobUrl) {
          window.URL.revokeObjectURL(this.previewBlobUrl);
        }
        this.previewBlobUrl = window.URL.createObjectURL(blob);
        const pdfUrlWithParams = `${this.previewBlobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
        this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrlWithParams);

        const modalElement = document.getElementById('salarySlipPdfModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modal.show();
        }
        this.ngxUILoaderService.stop();
      },
      error: async (err) => {
        if (err.error instanceof Blob) {
          try {
            const text = await err.error.text();
            const errObj = JSON.parse(text);
            this.toastrService.warning(errObj.message || errObj.Message || 'No salary slip record found.');
          } catch {
            this.toastrService.error('Error opening salary slip PDF.');
          }
        } else {
          this.toastrService.error('Error opening salary slip PDF.');
        }
        this.ngxUILoaderService.stop();
      }
    });
  }

//  ADD THIS  AFTER  THESE ABOVE TWO
 closePdfModal() {
    this.previewPdfUrl = null;
    if (this.previewBlobUrl) {
      window.URL.revokeObjectURL(this.previewBlobUrl);
      this.previewBlobUrl = '';
    }
    const modalElement = document.getElementById('salarySlipPdfModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  goBack() {
    this.workflowNav.returnToOrigin(this.returnUrl, '/dash/payroll/payrolldashboard/autoSalaryProcess');
  }

}

