import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';

import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonRateCardService } from '../common-rate-card.service';

export interface ActiveRateField {
  key: string;
  label: string;
  allowedRateTypes?: { name: string; value: string }[];
}

@Component({
  selector: 'app-common-rate-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './common-rate-card.component.html',
  styleUrls: ['./common-rate-card.component.scss']
})
export class CommonRateCardComponent implements OnInit {
  activeTab: number = 1; // 1 = Rate Card Details, 2 = All Rate Cards
  rateCardForm!: FormGroup;
  isSubmitted: boolean = false;
  isSaving: boolean = false;
  isGridLoading: boolean = false;
  isEditMode: boolean = false;
  editingDbId: number | null = null;

  // Pagination matching monthlyAttendance & StateMaster_list
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  gridSearchTerm: string = '';
  gridRateCards: any[] = [];
  allCombinationRateCards: any[] = [];

  // Dropdown lists
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];
  vehicleTypeList: any[] = [];
  isVehicleTypeRequired: boolean = false;
  isPrimaryVehicleTypeRequired: boolean = false;

  // Active Rate Configuration rows calculated on Client/Model change
  activeRateFields: ActiveRateField[] = [];

  rateTypes: any[] = [
    { name: 'Fixed', value: 'Fixed' },
    { name: 'Slab', value: 'Slab' }
  ];

  gridSelectedClientId: any = null;
  gridSelectedModelId: any = null;
  gridSelectedLocationId: any = null;
  gridModelList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private rateCardService: CommonRateCardService,
    private clientService: ClientMasterService,
    private commonService: ManualPunchBio,
    private dropdownService: DropdownService,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private route: ActivatedRoute,
    private router: Router,
    public encryptionService: EncryptionService
  ) { }

  goBack(): void {
    if (this.activeTab === 2) {
      this.activeTab = 1;
    } else {
      this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/common_rate_card_list']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadLocations();
    this.loadVehicleTypes();
    this.loadGridRateCards();

    this.loadClients(() => {
      // 1. Check if encrypted ID is passed in route params
      const paramId = this.route.snapshot.params['pk_RateCardID'];
      if (paramId && paramId !== 'undefined') {
        let decryptedId: string = '';
        try {
          decryptedId = this.encryptionService.decryptText(paramId.toString());
        } catch {
          decryptedId = paramId;
        }

        const idNum = Number(decryptedId);
        if (!isNaN(idNum) && idNum > 0) {
          this.fetchAndEditRateCard(idNum);
          return;
        }
      }

      // 2. Check query params as fallback
      this.route.queryParams.subscribe((params: any) => {
        if (params['id']) {
          const id = Number(params['id']);
          if (!isNaN(id) && id > 0) {
            this.fetchAndEditRateCard(id);
          }
        }
      });
    });
  }

  private fetchAndEditRateCard(id: number): void {
    this.loader.start();
    this.rateCardService.getById(id).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res?.isSuccess && res?.data) {
          this.isEditMode = true;
          this.editingDbId = id;
          this.patchFormData(res.data);
          this.activeTab = 1;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.toastr.error('Could not find the requested Rate Card details.', 'Not Found');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to load Rate Card for editing.', 'Error');
      }
    });
  }

  canAccessTab2(): boolean {
    if (this.isEditMode) return true;
    return !!this.existingRateCardWarning;
  }

  switchTab(tabIndex: number): void {
    if (tabIndex === 2) {
      if (!this.canAccessTab2()) {
        const clientId = this.rateCardForm.get('ClientID')?.value;
        const modelId = this.rateCardForm.get('ModelID')?.value;
        const locationId = this.rateCardForm.get('LocationID')?.value;
        const effectiveFrom = this.rateCardForm.get('EffectiveFrom')?.value;
        const fhrid = (this.rateCardForm.get('FHRID')?.value || '').trim();

        if (!clientId || !modelId || !locationId || !effectiveFrom || !fhrid) {
          this.toastr.info('Please select Client, Model, Location, Effective From, and enter FHR ID to check existing rate cards.', 'Tab Locked');
        } else {
          this.toastr.info('No existing rate card found for this combination.', 'New Rate Card');
        }
        return;
      }
      this.loadGridRateCards();
    }
    this.activeTab = tabIndex;
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.rateCardForm = this.fb.group({
      ClientID: [null, [Validators.required]],
      ModelID: [null, [Validators.required]],
      LocationID: [null, [Validators.required]],
      EffectiveFrom: [today, [Validators.required]],
      FHRID: ['', [Validators.required]],
      Large_VehicleTypeID: [null],
      Large_VehicleTypeName: [''],
      AmazonEdsp_VehicleTypeID: [null],
      AmazonEdsp_VehicleTypeName: [''],

      // Dynamic Rate fields
      Normal_RateType: [null],
      Normal_Rate: [''],
      Normal_SlabExpr: [''],

      Pickup_RateType: [null],
      Pickup_Rate: [''],
      Pickup_SlabExpr: [''],

      Fm_RateType:[null],
      Fm_Rate:  [''],   
      Fm_SlabExpr:  [''],

      
      Rto_RateType:  [null],
      Rto_Rate: [''],     
      Rto_SlabExpr: [''],

      Dto_RateType:  [null],
      Dto_Rate: [''],      
      Dto_SlabExpr:[''],
      
      MFN_RateType: [null],
      MFN_Rate: [''],
      MFN_SlabExpr: [''],

      Van_RateType: [null],
      Van_Rate: [''],
      Van_SlabExpr: [''],

      Shopsy_RateType: [null],
      Shopsy_Deduction_Rate: [''],
      Shopsy_SlabExpr: [''],

      U2S_RateType: [null],
      U2S_Rate: [''],
      U2S_SlabExpr: [''],

      Prexo_RateType: [null],
      Prexo_Rate: [''],
      Prexo_SlabExpr: [''],

      Grocery_RateType: [null],
      Grocery_Rate: [''],
      Grocery_SlabExpr: [''],

      Incentive_RateType: [null],
      Incentive_Rate: [''],
      Incentive_SlabExpr: ['']
    });
  }

  // Load Client list from Cost Center
  private loadClients(callback?: () => void): void {
    this.commonService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        if (res?.data && Array.isArray(res.data)) {
          this.clientList = res.data.filter((item: any) => item.value !== null && item.value !== '');
        }
        if (callback) callback();
      },
      error: () => {
        this.clientList = [];
        if (callback) callback();
      }
    });
  }

  // Helper to sanitize names like "VAN:VAN" -> "VAN"
  cleanVehicleName(rawName: string): string {
    if (!rawName) return '';
    let name = rawName.toString().trim();
    if (name.includes(':')) {
      const parts = name.split(':');
      name = parts[parts.length - 1].trim();
    }
    return name;
  }

  // Load Vehicle Types from CodeTypeId = 8
  private loadVehicleTypes(callback?: () => void): void {
    this.rateCardService.getVehicleTypes().subscribe({
      next: (res: any) => {
        const rawList = res?.data || res?.list || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          this.vehicleTypeList = rawList.map((item: any) => {
            const rawName = item.name || item.Name || item.codeDescription || item.CodeDescription || item.text || item.description || '';
            const cleanName = this.cleanVehicleName(rawName);
            const val = (item.value !== undefined && item.value !== null) ? item.value :
              (item.Value !== undefined && item.Value !== null) ? item.Value :
                (item.codeId !== undefined && item.codeId !== null) ? item.codeId :
                  (item.CodeId !== undefined && item.CodeId !== null) ? item.CodeId :
                    (item.id !== undefined && item.id !== null) ? item.id : null;
            const numVal = (val !== null && !isNaN(Number(val))) ? Number(val) : val;
            return {
              name: cleanName,
              value: numVal
            };
          }).filter((item: any) => item.value !== null && item.name !== '');
        } else {
          this.vehicleTypeList = [];
        }
        if (callback) callback();
      },
      error: () => {
        this.vehicleTypeList = [];
        if (callback) callback();
      }
    });
  }

  existingRateCardWarning: any = null;

  // Event handler when Client selection changes
  onClientChange(event: any): void {
    const clientId = this.rateCardForm.get('ClientID')?.value;
    this.rateCardForm.get('ModelID')?.setValue(null);
    this.modelList = [];
    this.activeRateFields = [];
    this.existingRateCardWarning = null;

    if (clientId) {
      this.loadModelsByClient(clientId);
    }
  }

  // Event handler when Model selection changes
  onModelChange(event: any): void {
    this.updateActiveRateFields();
    this.checkExistingRateCard();
  }

  // Event handler when Location selection changes
  onLocationChange(event: any): void {
    this.checkExistingRateCard();
  }

  // Event handler when Effective From date changes
  onEffectiveFromChange(event: any): void {
    this.checkExistingRateCard();
  }

  // Event handler when FHR ID changes
  onFhridChange(event: any): void {
    this.checkExistingRateCard();
  }

  // Event handler when Vehicle Type changes
  onVehicleTypeChange(event: any): void {
    const vId = this.rateCardForm.get('Large_VehicleTypeID')?.value;
    if (vId) {
      const match = this.vehicleTypeList.find(v => v.value == vId || v.id == vId || v.codeId == vId);
      const name = this.cleanVehicleName(match?.name || match?.description || '');
      this.rateCardForm.get('Large_VehicleTypeName')?.setValue(name);
    } else {
      this.rateCardForm.get('Large_VehicleTypeName')?.setValue('');
    }
    this.checkExistingRateCard();
  }

  // Event handler when Amazon EDSP Vehicle Type changes
  onAmazonEdspVehicleTypeChange(event: any): void {
    const vId = this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.value;
    if (vId) {
      const match = this.vehicleTypeList.find(v => v.value == vId || v.id == vId || v.codeId == vId);
      const name = this.cleanVehicleName(match?.name || match?.description || '');
      this.rateCardForm.get('AmazonEdsp_VehicleTypeName')?.setValue(name);
    } else {
      this.rateCardForm.get('AmazonEdsp_VehicleTypeName')?.setValue('');
    }
    this.checkExistingRateCard();
  }

  // Check if a rate card already exists for selected combination
  checkExistingRateCard(): void {
    if (this.isEditMode) return;

    const clientId = this.rateCardForm.get('ClientID')?.value;
    const modelId = this.rateCardForm.get('ModelID')?.value;
    const locationId = this.rateCardForm.get('LocationID')?.value;
    const effectiveFrom = this.rateCardForm.get('EffectiveFrom')?.value;
    const fhrid = (this.rateCardForm.get('FHRID')?.value || '').trim();
    const largeVehicleTypeId = this.rateCardForm.get('Large_VehicleTypeID')?.value;
    const amazonEdspVehicleTypeId = this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.value;

    // Check only when all 5 parameters (Client, Model, Location, Effective From, FHR ID) are provided
    if (!clientId || !modelId || !locationId || !effectiveFrom || !fhrid) {
      this.existingRateCardWarning = null;
      return;
    }

    const clientObj = this.clientList.find(c => c.value == clientId || c.id == clientId);
    const modelObj = this.modelList.find(m => m.value == modelId || m.id == modelId);
    const locObj = this.locationList.find(l => l.value == locationId || l.pk_locid == locationId);

    const clientName = clientObj?.name || this.getClientName(clientId);
    const modelName = modelObj?.name || this.getModelName(modelId);
    const locName = locObj?.name || locObj?.locname || this.getLocationName(locationId);
    const formattedEffDate = this.formatDateDMY(effectiveFrom);

    this.rateCardService.checkExists(clientId, modelId, locationId, effectiveFrom, fhrid, largeVehicleTypeId, amazonEdspVehicleTypeId).subscribe({
      next: (res: any) => {
        const data = res?.data;
        const recordExists = data?.recordExists ?? data?.RecordExists ?? false;
        const rawList = data?.list ?? data?.List ?? (Array.isArray(data) ? data : []);
        const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

        // 1. Store all historical revisions in allCombinationRateCards so Tab 2 displays all data
        if (list && list.length > 0) {
          this.allCombinationRateCards = list.map((rc: any) => ({
            ...rc,
            configuredRates: this.parseConfiguredRates(rc)
          }));
        } else {
          this.allCombinationRateCards = [];
        }

        // 2. If exact combination (including EffectiveFrom) exists, display warning banner
        if (recordExists) {
          const match = list.find((rc: any) => this.formatDateDMY(rc.EffectiveFrom || rc.effectiveFrom) === formattedEffDate) || list[0] || {};
          this.existingRateCardWarning = {
            rateCard: match,
            message: `Rate card already exists for Client: "${clientName}", Model: "${modelName}", Location: "${locName}", Effective From: "${formattedEffDate}", FHR ID: "${fhrid}". This combination is already configured. Please try any other combination or view details in 'All Rate Cards' tab.`
          };
          this.gridSearchTerm = clientName;
        } else {
          this.existingRateCardWarning = null;
        }
      },
      error: () => {
        this.existingRateCardWarning = null;
      }
    });
  }

  // Helper to format rate display with badges
  getRateDisplay(item: any, type: string): { isFixed: boolean; isSlab: boolean; isPercentage?: boolean; isBaseRate?: boolean; text: string } {
    if (!item) return { isFixed: false, isSlab: false, text: '-' };

    let rateType = item[`${type}_RateType`] ?? item[`${type.toLowerCase()}_RateType`];
    let rateVal = item[`${type}_Rate`] ?? item[`${type.toLowerCase()}_Rate`];
    let slabExpr = item[`${type}_SlabExpr`] ?? item[`${type.toLowerCase()}_SlabExpr`];

    if (type === 'Shopsy') {
      rateVal = item['Shopsy_Deduction_Rate'] ?? item['shopsy_Deduction_Rate'] ?? rateVal;
    }

    if (type === 'MFN') {
      rateType = rateType ?? item['mfN_RateType'] ?? item['mfn_RateType'];
      rateVal = rateVal ?? item['mfN_Rate'] ?? item['mfn_Rate'];
      slabExpr = slabExpr ?? item['mfN_SlabExpr'] ?? item['mfn_SlabExpr'];
    }

    if (rateType === 'Fixed' && rateVal !== null && rateVal !== undefined && rateVal !== '') {
      return { isFixed: true, isSlab: false, text: `₹ ${rateVal} (Fixed)` };
    } else if (rateType === 'Percentage' && rateVal !== null && rateVal !== undefined && rateVal !== '') {
      return { isFixed: false, isSlab: false, isPercentage: true, text: `${rateVal}% (Percentage)` };
    } else if (rateType === 'Base Rate') {
      return { isFixed: false, isSlab: false, isBaseRate: true, text: `Base Rate` };
    } else if (rateType === 'Slab' && slabExpr) {
      return { isFixed: false, isSlab: true, text: `Slab: ${slabExpr}` };
    }
    return { isFixed: false, isSlab: false, text: '-' };
  }

  // Load Models mapped to selected Client
  private loadModelsByClient(clientId: any, callback?: () => void): void {
    const costCentreId = typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId;
    if (!costCentreId) {
      this.modelList = [];
      this.updateActiveRateFields();
      return;
    }

    this.clientService.getModelListByClient(costCentreId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.modelList = res.data;
        } else {
          this.modelList = [];
        }
        this.updateActiveRateFields();
        if (callback) callback();
      },
      error: () => {
        this.modelList = [];
        this.updateActiveRateFields();
      }
    });
  }

  // Load Locations
  // private loadLocations(): void {
  //   this.dropdownService.getLocations().subscribe({
  //     next: (data: any[]) => {
  //       this.locationList = data || [];
  //     },
  //     error: () => {
  //       this.locationList = [];
  //     }
  //   });
  // }
  private loadLocations(callback?: () => void): void {
    this.commonService.getCommanList('Location').subscribe({
      next: (res: any) => {
        if (res?.data && Array.isArray(res.data)) {
          this.locationList = res.data.filter((item: any) => item.value !== null && item.value !== '');
        }
        if (callback) callback();
      },
      error: () => {
        this.locationList = [];
        if (callback) callback();
      }
    });
  }

  // Compute active rate rows once based on selected Client and Model
  updateActiveRateFields(): void {
    const clientId = this.rateCardForm.get('ClientID')?.value;
    const modelId = this.rateCardForm.get('ModelID')?.value;

    if (!clientId || !modelId) {
      this.activeRateFields = [];
      this.isVehicleTypeRequired = false;
      this.isPrimaryVehicleTypeRequired = false;
      this.rateCardForm.get('Large_VehicleTypeID')?.clearValidators();
      this.rateCardForm.get('Large_VehicleTypeID')?.updateValueAndValidity();
      this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.clearValidators();
      this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.updateValueAndValidity();
      return;
    }

    const clientObj = this.clientList.find(c => c.value == clientId || c.id == clientId);
    const modelObj = this.modelList.find(m => m.value == modelId || m.id == modelId);

    const clientName = (clientObj?.name || '').toLowerCase().trim();
    const modelName = (modelObj?.name || '').toLowerCase().trim();

    if (!clientName || !modelName) {
      this.activeRateFields = [];
      this.isVehicleTypeRequired = false;
      this.isPrimaryVehicleTypeRequired = false;
      this.rateCardForm.get('Large_VehicleTypeID')?.clearValidators();
      this.rateCardForm.get('Large_VehicleTypeID')?.updateValueAndValidity();
      this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.clearValidators();
      this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.updateValueAndValidity();
      return;
    }

    this.isVehicleTypeRequired = false;
    this.isPrimaryVehicleTypeRequired = false;
    this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.clearValidators();
    this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.updateValueAndValidity();

    // 1. Flipkart / Large Model -> Normal Rate + Vehicle Type Dropdown
    if (modelName.includes('large')) {
      this.isVehicleTypeRequired = true;
      this.rateCardForm.get('Large_VehicleTypeID')?.setValidators([Validators.required]);
      this.rateCardForm.get('Large_VehicleTypeID')?.updateValueAndValidity();
      this.activeRateFields = [
        { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes }
      ];
    } else {
      this.isVehicleTypeRequired = false;
      this.rateCardForm.get('Large_VehicleTypeID')?.clearValidators();
      this.rateCardForm.get('Large_VehicleTypeID')?.updateValueAndValidity();
      
      // 2. Flipkart / ODH-MDH Model
      if (modelName.includes('odh') || modelName.includes('mdh')) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: [{ name: 'Fixed', value: 'Fixed' }, { name: 'Slab', value: 'Slab' }] },
          { key: 'Shopsy', label: 'Shopsy Rate', allowedRateTypes: [{ name: 'Fixed', value: 'Fixed' }] },
          { key: 'U2S', label: 'U2S Rate', allowedRateTypes: [{ name: 'Percentage', value: 'Percentage' }, { name: 'Fixed', value: 'Fixed' }] },
          { key: 'Prexo', label: 'Prexo Rate', allowedRateTypes: [{ name: 'Fixed', value: 'Fixed' }] },
          { key: 'Grocery', label: 'Grocery Rate', allowedRateTypes: [{ name: 'Base Rate', value: 'Base Rate' }, { name: 'Fixed', value: 'Fixed' }, { name: 'Slab', value: 'Slab' }] }
        ];
      }
      // 3. Flipkart + XRM
      else if (clientName.includes('flipkart') && modelName.includes('xrm')) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes },
          { key: 'Pickup', label: 'Pickup Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 4. Flipkart + FM / Variable
      else if (clientName.includes('flipkart') && (modelName.includes('fm') || modelName.includes('variable'))) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 5. Airtel + FSE
      else if (clientName.includes('airtel') && modelName.includes('fse')) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 6. Shiprocket
      else if (clientName.includes('shiprocket') && (modelName.includes('shiprocket') || modelName.includes('variable'))) {
        this.activeRateFields = [
        { 
          key: 'Normal', 
          label: 'Normal Rate', 
          allowedRateTypes: [
            { name: 'Fixed', value: 'Fixed' },
            { name: 'Slab', value: 'Slab' },
            { name: 'Packet Slab', value: 'Packet Slab' }
          ] 
        }
      ];
      }
      // 7. Ecom Express / Ebbes
      else if ((clientName.includes('ecom') || clientName.includes('ebbes') || clientName.includes('ebees')) &&
               (modelName.includes('ebbes') || modelName.includes('ebees') || modelName.includes('variable'))) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes },
          { key: 'Pickup', label: 'Pickup Rate', allowedRateTypes: this.rateTypes },
          { key: 'Rto', label: 'RTO Rate', allowedRateTypes: this.rateTypes },
          { key: 'Dto', label: 'DTO Rate', allowedRateTypes: this.rateTypes },
          { key: 'Fm', label: 'FM Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 8. Amazon + DSP
      else if (clientName.includes('amazon') && (modelName === 'dsp' || (modelName.includes('dsp') && !modelName.includes('edsp')))) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes },
          { key: 'Pickup', label: 'Pickup Rate', allowedRateTypes: this.rateTypes },
          { key: 'MFN', label: 'MFN Rate', allowedRateTypes: this.rateTypes },
          { key: 'Van', label: 'Van Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 9. Amazon + EDSP
      else if (clientName.includes('amazon') && modelName.includes('edsp')) {
        this.isPrimaryVehicleTypeRequired = true;
        this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.setValidators([Validators.required]);
        this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.updateValueAndValidity();
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes },
          { key: 'Pickup', label: 'Pickup Rate', allowedRateTypes: this.rateTypes },
          { key: 'MFN', label: 'MFN Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 10. BlueDart
      else if ((clientName.includes('bluedart') || clientName.includes('blue dart')) &&
               (modelName.includes('variable') || modelName.includes('(b)') || modelName.includes('b'))) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 11. Healthkart
      else if(clientName.includes('healthkart') && (modelName.includes('variable') || modelName.includes('h') || modelName.includes('(h)'))) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      // 12. Meesho
      else if(clientName.includes('meesho') && (modelName.includes('variable') || modelName.includes('m') || modelName.includes('(m)'))) {
        this.activeRateFields = [
          { key: 'Normal', label: 'Normal Rate', allowedRateTypes: this.rateTypes },
          { key: 'Pickup', label: 'Pickup Rate', allowedRateTypes: this.rateTypes }
        ];
      }
      else {
        this.activeRateFields = [];
      }
    }

    // Always add Incentive Rate for ALL clients if any rates were generated
    if (this.activeRateFields.length > 0) {
      if (!this.activeRateFields.some(f => f.key === 'Incentive')) {
        this.activeRateFields.push({ key: 'Incentive', label: 'Incentive Rate', allowedRateTypes: [{ name: 'Fixed', value: 'Fixed' }] });
      }
    }
  }

  trackByFieldKey(index: number, item: ActiveRateField): string {
    return item.key;
  }

  // Helper names
  getClientName(id: any): string {
    const found = this.clientList.find(c => c.value == id || c.id == id);
    return found ? found.name : (id ? `Client #${id}` : '-');
  }

  getModelName(id: any): string {
    const found = this.modelList.find(m => m.value == id || m.id == id);
    return found ? found.name : (id ? `Model #${id}` : '-');
  }

  getLocationName(id: any): string {
    const found = this.locationList.find(l => l.value == id || l.id == id);
    return found ? found.name : (id || '-');
  }

  getLargeVehicleTypeName(id: any): string {
    const found = this.vehicleTypeList.find(v => v.value == id || v.id == id || v.codeId == id);
    const raw = found ? (found.name || found.description) : (id || '-');
    return this.cleanVehicleName(raw);
  }

  // Save / Update rate card
  onSubmit(): void {
    this.isSubmitted = true;

    if (this.rateCardForm.invalid) {
      this.toastr.warning('Please fill in all required fields (Client, Model, Location, Effective From' + ((this.isVehicleTypeRequired || this.isPrimaryVehicleTypeRequired) ? ', Vehicle Type' : '') + ').', 'Missing Information');
      return;
    }

    if (this.activeRateFields.length === 0) {
      this.toastr.warning('No rate types are configured for the selected Client and Model combination.', 'No Rates Configured');
      return;
    }

    const formVal = this.rateCardForm.value;

    // Check if at least ONE rate type is selected
    const hasAtLeastOneSelected = this.activeRateFields.some(f => !!formVal[`${f.key}_RateType`]);
    if (!hasAtLeastOneSelected) {
      this.toastr.warning('Please select Rate Type for at least one rate before saving.', 'Rate Type Required');
      return;
    }

    // Helper to get resolved rate value and type
    const getResolvedRate = (key: string) => {
      const isFieldActive = this.activeRateFields.some(f => f.key === key);
      if (!isFieldActive) {
        return { rate: null, rateType: null, slabExpr: null };
      }

      const rType = formVal[`${key}_RateType`];
      if (!rType) {
        return { rate: null, rateType: null, slabExpr: null };
      }

       if (rType === 'Slab' || rType === 'Packet Slab') {
        const slabText = formVal[`${key}_SlabExpr`]?.toString().trim();
        return {
          rate: 0,
            rateType: rType,
          slabExpr: (slabText && slabText !== '') ? slabText : '0'
        };
      } else if (rType === 'Base Rate') {
        return {
          rate: 0,
          rateType: 'Base Rate',
          slabExpr: null
        };
      } else if (rType === 'Percentage') {
        const val = formVal[`${key}_Rate`];
        const numVal = (val !== null && val !== undefined && val.toString().trim() !== '') ? Number(val) : 0;
        return {
          rate: numVal,
          rateType: 'Percentage',
          slabExpr: null
        };
      } else {
        const val = key === 'Shopsy' ? formVal['Shopsy_Deduction_Rate'] : formVal[`${key}_Rate`];
        const numVal = (val !== null && val !== undefined && val.toString().trim() !== '') ? Number(val) : 0;
        return {
          rate: numVal,
          rateType: 'Fixed',
          slabExpr: null
        };
      }
    };

    const normalData = getResolvedRate('Normal');
    const pickupData = getResolvedRate('Pickup');
    const rtoData = getResolvedRate('Rto');
    const dtoData = getResolvedRate('Dto');
    const fmData = getResolvedRate('Fm');
    const mfnData = getResolvedRate('MFN');
    const vanData = getResolvedRate('Van');
    const shopsyData = getResolvedRate('Shopsy');
    const u2sData = getResolvedRate('U2S');
    const prexoData = getResolvedRate('Prexo');
    const groceryData = getResolvedRate('Grocery');
    const incentiveData = getResolvedRate('Incentive');

    const payload: any = {
      pk_RateCardID: this.isEditMode && this.editingDbId ? this.editingDbId : undefined,
      ClientID: formVal.ClientID !== null && formVal.ClientID !== undefined && formVal.ClientID !== '' ? Number(formVal.ClientID) : null,
      ModelID: formVal.ModelID !== null && formVal.ModelID !== undefined && formVal.ModelID !== '' ? Number(formVal.ModelID) : null,
      LocationID: formVal.LocationID,
      FHRID: formVal.FHRID?.trim() || '',
      EffectiveFrom: formVal.EffectiveFrom,
      Large_VehicleTypeID: formVal.Large_VehicleTypeID ? Number(formVal.Large_VehicleTypeID) : null,
      Large_VehicleTypeName: this.cleanVehicleName(formVal.Large_VehicleTypeName) || null,
      AmazonEdsp_VehicleTypeID: formVal.AmazonEdsp_VehicleTypeID ? Number(formVal.AmazonEdsp_VehicleTypeID) : null,
      AmazonEdsp_VehicleTypeName: this.cleanVehicleName(formVal.AmazonEdsp_VehicleTypeName) || null,

      Normal_Rate: normalData.rate,
      Normal_RateType: normalData.rateType,
      Normal_SlabExpr: normalData.slabExpr,

      Pickup_Rate: pickupData.rate,
      Pickup_RateType: pickupData.rateType,
      Pickup_SlabExpr: pickupData.slabExpr,

      Rto_Rate: rtoData.rate,
      Rto_RateType: rtoData.rateType,
      Rto_SlabExpr: rtoData.slabExpr,

      Dto_Rate: dtoData.rate,
      Dto_RateType: dtoData.rateType,
      Dto_SlabExpr: dtoData.slabExpr,


      Fm_Rate: fmData.rate,
      Fm_RateType: fmData.rateType,
      Fm_SlabExpr: fmData.slabExpr,

      MFN_Rate: mfnData.rate,
      MFN_RateType: mfnData.rateType,
      MFN_SlabExpr: mfnData.slabExpr,

      Incentive_Rate: incentiveData.rate,
      Incentive_RateType: incentiveData.rateType,
      Incentive_SlabExpr: incentiveData.slabExpr,

      Van_Rate: vanData.rate,
      Van_RateType: vanData.rateType,
      Van_SlabExpr: vanData.slabExpr,

      Shopsy_Deduction_Rate: shopsyData.rate,
      Shopsy_RateType: shopsyData.rateType,
      Shopsy_SlabExpr: shopsyData.slabExpr,

      U2S_Rate: u2sData.rate,
      U2S_RateType: u2sData.rateType,
      U2S_SlabExpr: u2sData.slabExpr,

      Prexo_Rate: prexoData.rate,
      Prexo_RateType: prexoData.rateType,
      Prexo_SlabExpr: prexoData.slabExpr,

      Grocery_Rate: groceryData.rate,
      Grocery_RateType: groceryData.rateType,
      Grocery_SlabExpr: groceryData.slabExpr
    };

    this.isSaving = true;
    this.loader.start();

    if (this.isEditMode && this.editingDbId) {
      this.rateCardService.update(payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.loader.stop();
          if (res?.isSuccess) {
            this.toastr.success(res?.message || 'Rate card updated successfully!', 'Success');
            this.resetForm();
            this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/common_rate_card_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to update rate card.', 'Error');
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          this.loader.stop();
          this.toastr.error(err?.error?.message || 'Server error occurred.', 'Server Error');
        }
      });
    } else {
      this.rateCardService.insert(payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.loader.stop();
          if (res?.isSuccess) {
            this.toastr.success(res?.message || 'Rate card saved successfully!', 'Success');
            this.resetForm();
            this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/common_rate_card_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to save rate card.', 'Error');
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          this.loader.stop();
          this.toastr.error(err?.error?.message || 'Server error occurred.', 'Server Error');
        }
      });
    }
  }

  private patchFormData(item: any): void {
    if (!item) return;

    const rawClientId = item.clientID ?? item.ClientID;
    const rawModelId = item.modelID ?? item.ModelID;
    const rawLocationId = item.locationID ?? item.LocationID;
    const fhrid = item.fhrid ?? item.FHRID ?? '';
    const effectiveFromRaw = item.effectiveFrom ?? item.EffectiveFrom;
    const rawVehicleTypeId = item.large_VehicleTypeID ?? item.Large_VehicleTypeID ?? null;
    const largeVehicleTypeName = this.cleanVehicleName(item.large_VehicleTypeName ?? item.Large_VehicleTypeName ?? '');

    let effDate = '';
    if (effectiveFromRaw) {
      effDate = typeof effectiveFromRaw === 'string'
        ? effectiveFromRaw.split('T')[0]
        : new Date(effectiveFromRaw).toISOString().split('T')[0];
    }

    const normalRateType = item.normal_RateType ?? item.Normal_RateType ?? null;
    const normalRate = item.normal_Rate ?? item.Normal_Rate ?? '';
    const normalSlabExpr = item.normal_SlabExpr ?? item.Normal_SlabExpr ?? '';

    const pickupRateType = item.pickup_RateType ?? item.Pickup_RateType ?? null;
    const pickupRate = item.pickup_Rate ?? item.Pickup_Rate ?? '';
    const pickupSlabExpr = item.pickup_SlabExpr ?? item.Pickup_SlabExpr ?? '';

    const mfnRateType = item.mfN_RateType ?? item.mfn_RateType ?? item.MFN_RateType ?? null;
    const mfnRate = item.mfN_Rate ?? item.mfn_Rate ?? item.MFN_Rate ?? '';
    const mfnSlabExpr = item.mfN_SlabExpr ?? item.mfn_SlabExpr ?? item.MFN_SlabExpr ?? '';

    const vanRateType = item.van_RateType ?? item.Van_RateType ?? null;
    const vanRate = item.van_Rate ?? item.Van_Rate ?? '';
    const vanSlabExpr = item.van_SlabExpr ?? item.Van_SlabExpr ?? '';

    const shopsyRateType = item.shopsy_RateType ?? item.Shopsy_RateType ?? null;
    const shopsyDeductionRate = item.shopsy_Deduction_Rate ?? item.Shopsy_Deduction_Rate ?? item.shopsy_Rate ?? item.Shopsy_Rate ?? '';
    const shopsySlabExpr = item.shopsy_SlabExpr ?? item.Shopsy_SlabExpr ?? '';

    const u2sRateType = item.u2S_RateType ?? item.U2S_RateType ?? item.u2s_RateType ?? null;
    const u2sRate = item.u2S_Rate ?? item.U2S_Rate ?? item.u2s_Rate ?? '';
    const u2sSlabExpr = item.u2S_SlabExpr ?? item.U2S_SlabExpr ?? item.u2s_SlabExpr ?? '';

    const prexoRateType = item.prexo_RateType ?? item.Prexo_RateType ?? item.proxo_RateType ?? item.Proxo_RateType ?? null;
    const prexoRate = item.prexo_Rate ?? item.Prexo_Rate ?? item.proxo_Rate ?? item.Proxo_Rate ?? '';
    const prexoSlabExpr = item.prexo_SlabExpr ?? item.Prexo_SlabExpr ?? item.proxo_SlabExpr ?? item.Proxo_SlabExpr ?? '';

    const groceryRateType = item.grocery_RateType ?? item.Grocery_RateType ?? null;
    const groceryRate = item.grocery_Rate ?? item.Grocery_Rate ?? '';
    const grocerySlabExpr = item.grocery_SlabExpr ?? item.Grocery_SlabExpr ?? '';

    const rtoRateType = item.rto_RateType ?? item.Rto_RateType ?? null;
    const rtoRate = item.rto_Rate ?? item.Rto_Rate ?? '';
    const rtoSlabExpr = item.rto_SlabExpr ?? item.Rto_SlabExpr ?? '';

    const dtoRateType = item.dto_RateType ?? item.Dto_RateType ?? null;
    const dtoRate = item.dto_Rate ?? item.Dto_Rate ?? '';
    const dtoSlabExpr = item.dto_SlabExpr ?? item.Dto_SlabExpr ?? '';

    const fmRateType = item.fm_RateType ?? item.Fm_RateType ?? null;
    const fmRate = item.fm_Rate ?? item.Fm_Rate ?? '';
    const fmSlabExpr = item.fm_SlabExpr ?? item.Fm_SlabExpr ?? '';

    const incentiveRateType = item.incentive_RateType ?? item.Incentive_RateType ?? null;
    const incentiveRate = item.incentive_Rate ?? item.Incentive_Rate ?? '';
    const incentiveSlabExpr = item.incentive_SlabExpr ?? item.Incentive_SlabExpr ?? '';

    const amazonEdspVehicleTypeID = item.amazonEdsp_VehicleTypeID ?? item.AmazonEdsp_VehicleTypeID ?? null;
    const amazonEdspVehicleTypeName = item.amazonEdsp_VehicleTypeName ?? item.AmazonEdsp_VehicleTypeName ?? '';

    // Find exact matching client item from loaded clientList
    const clientMatch = this.clientList.find(c => c.value == rawClientId || c.id == rawClientId);
    const resolvedClientId = clientMatch ? clientMatch.value : rawClientId;

    this.loadModelsByClient(rawClientId, () => {
      // Find exact matching model item from loaded modelList
      const modelMatch = this.modelList.find(m => m.value == rawModelId || m.id == rawModelId);
      const resolvedModelId = modelMatch ? modelMatch.value : rawModelId;

      // Find exact matching location from loaded locationList
      const locMatch = this.locationList.find(l => l.value == rawLocationId || l.pk_locid == rawLocationId);
      const resolvedLocId = locMatch ? (locMatch.value ?? locMatch.pk_locid) : rawLocationId;

      // Set Client & Model so updateActiveRateFields enables Vehicle Type dropdown
      this.rateCardForm.get('ClientID')?.setValue(resolvedClientId);
      this.rateCardForm.get('ModelID')?.setValue(resolvedModelId);
      this.rateCardForm.get('LocationID')?.setValue(resolvedLocId);
      this.rateCardForm.get('FHRID')?.setValue(fhrid);
      this.rateCardForm.get('EffectiveFrom')?.setValue(effDate);

      this.updateActiveRateFields();

      // Resolve vehicle type ID (match by ID or Name from vehicleTypeList)
      let resolvedVehicleId: any = rawVehicleTypeId !== null && rawVehicleTypeId !== undefined && rawVehicleTypeId !== '' ? Number(rawVehicleTypeId) : null;
      if (this.vehicleTypeList && this.vehicleTypeList.length > 0) {
        const vMatch = this.vehicleTypeList.find(v =>
          v.value == rawVehicleTypeId ||
          (largeVehicleTypeName && v.name && v.name.toLowerCase().trim() === largeVehicleTypeName.toLowerCase().trim())
        );
        if (vMatch) {
          resolvedVehicleId = vMatch.value;
        }
      }

      let resolvedAmazonEdspVehicleId: any = amazonEdspVehicleTypeID !== null && amazonEdspVehicleTypeID !== undefined && amazonEdspVehicleTypeID !== '' ? Number(amazonEdspVehicleTypeID) : null;
      if (this.vehicleTypeList && this.vehicleTypeList.length > 0) {
        const amzMatch = this.vehicleTypeList.find(v => 
          v.value == amazonEdspVehicleTypeID || 
          (amazonEdspVehicleTypeName && v.name && v.name.toLowerCase().trim() === amazonEdspVehicleTypeName.toLowerCase().trim())
        );
        if (amzMatch) {
          resolvedAmazonEdspVehicleId = amzMatch.value;
        }
      }

      this.rateCardForm.patchValue({
        ClientID: resolvedClientId,
        ModelID: resolvedModelId,
        LocationID: resolvedLocId,
        FHRID: fhrid,
        EffectiveFrom: effDate,
        Large_VehicleTypeID: resolvedVehicleId,
        Large_VehicleTypeName: largeVehicleTypeName,
        AmazonEdsp_VehicleTypeID: resolvedAmazonEdspVehicleId,
        AmazonEdsp_VehicleTypeName: amazonEdspVehicleTypeName,

        Normal_RateType: normalRateType,
        Normal_Rate: normalRate !== null && normalRate !== undefined ? normalRate : '',
        Normal_SlabExpr: normalSlabExpr,

        Pickup_RateType: pickupRateType,
        Pickup_Rate: pickupRate !== null && pickupRate !== undefined ? pickupRate : '',
        Pickup_SlabExpr: pickupSlabExpr,

        MFN_RateType: mfnRateType,
        MFN_Rate: mfnRate !== null && mfnRate !== undefined ? mfnRate : '',
        MFN_SlabExpr: mfnSlabExpr,

        Van_RateType: vanRateType,
        Van_Rate: vanRate !== null && vanRate !== undefined ? vanRate : '',
        Van_SlabExpr: vanSlabExpr,

        Shopsy_RateType: shopsyRateType,
        Shopsy_Deduction_Rate: shopsyDeductionRate !== null && shopsyDeductionRate !== undefined ? shopsyDeductionRate : '',
        Shopsy_SlabExpr: shopsySlabExpr,

        U2S_RateType: u2sRateType,
        U2S_Rate: u2sRate !== null && u2sRate !== undefined ? u2sRate : '',
        U2S_SlabExpr: u2sSlabExpr,

        Prexo_RateType: prexoRateType,
        Prexo_Rate: prexoRate !== null && prexoRate !== undefined ? prexoRate : '',
        Prexo_SlabExpr: prexoSlabExpr,

        Grocery_RateType: groceryRateType,
        Grocery_Rate: groceryRate !== null && groceryRate !== undefined ? groceryRate : '',
        Grocery_SlabExpr: grocerySlabExpr,

        Rto_RateType: rtoRateType,
        Rto_Rate: rtoRate !== null && rtoRate !== undefined ? rtoRate : '',
        Rto_SlabExpr: rtoSlabExpr,

        Dto_RateType: dtoRateType,
        Dto_Rate: dtoRate !== null && dtoRate !== undefined ? dtoRate : '',
        Dto_SlabExpr: dtoSlabExpr,

        Fm_RateType: fmRateType,
        Fm_Rate: fmRate !== null && fmRate !== undefined ? fmRate : '',
        Fm_SlabExpr: fmSlabExpr,

        Incentive_RateType: incentiveRateType,
        Incentive_Rate: incentiveRate !== null && incentiveRate !== undefined ? incentiveRate : '',
        Incentive_SlabExpr: incentiveSlabExpr
      });
    });
  }

  resetForm(): void {
    this.isSubmitted = false;
    this.isEditMode = false;
    this.editingDbId = null;
    this.activeRateFields = [];
    this.existingRateCardWarning = null;
    this.isVehicleTypeRequired = false;
    const today = new Date().toISOString().split('T')[0];
    this.rateCardForm.reset({
      ClientID: null,
      ModelID: null,
      LocationID: null,
      EffectiveFrom: today,
      FHRID: '',
      Large_VehicleTypeID: null,
      Large_VehicleTypeName: '',

      Normal_RateType: null,
      Normal_Rate: '',
      Normal_SlabExpr: '',

      Pickup_RateType: null,
      Pickup_Rate: '',
      Pickup_SlabExpr: '',

      MFN_RateType: null,
      MFN_Rate: '',
      MFN_SlabExpr: '',

      Van_RateType: null,
      Van_Rate: '',
      Van_SlabExpr: '',

      Shopsy_RateType: null,
      Shopsy_Deduction_Rate: '',
      Shopsy_SlabExpr: '',

      U2S_RateType: null,
      U2S_Rate: '',
      U2S_SlabExpr: '',

      Prexo_RateType: null,
      Prexo_Rate: '',
      Prexo_SlabExpr: '',

      Grocery_RateType: null,
      Grocery_Rate: '',
      Grocery_SlabExpr: '',

      Rto_RateType: null,
      Rto_Rate: '',
      Rto_SlabExpr: '',

      Dto_RateType: null,
      Dto_Rate: '',
      Dto_SlabExpr: '',

      Fm_RateType: null,
      Fm_Rate: '',
      Fm_SlabExpr: '',

      Incentive_RateType: null,
      Incentive_Rate: '',
      Incentive_SlabExpr: '',

      AmazonEdsp_VehicleTypeID: null,
      AmazonEdsp_VehicleTypeName: ''
    });
    this.rateCardForm.get('Large_VehicleTypeID')?.clearValidators();
    this.rateCardForm.get('Large_VehicleTypeID')?.updateValueAndValidity();
    this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.clearValidators();
    this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.updateValueAndValidity();
    this.modelList = [];
  }

  // ================= TAB 2: ALL RATE CARDS (GRID VIEW) =================

  loadGridRateCards(): void {
    this.isGridLoading = true;

    const clientId = this.rateCardForm.get('ClientID')?.value;
    const modelId = this.rateCardForm.get('ModelID')?.value;
    const locationId = this.rateCardForm.get('LocationID')?.value;
    const effectiveFrom = this.rateCardForm.get('EffectiveFrom')?.value;
    const fhrid = (this.rateCardForm.get('FHRID')?.value || '').trim();
    const largeVehicleTypeId = this.rateCardForm.get('Large_VehicleTypeID')?.value;
    const amazonEdspVehicleTypeId = this.rateCardForm.get('AmazonEdsp_VehicleTypeID')?.value;

    if (clientId && modelId && locationId && effectiveFrom && fhrid) {
      // Load all rate card revisions for this specific combination
      this.rateCardService.checkExists(clientId, modelId, locationId, effectiveFrom, fhrid, largeVehicleTypeId, amazonEdspVehicleTypeId).subscribe({
        next: (res: any) => {
          this.isGridLoading = false;
          const data = res?.data;
          const rawList = data?.list ?? data?.List ?? (Array.isArray(data) ? data : (data ? [data] : []));
          const list = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

          if (list.length > 0) {
            this.allCombinationRateCards = list.map((rc: any) => ({
              ...rc,
              configuredRates: this.parseConfiguredRates(rc)
            }));
            this.applyLocalGridFilter();
          } else {
            this.allCombinationRateCards = [];
            this.gridRateCards = [];
            this.totalItems = 0;
          }
        },
        error: () => {
          this.isGridLoading = false;
          this.allCombinationRateCards = [];
          this.gridRateCards = [];
          this.totalItems = 0;
        }
      });
    } else {
      // General paged list
      this.rateCardService.getAll(
        this.pageIndex - 1,
        this.pageSize,
        this.gridSearchTerm
      ).subscribe({
        next: (res: any) => {
          this.isGridLoading = false;
          if (res?.isSuccess) {
            const rawList = res.data || [];
            this.gridRateCards = rawList.map((rc: any) => ({
              ...rc,
              configuredRates: this.parseConfiguredRates(rc)
            }));
            this.totalItems = res.totalCount || this.gridRateCards.length;
          } else {
            this.gridRateCards = [];
            this.totalItems = 0;
          }
        },
        error: () => {
          this.isGridLoading = false;
          this.gridRateCards = [];
          this.totalItems = 0;
        }
      });
    }
  }

  applyLocalGridFilter(): void {
    const term = (this.gridSearchTerm || '').trim().toLowerCase();
    if (!term) {
      this.gridRateCards = [...this.allCombinationRateCards];
    } else {
      this.gridRateCards = this.allCombinationRateCards.filter((item: any) => {
        const client = (item.ClientName || item.clientName || '').toLowerCase();
        const model = (item.ModelName || item.modelName || '').toLowerCase();
        const fhrid = (item.FHRID || item.fhrid || '').toLowerCase();
        const loc = (item.LocationName || item.locationName || '').toLowerCase();
        const vehicle = (item.Large_VehicleTypeName || item.large_VehicleTypeName || item.VehicleTypeName || item.vehicleTypeName || '').toLowerCase();
        const effDate = (item.EffectiveFrom || item.effectiveFrom || '').toString().toLowerCase();
        const ratesStr = (item.configuredRates || []).map((r: any) => `${r.name} ${r.type} ${r.value}`).join(' ').toLowerCase();

        return client.includes(term) ||
          model.includes(term) ||
          fhrid.includes(term) ||
          loc.includes(term) ||
          vehicle.includes(term) ||
          effDate.includes(term) ||
          ratesStr.includes(term);
      });
    }
    this.totalItems = this.gridRateCards.length;
  }

  onGridFilterChange(): void {
    this.pageIndex = 1;
    const clientId = this.rateCardForm.get('ClientID')?.value;
    const modelId = this.rateCardForm.get('ModelID')?.value;
    const locationId = this.rateCardForm.get('LocationID')?.value;

    if (clientId && modelId && locationId) {
      // Local client-side filter within combination records (does NOT call getAll API)
      this.applyLocalGridFilter();
    } else {
      this.loadGridRateCards();
    }
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    const clientId = this.rateCardForm.get('ClientID')?.value;
    const modelId = this.rateCardForm.get('ModelID')?.value;
    const locationId = this.rateCardForm.get('LocationID')?.value;

    if (!clientId || !modelId || !locationId) {
      this.loadGridRateCards();
    }
  }

  editDbRateCard(item: any): void {
    if (!item) return;
    const id = item.pk_RateCardID ?? item.pk_RateCardId ?? item.pk_rateCardID ?? item.id ?? null;
    if (id) {
      this.fetchAndEditRateCard(Number(id));
    } else {
      this.isEditMode = true;
      this.editingDbId = id;
      this.patchFormData(item);
      this.activeTab = 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  deleteDbRateCard(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this Rate Card? This action cannot be undone.')) {
      this.loader.start();
      this.rateCardService.delete(id).subscribe({
        next: (res: any) => {
          this.loader.stop();
          if (res?.isSuccess) {
            this.toastr.success('Rate card deleted successfully.', 'Deleted');
            this.loadGridRateCards();
          } else {
            this.toastr.error(res?.message || 'Failed to delete rate card.', 'Error');
          }
        },
        error: (err: any) => {
          this.loader.stop();
          this.toastr.error(err?.error?.message || 'Server error occurred while deleting.', 'Error');
        }
      });
    }
  }

  formatRateForExport(rc: any, type: string): string {
    if (!rc) return '-';
    const rType = rc[`${type}_RateType`] ?? rc[`${type.toLowerCase()}_RateType`];
    if (!rType) return '-';

    if (rType === 'Fixed') {
      let val = rc[`${type}_Rate`] ?? rc[`${type.toLowerCase()}_Rate`];
      if (type === 'Shopsy') {
        val = rc['Shopsy_Deduction_Rate'] ?? rc['shopsy_Deduction_Rate'] ?? rc['shopsy_Rate'] ?? val;
      }
      return `Fixed (₹ ${Number(val || 0).toFixed(2)})`;
    } else if (rType === 'Slab') {
      const slab = rc[`${type}_SlabExpr`] ?? rc[`${type.toLowerCase()}_SlabExpr`];
      return `Slab (${slab || '0'})`;
    } else if (rType === 'Percentage') {
      const val = rc[`${type}_Rate`] ?? rc[`${type.toLowerCase()}_Rate`];
      return `Percentage (${val || 0}%)`;
    } else if (rType === 'Base Rate') {
      return 'Base Rate';
    }
    return '-';
  }

  exportToExcel(): void {
    const clientId = this.rateCardForm.get('ClientID')?.value;
    const modelId = this.rateCardForm.get('ModelID')?.value;
    const locationId = this.rateCardForm.get('LocationID')?.value;

    // 1. If in combination/revision mode with loaded items
    if (clientId && modelId && locationId && (this.gridRateCards.length > 0 || this.allCombinationRateCards.length > 0)) {
      const sourceList = this.gridRateCards.length > 0 ? this.gridRateCards : this.allCombinationRateCards;
      this.generateAndSaveExcel(sourceList);
      return;
    }

    // 2. Otherwise fetch from service
    this.loader.start();
    this.rateCardService.getAll(0, 100000, this.gridSearchTerm).subscribe({
      next: (res: any) => {
        this.loader.stop();
        const rawList = res?.data || [];
        if (rawList.length === 0) {
          this.toastr.warning('No rate card data found to export.', 'No Data');
          return;
        }
        this.generateAndSaveExcel(rawList);
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to export rate cards.', 'Export Error');
      }
    });
  }

  formatDateDMY(dateVal: any): string {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal.toString();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateVal.toString();
    }
  }

  private generateAndSaveExcel(dataList: any[]): void {
    if (!dataList || dataList.length === 0) {
      this.toastr.warning('No rate card data found to export.', 'No Data');
      return;
    }

    const exportData = dataList.map((rc: any, idx: number) => {
      const rates = rc.configuredRates || this.parseConfiguredRates(rc);
      const configuredRatesStr = rates.map((r: any) => `[ ${r.name.toUpperCase()} - ${r.type.toUpperCase()} ] : ${r.value}`).join(' \r\n\r\n ');

      const formatDateTime = (dateVal: any) => {
        if (!dateVal) return '-';
        try {
          const d = new Date(dateVal);
          if (isNaN(d.getTime())) return dateVal.toString();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
        } catch {
          return dateVal.toString();
        }
      };

      return {
        'S.No': idx + 1,
        'Client': rc.ClientName || rc.clientName || this.getClientName(rc.ClientID || rc.clientID),
        'Model': rc.ModelName || rc.modelName || this.getModelName(rc.ModelID || rc.modelID),
        'Vehicle Type': this.cleanVehicleName(rc.Large_VehicleTypeName || rc.large_VehicleTypeName || rc.VehicleTypeName || rc.vehicleTypeName || rc.AmazonEdsp_VehicleTypeName || rc.amazonEdsp_VehicleTypeName || '-'),
        'FHR ID': rc.FHRID || rc.fhrid || '-',
        'Location': rc.LocationName || rc.locationName || this.getLocationName(rc.LocationID || rc.locationID),
        'Effective From': this.formatDateDMY(rc.EffectiveFrom || rc.effectiveFrom),
        'Status': rc.Status || rc.status || 'Active',
        'Configured Rates & Values': configuredRatesStr || '-',
        'Entry By': rc.AssignBy || rc.assignBy || '-',
        'Entry Date': formatDateTime(rc.AssignDate || rc.assignDate),
        'Update By': rc.UpdateBy || rc.updateBy || '-',
        'Update Date': formatDateTime(rc.UpdateDate || rc.updateDate)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const colWidths = [];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 10;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        if (!worksheet[cellRef]) continue;

        const cellStr = worksheet[cellRef].v ? worksheet[cellRef].v.toString() : '';

        if (R === 0) {
          worksheet[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { patternType: "solid", fgColor: { rgb: "007BFF" } },
            alignment: { vertical: "center", horizontal: "center" }
          };
          maxWidth = Math.max(maxWidth, cellStr.length + 5);
        } else {
          if (C === 8) { 
            worksheet[cellRef].s = { alignment: { wrapText: true, vertical: "top" } };
            maxWidth = 60; 
          } else {
            worksheet[cellRef].s = { alignment: { vertical: "center" } };
            maxWidth = Math.max(maxWidth, cellStr.length + 2);
          }
        }
      }
      colWidths[C] = { wch: Math.min(maxWidth, 100) };
    }
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CommonRateCards');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, `Common_Rate_Cards_${this.formatDateDMY(new Date())}.xlsx`);
    this.toastr.success('Rate cards exported to Excel successfully!', 'Export Success');
  }

  parseConfiguredRates(item: any): Array<{ name: string; type: string; value: string; isFixed: boolean }> {
    if (!item) return [];
    const rates: Array<{ name: string; type: string; value: string; isFixed: boolean }> = [];

    const getVal = (keys: string[]) => {
      for (const k of keys) {
        if (item[k] !== undefined && item[k] !== null) return item[k];
      }
      return null;
    };

    // 1. Normal Rate
    const normalType = getVal(['Normal_RateType', 'normal_RateType', 'normalRateType']);
    const normalRate = getVal(['Normal_Rate', 'normal_Rate', 'normalRate']);
    const normalSlab = getVal(['Normal_SlabExpr', 'normal_SlabExpr', 'normalSlabExpr']);
    if (normalType === 'Fixed') {
      rates.push({ name: 'Normal', type: 'Fixed', value: `₹ ${Number(normalRate || 0).toFixed(2)}`, isFixed: true });
    } else if (normalType === 'Slab') {
      rates.push({ name: 'Normal', type: 'Slab', value: (normalSlab && normalSlab !== '') ? normalSlab : '0', isFixed: false });
    }  else if (normalType === 'Packet Slab') {
      rates.push({ name: 'Normal', type: 'Packet Slab', value: (normalSlab && normalSlab !== '') ? normalSlab : '0', isFixed: false });
    }
     
    // 2. Pickup Rate
    const pickupType = getVal(['Pickup_RateType', 'pickup_RateType', 'pickupRateType']);
    const pickupRate = getVal(['Pickup_Rate', 'pickup_Rate', 'pickupRate']);
    const pickupSlab = getVal(['Pickup_SlabExpr', 'pickup_SlabExpr', 'pickupSlabExpr']);
    if (pickupType === 'Fixed') {
      rates.push({ name: 'Pickup', type: 'Fixed', value: `₹ ${Number(pickupRate || 0).toFixed(2)}`, isFixed: true });
    } else if (pickupType === 'Slab') {
      rates.push({ name: 'Pickup', type: 'Slab', value: (pickupSlab && pickupSlab !== '') ? pickupSlab : '0', isFixed: false });
    }

    // 3. RTO Rate
    const rtoType = getVal(['Rto_RateType', 'rto_RateType', 'rtoRateType']);
    const rtoRate = getVal(['Rto_Rate', 'rto_Rate', 'rtoRate']);
    const rtoSlab = getVal(['Rto_SlabExpr', 'rto_SlabExpr', 'rtoSlabExpr']);
    if (rtoType === 'Fixed') {
      rates.push({ name: 'RTO', type: 'Fixed', value: `₹ ${Number(rtoRate || 0).toFixed(2)}`, isFixed: true });
    } else if (rtoType === 'Slab') {
      rates.push({ name: 'RTO', type: 'Slab', value: (rtoSlab && rtoSlab !== '') ? rtoSlab : '0', isFixed: false });
    }

    // 4. DTO Rate
    const dtoType = getVal(['Dto_RateType', 'dto_RateType', 'dtoRateType']);
    const dtoRate = getVal(['Dto_Rate', 'dto_Rate', 'dtoRate']);
    const dtoSlab = getVal(['Dto_SlabExpr', 'dto_SlabExpr', 'dtoSlabExpr']);
    if (dtoType === 'Fixed') {
      rates.push({ name: 'DTO', type: 'Fixed', value: `₹ ${Number(dtoRate || 0).toFixed(2)}`, isFixed: true });
    } else if (dtoType === 'Slab') {
      rates.push({ name: 'DTO', type: 'Slab', value: (dtoSlab && dtoSlab !== '') ? dtoSlab : '0', isFixed: false });
    }

    // 5. FM Rate
    const fmType = getVal(['Fm_RateType', 'fm_RateType', 'fmRateType']);
    const fmRate = getVal(['Fm_Rate', 'fm_Rate', 'fmRate']);
    const fmSlab = getVal(['Fm_SlabExpr', 'fm_SlabExpr', 'fmSlabExpr']);
    if (fmType === 'Fixed') {
      rates.push({ name: 'FM', type: 'Fixed', value: `₹ ${Number(fmRate || 0).toFixed(2)}`, isFixed: true });
    } else if (fmType === 'Slab') {
      rates.push({ name: 'FM', type: 'Slab', value: (fmSlab && fmSlab !== '') ? fmSlab : '0', isFixed: false });
    }

    // 6. MFN Rate
    const mfnType = getVal(['MFN_RateType', 'mfN_RateType', 'mfn_RateType', 'mfnRateType']);
    const mfnRate = getVal(['MFN_Rate', 'mfN_Rate', 'mfn_Rate', 'mfnRate']);
    const mfnSlab = getVal(['MFN_SlabExpr', 'mfN_SlabExpr', 'mfn_SlabExpr', 'mfnSlabExpr']);
    if (mfnType === 'Fixed') {
      rates.push({ name: 'MFN', type: 'Fixed', value: `₹ ${Number(mfnRate || 0).toFixed(2)}`, isFixed: true });
    } else if (mfnType === 'Slab') {
      rates.push({ name: 'MFN', type: 'Slab', value: (mfnSlab && mfnSlab !== '') ? mfnSlab : '0', isFixed: false });
    }

    // 4. Van Rate
    const vanType = getVal(['Van_RateType', 'van_RateType', 'vanRateType']);
    const vanRate = getVal(['Van_Rate', 'van_Rate', 'vanRate']);
    const vanSlab = getVal(['Van_SlabExpr', 'van_SlabExpr', 'vanSlabExpr']);
    if (vanType === 'Fixed') {
      rates.push({ name: 'Van', type: 'Fixed', value: `₹ ${Number(vanRate || 0).toFixed(2)}`, isFixed: true });
    } else if (vanType === 'Slab') {
      rates.push({ name: 'Van', type: 'Slab', value: (vanSlab && vanSlab !== '') ? vanSlab : '0', isFixed: false });
    }

    // 5. Shopsy Rate
    const shopsyType = getVal(['Shopsy_RateType', 'shopsy_RateType', 'shopsyRateType']);
    const shopsyRate = getVal(['Shopsy_Deduction_Rate', 'shopsy_Deduction_Rate', 'shopsyDeductionRate', 'Shopsy_Rate', 'shopsy_Rate']);
    const shopsySlab = getVal(['Shopsy_SlabExpr', 'shopsy_SlabExpr', 'shopsySlabExpr']);
    if (shopsyType === 'Fixed') {
      rates.push({ name: 'Shopsy', type: 'Fixed', value: `₹ ${Number(shopsyRate || 0).toFixed(2)}`, isFixed: true });
    } else if (shopsyType === 'Slab') {
      rates.push({ name: 'Shopsy', type: 'Slab', value: (shopsySlab && shopsySlab !== '') ? shopsySlab : '0', isFixed: false });
    }

    // 6. U2S Rate
    const u2sType = getVal(['U2S_RateType', 'u2S_RateType', 'u2s_RateType', 'u2sRateType']);
    const u2sRate = getVal(['U2S_Rate', 'u2S_Rate', 'u2s_Rate', 'u2sRate']);
    if (u2sType === 'Percentage') {
      rates.push({ name: 'U2S', type: 'Percentage', value: `${u2sRate !== null && u2sRate !== '' ? u2sRate : '0'}%`, isFixed: false });
    } else if (u2sType === 'Fixed') {
      rates.push({ name: 'U2S', type: 'Fixed', value: `₹ ${Number(u2sRate || 0).toFixed(2)}`, isFixed: true });
    }

    // 7. Prexo Rate
    const prexoType = getVal(['Prexo_RateType', 'prexo_RateType', 'prexoRateType', 'Proxo_RateType', 'proxo_RateType']);
    const prexoRate = getVal(['Prexo_Rate', 'prexo_Rate', 'prexoRate', 'Proxo_Rate', 'proxo_Rate']);
    if (prexoType === 'Fixed') {
      rates.push({ name: 'Prexo', type: 'Fixed', value: `₹ ${Number(prexoRate || 0).toFixed(2)}`, isFixed: true });
    }

    // Incentive Rate
    const incentiveType = getVal(['Incentive_RateType', 'incentive_RateType', 'incentiveRateType']);
    const incentiveRate = getVal(['Incentive_Rate', 'incentive_Rate', 'incentiveRate']);
    const incentiveSlab = getVal(['Incentive_SlabExpr', 'incentive_SlabExpr', 'incentiveSlabExpr']);
    if (incentiveType === 'Fixed') {
      rates.push({ name: 'Incentive', type: 'Fixed', value: `₹ ${Number(incentiveRate || 0).toFixed(2)}`, isFixed: true });
    } else if (incentiveType === 'Slab') {
      rates.push({ name: 'Incentive', type: 'Slab', value: (incentiveSlab && incentiveSlab !== '') ? incentiveSlab : '0', isFixed: false });
    }

    // 8. Grocery Rate
    const groceryType = getVal(['Grocery_RateType', 'grocery_RateType', 'groceryRateType']);
    const groceryRate = getVal(['Grocery_Rate', 'grocery_Rate', 'groceryRate']);
    if (groceryType === 'Base Rate') {
      rates.push({ name: 'Grocery', type: 'Base Rate', value: 'Base Rate', isFixed: false });
    } else if (groceryType === 'Fixed') {
      rates.push({ name: 'Grocery', type: 'Fixed', value: `₹ ${Number(groceryRate || 0).toFixed(2)}`, isFixed: true });
    }

    return rates;
  }
}
