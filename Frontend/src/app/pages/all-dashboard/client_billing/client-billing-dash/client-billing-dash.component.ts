// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-client-billing-dash',
//   standalone: true,
//   imports: [],
//   templateUrl: './client-billing-dash.component.html',
//   styleUrl: './client-billing-dash.component.scss'
// })
// export class ClientBillingDashComponent {

// }

import { Component, AfterViewInit, OnDestroy, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectComponent } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
// import { ClientBillingService } from '../services/client-billing.service';  // your service

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-client-billing-dash',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './client-billing-dash.component.html',
  styleUrl: './client-billing-dash.component.scss'
})
export class ClientBillingDashComponent implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  months: any[]  = [];
  years: any[]   = [];
  clients: any[] = [];
  billingStatuses: any[] = [
    { name: 'All',            value: '' },
    { name: 'Paid',           value: 'Paid' },
    { name: 'Pending',        value: 'Pending' },
    { name: 'Partially Paid', value: 'Partially Paid' },
    { name: 'Overdue',        value: 'Overdue' }
  ];

  billingSummary: any = {};

  get totalRevenue()          { return this.billingSummary?.TotalRevenue        || 0; }
  get revenueGrowth()         { return this.billingSummary?.RevenueGrowth       || 0; }
  get collectedAmount()       { return this.billingSummary?.CollectedAmount     || 0; }
  get pendingAmount()         { return this.billingSummary?.PendingAmount       || 0; }
  get overdueAmount()         { return this.billingSummary?.OverdueAmount       || 0; }
  get avgRevenuePerEmployee() { return this.billingSummary?.AvgRevenuePerEmp   || 0; }
  get paidInvoices()          { return this.billingSummary?.PaidInvoices        || 0; }
  get pendingInvoices()       { return this.billingSummary?.PendingInvoices     || 0; }
  get partialInvoices()       { return this.billingSummary?.PartialInvoices     || 0; }
  get overdueInvoices()       { return this.billingSummary?.OverdueInvoices     || 0; }

  searchText        = '';
  filterBillingStatus = '';
  showAll           = false;

  billingList: any[]       = [];
  topClients: any[]        = [];
  profitabilityList: any[] = [];
  employeeBillingList: any[] = [];
  selectedClient: any      = null;

  private chart!: Chart;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    // private billingService: ClientBillingService,
    private toastrService: ToastrService,
    private Loader: NgxUiLoaderService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      client: [null],
      month:  [null],
      year:   [null],
      status: [null]
    });

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    // Replace with your actual API calls, e.g.:
    // forkJoin([
    //   this.billingService.getMonths(),
    //   this.billingService.getYears(),
    //   this.billingService.getClients()
    // ]).subscribe({ next: ([monthRes, yearRes, clientRes]) => { ... } });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear  = new Date().getFullYear();

    const monthMatch = this.months.find((m: any) => +m.value === currentMonth);
    const yearMatch  = this.years.find((y: any)  => +y.value === currentYear);

    if (monthMatch && yearMatch) {
      this.form.patchValue({ month: monthMatch.value, year: yearMatch.value });
      this.loadBillingData(null, monthMatch.value, yearMatch.value);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 300);
    }
  }

  loadBillingData(client: any, month: number, year: number): void {
    this.Loader.start();

    // Replace with your actual API call:
    // this.billingService.getBillingDashboard(client, month, year).subscribe({
    //   next: (res) => {
    //     this.Loader.stop();
    //     this.billingSummary    = res.data?.summary     || {};
    //     this.billingList       = res.data?.billingList || [];
    //     this.topClients        = res.data?.topClients  || [];
    //     this.profitabilityList = res.data?.profitability || [];
    //     setTimeout(() => { if (isPlatformBrowser(this.platformId)) this.initChart(); }, 100);
    //   },
    //   error: (err) => {
    //     this.Loader.stop();
    //     this.toastrService.error('Failed to load billing data');
    //     this.billingSummary = {};
    //   }
    // });

    this.Loader.stop(); // remove when real API is connected
  }

  selectClient(bill: any): void {
    this.selectedClient = bill;
    // Load employee billing for selected client:
    // this.billingService.getEmployeeBilling(bill.clientId, month, year).subscribe({
    //   next: (res) => { this.employeeBillingList = res.data || []; },
    //   error: () => { this.toastrService.error('Failed to load employee billing'); }
    // });
  }

  get filteredBillingList(): any[] {
    const s = this.searchText.toLowerCase();
    const filtered = this.billingList.filter(bill => {
      const matchSearch =
        bill.clientName.toLowerCase().includes(s)     ||
        (bill.invoiceNo || '').toLowerCase().includes(s);
      const matchStatus = this.filterBillingStatus
        ? bill.status === this.filterBillingStatus
        : true;
      return matchSearch && matchStatus;
    });
    return this.showAll ? filtered : filtered.slice(0, 4);
  }

  toggleViewAll(): void {
    this.showAll = !this.showAll;
  }

  // Chart.js Donut — Invoice Status
  initChart(): void {
    const canvas = document.getElementById('billingChartDiv') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const data  = [this.paidInvoices, this.pendingInvoices, this.partialInvoices, this.overdueInvoices];
    const total = data.reduce((s, v) => s + v, 0);
    const THRESHOLD = 0.04;

    const datalabelsPlugin = {
      id: 'customDatalabels',
      afterDatasetDraw(chart: any) {
        const { ctx, data: chartData } = chart;
        const meta   = chart.getDatasetMeta(0);
        const values: number[] = chartData.datasets[0].data;
        const sum    = values.reduce((a: number, b: number) => a + b, 0);
        meta.data.forEach((arc: any, i: number) => {
          const pct = sum > 0 ? values[i] / sum : 0;
          if (pct < THRESHOLD) return;
          const { x, y } = arc.tooltipPosition();
          ctx.save();
          ctx.fillStyle    = '#ffffff';
          ctx.font         = 'bold 11px sans-serif';
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor  = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur   = 3;
          ctx.fillText(`${Math.round(pct * 100)}%`, x, y);
          ctx.restore();
        });
      }
    };

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Pending', 'Partially Paid', 'Overdue'],
        datasets: [{
          data,
          backgroundColor: ['#54ca68', '#ffa446', '#20c9d8', '#e35b5d'],
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              }
            }
          }
        },
        animation: { animateRotate: true, duration: 1000 }
      },
      plugins: [datalabelsPlugin]
    });
  }

  onSelectionChange(): void {
    const { client, month, year } = this.form.value;
    if (month && year) {
      this.loadBillingData(client, month, year);
    }
  }

  // Action buttons
  generateInvoice()    { /* routerLink or modal */ }
  downloadInvoice()    { /* download logic */ }
  exportExcel()        { /* export logic */ }
  exportPdf()          { /* export logic */ }
  sendBillingReport()  { /* email logic */ }
  refreshDashboard()   {
    const { client, month, year } = this.form.value;
    if (month && year) this.loadBillingData(client, month, year);
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }
}