import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { VendorService } from '../Service/vendor.service';
import { DeductionTypeConfig, getDeductionTypesForModel, getDeductionTypesForClientAndModel } from './deduction-config';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-vendor-deduction-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './vendor-deduction-entry.component.html',
  styleUrls: ['./vendor-deduction-entry.component.scss']
})
export class VendorDeductionEntryComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  entryForm!: FormGroup;

  // Dropdown lists
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];
  allLinkedVendors: any[] = [];
  filteredVendors: any[] = [];

  // Active Deduction Types for current Model
  availableDeductionTypes: DeductionTypeConfig[] = [];

  // Special Model Requirements (Amazon DSP & EDSP)
  vehicleTypeList: any[] = [];
  routeBlockList: any[] = [];
  isVehicleTypeRequired: boolean = false;
  isRouteRequired: boolean = false;

  // Currently Selected Vendor Details
  selectedVendor: any = null;

  // Localized loading states (no full-screen blocking overlay)
  isVendorsLoading: boolean = false;
  isSaving: boolean = false;
  isLoadingFactBox: boolean = false;
  formSubmitted: boolean = false;

  // Fact Box State
  isFactBoxOpen: boolean = true;
  factBoxSummary: any = {
    totalEntriesCount: 0,
    totalDeductionAmount: 0,
    priorCycleDeficit: 0,
    isSynced: false,
    isLocked: false,
    syncedDate: null,
    recentEntries: []
  };

  public deductionTypeBreakdown: { type: string; count: number; total: number; icon: string; bgClass: string; isArrear?: boolean }[] = [];
  public totalPenaltiesAmount: number = 0;
  public totalArrearsAmount: number = 0;
  public netCycleImpact: number = 0;
  public activeEditingEntryId: number | null = null;
  public pendingDeleteEntry: any = null;
  public isDeletingEntry: boolean = false;
  private factBoxSub?: Subscription;

  isCycleLocked: boolean = false;
  isLocationsLoading: boolean = false;

  // Split Shipment Entry State (Full In-Page Mode)
  isSplitMode: boolean = false;
  isSplitModalOpen: boolean = false;
  splitShipmentForm!: FormGroup;
  splitSelectedLocation: any = '';
  splitLocationList: { value: string; name: string }[] = [];
  availableHubVendors: any[] = [];
  filteredHubVendors: any[] = [];
  selectedSplitVendors: { vendor: any; amount: number }[] = [];
  hubVendorSearch: string = '';
  pastedVendorText: string = '';
  isPasteBoxOpen: boolean = false;
  isSavingSplit: boolean = false;
  splitFormSubmitted: boolean = false;
  syncedVendorFhrids: Set<string> = new Set();
  syncedVendorCodes: Set<string> = new Set();
  isLoadingSyncStatus: boolean = false;

  // Excel Bulk Upload State
  isExcelModalOpen: boolean = false;
  selectedExcelFile: File | null = null;
  isDownloadingTemplate: boolean = false;
  isUploadingExcel: boolean = false;
  excelUploadErrors: string[] = [];
  excelUploadSuccessMessage: string = '';

  // Shipment Recovery Tracker Modal State
  isShipmentTrackerModalOpen: boolean = false;
  searchedShipmentId: string = '';
  shipmentRecoveryData: any[] = [];
  isLoadingShipmentRecovery: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private vendorService: VendorService,
    private clientService: ClientMasterService,
    private commonService: ManualPunchBio,
    private dropdownService: DropdownService
  ) {}

  navigateToDeductionUpload(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_deduction_upload']);
  }

  ngOnInit(): void {
    this.initForms();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.factBoxSub?.unsubscribe();
  }

  private initForms(): void {
    this.filterForm = this.fb.group({
      client: [null, Validators.required],
      model: [null, Validators.required],
      location: [null, Validators.required],
      vendor: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      vehicleType: [null],
      route: [null]
    });

    this.entryForm = this.fb.group({
      items: this.fb.array([])
    });

    // Add first row by default
    this.addDeductionLine();
    this.initSplitForm();

    // Cascading Handlers
    this.filterForm.get('client')?.valueChanges.subscribe((clientId: any) => {
      this.filterForm.get('model')?.setValue(null, { emitEvent: false });
      this.filterForm.get('location')?.setValue(null, { emitEvent: false });
      this.filterForm.get('vendor')?.setValue(null, { emitEvent: false });
      this.filterForm.get('vehicleType')?.setValue(null, { emitEvent: false });
      this.filterForm.get('route')?.setValue(null, { emitEvent: false });
      this.selectedVendor = null;
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      this.locationList = [];
      this.modelList = [];
      this.resetFactBox();
      this.updateSpecialModelFields();
      this.filterModelsByClient(clientId);
    });

    this.filterForm.get('model')?.valueChanges.subscribe((modelId: any) => {
      this.filterForm.get('location')?.setValue(null, { emitEvent: false });
      this.filterForm.get('vendor')?.setValue(null, { emitEvent: false });
      this.filterForm.get('vehicleType')?.setValue(null, { emitEvent: false });
      this.filterForm.get('route')?.setValue(null, { emitEvent: false });
      this.selectedVendor = null;
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      this.locationList = [];
      this.resetFactBox();
      this.updateActiveDeductionTypes();
      this.updateSpecialModelFields();
      this.loadLinkedLocations();
    });

    this.filterForm.get('vendor')?.valueChanges.subscribe((vendor: any) => {
      this.selectedVendor = vendor;
      if (!vendor) {
        this.resetFactBox();
      } else {
        this.checkAndLoadFactBox();
      }
    });

    this.filterForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.checkAndLoadFactBox();
    });

    this.filterForm.get('toDate')?.valueChanges.subscribe(() => {
      this.checkAndLoadFactBox();
    });

    this.filterForm.get('vehicleType')?.valueChanges.subscribe(() => {
      this.checkAndLoadFactBox();
    });

    this.filterForm.get('route')?.valueChanges.subscribe(() => {
      this.checkAndLoadFactBox();
    });
  }

  get items(): FormArray {
    return this.entryForm.get('items') as FormArray;
  }

  addDeductionLine(preset?: any): void {
    const rawAmt = preset?.amount !== undefined && preset?.amount !== null && preset?.amount !== '' 
      ? Math.max(0.01, Math.abs(Number(preset.amount))) 
      : '';

    const row = this.fb.group({
      deductionEntryId: [preset?.deductionEntryId || 0],
      deductionType: [preset?.deductionType || null, Validators.required],
      standardDbColumn: [preset?.standardDbColumn || '', Validators.required],
      shipmentId: [preset?.shipmentId || ''],
      amount: [rawAmt, [Validators.required, Validators.min(0.01)]],
      remarks: [preset?.remarks || '']
    });

    // Auto-update standardDbColumn when deductionType changes
    row.get('deductionType')?.valueChanges.subscribe((selectedType: any) => {
      const config = this.availableDeductionTypes.find(t => t.label === selectedType);
      if (config) {
        row.get('standardDbColumn')?.setValue(config.column);
      }
    });

    // Auto-sanitize amount to always be positive
    row.get('amount')?.valueChanges.subscribe((val: any) => {
      if (val !== null && val !== undefined && val !== '') {
        const num = parseFloat(val);
        if (!isNaN(num) && num < 0) {
          row.get('amount')?.setValue(Math.abs(num), { emitEvent: false });
        }
      }
    });

    this.items.push(row);
  }

  // Keyboard, input and paste protection against negative amounts
  onAmountKeyDown(event: KeyboardEvent): void {
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onAmountInput(index: number, event: any): void {
    const ctrl = this.items.at(index)?.get('amount');
    if (!ctrl) return;
    const input = event.target as HTMLInputElement;
    if (!input) return;

    if (input.value && (input.value.includes('-') || input.value.includes('+'))) {
      input.value = input.value.replace(/[-+]/g, '');
      ctrl.setValue(input.value ? parseFloat(input.value) : null);
    }
    const num = parseFloat(input.value);
    if (!isNaN(num) && num < 0) {
      const pos = Math.abs(num);
      input.value = pos.toString();
      ctrl.setValue(pos);
    }
  }

  onAmountPaste(index: number, event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') || '';
    if (pasted.includes('-') || pasted.includes('+')) {
      event.preventDefault();
      const cleaned = pasted.replace(/[-+]/g, '').trim();
      const num = parseFloat(cleaned);
      const ctrl = this.items.at(index)?.get('amount');
      const input = event.target as HTMLInputElement;
      if (!isNaN(num) && num > 0) {
        if (ctrl) ctrl.setValue(num);
        if (input) input.value = num.toString();
      } else {
        if (ctrl) ctrl.setValue(null);
        if (input) input.value = '';
      }
    }
  }

  onAmountBlur(index: number, event: any): void {
    const ctrl = this.items.at(index)?.get('amount');
    if (!ctrl) return;
    const val = parseFloat(ctrl.value);
    if (!isNaN(val) && val < 0) {
      ctrl.setValue(Math.abs(val));
    }
  }

  removeDeductionLine(index: number): void {
    if (this.activeEditingEntryId) {
      this.cancelEdit();
      return;
    }
    if (this.items.length > 1) {
      this.items.removeAt(index);
    } else {
      this.items.reset();
    }
  }

  clearGrid(): void {
    this.activeEditingEntryId = null;
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }
    this.addDeductionLine();
  }

  get totalGridAmount(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const val = parseFloat(ctrl.get('amount')?.value) || 0;
      return sum + Math.max(0, val);
    }, 0);
  }

  private loadClients(): void {
    this.commonService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        const raw = res?.data || [];
        this.clientList = (Array.isArray(raw) ? raw : [])
          .filter((c: any) => {
            const name = String(c?.name || c?.client_name || '').trim();
            const val = Number(c?.value || c?.client_id || 0);
            return name && !name.includes('-- Select --') && !isNaN(val) && val > 0;
          })
          .map((c: any) => ({
            value: Number(c.value || c.client_id),
            name: String(c.name || c.client_name).trim()
          }));
      },
      error: () => {
        this.clientList = [];
      }
    });
  }

  private filterModelsByClient(clientId: any): void {
    const costCentreId = clientId ? (typeof clientId === 'object' ? (clientId.value || clientId.id) : clientId) : 0;
    if (!costCentreId) return;

    this.clientService.getModelListByClient(costCentreId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.modelList = res.data.filter((m: any) => {
            const name = String(m?.name || m?.model_name || '').trim();
            const val = Number(m?.value || m?.model_id || 0);
            return name && !name.includes('-- Select --') && !isNaN(val) && val > 0;
          });
        } else {
          this.modelList = [];
        }
      },
      error: () => {
        this.modelList = [];
      }
    });
  }

  private updateActiveDeductionTypes(): void {
    const clientVal = this.filterForm.get('client')?.value;
    const modelVal = this.filterForm.get('model')?.value;

    const clientObj = this.clientList.find(c => c.value == clientVal);
    const modelObj = this.modelList.find(m => m.value == modelVal);

    const clientName = clientObj?.name || '';
    const modelName = modelObj?.name || '';

    this.availableDeductionTypes = getDeductionTypesForClientAndModel(clientVal, modelVal, clientName, modelName);
  }

  cleanDropdownName(rawName: string): string {
    if (!rawName) return '';
    let name = rawName.toString().trim();
    if (name.includes(':')) {
      const parts = name.split(':');
      name = parts[parts.length - 1].trim();
    }
    return name;
  }

  loadVehicleTypes(): void {
    if (this.vehicleTypeList.length > 0) return;
    this.vendorService.getVehicleTypes().subscribe({
      next: (res: any) => {
        const rawList = res?.data || res?.list || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList)) {
          this.vehicleTypeList = rawList.map((x: any) => {
            const raw = x.name || x.Name || x.codeDescription || x.CodeDescription || x.text || x.description || '';
            const name = this.cleanDropdownName(raw);
            return { name, value: name };
          }).filter((x: any) => x.name !== '');
        }
      },
      error: () => {
        this.vehicleTypeList = [];
      }
    });
  }

  loadRouteBlocks(): void {
    if (this.routeBlockList.length > 0) return;
    this.vendorService.getRouteBlocks().subscribe({
      next: (res: any) => {
        const rawList = res?.data || res?.list || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList)) {
          this.routeBlockList = rawList.map((x: any) => {
            const raw = x.name || x.Name || x.codeDescription || x.CodeDescription || x.text || x.description || '';
            const name = this.cleanDropdownName(raw);
            return { name, value: name };
          }).filter((x: any) => x.name !== '');
        }
      },
      error: () => {
        this.routeBlockList = [];
      }
    });
  }

  updateSpecialModelFields(): void {
    const clientVal = this.filterForm.get('client')?.value;
    const modelVal = this.filterForm.get('model')?.value;

    const clientObj = this.clientList.find(c => c.value == clientVal);
    const modelObj = this.modelList.find(m => m.value == modelVal);

    const clientName = (clientObj?.name || '').toLowerCase().trim();
    const modelName = (modelObj?.name || '').toLowerCase().trim();

    const isAmazon = clientName.includes('amazon');
    const isDsp = modelName === 'dsp' || (modelName.includes('dsp') && !modelName.includes('edsp'));
    const isEdsp = modelName.includes('edsp');

    if (isAmazon && isDsp) {
      this.isVehicleTypeRequired = true;
      this.isRouteRequired = true;
      this.filterForm.get('vehicleType')?.setValidators([Validators.required]);
      this.filterForm.get('route')?.setValidators([Validators.required]);
      this.loadVehicleTypes();
      this.loadRouteBlocks();
    } else if (isAmazon && isEdsp) {
      this.isVehicleTypeRequired = true;
      this.isRouteRequired = false;
      this.filterForm.get('vehicleType')?.setValidators([Validators.required]);
      this.filterForm.get('route')?.clearValidators();
      this.filterForm.get('route')?.setValue(null, { emitEvent: false });
      this.loadVehicleTypes();
    } else {
      this.isVehicleTypeRequired = false;
      this.isRouteRequired = false;
      this.filterForm.get('vehicleType')?.clearValidators();
      this.filterForm.get('vehicleType')?.setValue(null, { emitEvent: false });
      this.filterForm.get('route')?.clearValidators();
      this.filterForm.get('route')?.setValue(null, { emitEvent: false });
    }

    this.filterForm.get('vehicleType')?.updateValueAndValidity({ emitEvent: false });
    this.filterForm.get('route')?.updateValueAndValidity({ emitEvent: false });
  }

  loadLinkedLocations(): void {
    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;

    if (!clientId || !modelId) {
      this.locationList = [];
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      return;
    }

    this.isLocationsLoading = true;
    this.vendorService.getLinkedLocations(clientId, modelId).subscribe({
      next: (res: any) => {
        this.isLocationsLoading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          this.locationList = res.data
            .map((x: any) => ({
              value: String(x.value || x.Value || ''),
              name: String(x.name || x.Name || x.value || '')
            }))
            .filter((x: any) => x.value !== '');
        } else {
          this.fallbackToGlobalLocations();
        }
      },
      error: () => {
        this.isLocationsLoading = false;
        this.fallbackToGlobalLocations();
      }
    });
  }

  private fallbackToGlobalLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        this.locationList = (data || []).map((l: any) => ({
          value: String(l.value || l.id || ''),
          name: String(l.name || l.text || '')
        })).filter(l => l.value !== '');
      },
      error: () => {
        this.locationList = [];
      }
    });
  }

  loadVendorsForLocation(locationId: string): void {
    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;

    if (!clientId || !modelId) return;

    this.isVendorsLoading = true;
    this.vendorService.getLinkedVendors(clientId, modelId, locationId).subscribe({
      next: (res: any) => {
        this.isVendorsLoading = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.allLinkedVendors = res.data
            .filter((x: any) => (x.vendorCode || x.VendorCode || '').trim() !== '')
            .map((x: any) => {
              const fhrid = x.fhrid || x.FHRID || '';
              const vendorCode = (x.vendorCode || x.VendorCode || '').trim();
              const vendorName = (x.vendorName || x.VendorName || '').trim();
              const locID = x.locationID || x.LocationID || locationId;
              const locName = x.locationName || x.LocationName || '';
              return {
                fhrid,
                vendorCode,
                vendorName,
                locationID: locID,
                locationName: locName,
                displayName: `${vendorCode} - ${vendorName || fhrid} (${fhrid})`
              };
            });
          this.filteredVendors = [...this.allLinkedVendors];
        } else {
          this.allLinkedVendors = [];
          this.filteredVendors = [];
        }
      },
      error: () => {
        this.isVendorsLoading = false;
        this.allLinkedVendors = [];
        this.filteredVendors = [];
      }
    });
  }

  getClientName(): string {
    const val = this.filterForm?.get('client')?.value;
    const found = this.clientList.find(c => c.value == val);
    return found?.name || 'Selected Client';
  }

  getModelName(): string {
    const val = this.filterForm?.get('model')?.value;
    const found = this.modelList.find(m => m.value == val);
    return found?.name || 'Selected Model';
  }

  resetFactBox(): void {
    this.factBoxSub?.unsubscribe();
    this.isLoadingFactBox = false;
    this.factBoxSummary = {
      totalEntriesCount: 0,
      totalDeductionAmount: 0,
      priorCycleDeficit: 0,
      isSynced: false,
      isLocked: false,
      syncedDate: null,
      recentEntries: []
    };
    this.totalPenaltiesAmount = 0;
    this.totalArrearsAmount = 0;
    this.netCycleImpact = 0;
    this.deductionTypeBreakdown = [];
    this.isCycleLocked = false;
    this.entryForm.enable();
  }

  onLocationChange(locItem: any): void {
    const locId = (locItem && typeof locItem === 'object' && locItem.value !== undefined) ? locItem.value : (locItem || null);

    this.filterForm.get('vendor')?.setValue(null, { emitEvent: false });
    this.selectedVendor = null;
    this.resetFactBox();

    if (locId) {
      this.loadVendorsForLocation(locId);
    } else {
      this.allLinkedVendors = [];
      this.filteredVendors = [];
    }
  }

  onVendorChange(vendorItem: any): void {
    this.selectedVendor = vendorItem;
    if (!vendorItem) {
      this.resetFactBox();
      return;
    }
    // Auto-select location if not already picked
    if (vendorItem && vendorItem.locationID && !this.filterForm.get('location')?.value) {
      this.filterForm.get('location')?.setValue(vendorItem.locationID, { emitEvent: false });
      this.onLocationChange(vendorItem.locationID);
    }
    this.checkAndLoadFactBox();
  }

  onVendorClear(): void {
    this.selectedVendor = null;
    this.resetFactBox();
  }

  checkAndLoadFactBox(): void {
    const rawClient = this.filterForm.get('client')?.value;
    const clientId = rawClient ? (typeof rawClient === 'object' ? (rawClient.value || rawClient.id) : rawClient) : null;
    const rawModel = this.filterForm.get('model')?.value;
    const modelId = rawModel ? (typeof rawModel === 'object' ? (rawModel.value || rawModel.id) : rawModel) : null;
    const vendor = this.selectedVendor;
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    const locationId = this.filterForm.get('location')?.value || vendor?.locationID || '';

    if (!clientId || !modelId || !vendor || !fromDate || !toDate) {
      this.resetFactBox();
      return;
    }

    if (this.isVehicleTypeRequired && !this.filterForm.get('vehicleType')?.value) {
      this.resetFactBox();
      return;
    }

    if (this.isRouteRequired && !this.filterForm.get('route')?.value) {
      this.resetFactBox();
      return;
    }

    const fhrid = vendor.fhrid || vendor.FHRID;
    if (!fhrid) {
      this.resetFactBox();
      return;
    }

    const vehicleType = this.filterForm.get('vehicleType')?.value || '';
    const route = this.filterForm.get('route')?.value || '';

    // Cancel previous in-flight request to prevent race conditions and delayed loaders
    this.factBoxSub?.unsubscribe();

    this.isLoadingFactBox = true;
    this.factBoxSub = this.vendorService.getFactBoxDeductionSummary(clientId, modelId, fhrid, fromDate, toDate, locationId, vehicleType, route).subscribe({
      next: (res: any) => {
        this.isLoadingFactBox = false;
        if (res?.isSuccess && res.data) {
          this.factBoxSummary = res.data;
          this.updateDeductionBreakdown();
          this.isCycleLocked = !!(res.data.isLocked || res.data.isSynced);
          if (this.isCycleLocked) {
            this.entryForm.disable();
          } else {
            this.entryForm.enable();
          }
        } else {
          this.resetFactBox();
        }
      },
      error: () => {
        this.resetFactBox();
      }
    });
  }

  saveAllEntries(): void {
    this.formSubmitted = true;

    if (this.isCycleLocked) {
      this.toastr.warning('This cycle is already synced to Payment Transactions and locked.', 'Locked Cycle');
      return;
    }

    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.toastr.error('Please complete all selection filters (Client, Model, Vendor, Date Range' + (this.isVehicleTypeRequired ? ', Vehicle Type' : '') + (this.isRouteRequired ? ', Route' : '') + ').', 'Validation Error');
      return;
    }

    if (this.entryForm.invalid || this.items.length === 0) {
      this.entryForm.markAllAsTouched();
      this.toastr.error('Please ensure all deduction lines have valid Deduction Type and Amount > 0.', 'Validation Error');
      return;
    }

    const rawItems = this.entryForm.getRawValue().items;
    const invalidAmount = rawItems.some((r: any) => !r.amount || Number(r.amount) <= 0 || isNaN(Number(r.amount)));
    if (invalidAmount) {
      this.toastr.error('All deduction amounts must be positive and greater than zero.', 'Invalid Amount');
      return;
    }

    const missingShipmentId = rawItems.some((r: any) => {
      const type = (r.deductionType || '').toLowerCase();
      const col = (r.standardDbColumn || '').toLowerCase();
      const isShipment = type.includes('shipment') || type === 'deduction' || col === 'ded_shipment';
      return isShipment && (!r.shipmentId || !r.shipmentId.trim());
    });
    if (missingShipmentId) {
      this.toastr.error('Shipment / Waybill ID is mandatory for all Shipment Deduction lines.', 'Shipment ID Required');
      return;
    }

    const vendor = this.selectedVendor;
    const fhrid = vendor?.fhrid || vendor?.FHRID || this.filterForm.get('vendor')?.value?.fhrid || this.filterForm.get('vendor')?.value?.FHRID;
    const locId = this.filterForm.get('location')?.value || vendor?.locationID || '';

    const payload = {
      clientId: Number(this.filterForm.get('client')?.value),
      modelId: Number(this.filterForm.get('model')?.value),
      locationId: locId,
      fhrid: fhrid,
      fromDate: this.filterForm.get('fromDate')?.value,
      toDate: this.filterForm.get('toDate')?.value,
      vehicleType: this.filterForm.get('vehicleType')?.value || null,
      route: this.filterForm.get('route')?.value || null,
      items: rawItems.map((r: any) => ({
        pk_DeductionEntryId: Number(r.deductionEntryId || 0),
        deductionEntryId: Number(r.deductionEntryId || 0),
        deductionType: r.deductionType,
        standardDbColumn: r.standardDbColumn,
        shipmentId: r.shipmentId || '',
        amount: Math.abs(Number(r.amount)),
        remarks: r.remarks || ''
      }))
    };

    this.isSaving = true;
    this.vendorService.saveDeductionEntries(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Deductions saved successfully!', 'Saved');
          this.formSubmitted = false;
          this.activeEditingEntryId = null;
          this.clearGrid();
          this.checkAndLoadFactBox();
        } else {
          this.toastr.error(res?.message || 'Failed to save deductions.', 'Error');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.toastr.error(err?.error?.message || err?.message || 'Server error while saving deductions.', 'Error');
      }
    });
  }

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  get currentUserName(): string {
    return (sessionStorage.getItem('username') || localStorage.getItem('username') || sessionStorage.getItem('name') || localStorage.getItem('name') || '').trim();
  }

  get currentUserId(): string {
    return (sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || sessionStorage.getItem('USERID') || localStorage.getItem('UserId') || '').trim();
  }

  canEditEntry(item: any): boolean {
    if (this.isCycleLocked) return false;
    if (!item) return false;
    const createdBy = String(item.createdBy || item.CreatedBy || item.entryBy || item.EntryBy || '').trim().toLowerCase();
    const myUser = this.currentUserName.toLowerCase();
    const myId = this.currentUserId.toLowerCase();

    if (!createdBy) return true;
    if (myUser && createdBy === myUser) return true;
    if (myId && createdBy === myId) return true;
    if (myUser && createdBy.includes(myUser)) return true;
    if (myId && createdBy.includes(myId)) return true;
    return false;
  }

  getEntryId(item: any): number {
    return Number(
      item?.pk_DeductionEntryId ??
      item?.Pk_DeductionEntryId ??
      item?.pk_deductionEntryId ??
      item?.deductionEntryId ??
      item?.DeductionEntryId ??
      item?.id ??
      0
    );
  }

  cancelEdit(): void {
    this.activeEditingEntryId = null;
    this.clearGrid();
    this.toastr.info('Exited edit mode.', 'Cancelled');
  }

  editCycleEntry(item: any): void {
    if (!this.canEditEntry(item)) {
      this.toastr.warning('You can only edit deductions created by you.', 'Permission Denied');
      return;
    }
    if (this.isCycleLocked) {
      this.toastr.warning('This cycle is already synchronized and locked.', 'Locked Cycle');
      return;
    }

    const entryId = this.getEntryId(item);
    if (!entryId) return;

    if (this.activeEditingEntryId === entryId) {
      this.toastr.info(`Deduction #${entryId} is already in edit mode.`, 'Editing');
      return;
    }

    const type = item.deductionType || item.DeductionType;
    const config = this.availableDeductionTypes.find(t => t.label === type);
    const col = item.standardDbColumn || item.StandardDbColumn || config?.column || 'OtherDeduction';
    const shipId = (item.shipmentID || item.ShipmentID || '') === '-' ? '' : (item.shipmentID || item.ShipmentID || '');

    // Set active editing ID
    this.activeEditingEntryId = entryId;

    // Reset grid to ONLY this single row being edited (never multiple copies!)
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }

    this.addDeductionLine({
      deductionEntryId: entryId,
      deductionType: type,
      standardDbColumn: col,
      shipmentId: shipId,
      amount: Number(item.amount ?? item.Amount),
      remarks: item.remarks || item.Remarks || ''
    });

    if (item.vehicle_Type || item.Vehicle_Type || item.vehicleType) {
      const v = item.vehicle_Type || item.Vehicle_Type || item.vehicleType;
      this.filterForm.get('vehicleType')?.setValue(v, { emitEvent: false });
    }
    if (item.route || item.Route) {
      const r = item.route || item.Route;
      this.filterForm.get('route')?.setValue(r, { emitEvent: false });
    }

    this.toastr.info(`Editing deduction #${entryId}. Modify values and click Update.`, 'Edit Mode');
  }

  promptDeleteEntry(item: any): void {
    if (!this.canEditEntry(item)) {
      this.toastr.warning('You can only delete deductions created by you.', 'Permission Denied');
      return;
    }
    if (this.isCycleLocked) {
      this.toastr.warning('This cycle is already synchronized and locked.', 'Locked Cycle');
      return;
    }
    this.pendingDeleteEntry = item;
  }

  deleteCycleEntry(item: any): void {
    this.promptDeleteEntry(item);
  }

  cancelDeleteModal(): void {
    if (this.isDeletingEntry) return;
    this.pendingDeleteEntry = null;
  }

  confirmDeleteEntry(): void {
    if (!this.pendingDeleteEntry) return;

    const entryId = this.getEntryId(this.pendingDeleteEntry);
    if (!entryId) {
      this.pendingDeleteEntry = null;
      return;
    }

    this.isDeletingEntry = true;
    this.vendorService.deleteDeductionEntry(entryId).subscribe({
      next: (res: any) => {
        this.isDeletingEntry = false;
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Deduction deleted successfully.', 'Deleted');
          if (this.activeEditingEntryId === entryId) {
            this.cancelEdit();
          }
          this.pendingDeleteEntry = null;
          this.checkAndLoadFactBox();
        } else {
          this.toastr.error(res?.message || 'Failed to delete deduction.', 'Error');
        }
      },
      error: (err: any) => {
        this.isDeletingEntry = false;
        this.toastr.error(err?.error?.message || err?.message || 'Error deleting deduction.', 'Error');
      }
    });
  }

  get hasPendingUpdates(): boolean {
    return this.activeEditingEntryId !== null || this.items.controls.some(c => Number(c.get('deductionEntryId')?.value || 0) > 0);
  }

  downloadFactBoxExcel(): void {
    const entries = this.factBoxSummary.recentEntries;
    if (!entries || entries.length === 0) {
      this.toastr.info('No entries available to export.');
      return;
    }

    const rows = entries.map((e: any, index: number) => ({
      '#': index + 1,
      'FHR ID': this.selectedVendor?.fhrid || this.selectedVendor?.FHRID,
      'Vendor Code': this.selectedVendor?.vendorCode || this.selectedVendor?.VendorCode,
      'Vendor Name': this.selectedVendor?.vendorName || this.selectedVendor?.VendorName,
      'Deduction Type': e.deductionType || e.DeductionType,
      'Shipment ID': e.shipmentID || e.ShipmentID || '-',
      'Amount (₹)': Number(e.amount ?? e.Amount),
      'Remarks': e.remarks || e.Remarks || '-',
      'Entry Date': e.entryDate || e.EntryDate,
      'Entered By': e.entryBy || e.EntryBy || 'System'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cycle_Deductions');

    const fileName = `Deductions_${this.selectedVendor?.vendorCode || 'Vendor'}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  updateDeductionBreakdown(): void {
    const entries = this.factBoxSummary?.recentEntries;
    if (!entries || entries.length === 0) {
      this.deductionTypeBreakdown = [];
      this.totalPenaltiesAmount = 0;
      this.totalArrearsAmount = 0;
      this.netCycleImpact = 0;
      return;
    }

    let penaltiesSum = 0;
    let arrearsSum = 0;

    const map = new Map<string, { type: string; count: number; total: number; icon: string; bgClass: string; isArrear: boolean }>();
    for (const item of entries) {
      const type = (item.deductionType || item.DeductionType || 'Other').trim();
      const col = (item.standardDbColumn || item.StandardDbColumn || '').trim();
      const amount = Number(item.amount ?? item.Amount ?? 0);
      const isArrear = col === 'Ded_Arrear' || type.toLowerCase().includes('arrear');

      if (isArrear) {
        arrearsSum += amount;
      } else {
        penaltiesSum += amount;
      }

      if (!map.has(type)) {
        map.set(type, {
          type,
          count: 0,
          total: 0,
          icon: isArrear ? 'fa fa-plus-circle' : this.getDeductionIcon(type),
          bgClass: isArrear ? 'bg-success-subtle' : this.getDeductionBgClass(type),
          isArrear
        });
      }
      const curr = map.get(type)!;
      curr.count += 1;
      curr.total += amount;
    }

    this.totalPenaltiesAmount = penaltiesSum;
    this.totalArrearsAmount = arrearsSum;
    this.netCycleImpact = penaltiesSum - arrearsSum;

    // Show operational deductions first (sorted by total), then arrears
    this.deductionTypeBreakdown = Array.from(map.values()).sort((a, b) => {
      if (a.isArrear !== b.isArrear) return a.isArrear ? 1 : -1;
      return b.total - a.total;
    });
  }

  getDeductionIcon(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('shipment') || t.includes('courier') || t.includes('delivery')) {
      return 'fa fa-truck';
    }
    if (t.includes('karma') || t.includes('advance') || t.includes('loan')) {
      return 'fa fa-credit-card';
    }
    if (t.includes('welfare') || t.includes('fund') || t.includes('insurance')) {
      return 'fa fa-heart';
    }
    if (t.includes('penalty') || t.includes('fine')) {
      return 'fa fa-exclamation-triangle';
    }
    if (t.includes('attendance') || t.includes('absent')) {
      return 'fa fa-calendar-times-o';
    }
    if (t.includes('arrear')) {
      return 'fa fa-plus-circle text-success';
    }
    return 'fa fa-tag';
  }

  getDeductionBgClass(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('shipment')) return 'bg-primary-subtle';
    if (t.includes('karma')) return 'bg-warning-subtle';
    if (t.includes('welfare') || t.includes('arrear')) return 'bg-success-subtle';
    return 'bg-light';
  }

  // ==========================================
  // SPLIT SHIPMENT WIZARD LOGIC
  // ==========================================
  initSplitForm(): void {
    const defaultType = this.availableDeductionTypes.find(t => t.isShipment)?.label || (this.availableDeductionTypes.length > 0 ? this.availableDeductionTypes[0].label : 'Shipment Deduction');
    this.splitShipmentForm = this.fb.group({
      shipmentId: ['', [Validators.required]],
      deductionType: [defaultType, Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(1)]],
      splitMode: ['EQUAL', Validators.required],
      remarks: ['']
    });

    this.splitShipmentForm.get('totalAmount')?.valueChanges.subscribe(() => {
      this.recalculateSplitAmounts();
    });

    this.splitShipmentForm.get('splitMode')?.valueChanges.subscribe(() => {
      this.recalculateSplitAmounts();
    });
  }

  openSplitMode(): void {
    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    const vehicleType = this.filterForm.get('vehicleType')?.value;
    const route = this.filterForm.get('route')?.value;

    const missingFields: string[] = [];

    if (!clientId) {
      this.filterForm.get('client')?.markAsTouched();
      missingFields.push('Client');
    }
    if (!modelId) {
      this.filterForm.get('model')?.markAsTouched();
      missingFields.push('Model');
    }
    if (!fromDate) {
      this.filterForm.get('fromDate')?.markAsTouched();
      missingFields.push('From Date');
    }
    if (!toDate) {
      this.filterForm.get('toDate')?.markAsTouched();
      missingFields.push('To Date');
    }

    if (this.isVehicleTypeRequired && !vehicleType) {
      this.filterForm.get('vehicleType')?.markAsTouched();
      missingFields.push('Vehicle Type');
    }

    if (this.isRouteRequired && !route) {
      this.filterForm.get('route')?.markAsTouched();
      missingFields.push('Route / Block');
    }

    if (missingFields.length > 0) {
      this.toastr.warning(`Please select ${missingFields.join(', ')} before entering Split Mode.`, 'Incomplete Selection');
      return;
    }

    const currentLoc = this.filterForm.get('location')?.value;
    this.splitSelectedLocation = currentLoc ? String(currentLoc) : '';

    this.splitLocationList = [
      { value: '', name: 'All Locations / Hubs' },
      ...this.locationList
    ];

    this.syncedVendorFhrids.clear();
    this.syncedVendorCodes.clear();

    if (this.splitSelectedLocation && this.allLinkedVendors.length > 0) {
      this.availableHubVendors = [...this.allLinkedVendors];
      this.filteredHubVendors = [...this.availableHubVendors];
      this.checkVendorsSyncStatus();
    } else {
      this.loadSplitVendors(this.splitSelectedLocation);
    }

    this.selectedSplitVendors = [];
    this.hubVendorSearch = '';
    this.pastedVendorText = '';
    this.isPasteBoxOpen = false;
    this.splitFormSubmitted = false;

    // Pre-select currently chosen vendor ONLY if not locked/synced
    if (this.selectedVendor && !this.isCycleLocked) {
      this.selectedSplitVendors.push({ vendor: this.selectedVendor, amount: 0 });
    }

    this.initSplitForm();
    this.isSplitMode = true;
    this.isSplitModalOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openSplitModal(): void {
    this.openSplitMode();
  }

  closeSplitMode(): void {
    this.isSplitMode = false;
    this.isSplitModalOpen = false;
    this.selectedSplitVendors = [];
    this.splitFormSubmitted = false;
  }

  closeSplitModal(): void {
    this.closeSplitMode();
  }

  getFormattedDateRange(fromDate: any, toDate: any): string {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fStr = `${String(d1.getDate()).padStart(2, '0')}-${months[d1.getMonth()]}-${d1.getFullYear()}`;
    const tStr = `${String(d2.getDate()).padStart(2, '0')}-${months[d2.getMonth()]}-${d2.getFullYear()}`;
    return `${fStr} to ${tStr}`;
  }

  checkVendorsSyncStatus(): void {
    const clientId = Number(this.filterForm.get('client')?.value);
    const modelId = Number(this.filterForm.get('model')?.value);
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    if (!clientId || !modelId || !fromDate || !toDate) return;

    const rangeStr = this.getFormattedDateRange(fromDate, toDate);
    this.isLoadingSyncStatus = true;
    this.vendorService.getTransactionSyncList(clientId, modelId, rangeStr, '', '', '', 1, 99999).subscribe({
      next: (res: any) => {
        this.isLoadingSyncStatus = false;
        this.syncedVendorFhrids.clear();
        this.syncedVendorCodes.clear();
        if (res?.isSuccess && res.data?.rows) {
          for (const r of res.data.rows) {
            const isSyn = r.IsDeductionsSynced === true || r.IsDeductionsSynced === 1 || String(r.IsDeductionsSynced) === 'true';
            if (isSyn) {
              if (r.FHRID) this.syncedVendorFhrids.add(String(r.FHRID).trim());
              if (r.VendorCode) this.syncedVendorCodes.add(String(r.VendorCode).trim().toLowerCase());
            }
          }
          // Remove any selected vendor that was found to be synced
          const lockedInSelection = this.selectedSplitVendors.filter(sv => this.isVendorSynced(sv.vendor));
          if (lockedInSelection.length > 0) {
            const names = lockedInSelection.map(sv => sv.vendor.vendorCode || sv.vendor.fhrid).join(', ');
            this.selectedSplitVendors = this.selectedSplitVendors.filter(sv => !this.isVendorSynced(sv.vendor));
            this.recalculateSplitAmounts();
            this.toastr.warning(`Vendor(s) ${names} are already synchronized to Payment Transactions for this cycle and cannot receive deductions.`, 'Cycle Synced & Locked');
          }
        }
      },
      error: () => {
        this.isLoadingSyncStatus = false;
      }
    });
  }

  isVendorSynced(vendor: any): boolean {
    if (!vendor) return false;
    const fhr = String(vendor.fhrid || '').trim();
    const cleanFhr = this.getCleanFhrid(vendor.fhrid, vendor.vendorName).trim();
    const code = String(vendor.vendorCode || '').trim().toLowerCase();
    return this.syncedVendorFhrids.has(fhr) ||
           this.syncedVendorFhrids.has(cleanFhr) ||
           this.syncedVendorCodes.has(code);
  }

  get hasSyncedVendorSelected(): boolean {
    return this.selectedSplitVendors.some(sv => this.isVendorSynced(sv.vendor));
  }

  get syncedVendorCount(): number {
    return this.selectedSplitVendors.filter(sv => this.isVendorSynced(sv.vendor)).length;
  }

  loadSplitVendors(locId: string): void {
    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;
    if (!clientId || !modelId) return;

    this.isVendorsLoading = true;
    this.vendorService.getLinkedVendors(clientId, modelId, locId).subscribe({
      next: (res: any) => {
        this.isVendorsLoading = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.availableHubVendors = res.data
            .filter((x: any) => (x.vendorCode || x.VendorCode || '').trim() !== '')
            .map((x: any) => {
               const fhrid = x.fhrid || x.FHRID || '';
               const vendorCode = (x.vendorCode || x.VendorCode || '').trim();
               const vendorName = (x.vendorName || x.VendorName || '').trim();
               const locationID = x.locationID || x.LocationID || locId;
               const locationName = x.locationName || x.LocationName || '';
               return {
                 fhrid,
                 vendorCode,
                 vendorName,
                 locationID,
                 locationName,
                 displayName: `${vendorCode} - ${vendorName || fhrid} (${fhrid})`
               };
            });
          this.filteredHubVendors = [...this.availableHubVendors];
          this.checkVendorsSyncStatus();
        } else {
          this.availableHubVendors = [];
          this.filteredHubVendors = [];
        }
      },
      error: () => {
        this.isVendorsLoading = false;
        this.availableHubVendors = [];
        this.filteredHubVendors = [];
      }
    });
  }

  onSplitLocationChange(locVal: any): void {
    const locId = (locVal && typeof locVal === 'object' && locVal.value !== undefined) ? locVal.value : (locVal || '');
    this.splitSelectedLocation = locId ? String(locId) : '';
    this.loadSplitVendors(this.splitSelectedLocation);

    if (this.splitSelectedLocation && this.selectedSplitVendors.length > 0) {
      const beforeCount = this.selectedSplitVendors.length;
      this.selectedSplitVendors = this.selectedSplitVendors.filter(sv => String(sv.vendor.locationID) === String(this.splitSelectedLocation));
      const removed = beforeCount - this.selectedSplitVendors.length;
      if (removed > 0) {
        this.toastr.info(`Removed ${removed} vendor(s) not in ${this.getSelectedLocationName()}.`, 'Location Filter Applied');
      }
    }
    this.recalculateSplitAmounts();
  }

  getSelectedLocationName(): string {
    if (!this.splitSelectedLocation) return 'All Hubs';
    const loc = this.locationList.find(l => String(l.value) === String(this.splitSelectedLocation));
    return loc ? loc.name : this.splitSelectedLocation;
  }

  getCleanVendorName(name: string, fhrid?: string): string {
    const raw = (name || '').trim();
    if (!raw) return fhrid || '-';
    if (raw.includes('/')) {
      const parts = raw.split('/').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return parts[0];
      }
    }
    return raw;
  }

  getCleanFhrid(fhrid: string, name?: string): string {
    const raw = (fhrid || '').trim();
    if (!raw) return '-';
    if (raw.includes('/')) {
      const parts = raw.split('/').map(p => p.trim()).filter(Boolean);
      const lastPart = parts[parts.length - 1];
      if (/^\d+$/.test(lastPart) || lastPart.length >= 4) {
        return lastPart;
      }
    }
    return raw;
  }

  formatVendorDisplay(v: any): string {
    if (!v) return '';
    const code = (v.vendorCode || '').trim();
    const cleanName = this.getCleanVendorName(v.vendorName, v.fhrid);
    const cleanFhr = this.getCleanFhrid(v.fhrid, v.vendorName);
    if (cleanName && cleanFhr && cleanName !== cleanFhr) {
      return `${code} - ${cleanName} (${cleanFhr})`;
    }
    return `${code} - ${cleanName || cleanFhr}`;
  }

  filterHubVendors(): void {
    const q = (this.hubVendorSearch || '').toLowerCase().trim();
    if (!q) {
      this.filteredHubVendors = [...this.availableHubVendors];
      return;
    }
    this.filteredHubVendors = this.availableHubVendors.filter(v =>
      (v.vendorCode || '').toLowerCase().includes(q) ||
      (v.fhrid || '').toLowerCase().includes(q) ||
      (v.vendorName || '').toLowerCase().includes(q) ||
      (v.locationName || '').toLowerCase().includes(q)
    );
  }

  isVendorSelected(vendor: any): boolean {
    return this.selectedSplitVendors.some(sv => sv.vendor.fhrid === vendor.fhrid);
  }

  toggleVendorSelection(vendor: any): void {
    if (this.isVendorSynced(vendor)) {
      this.toastr.warning(
        `Vendor ${vendor.vendorCode} (${this.getCleanFhrid(vendor.fhrid, vendor.vendorName)}) is already synchronized to Payment Transactions for this cycle and locked. New entries are blocked.`,
        'Cycle Synced & Locked'
      );
      return;
    }

    const idx = this.selectedSplitVendors.findIndex(sv => sv.vendor.fhrid === vendor.fhrid);
    if (idx > -1) {
      this.selectedSplitVendors.splice(idx, 1);
    } else {
      this.selectedSplitVendors.push({ vendor, amount: 0 });
    }
    this.recalculateSplitAmounts();
  }

  selectAllHubVendors(): void {
    const available = this.availableHubVendors.filter(v => !this.isVendorSynced(v));
    const skipped = this.availableHubVendors.length - available.length;
    this.selectedSplitVendors = available.map(v => ({ vendor: v, amount: 0 }));
    this.recalculateSplitAmounts();
    if (skipped > 0) {
      this.toastr.info(`Selected ${available.length} active vendors. ${skipped} vendor(s) skipped because their payout cycle is already synchronized.`, 'Selected Unlocked Vendors');
    } else {
      this.toastr.info(`Selected all ${available.length} vendors in this location.`, 'Selected All');
    }
  }

  clearAllSplitVendors(): void {
    this.selectedSplitVendors = [];
    this.recalculateSplitAmounts();
  }

  removeSplitVendor(index: number): void {
    if (index >= 0 && index < this.selectedSplitVendors.length) {
      this.selectedSplitVendors.splice(index, 1);
      this.recalculateSplitAmounts();
    }
  }

  togglePasteBox(): void {
    this.isPasteBoxOpen = !this.isPasteBoxOpen;
  }

  applyPastedVendors(): void {
    if (!this.pastedVendorText || !this.pastedVendorText.trim()) {
      this.toastr.warning('Please enter or paste vendor codes or FHRIDs.', 'Empty Input');
      return;
    }

    const tokens = this.pastedVendorText
      .split(/[,;\n\r\t ]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tokens.length === 0) return;

    let matchedCount = 0;
    const notFound: string[] = [];
    const skippedLocked: string[] = [];

    for (const token of tokens) {
      const lowerToken = token.toLowerCase();
      // Match by VendorCode or FHRID or clean FHRID or VendorName or clean Name
      const matched = this.availableHubVendors.find(v => {
        const code = (v.vendorCode || '').toLowerCase();
        const fhr = (v.fhrid || '').toLowerCase();
        const vName = (v.vendorName || '').toLowerCase();
        const cleanFhr = this.getCleanFhrid(v.fhrid, v.vendorName).toLowerCase();
        const cleanVName = this.getCleanVendorName(v.vendorName, v.fhrid).toLowerCase();
        return code === lowerToken ||
               fhr === lowerToken ||
               cleanFhr === lowerToken ||
               vName === lowerToken ||
               cleanVName === lowerToken ||
               fhr.includes(lowerToken);
      });

      if (matched) {
        if (this.isVendorSynced(matched)) {
          if (!skippedLocked.includes(matched.vendorCode)) {
            skippedLocked.push(matched.vendorCode);
          }
          continue;
        }
        if (!this.selectedSplitVendors.some(sv => sv.vendor.fhrid === matched.fhrid)) {
          this.selectedSplitVendors.push({ vendor: matched, amount: 0 });
          matchedCount++;
        }
      } else {
        if (!notFound.includes(token)) {
          notFound.push(token);
        }
      }
    }

    this.recalculateSplitAmounts();
    if (matchedCount > 0) {
      this.toastr.success(`${matchedCount} vendor(s) matched and added.`, 'Vendors Added');
    }
    if (skippedLocked.length > 0) {
      this.toastr.warning(`Skipped ${skippedLocked.length} vendor(s) because their payout cycle is already synchronized: ${skippedLocked.join(', ')}`, 'Cycle Synced & Locked');
    }
    if (notFound.length > 0) {
      this.toastr.warning(`Could not find ${notFound.length} token(s) in this hub: ${notFound.slice(0, 5).join(', ')}${notFound.length > 5 ? '...' : ''}`, 'Unmatched Tokens');
    }
    this.pastedVendorText = '';
    this.isPasteBoxOpen = false;
  }

  recalculateSplitAmounts(): void {
    const mode = this.splitShipmentForm?.get('splitMode')?.value;
    const total = parseFloat(this.splitShipmentForm?.get('totalAmount')?.value) || 0;
    const count = this.selectedSplitVendors.length;

    if (mode === 'EQUAL' && count > 0 && total > 0) {
      const basePerVendor = Math.floor((total / count) * 100) / 100;
      const remainder = Math.round((total - (basePerVendor * count)) * 100) / 100;

      this.selectedSplitVendors.forEach((sv, idx) => {
        sv.amount = idx === 0 ? Math.round((basePerVendor + remainder) * 100) / 100 : basePerVendor;
      });
    }
  }

  onCustomVendorAmountChange(item: any, event: any): void {
    const val = parseFloat(event.target.value);
    item.amount = isNaN(val) ? 0 : Math.round(Math.max(0, val) * 100) / 100;
  }

  get splitTotalAllocated(): number {
    return this.selectedSplitVendors.reduce((sum, sv) => sum + (Number(sv.amount) || 0), 0);
  }

  get splitRemainingAmount(): number {
    const total = parseFloat(this.splitShipmentForm?.get('totalAmount')?.value) || 0;
    return Math.round((total - this.splitTotalAllocated) * 100) / 100;
  }

  get hasInvalidVendorAmount(): boolean {
    return this.selectedSplitVendors.some(sv => !sv.amount || Number(sv.amount) < 1);
  }

  get invalidVendorCount(): number {
    return this.selectedSplitVendors.filter(sv => !sv.amount || Number(sv.amount) < 1).length;
  }

  get isSplitBalanced(): boolean {
    const total = parseFloat(this.splitShipmentForm?.get('totalAmount')?.value) || 0;
    const count = this.selectedSplitVendors.length;
    if (total < 1 || count < 2) return false;
    // Every participating vendor MUST have an allocation >= ₹1.00
    if (this.hasInvalidVendorAmount) return false;
    // Cannot save if any participating vendor is already synced/locked
    if (this.hasSyncedVendorSelected) return false;
    return Math.abs(this.splitRemainingAmount) < 0.01;
  }

  saveSplitShipmentDeductions(): void {
    this.splitFormSubmitted = true;

    if (this.splitShipmentForm.invalid) {
      this.splitShipmentForm.markAllAsTouched();
      this.toastr.error('Please enter Shipment ID, Deduction Type, and Total Amount (minimum ₹1.00).', 'Validation Error');
      return;
    }

    const total = parseFloat(this.splitShipmentForm?.get('totalAmount')?.value) || 0;
    if (total < 1) {
      this.toastr.error('Total shipment penalty amount must be at least ₹1.00.', 'Invalid Total Amount');
      return;
    }

    if (this.selectedSplitVendors.length < 2) {
      this.toastr.error('Please select at least 2 vendors to split this shipment deduction.', 'Minimum Vendors Required');
      return;
    }

    if (this.hasSyncedVendorSelected) {
      const lockedList = this.selectedSplitVendors
        .filter(sv => this.isVendorSynced(sv.vendor))
        .map(sv => `${sv.vendor.vendorCode} (${this.getCleanFhrid(sv.vendor.fhrid, sv.vendor.vendorName)})`)
        .join(', ');
      this.toastr.error(
        `Cannot save: Vendor(s) ${lockedList} are already synchronized to Payment Transactions for this cycle. Please remove them from the split.`,
        'Cycle Synced & Locked'
      );
      return;
    }

    const invalidVendors = this.selectedSplitVendors.filter(sv => !sv.amount || Number(sv.amount) < 1);
    if (invalidVendors.length > 0) {
      this.toastr.error(
        `Every vendor in the split must be allocated at least ₹1.00. Found ${invalidVendors.length} vendor(s) with ₹0 or less. Please remove vendors with ₹0 allocation or assign them an amount.`,
        'Minimum ₹1.00 Required'
      );
      return;
    }

    if (!this.isSplitBalanced) {
      this.toastr.error(`The total allocated amount (₹${this.splitTotalAllocated.toFixed(2)}) must exactly match the total shipment penalty (₹${total.toFixed(2)}).`, 'Unbalanced Split');
      return;
    }

    const rawForm = this.splitShipmentForm.getRawValue();
    const config = this.availableDeductionTypes.find(t => t.label === rawForm.deductionType);
    const stdCol = config?.column || 'Ded_Shipment';
    const clientId = Number(this.filterForm.get('client')?.value);
    const modelId = Number(this.filterForm.get('model')?.value);
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    const vehicleType = this.filterForm.get('vehicleType')?.value || null;
    const route = this.filterForm.get('route')?.value || null;

    if (this.isVehicleTypeRequired && !vehicleType) {
      this.toastr.error('Vehicle Type is mandatory for this model before saving split shipment.', 'Validation Error');
      return;
    }
    if (this.isRouteRequired && !route) {
      this.toastr.error('Route / Block is mandatory for Amazon DSP before saving split shipment.', 'Validation Error');
      return;
    }

    const totalAmount = Number(rawForm.totalAmount);
    const count = this.selectedSplitVendors.length;
    const splitGroupId = `${rawForm.shipmentId.trim()}_${Date.now()}`;

    const mainLoc = this.filterForm.get('location')?.value;
    const items = this.selectedSplitVendors.map(sv => ({
      fhrid: sv.vendor.fhrid,
      vendorCode: sv.vendor.vendorCode,
      locationId: sv.vendor.locationID || this.splitSelectedLocation || mainLoc || '',
      cycle_FromDate: fromDate,
      cycle_ToDate: toDate,
      vehicle_Type: vehicleType,
      route: route,
      deductionType: rawForm.deductionType,
      standardDbColumn: stdCol,
      shipmentId: rawForm.shipmentId.trim(),
      amount: Math.abs(Number(sv.amount)),
      remarks: rawForm.remarks ? `[Split Shipment ${rawForm.shipmentId.trim()} (1/${count})] ${rawForm.remarks}` : `[Split Shipment ${rawForm.shipmentId.trim()} (1/${count})]`,
      isSplitShipment: true,
      originalShipmentAmount: totalAmount,
      splitShareCount: count,
      splitGroupId: splitGroupId
    }));

    const payload = {
      clientId,
      modelId,
      items
    };

    this.isSavingSplit = true;
    this.vendorService.saveMultiVendorDeductionBatch(payload).subscribe({
      next: (res: any) => {
        this.isSavingSplit = false;
        if (res?.isSuccess) {
          this.toastr.success(`Shipment deduction of ₹${totalAmount.toFixed(2)} divided among ${count} vendors saved successfully!`, 'Split Saved');
          this.closeSplitMode();
          // If main page didn't have location selected, sync the location picked in modal
          if (!mainLoc && this.splitSelectedLocation) {
            this.filterForm.get('location')?.setValue(this.splitSelectedLocation, { emitEvent: false });
            this.onLocationChange(this.splitSelectedLocation);
          }
          this.checkAndLoadFactBox();
        } else {
          this.toastr.error(res?.message || 'Failed to save split deductions.', 'Error');
        }
      },
      error: (err: any) => {
        this.isSavingSplit = false;
        this.toastr.error(err?.error?.message || err?.message || 'Server error while saving split deductions.', 'Error');
      }
    });
  }

  // ==========================================
  // EXCEL BULK DOWNLOAD & UPLOAD LOGIC
  // ==========================================
  openExcelModal(): void {
    const clientId = this.filterForm.get('client')?.value;
    const modelId = this.filterForm.get('model')?.value;
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;

    if (!clientId || !modelId || !fromDate || !toDate) {
      this.toastr.warning('Please select Client, Model, and Date Range before opening Excel Upload.', 'Incomplete Selection');
      return;
    }

    this.selectedExcelFile = null;
    this.excelUploadErrors = [];
    this.excelUploadSuccessMessage = '';
    this.isExcelModalOpen = true;
  }

  closeExcelModal(): void {
    this.isExcelModalOpen = false;
    this.selectedExcelFile = null;
    this.excelUploadErrors = [];
    this.excelUploadSuccessMessage = '';
  }

  downloadExcelTemplate(): void {
    const clientId = Number(this.filterForm.get('client')?.value);
    const modelId = Number(this.filterForm.get('model')?.value);
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;
    const locationId = this.filterForm.get('location')?.value || '';

    this.isDownloadingTemplate = true;
    this.vendorService.downloadDeductionExcelTemplate(clientId, modelId, fromDate, toDate, locationId).subscribe({
      next: (blob: Blob) => {
        this.isDownloadingTemplate = false;
        const filename = `Vendor_Deductions_Template_Client${clientId}_Model${modelId}_${fromDate}_${toDate}.xlsx`;
        FileSaver.saveAs(blob, filename);
        this.toastr.success('Pre-populated deduction Excel template downloaded successfully.', 'Downloaded');
      },
      error: (err: any) => {
        this.isDownloadingTemplate = false;
        this.toastr.error(err?.message || 'Failed to download Excel template.', 'Error');
      }
    });
  }

  onExcelFileSelect(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        this.toastr.error('Please select an Excel file (.xlsx or .xls).', 'Invalid File');
        return;
      }
      this.selectedExcelFile = file;
      this.excelUploadErrors = [];
      this.excelUploadSuccessMessage = '';
    }
  }

  uploadExcelFile(): void {
    if (!this.selectedExcelFile) {
      this.toastr.warning('Please choose an Excel file to upload.', 'No File Selected');
      return;
    }

    const clientId = Number(this.filterForm.get('client')?.value);
    const modelId = Number(this.filterForm.get('model')?.value);
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;

    const formData = new FormData();
    formData.append('file', this.selectedExcelFile);
    formData.append('clientId', clientId.toString());
    formData.append('modelId', modelId.toString());
    formData.append('fromDate', fromDate || '');
    formData.append('toDate', toDate || '');

    this.isUploadingExcel = true;
    this.excelUploadErrors = [];
    this.excelUploadSuccessMessage = '';

    this.vendorService.uploadDeductionExcel(formData).subscribe({
      next: (res: any) => {
        this.isUploadingExcel = false;
        if (res?.isSuccess) {
          const count = res?.data?.UploadedCount ?? res?.data?.uploadedCount ?? 'All';
          this.excelUploadSuccessMessage = `Successfully imported ${count} deduction entries into the system!`;
          this.toastr.success(this.excelUploadSuccessMessage, 'Bulk Import Complete');
          this.selectedExcelFile = null;
          this.checkAndLoadFactBox();
        } else {
          this.toastr.error(res?.message || 'Excel upload failed.', 'Error');
          if (Array.isArray(res?.errors)) {
            this.excelUploadErrors = res.errors;
          }
        }
      },
      error: (err: any) => {
        this.isUploadingExcel = false;
        const msg = err?.error?.message || err?.message || 'Server error during Excel upload.';
        this.toastr.error(msg, 'Upload Error');
        if (Array.isArray(err?.error?.errors)) {
          this.excelUploadErrors = err.error.errors;
        } else if (msg) {
          this.excelUploadErrors = [msg];
        }
      }
    });
  }

  // ==========================================
  // SHIPMENT RECOVERY TRACKER LOGIC
  // ==========================================
  openShipmentTracker(shipmentId?: string): void {
    this.searchedShipmentId = shipmentId || '';
    this.shipmentRecoveryData = [];
    this.isShipmentTrackerModalOpen = true;
    if (this.searchedShipmentId) {
      this.searchShipmentRecovery();
    }
  }

  closeShipmentTracker(): void {
    this.isShipmentTrackerModalOpen = false;
    this.searchedShipmentId = '';
    this.shipmentRecoveryData = [];
  }

  searchShipmentRecovery(): void {
    if (!this.searchedShipmentId || !this.searchedShipmentId.trim()) {
      this.toastr.warning('Please enter a Shipment / Waybill ID to search.', 'Input Required');
      return;
    }

    const clientId = Number(this.filterForm.get('client')?.value) || undefined;
    const modelId = Number(this.filterForm.get('model')?.value) || undefined;

    this.isLoadingShipmentRecovery = true;
    this.vendorService.getShipmentRecoverySummary(this.searchedShipmentId.trim(), clientId, modelId).subscribe({
      next: (res: any) => {
        this.isLoadingShipmentRecovery = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.shipmentRecoveryData = res.data;
          if (this.shipmentRecoveryData.length === 0) {
            this.toastr.info(`No deduction records found for Shipment ID '${this.searchedShipmentId}'.`, 'Not Found');
          }
        } else {
          this.shipmentRecoveryData = [];
          this.toastr.info(`No deduction records found for Shipment ID '${this.searchedShipmentId}'.`, 'Not Found');
        }
      },
      error: (err: any) => {
        this.isLoadingShipmentRecovery = false;
        this.shipmentRecoveryData = [];
        this.toastr.error(err?.error?.message || err?.message || 'Failed to fetch shipment recovery summary.', 'Error');
      }
    });
  }

  get totalShipmentSplitAmount(): number {
    return this.shipmentRecoveryData.reduce((sum, item) => sum + (Number(item.splitAmount) || 0), 0);
  }

  get totalShipmentRecovered(): number {
    return this.shipmentRecoveryData.reduce((sum, item) => sum + (Number(item.recoveredAmount) || 0), 0);
  }

  get totalShipmentPending(): number {
    return this.shipmentRecoveryData.reduce((sum, item) => sum + (Number(item.pendingDeficit) || 0), 0);
  }
}
