import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { VendorService } from '../Service/vendor.service';
import { DeductionTypeConfig, DEFAULT_DEDUCTION_TYPES, getDeductionTypesForClientAndModel, getDeductionTypesForModel } from '../vendor-deduction-entry/deduction-config';

interface DeductionPriorityItem {
  key: string;
  label: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-vendor-recovery-strategy-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, RouterModule],
  templateUrl: './vendor-recovery-strategy-config.component.html',
  styleUrls: ['./vendor-recovery-strategy-config.component.scss']
})
export class VendorRecoveryStrategyConfigComponent implements OnInit {
  configForm!: FormGroup;

  clientList: any[] = [];
  modelList: any[] = [];

  scopeType: 'GLOBAL' | 'SPECIFIC' = 'GLOBAL';

  // Current Policy State
  currentPolicy: any = null;
  selectedStrategy: 'FIFO' | 'PRIORITY' | 'PROPORTIONAL' = 'FIFO';
  maxRecoveryPercent: number = 100;
  isInherited: boolean = false;
  inheritedFrom: string = 'GlobalDefault';

  // Ordered list of deduction keys
  priorityItems: DeductionPriorityItem[] = [];

  // Live Simulation State
  simEarnings: number = 10000;
  simTotalDeductions: number = 0;
  simulatedResults: any[] = [];
  simPenalties: any[] = [];

