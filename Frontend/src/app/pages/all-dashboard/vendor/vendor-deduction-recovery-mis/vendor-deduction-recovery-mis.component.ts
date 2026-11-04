import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { VendorService } from '../Service/vendor.service';
import { RouterModule } from '@angular/router';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-vendor-deduction-recovery-mis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule, RouterModule],
  templateUrl: './vendor-deduction-recovery-mis.component.html',
  styleUrls: ['./vendor-deduction-recovery-mis.component.scss']
})
export class VendorDeductionRecoveryMisComponent implements OnInit {
  filterForm!: FormGroup;

  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];

  statusList = [
    { label: 'All Statuses', value: 'ALL' },
    { label: '🟢 Fully Recovered', value: 'FULLY_RECOVERED' },
    { label: '🟡 Partially Recovered', value: 'PARTIALLY_RECOVERED' },
    { label: '🔴 Pending Deficits', value: 'PENDING' }
  ];

  misData: any[] = [];
  filteredData: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 15;
  searchTerm: string = '';

  // Executive KPI summary metrics
  totalOriginalAmount: number = 0;
  totalCycle1Recovered: number = 0;
  totalCycle2Recovered: number = 0;
  totalRecovered: number = 0;
  totalPendingBalance: number = 0;
  recoveryRate: number = 0;

  // Shipment Drilldown Modal State
  isShipmentModalOpen: boolean = false;
  activeShipmentId: string = '';
  shipmentBreakdownData: any[] = [];
  isLoadingShipmentBreakdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private vendorService: VendorService,
    private clientService: ClientMasterService,
    private commonService: ManualPunchBio,
    private dropdownService: DropdownService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadLocations();
    this.searchReport();
  }

  private initForm(): void {
    const today = new Date();
    // Default from previous month to end of current month so current and recent cycles (e.g. Sept & Oct) are immediately visible
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const fromStr = this.formatDate(firstDay);
    const toStr = this.formatDate(lastDay);

    this.filterForm = this.fb.group({
      client: [null],
      model: [null],
      location: [null],
      fromDate: [fromStr],
      toDate: [toStr],
      recoveryStatus: ['ALL']
    });

    this.filterForm.get('client')?.valueChanges.subscribe((clientId: any) => {
      this.filterForm.get('model')?.setValue(null);
      this.filterModelsByClient(clientId);
    });
  }

  private formatDate(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private loadClients(): void {
    this.commonService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.clientList = res.data.slice(1);
        }
      }
    });
  }

  private filterModelsByClient(clientId: any): void {
    const costCentreId = clientId ? (typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId) : 0;
    if (!costCentreId) {
      this.modelList = [];
      return;
    }

    this.clientService.getModelListByClient(costCentreId).subscribe({
      next: (res: any) => {
        this.modelList = res?.isSuccess && Array.isArray(res.data) ? res.data : [];
      }
    });
  }

  private loadLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        this.locationList = data || [];
      }
    });
  }

  searchReport(): void {
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;

    if (!fromDate || !toDate) {
      this.toastr.warning('Please specify From Date and To Date.', 'Date Required');
      return;
    }

    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;
    const locationId = this.filterForm.get('location')?.value;
    const status = this.filterForm.get('recoveryStatus')?.value || 'ALL';

    this.loader.start();
    this.vendorService.getRecoveryMISReport(fromDate, toDate, clientId, modelId, locationId, status).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.misData = res.data;
          this.applyLocalFilter();
        } else {
          this.misData = [];
          this.filteredData = [];
          this.recalculateKPIs();
        }
      },
      error: () => {
        this.loader.stop();
        this.misData = [];
        this.filteredData = [];
        this.recalculateKPIs();
      }
    });
  }

  resetForm(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.filterForm.reset({
      client: null,
      model: null,
      location: null,
      fromDate: this.formatDate(firstDay),
      toDate: this.formatDate(lastDay),
      recoveryStatus: 'ALL'
    });
    this.searchTerm = '';
    this.searchReport();
  }

  applyLocalFilter(): void {
    const term = this.searchTerm?.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.misData];
    } else {
      this.filteredData = this.misData.filter(item => {
        const fhrid = (item.fhrid || item.FHRID || '').toLowerCase();
        const vcode = (item.vendorCode || item.VendorCode || '').toLowerCase();
        const vname = (item.vendorName || item.VendorName || '').toLowerCase();
        const shp = (item.shipmentID || item.ShipmentID || '').toLowerCase();
        const dtype = (item.deductionType || item.DeductionType || '').toLowerCase();
        const hub = (item.hubName || item.HubName || '').toLowerCase();
        const vtype = (item.vehicle_Type || item.Vehicle_Type || item.vehicleType || item.VehicleType || '').toLowerCase();
        const route = (item.route || item.Route || '').toLowerCase();
        return fhrid.includes(term) || vcode.includes(term) || vname.includes(term) || shp.includes(term) || dtype.includes(term) || hub.includes(term) || vtype.includes(term) || route.includes(term);
      });
    }
    this.pageIndex = 1;
    this.recalculateKPIs();
  }

  penaltyIncidentsCount: number = 0;

  isArrearRow(item: any): boolean {
    const col = (item.standardDbColumn || item.StandardDbColumn || '').trim().toLowerCase();
    const type = (item.deductionType || item.DeductionType || '').trim().toLowerCase();
    return col === 'ded_arrear' || type.includes('arrear');
  }

  getVehicleType(row: any): string {
    const v = String(row.vehicle_Type || row.vehicleType || row.Vehicle_Type || '').trim();
    return (v === '0' || v === '-' || v.toLowerCase() === 'null') ? '' : v;
  }

  getRoute(row: any): string {
    const r = String(row.route || row.Route || '').trim();
    return (r === '0' || r === '-' || r.toLowerCase() === 'null') ? '' : r;
  }

  isFourWheeler(type: string): boolean {
    const t = (type || '').toLowerCase();
    return t.includes('van') || t.includes('4w') || t.includes('car') || t.includes('truck');
  }

  private recalculateKPIs(): void {
    // Only calculate operational penalty recovery metrics (Arrear is a payout credit, not a penalty deficit)
    const penaltyRows = this.filteredData.filter(i => !this.isArrearRow(i));
    this.penaltyIncidentsCount = penaltyRows.length;

    this.totalOriginalAmount = penaltyRows.reduce((sum, i) => sum + (Number(i.originalAmount ?? i.OriginalAmount) || 0), 0);
    this.totalCycle1Recovered = penaltyRows.reduce((sum, i) => sum + (Number(i.cycle1_Recovered ?? i.Cycle1_Recovered) || 0), 0);
    this.totalCycle2Recovered = penaltyRows.reduce((sum, i) => sum + (Number(i.cycle2_Recovered ?? i.Cycle2_Recovered) || 0), 0);
    this.totalRecovered = penaltyRows.reduce((sum, i) => sum + (Number(i.total_Recovered ?? i.Total_Recovered) || 0), 0);
    this.totalPendingBalance = penaltyRows.reduce((sum, i) => sum + (Number(i.pending_Balance ?? i.Pending_Balance) || 0), 0);

    if (this.totalOriginalAmount > 0) {
      this.recoveryRate = Math.min(100, (this.totalRecovered / this.totalOriginalAmount) * 100);
    } else {
      this.recoveryRate = 0;
    }
  }

  copyForExcel(): void {
    if (!this.filteredData.length) {
      this.toastr.info('No data to copy.', 'Empty');
      return;
    }

    const headers = [
      'POC', 'Date', 'Client', 'Model', 'Hub Name', 'Vehicle Type', 'Route / Block', 'FHR ID', 'Vendor Code', 
      'Vendor Name', 'Deduction Type', 'Shipment ID', 'Amount', 'Cycle 1 Recovered', 
      'Cycle 2 Recovered', 'Total Recovered', 'Pending Balance', 'Status', 'Remarks'
    ];

    const rows = this.filteredData.map(e => [
      e.poC_EntryNo,
      e.entryDate ? new Date(e.entryDate).toISOString().split('T')[0] : '',
      e.clientName || '',
      e.modelName || '',
      e.hubName || '',
      e.vehicle_Type || e.Vehicle_Type || e.vehicleType || '-',
      e.route || e.Route || '-',
      e.fhrid || '',
      e.vendorCode || '',
      e.vendorName || '',
      e.deductionType || '',
      e.shipmentID || '-',
      e.originalAmount || 0,
      e.cycle1_Recovered || 0,
      e.cycle2_Recovered || 0,
      e.total_Recovered || 0,
      e.pending_Balance || 0,
      e.recoveryStatus || '',
      e.recoveryRemarks || ''
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      this.toastr.success('TSV copied to clipboard! You can now paste directly into Excel.', 'Copied for Excel');
    }).catch(() => {
      this.toastr.error('Failed to copy to clipboard.', 'Error');
    });
  }

  exportExcel(): void {
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;
    const locationId = this.filterForm.get('location')?.value;
    const status = this.filterForm.get('recoveryStatus')?.value || 'ALL';

    this.loader.start();
    this.vendorService.exportRecoveryMISReport(fromDate, toDate, clientId, modelId, locationId, status).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        FileSaver.saveAs(blob, `Vendor_Deduction_Recovery_MIS_${fromDate}_to_${toDate}.xlsx`);
        this.toastr.success('Excel downloaded successfully.', 'Exported');
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to export Excel report.', 'Error');
      }
    });
  }

  openShipmentDetails(shipmentId: string): void {
    if (!shipmentId || shipmentId === '-') return;
    this.activeShipmentId = shipmentId;
    this.shipmentBreakdownData = [];
    this.isShipmentModalOpen = true;
    this.isLoadingShipmentBreakdown = true;

    this.vendorService.getShipmentRecoverySummary(shipmentId).subscribe({
      next: (res: any) => {
        this.isLoadingShipmentBreakdown = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.shipmentBreakdownData = res.data;
        } else {
          this.shipmentBreakdownData = [];
        }
      },
      error: () => {
        this.isLoadingShipmentBreakdown = false;
        this.shipmentBreakdownData = [];
        this.toastr.error('Failed to load shipment recovery details.', 'Error');
      }
    });
  }

  closeShipmentDetails(): void {
    this.isShipmentModalOpen = false;
    this.activeShipmentId = '';
    this.shipmentBreakdownData = [];
  }

  get totalShipmentAllocated(): number {
    return this.shipmentBreakdownData.reduce((sum, item) => sum + (Number(item.splitAmount) || 0), 0);
  }

  get totalShipmentRecovered(): number {
    return this.shipmentBreakdownData.reduce((sum, item) => sum + (Number(item.recoveredAmount) || 0), 0);
  }

  get totalShipmentPending(): number {
    return this.shipmentBreakdownData.reduce((sum, item) => sum + (Number(item.pendingDeficit) || 0), 0);
  }
}