  // Audit Logs State
  auditLogs: any[] = [];
  isAuditLoading: boolean = false;
  showAuditDrawer: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private vendorService: VendorService,
    private clientService: ClientMasterService,
    private commonService: ManualPunchBio
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.priorityItems = this.getActiveDeductions();
    this.recalculateSimulation();
    this.loadPolicy();
  }

  private initForm(): void {
    this.configForm = this.fb.group({
      clientId: [null],
      modelId: [null]
    });

    this.configForm.get('clientId')?.valueChanges.subscribe((cid: any) => {
      this.configForm.get('modelId')?.setValue(null, { emitEvent: false });
      this.loadModels(cid);
      if (this.scopeType === 'SPECIFIC') {
        this.updatePriorityList();
        this.loadPolicy();
      }
    });

    this.configForm.get('modelId')?.valueChanges.subscribe(() => {
      if (this.scopeType === 'SPECIFIC') {
        this.updatePriorityList();
        this.loadPolicy();
      }
    });
  }

  onScopeChange(scope: 'GLOBAL' | 'SPECIFIC'): void {
    this.scopeType = scope;
    if (scope === 'GLOBAL') {
      this.configForm.patchValue({ clientId: null, modelId: null }, { emitEvent: false });
      this.updatePriorityList();
      this.loadPolicy();
    } else {
      this.updatePriorityList();
      if (this.configForm.get('clientId')?.value) {
        this.loadPolicy();
      }
    }
  }

  getActiveDeductions(): DeductionPriorityItem[] {
    if (this.scopeType === 'SPECIFIC') {
      const clientVal = this.configForm.get('clientId')?.value;
      const modelVal = this.configForm.get('modelId')?.value;

      const clientObj = this.clientList.find(c => (c.value == clientVal || c.id == clientVal));
      const modelObj = this.modelList.find(m => (m.value == modelVal || m.id == modelVal));

      const clientName = clientObj?.name || '';
      const modelName = modelObj?.name || modelObj?.label || '';

      const configs = getDeductionTypesForClientAndModel(clientVal, modelVal, clientName, modelName);
      return configs
        .filter(c => !c.isPositive)
        .map(c => ({
          key: c.column,
          label: c.label,
          badgeClass: this.getBadgeClassForColumn(c.column)
        }));
    } else {
      // Global Standard: Distinct real deduction types across all models
      return DEFAULT_DEDUCTION_TYPES
        .filter(c => !c.isPositive)
        .map(c => ({
          key: c.column,
          label: c.label,
          badgeClass: this.getBadgeClassForColumn(c.column)
        }));
    }
  }

  private getBadgeClassForColumn(col: string): string {
    switch (col) {
      case 'Ded_COD': return 'bg-danger text-white';
      case 'Ded_Shipment': return 'bg-primary text-white';
      case 'Ded_Advance': return 'bg-info text-dark';
      case 'Ded_Rent': return 'bg-warning text-dark';
      case 'Ded_KarmaLife': return 'bg-dark text-white';
      case 'Ded_SD': return 'bg-success text-white';
      case 'Ded_TNT': return 'bg-danger-subtle text-danger';
      case 'Ded_Welfare': return 'bg-primary-subtle text-primary';
      case 'Ded_Insurance': return 'bg-info-subtle text-info';
      case 'Ded_Hold': return 'bg-secondary-subtle text-secondary';
      default: return 'bg-secondary text-white';
    }
  }

  updatePriorityList(savedOrderStr?: string | null): void {
    const active = this.getActiveDeductions();
    const orderToUse = savedOrderStr || (this.priorityItems && this.priorityItems.length > 0 ? this.priorityItems.map(p => p.key).join(',') : null);

    if (!orderToUse) {
      this.priorityItems = [...active];
      this.recalculateSimulation();
      return;
    }

    const keys = orderToUse.split(',').map(k => k.trim().toLowerCase());
    const ordered: DeductionPriorityItem[] = [];
    const remaining = [...active];

    for (const key of keys) {
      const idx = remaining.findIndex(item => item.key.toLowerCase() === key);
      if (idx !== -1) {
        ordered.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
    }

    this.priorityItems = [...ordered, ...remaining];
    this.recalculateSimulation();
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

  private loadModels(clientId: any): void {
    const costCentreId = clientId ? (typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId) : 0;
    if (!costCentreId) {
      this.modelList = [];
      this.updatePriorityList();
      return;
    }

    this.clientService.getModelListByClient(costCentreId).subscribe({
      next: (res: any) => {
        this.modelList = res?.isSuccess && Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        this.updatePriorityList();
      },
      error: () => {
        this.modelList = [];
        this.updatePriorityList();
      }
    });
  }

  loadPolicy(): void {
    const rawClient = this.scopeType === 'SPECIFIC' ? this.configForm.get('clientId')?.value : null;
    const rawModel = this.scopeType === 'SPECIFIC' ? this.configForm.get('modelId')?.value : null;

    const clientId = rawClient ? (typeof rawClient === 'object' ? (rawClient?.value || rawClient?.id) : rawClient) : null;
    const modelId = rawModel ? (typeof rawModel === 'object' ? (rawModel?.value || rawModel?.id) : rawModel) : null;

    this.loader.start();
    this.vendorService.getRecoveryPolicy(clientId ? Number(clientId) : null, modelId ? Number(modelId) : null).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res?.isSuccess && res.data) {
          this.currentPolicy = res.data;
          this.selectedStrategy = res.data.strategy || 'FIFO';
          this.maxRecoveryPercent = res.data.maxRecoveryPercent !== undefined && res.data.maxRecoveryPercent !== null ? Number(res.data.maxRecoveryPercent) : 100;
          this.isInherited = res.data.isInherited;
          this.inheritedFrom = res.data.inheritedFrom || 'GlobalDefault';

          this.parsePriorityOrder(res.data.priorityOrder);
        } else {
          this.updatePriorityList();
        }
        this.recalculateSimulation();
      },
      error: () => {
        this.loader.stop();
        this.updatePriorityList();
        this.recalculateSimulation();
      }
    });
  }

  private parsePriorityOrder(orderStr: string | null): void {
    this.updatePriorityList(orderStr);
  }

  selectStrategy(strategy: 'FIFO' | 'PRIORITY' | 'PROPORTIONAL'): void {
    this.selectedStrategy = strategy;
    this.recalculateSimulation();
  }

  // Priority Re-ordering
  movePriorityUp(index: number): void {
    if (index > 0) {
      const temp = this.priorityItems[index];
      this.priorityItems[index] = this.priorityItems[index - 1];
      this.priorityItems[index - 1] = temp;
      this.recalculateSimulation();
    }
  }

  movePriorityDown(index: number): void {
    if (index < this.priorityItems.length - 1) {
      const temp = this.priorityItems[index];
      this.priorityItems[index] = this.priorityItems[index + 1];
      this.priorityItems[index + 1] = temp;
      this.recalculateSimulation();
    }
  }

  // Strict 1 to 100 validation: Disallow 0, negatives, signs, and non-digits
  onCapKeyDown(event: KeyboardEvent): void {
    const allowedControlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedControlKeys.includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    // Disallow non-digits (blocks '-', '+', 'e', 'E', '.', ',', etc.)
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    if (!input) return;

    // Disallow '0' if input is empty or completely selected (since 0 is not allowed)
    const isAllSelected = (input.selectionStart === 0 && input.selectionEnd === input.value.length);
    if (event.key === '0' && (!input.value || isAllSelected || input.value === '0')) {
      event.preventDefault();
      return;
    }

    // Check if resulting number would exceed 100
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const nextValStr = input.value.slice(0, start) + event.key + input.value.slice(end);
    const nextVal = parseInt(nextValStr, 10);
    if (!isNaN(nextVal) && nextVal > 100) {
      event.preventDefault();
      this.maxRecoveryPercent = 100;
      input.value = '100';
      this.recalculateSimulation();
    }
  }

  onCapInput(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    // If browser marks as invalid (e.g. pasted invalid text into number input)
    if (input.validity && input.validity.badInput) {
      input.value = this.maxRecoveryPercent ? this.maxRecoveryPercent.toString() : '100';
      return;
    }

    let clean = input.value.replace(/\D/g, '').replace(/^0+/, '');

    if (clean === '') {
      input.value = '';
      return;
    }

    let val = parseInt(clean, 10);
    if (val > 100) {
      val = 100;
    } else if (val < 1) {
      val = 1;
    }

    input.value = val.toString();
    this.maxRecoveryPercent = val;
    this.recalculateSimulation();
  }

  onCapPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digitsOnly = pasted.replace(/\D/g, '').replace(/^0+/, '');
    const input = event.target as HTMLInputElement;

    if (!digitsOnly) {
      if (input) input.value = '1';
      this.maxRecoveryPercent = 1;
      this.recalculateSimulation();
      return;
    }

    let num = parseInt(digitsOnly, 10);
    if (num > 100) num = 100;
    if (num < 1) num = 1;

    this.maxRecoveryPercent = num;
    if (input) input.value = num.toString();
    this.recalculateSimulation();
  }

  onCapBlur(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    if (!input.value || Number(input.value) < 1 || (input.validity && input.validity.badInput)) {
      this.maxRecoveryPercent = 1;
      input.value = '1';
      this.recalculateSimulation();
    } else if (Number(input.value) > 100) {
      this.maxRecoveryPercent = 100;
      input.value = '100';
      this.recalculateSimulation();
    }
  }

  setRecoveryCap(percent: number): void {
    this.maxRecoveryPercent = Math.min(100, Math.max(1, Math.round(Number(percent) || 1)));
    this.recalculateSimulation();
  }

  savePolicy(): void {
    const rawClient = this.scopeType === 'SPECIFIC' ? this.configForm.get('clientId')?.value : null;
    const rawModel = this.scopeType === 'SPECIFIC' ? this.configForm.get('modelId')?.value : null;

    const clientId = rawClient ? (typeof rawClient === 'object' ? (rawClient?.value || rawClient?.id) : rawClient) : null;
    const modelId = rawModel ? (typeof rawModel === 'object' ? (rawModel?.value || rawModel?.id) : rawModel) : null;

    if (this.scopeType === 'SPECIFIC' && !clientId) {
      this.toastr.warning('Please select a Client to configure a specific policy.', 'Client Required');
      return;
    }

    const priorityOrderStr = this.priorityItems.map(item => item.key).join(',');

    const payload = {
      clientId: clientId ? Number(clientId) : null,
      modelId: modelId ? Number(modelId) : null,
      strategy: this.selectedStrategy,
      priorityOrder: priorityOrderStr,
      maxRecoveryPercent: Number(this.maxRecoveryPercent) || 100
    };

    this.loader.start();
    this.vendorService.saveRecoveryPolicy(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res?.isSuccess) {
          this.toastr.success(res?.message || 'Policy saved successfully! Audit log created.', 'Success');
          this.loadPolicy();
        } else {
          this.toastr.error(res?.message || 'Failed to save policy.', 'Error');
        }
      },
      error: (err: any) => {
        this.loader.stop();
        this.toastr.error(err?.error?.message || err?.message || 'Server error while saving policy.', 'Error');
      }
    });
  }

  private getSampleAmountForDeduction(key: string, idx: number): number {
    const realisticAmounts: { [key: string]: number } = {
      'Ded_Shipment': 4500,
      'Ded_COD': 3000,
      'Ded_Advance': 2000,
      'Ded_Rent': 1500,
      'Ded_KarmaLife': 1200,
      'Ded_Hold': 1000,
      'Ded_SD': 1000,
      'Ded_Insurance': 800,
      'Ded_TNT': 600,
      'Ded_Welfare': 500,
      'Ded_Other': 1000
    };
    return realisticAmounts[key] || Math.max(500, 2000 - (idx * 200));
  }

  // Live Simulator Calculations
  recalculateSimulation(): void {
    if (this.priorityItems && this.priorityItems.length > 0) {
      // Map all authentic deduction types for the selected client/model (or global default)
      this.simPenalties = this.priorityItems.map((p, i) => ({
        name: p.label,
        key: p.key,
        amount: this.getSampleAmountForDeduction(p.key, i)
      }));
    } else {
      this.simPenalties = [];
    }

    this.simTotalDeductions = this.simPenalties.reduce((sum, p) => sum + p.amount, 0);
    const rawEarnings = Number(this.simEarnings) || 0;
    const maxCapPct = Math.min(100, Math.max(1, Number(this.maxRecoveryPercent) || 100));
    const cappedEarnings = Math.round(rawEarnings * (maxCapPct / 100.0) * 100) / 100;
    const earnings = cappedEarnings;
    const total = this.simTotalDeductions;

    if (this.selectedStrategy === 'PROPORTIONAL') {
      this.simulatedResults = this.simPenalties.map(p => {
        const ratio = total > 0 ? p.amount / total : 0;
        const deficitTotal = Math.max(0, total - earnings);
        const itemDeficit = Math.round(deficitTotal * ratio * 100) / 100;
        const recovered = Math.round((p.amount - itemDeficit) * 100) / 100;
        return {
          name: p.name,
          key: p.key,
          original: p.amount,
          recovered: Math.max(0, recovered),
          pending: Math.max(0, itemDeficit),
          status: itemDeficit <= 0 ? 'Fully Recovered' : (recovered > 0 ? 'Partially Recovered' : 'Pending')
        };
      });
      return;
    }

    // Determine ordering for FIFO or Priority
    let list = [...this.simPenalties];
    if (this.selectedStrategy === 'PRIORITY') {
      const orderKeys = this.priorityItems.map(item => item.key);
      list.sort((a, b) => {
        const idxA = orderKeys.indexOf(a.key);
        const idxB = orderKeys.indexOf(b.key);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
    }

    let remainingEarnings = earnings;
    this.simulatedResults = list.map(p => {
      let recovered = 0;
      if (remainingEarnings >= p.amount) {
        recovered = p.amount;
        remainingEarnings -= p.amount;
      } else {
        recovered = remainingEarnings;
        remainingEarnings = 0;
      }
      const pending = p.amount - recovered;
      return {
        name: p.name,
        key: p.key,
        original: p.amount,
        recovered,
        pending,
        status: pending === 0 ? 'Fully Recovered' : (recovered > 0 ? 'Partially Recovered' : 'Pending')
      };
    });
  }

  // Audit Log Management
  openAuditDrawer(): void {
    this.showAuditDrawer = true;
    this.loadAuditLogs();
  }

  closeAuditDrawer(): void {
    this.showAuditDrawer = false;
  }

  loadAuditLogs(): void {
    const clientId = this.scopeType === 'SPECIFIC' ? this.configForm.get('clientId')?.value : null;
    const modelId = this.scopeType === 'SPECIFIC' ? this.configForm.get('modelId')?.value : null;

    this.isAuditLoading = true;
    this.vendorService.getRecoveryPolicyAuditLog(clientId, modelId).subscribe({
      next: (res: any) => {
        this.isAuditLoading = false;
        this.auditLogs = res?.data || [];
      },
      error: () => {
        this.isAuditLoading = false;
        this.auditLogs = [];
      }
    });
  }

  getAuditOrderItems(val: string | null): string[] {
    if (!val || val === 'None' || val === 'NULL' || val.trim() === '') return [];
    return val.split(',').map(k => k.trim()).filter(k => !!k).map(k => this.getDeductionLabel(k));
  }

  getDeductionLabel(key: string): string {
    const knownLabels: Record<string, string> = {
      'Ded_Shipment': 'Shipment Deduction',
      'Ded_COD': 'COD Deduction',
      'Ded_Advance': 'Advance Deduction',
      'Ded_Rent': 'Rent Deduction',
      'Ded_KarmaLife': 'Karma Life Deduction',
      'Ded_Hold': 'Hold',
      'Ded_SD': 'SD',
      'Ded_Insurance': 'Insurance Deduction',
      'Ded_TNT': 'TNT Deduction',
      'Ded_Welfare': 'Welfare Deduction',
      'Ded_Other': 'Other Deduction',
      'Ded_Arrear': 'Arrear'
    };
    if (knownLabels[key]) return knownLabels[key];
    return key.replace(/^Ded_/, '').replace(/([A-Z])/g, ' $1').trim() + ' Deduction';
  }

  formatFieldName(fieldName: string): string {
    if (fieldName === 'PriorityOrder') return 'Priority Hierarchy';
    if (fieldName === 'Strategy') return 'Settlement Strategy';
    if (fieldName === 'Policy Created') return 'Initial Policy Setup';
    return fieldName;
  }

  formatStrategyName(val: string | null): string {
    if (!val || val === 'None' || val === 'NULL') return val || '-';
    if (val === 'FIFO') return 'FIFO (Chronological)';
    if (val === 'PRIORITY') return 'Priority-Based Ranking';
    if (val === 'PROPORTIONAL') return 'Proportional Distribution';
    return val;
  }
}
