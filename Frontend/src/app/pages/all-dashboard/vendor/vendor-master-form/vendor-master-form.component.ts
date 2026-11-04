import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VendorService } from '../Service/vendor.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { forkJoin, of, Subject, Observable, concat } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DesignationService } from '../../payroll/services/designation.service';

@Component({
  selector: 'app-vendor-master-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './vendor-master-form.component.html',
  styleUrls: ['./vendor-master-form.component.scss']
})
export class VendorMasterFormComponent implements OnInit {
  @ViewChild('agentNgSelect') agentNgSelect: any;
  vendorForm!: FormGroup;
  isEditMode: boolean = false;
  submitted: boolean = false;
  vendorId: string = '';
  isFactBoxOpen: boolean = true; // Fact Box open by default
  pendingFhrIdStr: string | null = null;

  // Agent Autocomplete (matching vendor_transaction_list)
  agentVendorList$: Observable<any[]>;
  agentCodeInput$ = new Subject<string>();
  isAgentLoading = false;

  // Vendor List Popup State
  vendorList: any[] = [];
  showVendorListPopup: boolean = false;
  vendorListTitle: string = '';
  searchVendorText: string = '';

  get filteredVendorList() {
    if (!this.searchVendorText) return this.vendorList;
    return this.vendorList.filter(v => v.candidate_name?.toLowerCase().includes(this.searchVendorText.toLowerCase()));
  }

  // Fact Box stats
  stats = {
    totalVendors: 0,
    verifiedVendors: 0,
    pendingVerification: 0
  };

  // Dropdown Lists
  states: any[] = [];
  cities: any[] = [];
  permCities: any[] = [];
  clients: any[] = [];
  categories: any[] = [];
  banks: any[] = [];
  allModels: any[] = [];
  models: any[] = [];
  linkedModels: any[] = [];
  linkedFHRIds: any[] = [];
  uniqueLinkedFHRIds: any[] = [];
  selectedFHRDetailsList: any[] = [];
  allSelectedFHRDetailsList: any[] = [];

  historicActiveFHRDetailsList: any[] = [];
  historicAllFHRDetailsList: any[] = [];

  // Local Options
  rateTypes: string[] = ['Per Packet', 'Per Item', 'Fixed'];
  rateTypesList: any[] = [];
  vendorTypes: string[] = ['Bike', 'Van'];

  getRateTypeDisplayName(val: any): string {
    if (!val) return '-';
    const valStr = val.toString().trim();
    const found = this.rateTypesList.find(r => r.value === valStr || r.name.toLowerCase() === valStr.toLowerCase());
    return found ? found.name : valStr;
  }

  // Parses "1-74:18,75-100:19" → [{range:"1-74", rate:"18"}, {range:"75-100", rate:"19"}]
  parseSlabExpr(expr: string): { range: string; rate: string }[] {
    if (!expr) return [];
    return expr.split(',').map(part => {
      const colonIdx = part.lastIndexOf(':');
      if (colonIdx === -1) return { range: part.trim(), rate: '' };
      return {
        range: part.substring(0, colonIdx).trim(),
        rate: part.substring(colonIdx + 1).trim()
      };
    }).filter(s => s.range !== '');
  }


  // Dynamic Fields metadata configs
  basicDetailsFields: any[] = [];
  bankAndIdentityFields: any[] = [];
  vendorDetailsFields: any[] = [];
  rateCardFields: any[] = [];
  pendingModelId: string | null = null;
  auditTimeline: any[] = [];
  rateCardsList: any[] = [];
  editingRateCardIndex: number | null = null;
  rateCardSubmitted: boolean = false;
  allVendorsList: any[] = [];
  agentVendorsList: any[] = [];

  activeTab: number = 1;
  rateCardHistoryList: any[] = [];
  isHistoryLoading: boolean = false;
  pageIndexTab3: number = 1;
  pageSizeTab3: number = 10;
  totalCountTab3: number = 0;


  fhridMappingStats = {
    totalVendors: 0,
    mappedVendors: 0,
    unmappedVendors: 0
  };
  formatDateOnly(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') {
      if (val.includes('T')) return val.split('T')[0];
      if (val.includes(' ')) return val.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  parseNumberOrNull(val: any): number | null {
    if (val !== null && val !== undefined && val !== '' && !isNaN(Number(val))) {
      return Number(val);
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService,
    private loader: NgxUiLoaderService,
    private cdr: ChangeDetectorRef,
    private designationService: DesignationService
  ) {
    this.agentVendorList$ = concat(
      of([]),
      this.agentCodeInput$.pipe(
        distinctUntilChanged(),
        switchMap((term) => {
          const searchStr = (term || '').toString().trim().toUpperCase();
          if (!searchStr || searchStr.length < 1) {
            this.isAgentLoading = false;
            return of([]);
          }
          this.isAgentLoading = true;
          return of(searchStr).pipe(
            debounceTime(200),
            switchMap((s) => {
              this.isAgentLoading = false;
              const matched = this.agentVendorsList.filter(a =>
                (a.code && a.code.includes(s)) ||
                (a.name && a.name.toUpperCase().includes(s))
              );
              if (matched.length > 0) {
                return of(matched);
              }
              if (s.length >= 2) {
                this.isAgentLoading = true;
                return this.vendorService.searchVendors(s).pipe(
                  catchError(() => of({ data: [] })),
                  switchMap(res => {
                    this.isAgentLoading = false;
                    const list = (res?.data || [])
                      .filter((v: any) => {
                        const c = (v.VendorCode || v.vendor_Code || '').toString().trim();
                        return c !== '' && c !== '-' && c.toLowerCase() !== 'null';
                      })
                      .map((v: any) => ({
                        code: (v.VendorCode || v.vendor_Code || '').toString().trim().toUpperCase(),
                        name: v.VendorName || v.vendor_Name || v.candidate_name || '',
                        pan: v.VendorPanNo || v.vendor_PanNo || '',
                        account: v.VendorAccountNo || v.vendor_AccountNo || '',
                        displayText: `${(v.VendorCode || v.vendor_Code || '').toString().trim().toUpperCase()} ${v.VendorName || v.vendor_Name || v.candidate_name || ''}`.trim(),
                        raw: v
                      }));
                    return of(list);
                  })
                );
              }
              return of([]);
            })
          );
        })
      )
    );
  }

  ngOnInit(): void {
    this.initForm();
    this.setupFieldConfigs();
    this.loadDropdowns();
    // Check for edit mode
    const encryptedId = this.route.snapshot.paramMap.get('pk_recId');
    if (encryptedId) {
      this.isEditMode = true;
      this.vendorId = this.encryptionService.decryptText(encryptedId);
      this.loadVendor(this.vendorId);
    }
  }

  initForm(): void {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.vendorForm = this.fb.group({
      pk_recId: [null],
      Vendor_Name: ['', [Validators.required, Validators.maxLength(150)]],
      Vendor_FatherName: ['', [Validators.maxLength(150)]],
      Vendor_ContactNo: ['', [Validators.pattern('^[0-9]{10}$')]],
      Vendor_Gender: ['', [Validators.required]],
      Vendor_DOB: [''],
      Vendor_Address: ['', [Validators.maxLength(500)]],
      Vendor_PermanentAddress: ['', [Validators.maxLength(500)]],
      sameAsCurrentAddress: [false],
      Vendor_FKStateId: ['', [Validators.required]],
      Vendor_State: [''],
      Vendor_FKCityId: [''],
      Vendor_City: [''],
      Vendor_FKPermStateId: [''],
      Vendor_PermState: [''],
      Vendor_FKPermCityId: [''],
      Vendor_PermCity: [''],
      Vendor_FKBankId: ['', [Validators.required]],
      Vendor_BankName: [''],
      Vendor_AccountNo: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
      Vendor_IFSCCode: ['', [Validators.required, Validators.pattern('^[a-zA-Z]{4}0[a-zA-Z0-9]{6}$')]],
      Vendor_PanNo: ['', [Validators.pattern('^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$')]],
      Vendor_AaddharNo: ['', [Validators.pattern('^[0-9]{12}$')]],
      Vendor_GSTNo: ['', [Validators.pattern('^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}Z[0-9a-zA-Z]{1}$')]],

      Vendor_IsGSTApplicable: [false],
      Vendor_GSTRate: [null],
      Vendor_IsTDSApplicable: [true],
      Vendor_TaxTDSRate: [null, [Validators.required, Validators.min(0), Validators.max(100)]],

      // Linked FHR ID section
      Vendor_FKLinkedClientId: [null],
      Vendor_FKLinkedModelId: [null],
      Vendor_FKLinkedFHRId: [null],

      Vendor_Code: ['AUTO'],
      Vendor_Status: ['Not Verified'],
      Vendor_RegistrationDate: [today],



      // Rate Card fields
      Vendor_FKClientId: [''],
      Vendor_RateType: [''],
      Vendor_Type: [''],
      Vendor_FK_ModelId: [''],
      Vendor_HFRID: ['', [Validators.maxLength(50)]],
      EffectiveFrom: [today],

      Vendor_CategoryID: [null],
      Vendor_Rate: [null],
      Vendor_RateDeduction: [null],
      Vendor_DeliveryRate: [null],
      Vendor_PickupRate: [null],
      Vendor_MFNRate: [null],
      Vendor_TDSPercentage: [null],
      IsVendor: [true],
      // Additional Candidate Details
      AgentCode: [null, [Validators.maxLength(50)]],
      AgentName: ['', [Validators.maxLength(150)]],
      LegalName: ['', [Validators.maxLength(150)]],
      EmergencyContactNo: ['', [Validators.pattern('^[0-9]{10}$')]],
      EmailID: ['', [Validators.email]],
      EShramCardNo: ['', [Validators.maxLength(30)]],
      AyushmanCard: [false],
      AyushmanCardNo: ['', [Validators.maxLength(30)]],
      AccountHolderName: ['', [Validators.required, Validators.maxLength(150)]],
      PermanentPinCode: ['', [Validators.pattern('^[0-9]{6}$')]],
      CurrentPinCode: ['', [Validators.pattern('^[0-9]{6}$')]]
    });

    ['Vendor_PanNo', 'Vendor_IFSCCode', 'Vendor_GSTNo', 'AgentCode'].forEach(key => {
      this.vendorForm.get(key)?.valueChanges.subscribe(val => {
        if (val && typeof val === 'string') {
          const upper = val.toUpperCase().trim();
          if (val !== upper) {
            this.vendorForm.get(key)?.setValue(upper, { emitEvent: false });
          }
        }
      });
    });

    this.vendorForm.get('AgentCode')?.valueChanges.subscribe(val => {
      this.onAgentCodeChange(val);
    });

    //     this.vendorForm.get('AyushmanCard')?.valueChanges.subscribe(val => {
    //   this.onAyushmanCardToggle(val);
    // });

    this.vendorForm.get('Vendor_FKClientId')?.valueChanges.subscribe(clientId => {
      this.filterModelsByClient(clientId);
    });

    this.vendorForm.get('sameAsCurrentAddress')?.valueChanges.subscribe(isSame => {
      if (isSame) {
        const currentAddr = this.vendorForm.get('Vendor_Address')?.value || '';
        this.vendorForm.get('Vendor_PermanentAddress')?.setValue(currentAddr);
      }
    });

    this.vendorForm.get('Vendor_Address')?.valueChanges.subscribe(currentAddr => {
      if (this.vendorForm.get('sameAsCurrentAddress')?.value) {
        this.vendorForm.get('Vendor_PermanentAddress')?.setValue(currentAddr || '', { emitEvent: false });
      }
    });

    this.vendorForm.get('Vendor_FK_ModelId')?.valueChanges.subscribe(modelId => {
      this.adjustDynamicValidators(modelId);
    });

    const verificationFields = ['Vendor_AaddharNo', 'Vendor_PanNo', 'Vendor_AccountNo', 'Vendor_IFSCCode'];
    verificationFields.forEach(field => {
      this.vendorForm.get(field)?.valueChanges.subscribe(() => {
        this.updateVerificationStatus();
      });
    });
  }

  setupFieldConfigs(): void {
    this.basicDetailsFields = [
      {
        key: 'Vendor_Name',
        label: 'Vendor Name',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: true,
        placeholder: 'Enter vendor name'
      },
      {
        key: 'LegalName',
        label: 'Legal Name (As Per Aadhaar)',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        placeholder: 'Enter legal name as per Aadhaar'
      },

      {
        key: 'Vendor_FatherName',
        label: "Father's Name",
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        placeholder: "Enter father's name"
      },
      {
        key: 'Vendor_ContactNo',
        dbFieldName: 'VendorContactNo',
        label: 'Mobile Number',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        maxLength: 10,
        placeholder: 'Enter 10-digit mobile no.',
        numbersOnly: true
      },
      {
        key: 'EmergencyContactNo',
        dbFieldName: 'VendorEmergencyContact',
        label: 'Emergency Contact No.',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        maxLength: 10,
        numbersOnly: true,
        placeholder: 'Enter 10-digit mobile no.'
      },
      {
        key: 'EmailID',
        dbFieldName: 'VendorEmailID',
        label: 'Email ID',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        placeholder: 'Enter email address'
      },
      {
        key: 'Vendor_Gender',
        label: 'Gender',
        type: 'select',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: true,
        options: [
          { name: 'Male', value: 'Male' },
          { name: 'Female', value: 'Female' },
          { name: 'Other', value: 'Other' }
        ]
      },
      {
        key: 'Vendor_DOB',
        label: 'Date of Birth',
        type: 'date',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false
      },
      {
        key: 'Vendor_RegistrationDate',
        label: 'Registration Date',
        type: 'date',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false
      },
      {
        key: 'AgentCode',
        label: 'Agent Code',
        type: 'agent-select',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        placeholder: 'Type to search agent...'
      },
      {
        key: 'AgentName',
        label: 'Agent Name',
        type: 'text',
        readonly: true,
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        placeholder: 'Agent name will auto-populate'
      },
    ];

    this.bankAndIdentityFields = [
      {
        key: 'Vendor_FKBankId',
        label: 'Bank Name',
        type: 'select',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: true,
        options: [],
        onChange: (val: any) => this.onBankChange(val)
      },
      {
        key: 'Vendor_AccountNo',
        dbFieldName: 'VendorAccountNo',
        label: 'Account Number',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: true,
        maxLength: 18,
        placeholder: 'Enter account number',
        numbersOnly: true
      },
      {
        key: 'Vendor_IFSCCode',
        label: 'IFSC Code',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: true,
        maxLength: 11,
        placeholder: 'e.g. SBIN0012345'
      },

      {
        key: 'AccountHolderName',
        label: 'Account Holder Name',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: true,
        placeholder: 'Enter account holder name'
      },
      {
        key: 'Vendor_PanNo',
        dbFieldName: 'VendorPanNo',
        label: 'PAN Number',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        maxLength: 10,
        placeholder: 'e.g. ABCDE1234F',
        uppercase: true
      },
      {
        key: 'Vendor_AaddharNo',
        dbFieldName: 'VendorAaddharNo',
        label: 'Aadhar Number',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        maxLength: 12,
        placeholder: 'Enter 12-digit Aadhar number',
        numbersOnly: true
      },
      {
        key: 'Vendor_GSTNo',
        dbFieldName: 'VendorGSTNo',
        label: 'GST Number',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        uppercase: true,
        placeholder: 'Enter 15-character GST no.',
        maxLength: 15
      },
      {
        key: 'EShramCardNo',
        dbFieldName: 'VendorEShramCardNo',
        label: 'E-Shram Card No.',
        type: 'text',
        width: 'col-sm-12 col-md-4 col-lg-4 mb-1',
        required: false,
        placeholder: 'Enter E-Shram Card No.',
        maxLength: 20
      },

    ];

    this.rateCardFields = [
      {
        key: 'Vendor_FKClientId',
        label: 'Client',
        type: 'select',
        width: 'col-sm-12 col-md-3 col-lg-3 mb-3',
        required: true,
        options: [],
        onChange: (val: any) => this.onClientChange(val)
      },
      {
        key: 'Vendor_FK_ModelId',
        label: 'Model',
        type: 'select',
        width: 'col-sm-12 col-md-3 col-lg-3 mb-3',
        required: true,
        options: []
      },
      {
        key: 'Vendor_Type',
        label: 'Vendor Type',
        type: 'select',
        width: 'col-sm-12 col-md-3 col-lg-3 mb-3',
        required: true,
        options: this.vendorTypes.map(vt => ({ name: vt, value: vt }))
      },
      {
        key: 'Vendor_RateType',
        label: 'Rate Type',
        type: 'select',
        width: 'col-sm-12 col-md-3 col-lg-3 mb-3',
        required: true,
        options: []
      },
      {
        key: 'Vendor_HFRID',
        label: 'FHR ID',
        type: 'text',
        width: 'col-sm-12 col-md-3 col-lg-3 mb-3',
        required: false,
        placeholder: 'Enter FHR ID (Optional)'
      }
    ];
  }

  loadDropdowns(): void {
    const compId = sessionStorage.getItem('companyId') || 'GU-1';

    this.vendorService.getDdlListBasedOnCodeType('6', compId).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.rateTypesList = (res.data || []).map((c: any) => ({
          name: c.name || c.description || c.codeDescription || c.text,
          value: (c.value || c.codeId || c.id).toString()
        }));
        this.updateFieldOptions('Vendor_RateType', this.rateTypesList);
      }
    });

    this.vendorService.getDropdownList('State').subscribe(res => {
      if (res.isSuccess) {
        this.states = res.data;
        this.updateFieldOptions('Vendor_FKStateId', res.data);
        this.updateFieldOptions('Vendor_FKPermStateId', res.data);
      }
    });

    this.vendorService.getDropdownList('CostCenter').subscribe(res => {
      if (res.isSuccess) {
        this.clients = res.data;
        this.updateFieldOptions('Vendor_FKClientId', res.data);
        const currentClientId = this.vendorForm.get('Vendor_FKClientId')?.value;
        if (currentClientId) {
          this.filterModelsByClient(currentClientId);
        }
      }
    });

    // Category options loaded dynamically from database CodeType 5 (LSP_Master_General)
    this.vendorService.getDdlListBasedOnCodeType('5', compId).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.categories = (res.data || []).map((c: any) => ({
          name: c.name || c.description || c.codeDescription || c.text,
          value: Number(c.value || c.codeId || c.id)
        }));
        this.updateFieldOptions('Vendor_CategoryID', this.categories);
      }
    });

    this.vendorService.getDropdownList('Bank').subscribe(res => {
      if (res.isSuccess) {
        this.banks = res.data;
        this.updateFieldOptions('Vendor_FKBankId', res.data);
      }
    });

    this.vendorService.getDdlListBasedOnCodeType('4', compId).subscribe(res => {
      if (res.isSuccess) {
        this.allModels = (res.data || []).map((m: any) => {
          let cleanName = m.name || '';
          if (cleanName.includes(':')) {
            cleanName = cleanName.split(':')[1];
          }
          return {
            value: m.value != null ? m.value.toString() : '',
            name: m.name,
            displayName: cleanName
          };
        });
        const currentClientId = this.vendorForm.get('Vendor_FKClientId')?.value;
        if (currentClientId) {
          this.filterModelsByClient(currentClientId);
        }
      }
    });
  }

  onClientChange(val: any): void {
    const clientId = val && typeof val === 'object' ? val.value : val;
    this.filterModelsByClient(clientId);
  }

  filterModelsByClient(clientId: any): void {
    if (!clientId) {
      this.models = [];
      this.updateFieldOptions('Vendor_FK_ModelId', []);
      if (!this.isEditMode) {
        this.vendorForm.patchValue({ Vendor_FK_ModelId: null });
      }
      return;
    }

    if (!this.allModels || this.allModels.length === 0) {
      return;
    }

    const selectedClient = this.clients.find(c => c.value && c.value.toString() === clientId.toString());
    const clientName = (selectedClient?.name || '').toLowerCase();

    if (clientName.includes('flipkart')) {
      // Flipkart models: ODH, XRM, LARGE only
      const flipkartKeywords = ['ODH', 'XRM', 'LARGE'];
      this.models = this.allModels.filter(m => {
        const text = ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase();
        return flipkartKeywords.some(kw => text.includes(kw));
      });
    } else if (clientName.includes('amazon')) {
      // Amazon models: DSP, EDSP, ESDP only
      const amazonKeywords = ['DSP', 'EDSP', 'ESDP'];
      this.models = this.allModels.filter(m => {
        const text = ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase();
        return amazonKeywords.some(kw => text.includes(kw));
      });
    } else if (clientName.includes('shiprocket')) {
      // Shiprocket models: B2C / B2C Delivery only
      const shiprocketKeywords = ['B2C'];
      this.models = this.allModels.filter(m => {
        const text = ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase();
        return shiprocketKeywords.some(kw => text.includes(kw));
      });
    } else if (clientName.includes('airtel')) {
      // Airtel models: FSE-Pickup / FSE only
      const airtelKeywords = ['FSE'];
      this.models = this.allModels.filter(m => {
        const text = ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase();
        return airtelKeywords.some(kw => text.includes(kw));
      });
    } else if (clientName.includes('ebees')) {
      // Ebees models: exactly 1 LMD model (Delivery & Pickup)
      const ebeesMatches = this.allModels.filter(m => {
        const full = ((m.name || '') + ' ' + (m.displayName || '')).toUpperCase();
        return full.includes('EBEES') || full.includes('EB_') || full.includes('EB:');
      });

      let chosenModel: any = null;
      if (ebeesMatches.length > 0) {
        chosenModel = ebeesMatches[0];
      } else {
        const allLmds = this.allModels.filter(m => {
          const text = ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase();
          return text.includes('LMD') || text.includes('HYBRID');
        });
        if (allLmds.length > 1) {
          chosenModel = allLmds[1];
        } else if (allLmds.length === 1) {
          chosenModel = allLmds[0];
        }
      }

      this.models = chosenModel ? [{
        ...chosenModel,
        displayName: 'LMD (Delivery & Pickup)'
      }] : [];
    } else if (clientName.includes('bluedart') || clientName.includes('blue dart')) {
      // Blue Dart models: exactly 1 LMD model (Forward Delivery)
      const bdMatches = this.allModels.filter(m => {
        const full = ((m.name || '') + ' ' + (m.displayName || '')).toUpperCase();
        return full.includes('BLUEDART') || full.includes('BD_') || full.includes('BD:') || full.includes('BLUE');
      });

      let chosenModel: any = null;
      if (bdMatches.length > 0) {
        chosenModel = bdMatches[0];
      } else {
        const allLmds = this.allModels.filter(m => {
          const text = ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase();
          return text.includes('LMD');
        });
        if (allLmds.length > 0) {
          chosenModel = allLmds[0];
        }
      }

      this.models = chosenModel ? [{
        ...chosenModel,
        displayName: 'LMD (Forward Delivery)'
      }] : [];
    } else {
      // Clients not discussed (not Flipkart, Amazon, Shiprocket, Airtel, Ebees, Blue Dart): no models available
      this.models = [];
    }

    this.updateFieldOptions('Vendor_FK_ModelId', this.models.map(m => ({ name: m.displayName, value: m.value })));

    const activeModelId = this.pendingModelId || this.vendorForm.get('Vendor_FK_ModelId')?.value;
    if (activeModelId && this.models.some(m => m.value && m.value.toString() === activeModelId.toString())) {
      this.vendorForm.patchValue({ Vendor_FK_ModelId: activeModelId.toString() }, { emitEvent: false });
    } else {
      this.vendorForm.patchValue({ Vendor_FK_ModelId: null }, { emitEvent: false });
    }
  }

  updateFieldOptions(key: string, options: any[]): void {
    let field = this.basicDetailsFields.find(f => f.key === key);
    if (field) {
      field.options = options;
      return;
    }
    field = this.bankAndIdentityFields.find(f => f.key === key);
    if (field) {
      field.options = options;
      return;
    }
    field = this.rateCardFields.find(f => f.key === key);
    if (field) {
      field.options = options;
    }
  }

  getSelectedClientName(): string {
    const clientId = this.vendorForm.get('Vendor_FKClientId')?.value;
    if (!clientId) return '';
    const selectedClient = this.clients.find(c => c.value && c.value.toString() === clientId.toString());
    return (selectedClient?.name || '').toLowerCase();
  }

  getClientDisplayName(): string {
    const clientsSet = new Set<string>();

    const clientId = this.vendorForm.get('Vendor_FKClientId')?.value;
    if (clientId) {
      const selectedClient = this.clients.find(c => c.value && c.value.toString() === clientId.toString());
      if (selectedClient?.name) clientsSet.add(selectedClient.name);
    }

    const linkedClientVal = this.vendorForm.get('Vendor_FKLinkedClientId')?.value;
    if (linkedClientVal) {
      const linkedClientIds = Array.isArray(linkedClientVal) ? linkedClientVal : [linkedClientVal];
      linkedClientIds.forEach(id => {
        const c = this.clients.find(x => x.value && x.value.toString() === id.toString());
        if (c?.name) clientsSet.add(c.name);
      });
    }

    if (this.rateCardsList && this.rateCardsList.length > 0) {
      this.rateCardsList.forEach(rc => {
        const cName = rc.clientName || (rc.Vendor_FKClientId ? 'Client #' + rc.Vendor_FKClientId : null);
        if (cName) clientsSet.add(cName);
      });
    }

    if (clientsSet.size > 0) {
      return Array.from(clientsSet).join(', ');
    }
    return 'None';
  }

  getInsightsModelType(): string {
    const modelsSet = new Set<string>();

    const addModelName = (name: string) => {
      if (!name) return;
      const parts = name.split(':');
      const modelOnly = parts.length > 1 ? parts.slice(1).join(':').trim() : name.trim();
      modelsSet.add(modelOnly);
    };

    const modelId = this.vendorForm.get('Vendor_FK_ModelId')?.value;
    if (modelId) {
      const selectedModel = this.allModels.find(m => m.value && m.value.toString() === modelId.toString()) ||
        this.models.find(m => m.value && m.value.toString() === modelId.toString());
      if (selectedModel) addModelName(selectedModel.displayName || selectedModel.name);
    }

    const linkedModelVal = this.vendorForm.get('Vendor_FKLinkedModelId')?.value;
    if (linkedModelVal) {
      const linkedModelIds = Array.isArray(linkedModelVal) ? linkedModelVal : [linkedModelVal];
      linkedModelIds.forEach(id => {
        const m = this.allModels.find(x => x.value && x.value.toString() === id.toString()) ||
          this.linkedModels.find(x => x.value && x.value.toString() === id.toString()) ||
          this.models.find(x => x.value && x.value.toString() === id.toString());
        if (m) addModelName(m.displayName || m.name);
      });
    }

    if (this.rateCardsList && this.rateCardsList.length > 0) {
      this.rateCardsList.forEach(rc => {
        if (rc.modelName) addModelName(rc.modelName);
      });
    }

    if (modelsSet.size > 0) {
      return Array.from(modelsSet).join(', ');
    }
    return 'None';
  }

  getInsightsVendorType(): string {
    const typesSet = new Set<string>();

    const vType = this.vendorForm.get('Vendor_Type')?.value;
    if (vType) typesSet.add(vType);

    if (this.rateCardsList && this.rateCardsList.length > 0) {
      this.rateCardsList.forEach(rc => {
        if (rc.Vendor_Type) typesSet.add(rc.Vendor_Type);
      });
    }

    if (typesSet.size > 0) {
      return Array.from(typesSet).join(', ');
    }
    return 'Not Set';
  }

  // Retrieve selected model name/description to figure out the type
  getSelectedModelType(): string {
    const modelId = this.vendorForm.get('Vendor_FK_ModelId')?.value;
    if (!modelId) return '';
    const selectedModel = this.allModels.find(m => m.value.toString() === modelId.toString()) || this.models.find(m => m.value.toString() === modelId.toString());
    if (!selectedModel) return '';

    // Parse name like 'ODH01:ODH' or 'ODH'
    const name = selectedModel.name || '';
    if (name.includes(':')) {
      return name.split(':')[1].toUpperCase();
    }
    return name.toUpperCase();
  }

  // Adjust validators dynamically based on model choice
  adjustDynamicValidators(modelId: any): void {
    const categoryCtrl = this.vendorForm.get('Vendor_CategoryID');
    const rateCtrl = this.vendorForm.get('Vendor_Rate');
    const rateDeductionCtrl = this.vendorForm.get('Vendor_RateDeduction');
    const deliveryRateCtrl = this.vendorForm.get('Vendor_DeliveryRate');
    const pickupRateCtrl = this.vendorForm.get('Vendor_PickupRate');
    const mfnRateCtrl = this.vendorForm.get('Vendor_MFNRate');
    const tdsCtrl = this.vendorForm.get('Vendor_TDSPercentage');

    // Reset controls
    [categoryCtrl, rateCtrl, rateDeductionCtrl, deliveryRateCtrl, pickupRateCtrl, mfnRateCtrl, tdsCtrl].forEach(ctrl => {
      ctrl?.clearValidators();
    });

    const modelType = this.getSelectedModelType();
    const clientName = this.getSelectedClientName();

    // Clear non-applicable field values when changing models
    if (!modelType.includes('ODH')) {
      categoryCtrl?.setValue(null, { emitEvent: false });
      rateCtrl?.setValue(null, { emitEvent: false });
      rateDeductionCtrl?.setValue(null, { emitEvent: false });
    }
    if (!modelType.includes('XRM') && !modelType.includes('DSP') && !modelType.includes('EDSP') && !modelType.includes('ESDP') && !modelType.includes('LMD') && !modelType.includes('B2C')) {
      deliveryRateCtrl?.setValue(null, { emitEvent: false });
    }
    if (!modelType.includes('XRM') && !modelType.includes('LARGE') && !modelType.includes('DSP') && !modelType.includes('EDSP') && !modelType.includes('ESDP') && !modelType.includes('FSE') && !modelType.includes('LMD')) {
      pickupRateCtrl?.setValue(null, { emitEvent: false });
    }
    if (!modelType.includes('DSP') && !modelType.includes('EDSP') && !modelType.includes('ESDP')) {
      mfnRateCtrl?.setValue(null, { emitEvent: false });
    }
    if (!modelType.includes('DSP') && !modelType.includes('EDSP') && !modelType.includes('ESDP') && !modelType.includes('FSE') && !modelType.includes('LMD') && !modelType.includes('B2C')) {
      tdsCtrl?.setValue(null, { emitEvent: false });
    }

    if (modelType.includes('ODH')) {
      categoryCtrl?.setValidators([Validators.required]);
      rateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      rateDeductionCtrl?.setValidators([Validators.required, Validators.min(0)]);
    } else if (modelType.includes('XRM')) {
      deliveryRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      pickupRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
    } else if (modelType.includes('LARGE')) {
      pickupRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
    } else if (modelType.includes('DSP') || modelType.includes('EDSP') || modelType.includes('ESDP')) {
      deliveryRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      pickupRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      mfnRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      tdsCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else if (modelType.includes('FSE')) {
      pickupRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      tdsCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else if (modelType.includes('LMD')) {
      if (clientName.includes('bluedart')) {
        // Bluedart LMD: Delivery Rate & TDS %
        deliveryRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
        tdsCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        // Ebees (and other clients) LMD: Delivery Rate, Pickup Rate & TDS %
        deliveryRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
        pickupRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
        tdsCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      }
    } else if (modelType.includes('B2C')) {
      deliveryRateCtrl?.setValidators([Validators.required, Validators.min(0)]);
      tdsCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    }

    // Refresh validation updates
    [categoryCtrl, rateCtrl, rateDeductionCtrl, deliveryRateCtrl, pickupRateCtrl, mfnRateCtrl, tdsCtrl].forEach(ctrl => {
      ctrl?.updateValueAndValidity();
    });
  }

  // Update status based on aadhar, pan, and bank account values
  updateVerificationStatus(): void {
    if (!this.isEditMode) {
      this.vendorForm.patchValue({ Vendor_Status: 'Not Verified' }, { emitEvent: false });
      return;
    }

    const aadhar = (this.vendorForm.get('Vendor_AaddharNo')?.value || '').toString().trim();
    const pan = (this.vendorForm.get('Vendor_PanNo')?.value || '').toString().trim().toUpperCase();
    const account = (this.vendorForm.get('Vendor_AccountNo')?.value || '').toString().trim();
    const ifsc = (this.vendorForm.get('Vendor_IFSCCode')?.value || '').toString().trim().toUpperCase();

    const isAadharValid = aadhar && /^[0-9]{12}$/.test(aadhar);
    const isPanValid = pan && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    const isAccountValid = account && /^[0-9]{9,18}$/.test(account);
    const isIfscValid = ifsc && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

    if (isAadharValid && isPanValid && isAccountValid && isIfscValid) {
      this.vendorForm.patchValue({ Vendor_Status: 'Verified' }, { emitEvent: false });
    } else {
      this.vendorForm.patchValue({ Vendor_Status: 'Not Verified' }, { emitEvent: false });
    }
  }

  // Handle Cascades
  onStateChange(val: any): void {
    const stateId = val && typeof val === 'object' ? val.value : val;
    const selectedState = this.states.find(s => s.value && s.value.toString() === (stateId ? stateId.toString() : ''));

    this.vendorForm.patchValue({
      Vendor_State: selectedState ? selectedState.name : '',
      Vendor_FKCityId: null,
      Vendor_City: ''
    });
    this.cities = [];
    this.updateFieldOptions('Vendor_FKCityId', []);

    if (stateId) {
      this.vendorService.getCitiesByState(stateId).subscribe(res => {
        if (res.isSuccess) {
          this.cities = (res.data || []).filter((c: any) => c.value !== null && c.value !== '');
          this.updateFieldOptions('Vendor_FKCityId', this.cities);

          if (this.vendorForm.get('sameAsCurrentAddress')?.value) {
            this.permCities = [...this.cities];
            this.updateFieldOptions('Vendor_FKPermCityId', this.permCities);
            this.vendorForm.patchValue({
              Vendor_FKPermStateId: stateId,
              Vendor_PermState: selectedState ? selectedState.name : '',
              Vendor_FKPermCityId: null,
              Vendor_PermCity: ''
            });
          }
        }
      });
    }
  }

  onCityChange(val: any): void {
    const cityId = val && typeof val === 'object' ? val.value : val;
    const selectedCity = this.cities.find(c => c.value && c.value.toString() === (cityId ? cityId.toString() : ''));
    this.vendorForm.patchValue({
      Vendor_City: selectedCity ? selectedCity.name : ''
    });

    if (this.vendorForm.get('sameAsCurrentAddress')?.value) {
      this.vendorForm.patchValue({
        Vendor_FKPermCityId: cityId,
        Vendor_PermCity: selectedCity ? selectedCity.name : ''
      });
    }
  }

  onPermStateChange(val: any): void {
    const stateId = val && typeof val === 'object' ? val.value : val;
    const selectedState = this.states.find(s => s.value && s.value.toString() === (stateId ? stateId.toString() : ''));

    this.vendorForm.patchValue({
      Vendor_PermState: selectedState ? selectedState.name : '',
      Vendor_FKPermCityId: null,
      Vendor_PermCity: ''
    });
    this.permCities = [];
    this.updateFieldOptions('Vendor_FKPermCityId', this.permCities);

    if (stateId) {
      this.vendorService.getCitiesByState(stateId).subscribe(res => {
        if (res.isSuccess) {
          this.permCities = (res.data || []).filter((c: any) => c.value !== null && c.value !== '');
          this.updateFieldOptions('Vendor_FKPermCityId', this.permCities);
        }
      });
    }
  }

  onPermCityChange(val: any): void {
    const cityId = val && typeof val === 'object' ? val.value : val;
    const selectedCity = this.permCities.find(c => c.value && c.value.toString() === (cityId ? cityId.toString() : ''));
    this.vendorForm.patchValue({
      Vendor_PermCity: selectedCity ? selectedCity.name : ''
    });
  }

  onBankChange(val: any): void {
    const bankId = val && typeof val === 'object' ? val.value : val;
    const selectedBank = this.banks.find(b => b.value && b.value.toString() === (bankId ? bankId.toString() : ''));
    this.vendorForm.patchValue({
      Vendor_BankName: selectedBank ? selectedBank.name : ''
    });
  }


  // JYOTI

  onAyushmanCardToggle(event: any): void {
    const isChecked = event.target ? event.target.checked : !!event;
    const control = this.vendorForm.get('AyushmanCardNo');
    if (isChecked) {
      control?.setValidators([Validators.required, Validators.maxLength(30)]);
    } else {
      control?.clearValidators();
      control?.setValue('', { emitEvent: false });
    }
    control?.updateValueAndValidity();
  }

  // Toggle GST Applicable — add/remove required validator on GST Rate and GST Number
  onGSTToggle(event: any): void {
    const isChecked = event.target ? event.target.checked : !!event;
    const control = this.vendorForm.get('Vendor_GSTRate');
    const gstNoControl = this.vendorForm.get('Vendor_GSTNo');
    const gstNoField = this.bankAndIdentityFields?.find((f: any) => f.key === 'Vendor_GSTNo');

    if (isChecked) {
      control?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      gstNoControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}Z[0-9a-zA-Z]{1}$')]);
      if (gstNoField) {
        gstNoField.required = true;
      }
    } else {
      control?.clearValidators();
      control?.setValue(null, { emitEvent: false });
      gstNoControl?.clearValidators();
      gstNoControl?.setValidators([Validators.pattern('^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}Z[0-9a-zA-Z]{1}$')]);
      if (gstNoField) {
        gstNoField.required = false;
      }
    }
    control?.updateValueAndValidity();
    gstNoControl?.updateValueAndValidity();
  }

  // Toggle TDS Applicable — add/remove required validator on TDS Rate
  onTDSToggle(event: any): void {
    const isChecked = event.target ? event.target.checked : !!event;
    const control = this.vendorForm.get('Vendor_TaxTDSRate');
    if (isChecked) {
      control?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else {
      control?.clearValidators();
      control?.setValue(null, { emitEvent: false });
    }
    control?.updateValueAndValidity();
  }


  // Linked FHR ID: Client changed -> filter Models used by that client's saved rate cards
  getLinkedClientName(): string {
    const clientId = this.vendorForm.get('Vendor_FKLinkedClientId')?.value;
    const client = this.clients.find(c => c.value == clientId);
    return client ? client.name : '-';
  }

  getLinkedModelName(): string {
    const modelId = this.vendorForm.get('Vendor_FKLinkedModelId')?.value;
    const model = this.linkedModels.find(m => m.value == modelId);
    return model ? model.displayName || model.name : '-';
  }

  onLinkedClientChange(val: any): void {
    const clientIds = val && Array.isArray(val) ? val : (val ? [val] : []);

    if (!clientIds || clientIds.length === 0) {
      this.vendorForm.patchValue({
        Vendor_FKLinkedModelId: null,
        Vendor_FKLinkedFHRId: null
      }, { emitEvent: false });

      this.linkedFHRIds = [];
      this.uniqueLinkedFHRIds = [];
      this.linkedModels = [];
      this.onLinkedModelChange(null);
      return;
    }

    const observables = clientIds.map((cId: any) => {
      const clientIdStr = typeof cId === 'object' ? cId.value : cId;
      return this.vendorService.getModelListByClient(clientIdStr).pipe(
        catchError(err => {
          console.error(`Error fetching models for client ${clientIdStr}`, err);
          return of(null);
        })
      );
    });

    forkJoin(observables).subscribe(results => {
      let combinedModels: any[] = [];
      results.forEach((res, index) => {
        const cId = typeof clientIds[index] === 'object' ? clientIds[index].value : clientIds[index];
        const clientObj = this.clients.find(c => c.value == cId);
        const clientName = clientObj ? clientObj.name : 'Unknown';

        const data = Array.isArray(res) ? res : (res && res.data ? res.data : null);

        if (data && data.length > 0) {
          const models = data.map((m: any) => {
            let rawName = m.name || m.Name || m.description || m.Description || m.text || '';
            let rawValue = m.value != null ? m.value : (m.Value != null ? m.Value : (m.id != null ? m.id : ''));
            let cleanName = rawName;

            if (typeof cleanName === 'string' && cleanName.includes(':')) {
              cleanName = cleanName.split(':')[1];
            }

            return {
              value: `${cId}_${rawValue}`,
              clientId: cId,
              modelId: rawValue,
              clientName: clientName,
              name: rawName,
              displayName: `${clientName}:${m.displayName || cleanName}`
            };
          });
          combinedModels = combinedModels.concat(models);
        }
      });
      this.linkedModels = combinedModels;

      // Keep previously selected models if they are still valid for the new client list
      const currentModels = this.vendorForm.get('Vendor_FKLinkedModelId')?.value;
      if (currentModels && Array.isArray(currentModels)) {
        const validModels = currentModels.filter((mId: any) =>
          this.linkedModels.some((lm: any) => lm.value.toString() === mId.toString())
        );

        if (validModels.length !== currentModels.length) {
          this.vendorForm.patchValue({ Vendor_FKLinkedModelId: validModels }, { emitEvent: false });
        }

        // Always trigger model change to update FHRIDs cascade
        this.onLinkedModelChange(validModels);
      } else {
        this.onLinkedModelChange(currentModels);
      }
    });
  }

  // Linked FHR ID: Model changed -> filter FHR IDs used by that client+model's saved rate cards
  // onLinkedModelChange(val: any): void {
  //   const modelId = val && typeof val === 'object' ? val.value : val;
  //   const clientId = this.vendorForm.get('Vendor_FKLinkedClientId')?.value;

  //   this.vendorForm.patchValue({ Vendor_FKLinkedFHRId: null }, { emitEvent: false });

  //   if (!clientId || !modelId) {
  //     this.linkedFHRIds = [];
  //     return;
  //   }

  //   this.vendorService.getLinkedFHRIDs(clientId, modelId).subscribe({
  //     next: (res) => {
  //       const data = Array.isArray(res) ? res : (res && res.data ? res.data : null);
  //       if (data && data.length > 0) {
  //         this.linkedFHRIds = data.map((item: any) => {
  //           const rates = [];
  //           const normal = this.getRateConfig(item, 'Normal', 'Normal');
  //           if (normal) rates.push(normal);
  //           const pickup = this.getRateConfig(item, 'Pickup', 'Pickup');
  //           if (pickup) rates.push(pickup);
  //           const mfn = this.getRateConfig(item, 'MFN', 'MFN');
  //           if (mfn) rates.push(mfn);
  //           const van = this.getRateConfig(item, 'Van', 'Van');
  //           if (van) rates.push(van);
  //           const u2s = this.getRateConfig(item, 'U2S', 'U2S');
  //           if (u2s) rates.push(u2s);
  //           const shopsy = this.getRateConfig(item, 'Shopsy', 'Shopsy', 'Shopsy_Deduction_Rate');
  //           if (shopsy) rates.push(shopsy);
  //           const prexo = this.getRateConfig(item, 'Prexo', 'Prexo');
  //           if (prexo) rates.push(prexo);
  //           const grocery = this.getRateConfig(item, 'Grocery', 'Grocery');
  //           if (grocery) rates.push(grocery);

  //           const vType = item.Large_VehicleTypeName || item.large_VehicleTypeName || item.VehicleTypeName || item.vehicleTypeName || '';
  //           const fhrName = item.name || item.Name || '';

  //           return {
  //             value: item.value != null ? item.value.toString() : (item.Value != null ? item.Value.toString() : ''),
  //             name: fhrName,
  //             location: item.locationId || item.LocationID || item.LocationId || '',
  //             vehicleTypeName: vType,
  //             effectiveFrom: item.effectiveFrom || item.EffectiveFrom || '',
  //             rates: rates
  //           };
  //         });

  //         // Create a unique list for the dropdown
  //         const uniqueMap = new Map<string, any>();
  //         for (const item of this.linkedFHRIds) {
  //           if (!uniqueMap.has(item.value)) {
  //             uniqueMap.set(item.value, item);
  //           }
  //         }
  //         this.uniqueLinkedFHRIds = Array.from(uniqueMap.values());

  //       } else {
  //         this.linkedFHRIds = [];
  //         this.uniqueLinkedFHRIds = [];
  //       }
  //       this.onFHRIDChange();
  //     },
  //     error: (err) => {
  //       console.error('Error fetching FHR IDs', err);
  //       this.linkedFHRIds = [];
  //       this.uniqueLinkedFHRIds = [];
  //       this.onFHRIDChange();
  //     }
  //   });
  // }

  onLinkedModelChange(val: any, onDone?: () => void): void {
    const selectedModels = val && Array.isArray(val) ? val : (val ? [val] : []);

    if (!selectedModels || selectedModels.length === 0) {
      this.vendorForm.patchValue({ Vendor_FKLinkedFHRId: null }, { emitEvent: false });
      this.linkedFHRIds = [];
      this.uniqueLinkedFHRIds = [];
      this.onFHRIDChange(null, onDone);
      return;
    }

    const observables = selectedModels.map((m: any) => {
      const valStr = typeof m === 'object' ? m.value : m;
      let clientId: any = null;
      let modelId: any = null;
      let clientName = 'Unknown';
      let modelDisplayName = 'Unknown';

      const linkedMod = this.linkedModels.find(lm => lm.value && lm.value.toString() === valStr.toString());

      if (linkedMod) {
        clientId = linkedMod.clientId;
        modelId = linkedMod.modelId;
        clientName = linkedMod.clientName;
        // The display name we want is just the model name, e.g. "XRM"
        modelDisplayName = linkedMod.displayName ? linkedMod.displayName.split(':').pop() : (linkedMod.name || 'Unknown');
      } else {
        const parts = valStr.toString().split('_');
        clientId = parts.length > 1 ? parts[0] : null;
        modelId = parts.length > 1 ? parts[1] : parts[0];

        if (!clientId) {
          const clientVal = this.vendorForm.get('Vendor_FKLinkedClientId')?.value;
          const firstClient = Array.isArray(clientVal) && clientVal.length > 0 ? clientVal[0] : clientVal;
          clientId = typeof firstClient === 'object' ? firstClient.value : firstClient;
        }

        const cObj = this.clients.find(c => c.value && c.value.toString() === clientId?.toString());
        clientName = cObj ? cObj.name : 'Unknown';

        let mObj = this.models.find(mod => mod.value && mod.value.toString() === modelId?.toString());
        if (!mObj) {
          mObj = this.allModels.find(mod => mod.value && mod.value.toString() === modelId?.toString());
        }
        modelDisplayName = mObj ? (mObj.displayName || mObj.name) : 'Unknown';
      }

      return this.vendorService.getLinkedFHRIDs(clientId ?? '', modelId).pipe(
        map(res => ({ res, clientId, modelId, clientName, modelDisplayName })),
        catchError(err => {
          console.error(`Error fetching FHR IDs for client ${clientId} and model ${modelId}`, err);
          return of({ res: null, clientId, modelId, clientName, modelDisplayName });
        })
      );
    });

    forkJoin(observables).subscribe(results => {
      let combinedFHRs: any[] = [];
      results.forEach((item: any) => {
        const data = Array.isArray(item.res) ? item.res : (item.res && item.res.data ? item.res.data : null);

        if (data && data.length > 0) {
          const formattedFHRs = data.map((fhr: any) => {
            const rates = [];
            const normal = this.getRateConfig(fhr, 'Normal', 'Normal');
            if (normal) rates.push(normal);
            const pickup = this.getRateConfig(fhr, 'Pickup', 'Pickup');
            if (pickup) rates.push(pickup);
            const mfn = this.getRateConfig(fhr, 'MFN', 'MFN');
            if (mfn) rates.push(mfn);
            const van = this.getRateConfig(fhr, 'Van', 'Van');
            if (van) rates.push(van);
            const u2s = this.getRateConfig(fhr, 'U2S', 'U2S');
            if (u2s) rates.push(u2s);
            const shopsy = this.getRateConfig(fhr, 'Shopsy', 'Shopsy', 'Shopsy_Deduction_Rate');
            if (shopsy) rates.push(shopsy);
            const prexo = this.getRateConfig(fhr, 'Prexo', 'Prexo');
            if (prexo) rates.push(prexo);
            const grocery = this.getRateConfig(fhr, 'Grocery', 'Grocery');
            if (grocery) rates.push(grocery);

            const vType = fhr.Large_VehicleTypeName || fhr.large_VehicleTypeName || fhr.VehicleTypeName || fhr.vehicleTypeName || '';
            const fhrName = fhr.name || fhr.Name || '';
            const fhrVal = fhr.value != null ? fhr.value.toString() : (fhr.Value != null ? fhr.Value.toString() : '');

            const displayName = `${item.clientName}:${item.modelDisplayName}:${fhrName}`;

            return {
              value: `${item.clientId}_${item.modelId}_${fhrVal}`,
              originalValue: fhrVal,
              name: displayName,
              location: fhr.locationId || fhr.LocationID || fhr.LocationId || '',
              vehicleTypeName: vType,
              effectiveFrom: fhr.effectiveFrom || fhr.EffectiveFrom || '',
              rates: rates
            };
          });

          combinedFHRs = combinedFHRs.concat(formattedFHRs);
        }
      });

      this.linkedFHRIds = combinedFHRs;

      const uniqueMap = new Map<string, any>();
      for (const fhr of this.linkedFHRIds) {
        if (!uniqueMap.has(fhr.value)) {
          uniqueMap.set(fhr.value, fhr);
        }
      }
      this.uniqueLinkedFHRIds = Array.from(uniqueMap.values());

      if (this.pendingFhrIdStr) {
        const fhrIdArray = this.pendingFhrIdStr.split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id && id.toLowerCase() !== 'null' && id.toLowerCase() !== 'undefined');

        const mappedFhrIds = fhrIdArray.map(id => {
          const match = this.uniqueLinkedFHRIds.find(u => u.originalValue === id || u.value.toString() === id);
          return match ? match.value : id;
        });

        this.vendorForm.patchValue({ Vendor_FKLinkedFHRId: mappedFhrIds }, { emitEvent: false });
        this.pendingFhrIdStr = null;
      } else {
        // Filter previously selected FHR IDs against the newly fetched valid list
        const currentFHRs = this.vendorForm.get('Vendor_FKLinkedFHRId')?.value;
        if (currentFHRs && Array.isArray(currentFHRs)) {
          const validFHRs = currentFHRs.filter((fhrId: any) =>
            this.uniqueLinkedFHRIds.some((uf: any) => uf.value.toString() === fhrId.toString())
          );

          if (validFHRs.length !== currentFHRs.length) {
            this.vendorForm.patchValue({ Vendor_FKLinkedFHRId: validFHRs }, { emitEvent: false });
          }
        }
      }
      this.onFHRIDChange(undefined, onDone);
    });
  }

  onFHRIDChange(event?: any, onDone?: () => void): void {
    setTimeout(() => {
      let selectedValues = this.vendorForm.get('Vendor_FKLinkedFHRId')?.value;
      if (!selectedValues || selectedValues.length === 0) {
        this.selectedFHRDetailsList = [];
        this.allSelectedFHRDetailsList = [];
        this.cdr.detectChanges();
        onDone?.();
        return;
      }
      if (!Array.isArray(selectedValues)) {
        selectedValues = [selectedValues];
      }

      const selectedValuesStr = selectedValues.map((v: any) => {
        return (typeof v === 'object' && v.value) ? v.value.toString() : v.toString();
      });

      let allSelected = this.linkedFHRIds.filter(f => selectedValuesStr.includes(f.value.toString()));

      // Keep only the latest effectiveFrom record for each selected FHR ID
      let latestSelected: any[] = [];
      const grouped = new Map<string, any[]>();
      for (const item of allSelected) {
        const key = item.value.toString();
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(item);
      }

      for (const [key, items] of grouped.entries()) {
        if (items.length === 1) {
          latestSelected.push(items[0]);
        } else {
          items.sort((a, b) => {
            const dateA = new Date(a.effectiveFrom).getTime();
            const dateB = new Date(b.effectiveFrom).getTime();
            return dateB - dateA;
          });
          latestSelected.push(items[0]);
        }
      }

      this.selectedFHRDetailsList = latestSelected;
      this.allSelectedFHRDetailsList = allSelected;
      this.cdr.detectChanges();
      onDone?.();
    });
  }

  getProp(obj: any, key: string): any {
    if (!obj) return null;
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === lowerKey) return obj[k];
    }
    return null;
  }

  getRateConfig(item: any, label: string, prefix: string, valKey: string = prefix + '_Rate'): any {
    const type = this.getProp(item, prefix + '_RateType');
    if (!type) return null;

    const isSlab = (type || '').toString().toLowerCase() === 'slab';
    const isFixed = (type || '').toString().toLowerCase() === 'fixed';

    let val = '';
    if (isSlab) {
      val = this.getProp(item, prefix + '_SlabExpr');
    } else {                // <--- Isko aise change karein
      val = this.getProp(item, valKey);
    }


    return {
      label: label,
      type: type,
      isFixed: isFixed,
      isSlab: isSlab,
      value: val,
      slabs: isSlab ? this.parseSlabExpr(val) : []
    };
  }

  //END

  // Load existing vendor details for editing
  loadVendor(pk_recId: string): void {
    this.loader.start();
    this.vendorService.getVendorById(pk_recId).subscribe({
      next: (response) => {
        this.loader.stop();
        if (response.isSuccess && response.data) {
          const vendor = response.data;

          const rawDOB = vendor.vendor_DOB || vendor.Vendor_DOB || vendor.dateofbirth || vendor.dateOfBirth;
          const rawRegDate = vendor.vendor_RegistrationDate || vendor.Vendor_RegistrationDate || vendor.dated || vendor.Dated;
          vendor.vendor_DOB = this.formatDateOnly(rawDOB);
          vendor.vendor_RegistrationDate = this.formatDateOnly(rawRegDate);

          this.patchForm(vendor);
          this.loadVendorFHRIDHistory(pk_recId);
          this.loadRateCardsAndHistory(pk_recId, undefined, true);
        } else {
          this.toastr.error('Vendor record not found.');
          this.goBack();
        }
      },
      error: (err) => {
        this.loader.stop();
        console.error(err);
        this.toastr.error('Error loading vendor detail.');
        this.goBack();
      }
    });
  }

  loadVendorFHRIDHistory(pk_recId: string, onDone?: () => void): void {
    
    this.vendorService.getVendorFHRIDHistory(pk_recId, this.pageIndexTab3, this.pageSizeTab3).subscribe({
      next: (res) => {
        let rawData = [];
        if (res && res.isSuccess && res.data) {
          rawData = res.data.list || [];
          this.totalCountTab3 = res.data.totalCount || 0;
        } else {
          rawData = Array.isArray(res) ? res : (res && res.data ? res.data : []);
          this.totalCountTab3 = rawData.length;
        }

        if (rawData && rawData.length > 0) {
          const mappedHistory = rawData.map((item: any) => {
            const rates = [];
            const normal = this.getRateConfig(item, 'Normal', 'Normal');
            if (normal) rates.push(normal);
            const pickup = this.getRateConfig(item, 'Pickup', 'Pickup');
            if (pickup) rates.push(pickup);
            const mfn = this.getRateConfig(item, 'MFN', 'MFN');
            if (mfn) rates.push(mfn);
            const van = this.getRateConfig(item, 'Van', 'Van');
            if (van) rates.push(van);
            const u2s = this.getRateConfig(item, 'U2S', 'U2S');
            if (u2s) rates.push(u2s);
            const shopsy = this.getRateConfig(item, 'Shopsy', 'Shopsy', 'Shopsy_Rate');
            if (shopsy) rates.push(shopsy);
            const prexo = this.getRateConfig(item, 'Prexo', 'Prexo');
            if (prexo) rates.push(prexo);
            const grocery = this.getRateConfig(item, 'Grocery', 'Grocery');
            if (grocery) rates.push(grocery);

            return {
              value: item.FHRID || item.fHRID || item.fhrid || '',
              name: item.FHRID || item.fHRID || item.fhrid || '',
              clientName: item.ClientName || item.clientName || '',
              modelName: item.ModelName || item.modelName || '',
              location: item.LocationName || item.locationName || '',
              vehicleTypeName: item.Large_VehicleTypeName || item.large_VehicleTypeName || item.VehicleTypeName || item.vehicleTypeName || '',
              effectiveFrom: item.EffectiveFrom || item.effectiveFrom || '',
              isActive: item.IsActive ?? item.isActive,
              rates: rates,
              assignBy: item.AssignBy || item.assignBy || item.CreatedBy || item.createdBy || '',
              updateBy: item.UpdateBy || item.updateBy || item.ModifiedBy || item.modifiedBy || '',
              updateDate: item.UpdateDate || item.updateDate || item.ModifiedDate || item.modifiedDate || '',
              createdDate: item.CreatedDate || item.createdDate || item.CreatedOn || item.createdOn || ''
            };
          });

          this.historicAllFHRDetailsList = mappedHistory;

          const activeInThisPage = mappedHistory.filter((x: any) => x.isActive);
          console.log("activeInThisPage", activeInThisPage);
          const grouped = new Map<string, any>();
          activeInThisPage.forEach((item: any) => {
            const key = `${item.clientName}_${item.modelName}_${item.location}_${item.name}`;
            const effDate = new Date(item.effectiveFrom || 0).getTime();
            if (!grouped.has(key)) {
              grouped.set(key, item);
            } else {
              const existing = grouped.get(key);
              const existingEffDate = new Date(existing.effectiveFrom || 0).getTime();
              if (effDate > existingEffDate) {
                grouped.set(key, item);
              }
            }
          });
          const latestActive = Array.from(grouped.values());
          console.log("latestActive", latestActive);
          if (this.pageIndexTab3 === 1) {
            this.historicActiveFHRDetailsList = latestActive;
            console.log("historicActiveFHRDetailsList", this.historicActiveFHRDetailsList);
          } else {
            // Append any active items found on other pages if they aren't already listed
            latestActive.forEach((activeItem: any) => {
              const exists = this.historicActiveFHRDetailsList.find((existing: any) => existing.name === activeItem.name && existing.location === activeItem.location);
              if (!exists) {
                this.historicActiveFHRDetailsList.push(activeItem);
              }
            });
          }

          this.cdr.detectChanges();
        } else {
          this.historicAllFHRDetailsList = [];
          if (this.pageIndexTab3 === 1) {
            this.historicActiveFHRDetailsList = [];
          }
          this.cdr.detectChanges();
        }
        onDone?.();
      },
      error: (err) => {
        console.error('Error fetching FHRID history:', err);
        onDone?.();
      }
    });
  }

  onPageChangeTab3(page: number): void {
    this.pageIndexTab3 = page;
    this.loadVendorFHRIDHistory(this.vendorId);
  }

  patchForm(vendor: any, onLinkedComplete?: () => void): void {
    const rawRateType = (vendor.vendor_RateType || vendor.Vendor_RateType || '').toString().trim();
    const matchedRateType = this.rateTypes.find(rt => rt.toLowerCase() === rawRateType.toLowerCase()) || vendor.vendor_RateType || vendor.Vendor_RateType;

    const rawVendorType = (vendor.vendor_Type || vendor.Vendor_Type || '').toString().trim();
    const matchedVendorType = this.vendorTypes.find(vt => vt.toLowerCase() === rawVendorType.toLowerCase()) || vendor.vendor_Type || vendor.Vendor_Type;

    const modelId = vendor.vendor_FK_ModelId != null ? vendor.vendor_FK_ModelId : vendor.Vendor_FK_ModelId;
    this.pendingModelId = modelId != null ? modelId.toString() : null;

    const rawAgentCode = (vendor.agentCode ?? vendor.AgentCode ?? '').toString().trim();
    const cleanAgentCode = (!rawAgentCode || rawAgentCode === '-' || rawAgentCode.toLowerCase() === 'null') ? null : rawAgentCode;
    const cleanAgentName = cleanAgentCode ? (vendor.agentName ?? vendor.AgentName ?? '') : '';

    if (cleanAgentCode) {
      const initialAgentItem = {
        code: cleanAgentCode.toUpperCase(),
        name: cleanAgentName,
        displayText: `${cleanAgentCode.toUpperCase()} ${cleanAgentName}`.trim()
      };
      this.agentVendorList$ = concat(of([initialAgentItem]), this.agentVendorList$);
    }

    this.vendorForm.patchValue({
      pk_recId: vendor.pk_recId || vendor.Pk_recId,
      Vendor_Name: vendor.vendor_Name || vendor.Vendor_Name,
      Vendor_FatherName: vendor.vendor_FatherName || vendor.Vendor_FatherName,
      Vendor_ContactNo: vendor.vendor_ContactNo || vendor.Vendor_ContactNo,
      Vendor_Gender: vendor.vendor_Gender || vendor.Vendor_Gender,
      Vendor_DOB: this.formatDateOnly(vendor.vendor_DOB || vendor.Vendor_DOB || vendor.dateofbirth),
      Vendor_Address: vendor.vendor_Address || vendor.Vendor_Address,
      Vendor_PermanentAddress: vendor.vendor_PermanentAddress || vendor.Vendor_PermanentAddress || vendor.vendor_Address || vendor.Vendor_Address,
      Vendor_FKStateId: vendor.vendor_FKStateId || vendor.Vendor_FKStateId,
      Vendor_State: vendor.vendor_State || vendor.Vendor_State,
      Vendor_FKCityId: vendor.vendor_FKCityId || vendor.Vendor_FKCityId,
      Vendor_City: vendor.vendor_City || vendor.Vendor_City,
      Vendor_FKPermStateId: vendor.vendor_FKPermStateId || vendor.Vendor_FKPermStateId || vendor.vendor_FKStateId || vendor.Vendor_FKStateId,
      Vendor_PermState: vendor.vendor_PermState || vendor.Vendor_PermState || vendor.vendor_State || vendor.Vendor_State,
      Vendor_FKPermCityId: vendor.vendor_FKPermCityId || vendor.Vendor_FKPermCityId || vendor.vendor_FKCityId || vendor.Vendor_FKCityId,
      Vendor_PermCity: vendor.vendor_PermCity || vendor.Vendor_PermCity || vendor.vendor_City || vendor.Vendor_City,
      Vendor_FKBankId: vendor.vendor_FKBankId || vendor.Vendor_FKBankId,
      Vendor_BankName: vendor.vendor_BankName || vendor.Vendor_BankName,
      Vendor_AccountNo: vendor.vendor_AccountNo || vendor.Vendor_AccountNo,
      Vendor_IFSCCode: vendor.vendor_IFSCCode || vendor.Vendor_IFSCCode,
      Vendor_PanNo: vendor.vendor_PanNo || vendor.Vendor_PanNo,
      Vendor_GSTNo: vendor.vendor_GSTNo || vendor.Vendor_GSTNo,
      Vendor_AaddharNo: vendor.vendor_AaddharNo || vendor.Vendor_AaddharNo,
      Vendor_Code: vendor.vendor_Code || vendor.Vendor_Code,
      Vendor_Status: vendor.vendor_Status || vendor.Vendor_Status,
      Vendor_RegistrationDate: this.formatDateOnly(vendor.vendor_RegistrationDate || vendor.Vendor_RegistrationDate || vendor.dated),
      Vendor_FKClientId: null,
      Vendor_RateType: null,
      Vendor_Type: null,
      Vendor_FK_ModelId: null,
      Vendor_HFRID: '',
      Vendor_CategoryID: null,
      Vendor_Rate: null,
      Vendor_RateDeduction: null,
      Vendor_DeliveryRate: null,
      Vendor_PickupRate: null,
      Vendor_TDSPercentage: vendor.vendor_TDSPercentage ?? vendor.Vendor_TDSPercentage ?? vendor.vendor_TdsPercentage ?? vendor.Vendor_TdsPercentage ?? null,
      Vendor_IsGSTApplicable: vendor.vendor_IsGSTApplicable ?? vendor.Vendor_IsGSTApplicable ?? (!!vendor.vendor_GSTRate || !!vendor.Vendor_GSTRate || !!vendor.vendor_GstPercentage || !!vendor.Vendor_GstPercentage),
      Vendor_GSTRate: vendor.vendor_GSTRate || vendor.Vendor_GSTRate || vendor.vendor_GstPercentage || vendor.Vendor_GstPercentage || null,
      Vendor_IsTDSApplicable: vendor.vendor_IsTDSApplicable ?? vendor.Vendor_IsTDSApplicable ?? (!!vendor.vendor_TDSPercentage || !!vendor.Vendor_TDSPercentage || !!vendor.vendor_TdsPercentage || !!vendor.Vendor_TdsPercentage),
      Vendor_TaxTDSRate: vendor.vendor_TaxTDSRate || vendor.Vendor_TaxTDSRate || vendor.vendor_TDSPercentage || vendor.Vendor_TDSPercentage || vendor.vendor_TdsPercentage || vendor.Vendor_TdsPercentage || null,
      IsVendor: vendor.isVendor ?? true,
      AgentCode: cleanAgentCode,
      AgentName: cleanAgentName,
      LegalName: vendor.legalName ?? vendor.LegalName ?? '',
      EmergencyContactNo: vendor.emergencyContactNo ?? vendor.EmergencyContactNo ?? '',
      EmailID: vendor.emailID ?? vendor.EmailID ?? '',
      EShramCardNo: vendor.eShramCardNo ?? vendor.EShramCardNo ?? '',
      AyushmanCard: vendor.ayushmanCard ?? vendor.AyushmanCard ?? false,
      AyushmanCardNo: vendor.ayushmanCardNo ?? vendor.AyushmanCardNo ?? '',
      AccountHolderName: vendor.accountHolderName ?? vendor.AccountHolderName ?? '',
      PermanentPinCode: vendor.permanentPinCode ?? vendor.PermanentPinCode ?? '',
      CurrentPinCode: vendor.currentPinCode ?? vendor.CurrentPinCode ?? ''
    }, { emitEvent: false });

    // Initialize the GST validation state based on patched values
    this.onGSTToggle(this.vendorForm.get('Vendor_IsGSTApplicable')?.value);

    // Patch Linked FHRID section if values exist
    const linkedClientId = vendor.vendor_FKClientId ?? vendor.Vendor_FKClientId;
    const linkedModelId = vendor.vendor_FK_ModelId ?? vendor.Vendor_FK_ModelId;
    const linkedFhrIdStr = vendor.vendor_HFRID ?? vendor.Vendor_HFRID;

    let patchRetries = 0;
    const patchLinkedDropdowns = () => {
      if (patchRetries < 20 && ((linkedClientId && (!this.clients || this.clients.length === 0)) || (linkedModelId && (!this.allModels || this.allModels.length === 0)))) {
        patchRetries++;
        setTimeout(patchLinkedDropdowns, 200);
        return;
      }

      if (linkedClientId) {
        const clientArray = linkedClientId.toString().split(',').map((id: string) => id.trim());
        this.vendorForm.patchValue({ Vendor_FKLinkedClientId: clientArray }, { emitEvent: false });
        this.onLinkedClientChange(clientArray); // Load models
      } else {
        this.vendorForm.patchValue({ Vendor_FKLinkedClientId: null }, { emitEvent: false });
        this.onLinkedClientChange(null);
      }

      if (linkedModelId) {
        this.pendingFhrIdStr = linkedFhrIdStr || null;
        setTimeout(() => {
          const modelArray = linkedModelId.toString().split(',').map((id: string) => id.trim());
          this.vendorForm.patchValue({ Vendor_FKLinkedModelId: modelArray }, { emitEvent: false });
          this.onLinkedModelChange(modelArray, onLinkedComplete);
        }, 500);
      } else {
        this.vendorForm.patchValue({ Vendor_FKLinkedModelId: null }, { emitEvent: false });
        this.onLinkedModelChange(null, onLinkedComplete);
      }
    };

    patchLinkedDropdowns();

    const stateId = vendor.vendor_FKStateId || vendor.Vendor_FKStateId;
    const initialPermState = vendor.vendor_FKPermStateId || vendor.Vendor_FKPermStateId;

    if (stateId) {
      this.vendorService.getCitiesByState(stateId).subscribe(res => {
        if (res.isSuccess) {
          this.cities = (res.data || []).filter((c: any) => c.value !== null && c.value !== '');
          this.updateFieldOptions('Vendor_FKCityId', this.cities);

          if (this.vendorForm.get('sameAsCurrentAddress')?.value || initialPermState == stateId || !initialPermState) {
            this.permCities = [...this.cities];
            this.updateFieldOptions('Vendor_FKPermCityId', this.permCities);
          }
        }
      });
    }

    const permState = vendor.vendor_FKPermStateId || vendor.Vendor_FKPermStateId || stateId;
    if (permState && permState !== stateId) {
      this.vendorService.getCitiesByState(permState).subscribe(res => {
        if (res.isSuccess) {
          this.permCities = (res.data || []).filter((c: any) => c.value !== null && c.value !== '');
          this.updateFieldOptions('Vendor_FKPermCityId', this.permCities);
        }
      });
    }

    const vAddr = (vendor.vendor_Address || vendor.Vendor_Address || '').toString().trim();
    const vPermAddr = (vendor.vendor_PermanentAddress || vendor.Vendor_PermanentAddress || '').toString().trim();
    const vStateId = (stateId != null ? stateId : '').toString().trim();
    const vPermStateId = ((vendor.vendor_FKPermStateId != null ? vendor.vendor_FKPermStateId : vendor.Vendor_FKPermStateId) ?? vStateId).toString().trim();
    const vCityId = ((vendor.vendor_FKCityId != null ? vendor.vendor_FKCityId : vendor.Vendor_FKCityId) ?? '').toString().trim();
    const vPermCityId = ((vendor.vendor_FKPermCityId != null ? vendor.vendor_FKPermCityId : vendor.Vendor_FKPermCityId) ?? vCityId).toString().trim();

    const isSameAddr = vendor.sameAsCurrentAddress ?? vendor.SameAsCurrentAddress ?? (
      vAddr !== '' &&
      (!vPermAddr || vPermAddr.toLowerCase() === vAddr.toLowerCase()) &&
      (!vPermStateId || vStateId === vPermStateId) &&
      (!vPermCityId || vCityId === vPermCityId)
    );

    if (isSameAddr) {
      this.vendorForm.patchValue({
        sameAsCurrentAddress: true,
        Vendor_PermanentAddress: vAddr,
        Vendor_FKPermStateId: vStateId,
        Vendor_FKPermCityId: vCityId
      });
      this.onSameAddressToggle(true);
    } else {
      this.vendorForm.patchValue({ sameAsCurrentAddress: false });
    }

    this.rateCardsList = [];
    this.updateVerificationStatus();
    this.loadAuditLogs(vendor.pk_recId);
  }

  // Rate Card List Grid Actions
  addRateCardToGrid(): boolean {
    this.rateCardSubmitted = true;
    const clientId = this.vendorForm.get('Vendor_FKClientId')?.value;
    const modelId = this.vendorForm.get('Vendor_FK_ModelId')?.value;

    const selectedClient = clientId ? this.clients.find(c => c.value && c.value.toString() === clientId.toString()) : null;
    const clientName = selectedClient ? selectedClient.name : (clientId ? 'Client #' + clientId : 'N/A');

    const selectedModel = modelId ? (this.models.find(m => m.value && m.value.toString() === modelId.toString()) ||
      this.allModels.find(m => m.value && m.value.toString() === modelId.toString())) : null;
    const modelName = selectedModel ? (selectedModel.displayName || selectedModel.name) : (modelId ? 'Model #' + modelId : 'N/A');

    const categoryId = this.vendorForm.get('Vendor_CategoryID')?.value;
    const selectedCat = this.categories.find(c => c.value === categoryId);
    const categoryName = selectedCat ? selectedCat.name : (categoryId ? 'Category #' + categoryId : '-');

    const modelType = modelName.toUpperCase();
    const isOdh = modelType.includes('ODH');
    const isXrm = modelType.includes('XRM');
    const isLarge = modelType.includes('LARGE');
    const isDsp = modelType.includes('DSP') || modelType.includes('EDSP') || modelType.includes('ESDP');
    const isFse = modelType.includes('FSE');
    const isLmd = modelType.includes('LMD');
    const isB2c = modelType.includes('B2C');

    // Validate common rate card fields
    const rateType = this.vendorForm.get('Vendor_RateType')?.value;
    const vendorType = this.vendorForm.get('Vendor_Type')?.value;
    const hfrid = this.vendorForm.get('Vendor_HFRID')?.value;
    const effFromVal = this.vendorForm.get('EffectiveFrom')?.value;

    if (!rateType || !vendorType || !effFromVal) {
      this.toastr.warning('Please fill Rate Type, Vendor Type, and Effective From date before adding rate card.');
      return false;
    }

    // Model specific field validations
    if (isOdh && (!categoryId || this.vendorForm.get('Vendor_Rate')?.value == null || this.vendorForm.get('Vendor_RateDeduction')?.value == null)) {
      this.toastr.warning('Category, Rate, and Rate Deduction are required for ODH model.');
      return false;
    }

    if (isXrm && (this.vendorForm.get('Vendor_DeliveryRate')?.value == null || this.vendorForm.get('Vendor_PickupRate')?.value == null)) {
      this.toastr.warning('Delivery Rate and Pickup Rate are required for XRM model.');
      return false;
    }

    if (isLarge && this.vendorForm.get('Vendor_PickupRate')?.value == null) {
      this.toastr.warning('Pickup Rate is required for Large model.');
      return false;
    }

    if (isDsp && (this.vendorForm.get('Vendor_DeliveryRate')?.value == null || this.vendorForm.get('Vendor_PickupRate')?.value == null || this.vendorForm.get('Vendor_MFNRate')?.value == null || this.vendorForm.get('Vendor_TDSPercentage')?.value == null)) {
      this.toastr.warning('Delivery Rate, Pickup Rate, MFN Rate, and TDS % are required for DSP model.');
      return false;
    }

    if (isFse && (this.vendorForm.get('Vendor_PickupRate')?.value == null || this.vendorForm.get('Vendor_TDSPercentage')?.value == null)) {
      this.toastr.warning('Pickup Rate and TDS % are required for FSE model.');
      return false;
    }

    const clientNameUpper = clientName.toUpperCase();
    if (isLmd && clientNameUpper.includes('BLUEDART') && (this.vendorForm.get('Vendor_DeliveryRate')?.value == null || this.vendorForm.get('Vendor_TDSPercentage')?.value == null)) {
      this.toastr.warning('Delivery Rate and TDS % are required for Bluedart LMD model.');
      return false;
    }

    if (isLmd && !clientNameUpper.includes('BLUEDART') && (this.vendorForm.get('Vendor_DeliveryRate')?.value == null || this.vendorForm.get('Vendor_PickupRate')?.value == null || this.vendorForm.get('Vendor_TDSPercentage')?.value == null)) {
      this.toastr.warning('Delivery Rate, Pickup Rate, and TDS % are required for LMD model.');
      return false;
    }

    if (isB2c && (this.vendorForm.get('Vendor_DeliveryRate')?.value == null || this.vendorForm.get('Vendor_TDSPercentage')?.value == null)) {
      this.toastr.warning('Delivery Rate and TDS % are required for B2C Delivery model.');
      return false;
    }

    const effFrom = this.vendorForm.get('EffectiveFrom')?.value ? this.formatDateOnly(this.vendorForm.get('EffectiveFrom')?.value) : this.formatDateOnly(new Date());

    const rateCardItem = {
      fk_cost_centre_id: Number(clientId),
      Vendor_FKClientId: clientId.toString(),
      fk_modelId: modelId.toString(),
      Vendor_FK_ModelId: modelId.toString(),
      Vendor_HFRID: this.vendorForm.get('Vendor_HFRID')?.value || '',
      Vendor_RateType: this.vendorForm.get('Vendor_RateType')?.value || '',
      rateTypeName: this.getRateTypeDisplayName(this.vendorForm.get('Vendor_RateType')?.value),
      Vendor_Type: this.vendorForm.get('Vendor_Type')?.value || '',
      Vendor_CategoryID: isOdh && categoryId ? Number(categoryId) : 0,
      Vendor_Rate: isOdh ? this.parseNumberOrNull(this.vendorForm.get('Vendor_Rate')?.value) : null,
      Vendor_RateDeduction: isOdh ? this.parseNumberOrNull(this.vendorForm.get('Vendor_RateDeduction')?.value) : null,
      Vendor_DeliveryRate: (isXrm || isDsp || isLmd || isB2c) ? this.parseNumberOrNull(this.vendorForm.get('Vendor_DeliveryRate')?.value) : null,
      Vendor_PickupRate: (isXrm || isLarge || isDsp || isFse || isLmd) ? this.parseNumberOrNull(this.vendorForm.get('Vendor_PickupRate')?.value) : null,
      Vendor_TDSPercentage: (isDsp || isFse || isLmd || isB2c) ? this.parseNumberOrNull(this.vendorForm.get('Vendor_TDSPercentage')?.value) : null,
      Vendor_MFNRate: isDsp ? this.parseNumberOrNull(this.vendorForm.get('Vendor_MFNRate')?.value) : null,
      EffectiveFrom: effFrom,
      clientName: clientName,
      modelName: modelName,
      categoryName: isOdh ? categoryName : '-'
    };

    if (this.editingRateCardIndex !== null && this.editingRateCardIndex >= 0 && this.editingRateCardIndex < this.rateCardsList.length) {
      this.rateCardsList[this.editingRateCardIndex] = rateCardItem;
      this.toastr.success(`Updated rate card for ${clientName} (${modelName}) in table list.`);
      this.editingRateCardIndex = null;
    } else {
      const existingIdx = this.rateCardsList.findIndex(rc =>
        rc.Vendor_FKClientId?.toString() === clientId.toString() &&
        rc.Vendor_FK_ModelId?.toString() === modelId.toString() &&
        (rc.Vendor_CategoryID || 0) === (rateCardItem.Vendor_CategoryID || 0)
      );

      if (existingIdx !== -1) {
        this.rateCardsList[existingIdx] = rateCardItem;
        this.toastr.info(`Updated rate card for ${clientName} (${modelName}) in table list.`);
      } else {
        this.rateCardsList.push(rateCardItem);
        this.toastr.success(`Added rate card for ${clientName} (${modelName}) to table list.`);
      }
    }

    const today = this.formatDateOnly(new Date());
    this.vendorForm.patchValue({
      Vendor_FKClientId: null,
      Vendor_RateType: null,
      Vendor_Type: null,
      Vendor_FK_ModelId: null,
      Vendor_HFRID: '',
      EffectiveFrom: today,
      Vendor_CategoryID: null,
      Vendor_Rate: null,
      Vendor_RateDeduction: null,
      Vendor_DeliveryRate: null,
      Vendor_PickupRate: null,
      Vendor_MFNRate: null,
      Vendor_TDSPercentage: null
    }, { emitEvent: false });
    this.models = [];
    this.updateFieldOptions('Vendor_FK_ModelId', []);
    this.rateCardSubmitted = false;
    return true;
  }

  removeRateCardFromGrid(index: number): void {
    if (index >= 0 && index < this.rateCardsList.length) {
      if (this.editingRateCardIndex === index) {
        this.cancelRateCardEdit();
      } else if (this.editingRateCardIndex !== null && this.editingRateCardIndex > index) {
        this.editingRateCardIndex--;
      }
      const removed = this.rateCardsList.splice(index, 1)[0];
      this.toastr.info(`Removed rate card for ${removed.clientName || 'Client'} from table list.`);
    }
  }

  editRateCardFromGrid(index: number): void {
    if (index >= 0 && index < this.rateCardsList.length) {
      this.editingRateCardIndex = index;
      const item = this.rateCardsList[index];
      const today = this.formatDateOnly(new Date());
      this.vendorForm.patchValue({
        Vendor_FKClientId: item.Vendor_FKClientId || item.fk_cost_centre_id?.toString(),
        Vendor_RateType: item.Vendor_RateType,
        Vendor_Type: item.Vendor_Type,
        Vendor_HFRID: item.Vendor_HFRID,
        EffectiveFrom: item.EffectiveFrom || item.effectiveFrom ? this.formatDateOnly(item.EffectiveFrom || item.effectiveFrom) : today,
        Vendor_CategoryID: item.Vendor_CategoryID,
        Vendor_Rate: item.Vendor_Rate,
        Vendor_RateDeduction: item.Vendor_RateDeduction,
        Vendor_DeliveryRate: item.Vendor_DeliveryRate,
        Vendor_PickupRate: item.Vendor_PickupRate,
        Vendor_MFNRate: item.Vendor_MFNRate,
        Vendor_TDSPercentage: item.Vendor_TDSPercentage
      });

      if (item.Vendor_FKClientId) {
        this.filterModelsByClient(item.Vendor_FKClientId);
        const modelId = item.Vendor_FK_ModelId || item.fk_modelId;
        this.vendorForm.patchValue({ Vendor_FK_ModelId: modelId });
        this.adjustDynamicValidators(modelId);
      }

      this.toastr.info('Loaded rate card details for editing. Click "Save Rate Card Changes" when done.');
    }
  }

  cancelRateCardEdit(): void {
    this.editingRateCardIndex = null;
    this.rateCardSubmitted = false;
    const today = this.formatDateOnly(new Date());
    this.vendorForm.patchValue({
      Vendor_FKClientId: null,
      Vendor_RateType: null,
      Vendor_Type: null,
      Vendor_FK_ModelId: null,
      Vendor_HFRID: '',
      EffectiveFrom: today,
      Vendor_CategoryID: null,
      Vendor_Rate: null,
      Vendor_RateDeduction: null,
      Vendor_DeliveryRate: null,
      Vendor_PickupRate: null,
      Vendor_MFNRate: null,
      Vendor_TDSPercentage: null
    }, { emitEvent: false });
    this.models = [];
    this.updateFieldOptions('Vendor_FK_ModelId', []);
    this.toastr.info('Cancelled rate card editing.');
  }

  isTab2Loading: boolean = false;

  // Tab Navigation Handling
  switchTab(tabIndex: number): void {
    const currentRecId = this.vendorId || this.vendorForm.get('pk_recId')?.value;
    if ((tabIndex === 2 || tabIndex === 3) && !currentRecId) {
      this.toastr.warning('Please save Vendor Details (Tab 1) first before configuring Rate Cards.');
      return;
    }
    this.activeTab = tabIndex;
    this.submitted = false;
    this.rateCardSubmitted = false;

    // Fast & Instant tab switch without blocking screen spinner
    if ((tabIndex === 2 || tabIndex === 3) && currentRecId) {
      if (this.historicAllFHRDetailsList.length === 0) {
        this.loadVendorFHRIDHistory(currentRecId.toString());
      }
      if (this.rateCardsList.length === 0) {
        this.loadRateCardsAndHistory(currentRecId.toString(), undefined, true);
      }
    }
  }

  loadRateCardsAndHistory(vendorId: string, onDone?: () => void, skipLoader: boolean = true): void {
    if (!vendorId) {
      onDone?.();
      return;
    }
    this.isTab2Loading = true;
    this.isHistoryLoading = true;
    if (!skipLoader) this.loader.start();
    this.vendorService.getVendorRateCards(vendorId).subscribe({
      next: (res) => {
        this.isTab2Loading = false;
        this.isHistoryLoading = false;
        if (!skipLoader) this.loader.stop();
        if (res && res.isSuccess) {
          const rawCards = res.data || [];

          // 1. Populate Tab 3 (All Rate Cards - Active & Inactive)
          this.rateCardHistoryList = rawCards.map((item: any) => {
            let hfrId = item.vendor_HFRID ?? item.Vendor_HFRID ?? null;
            if (typeof hfrId === 'string' && hfrId.split('_').length >= 3) {
              hfrId = hfrId.split('_').slice(2).join('_');
            }
            let mName = item.modelName || item.ModelName || '';
            if (typeof mName === 'string' && mName.includes(':')) {
              mName = mName.split(':')[1];
            }
            return {
              ...item,
              modelName: mName,
              Vendor_RateType: item.vendor_RateType ?? item.Vendor_RateType ?? null,
              rateTypeName: item.rateTypeName || item.RateTypeName || this.getRateTypeDisplayName(item.vendor_RateType ?? item.Vendor_RateType),
              Vendor_Type: item.vendor_Type ?? item.Vendor_Type ?? null,
              Vendor_HFRID: hfrId,
              Vendor_Rate: this.parseNumberOrNull(item.vendor_Rate ?? item.Vendor_Rate),
              Vendor_RateDeduction: this.parseNumberOrNull(item.vendor_RateDeduction ?? item.Vendor_RateDeduction),
              Vendor_DeliveryRate: this.parseNumberOrNull(item.vendor_DeliveryRate ?? item.Vendor_DeliveryRate),
              Vendor_PickupRate: this.parseNumberOrNull(item.vendor_PickupRate ?? item.Vendor_PickupRate),
              Vendor_MFNRate: this.parseNumberOrNull(item.vendor_MFNRate ?? item.Vendor_MFNRate),
              Vendor_TDSPercentage: this.parseNumberOrNull(item.vendor_TDSPercentage ?? item.Vendor_TDSPercentage),
              EffectiveFrom: (item.effectiveFrom || item.EffectiveFrom) ? this.formatDateOnly(item.effectiveFrom || item.EffectiveFrom) : '-',
              EffectiveTo: (item.effectiveTo || item.EffectiveTo) ? this.formatDateOnly(item.effectiveTo || item.EffectiveTo) : (item.isActive || item.IsActive ? 'Current Active' : '-'),
              AuditAction: item.auditAction || item.AuditAction || 'INSERT',
              AuditDate: item.auditDate || item.AuditDate || item.uploadTimestamp || item.UploadTimestamp || item.dated
            };
          });

          // 2. Populate Tab 2 (Only Active with Latest Effective Date)
          const activeCards = rawCards.filter((c: any) => c.isActive === true || c.IsActive === true || c.isactive === true);

          const grouped = new Map<string, any>();
          activeCards.forEach((rc: any) => {
            const clientId = rc.vendor_FKClientId ?? rc.Vendor_FKClientId ?? rc.fk_cost_centre_id ?? '';
            const modelId = rc.vendor_FK_ModelId ?? rc.Vendor_FK_ModelId ?? rc.fk_modelId ?? '';
            const catId = rc.vendor_CategoryID ?? rc.Vendor_CategoryID ?? 0;
            const key = `${clientId}_${modelId}_${catId}`;

            const rcEffDate = new Date(rc.effectiveFrom || rc.EffectiveFrom || 0).getTime();

            if (!grouped.has(key)) {
              grouped.set(key, rc);
            } else {
              const existing = grouped.get(key);
              const existingEffDate = new Date(existing.effectiveFrom || existing.EffectiveFrom || 0).getTime();
              if (rcEffDate > existingEffDate) {
                grouped.set(key, rc);
              }
            }
          });

          const latestActiveCards = Array.from(grouped.values());

          this.rateCardsList = latestActiveCards.map((rc: any) => {
            const clientId = rc.vendor_FKClientId ?? rc.Vendor_FKClientId ?? rc.fk_cost_centre_id;
            const selectedClient = this.clients.find(c => c.value && c.value.toString() === (clientId ? clientId.toString() : ''));
            const clientName = rc.clientName || rc.ClientName || (selectedClient ? selectedClient.name : 'Client #' + clientId);

            const modelId = rc.vendor_FK_ModelId ?? rc.Vendor_FK_ModelId ?? rc.fk_modelId;
            const selectedModel = this.allModels.find(m => m.value && m.value.toString() === (modelId ? modelId.toString() : ''));
            let modelName = rc.modelName || rc.ModelName || (selectedModel ? (selectedModel.displayName || selectedModel.name) : 'Model #' + modelId);
            if (typeof modelName === 'string' && modelName.includes(':')) {
              modelName = modelName.split(':')[1];
            }

            const catId = rc.vendor_CategoryID ?? rc.Vendor_CategoryID;
            const selectedCat = this.categories.find(c => c.value === catId);
            const categoryName = rc.categoryName || rc.CategoryName || (selectedCat ? selectedCat.name : (catId ? 'Category #' + catId : '-'));

            let hfrId = rc.vendor_HFRID ?? rc.Vendor_HFRID ?? '';
            if (typeof hfrId === 'string' && hfrId.split('_').length >= 3) {
              hfrId = hfrId.split('_').slice(2).join('_');
            }
            const rateType = rc.vendor_RateType ?? rc.Vendor_RateType ?? '';
            const vType = rc.vendor_Type ?? rc.Vendor_Type ?? '';
            const rate = rc.vendor_Rate ?? rc.Vendor_Rate ?? null;
            const rateDed = rc.vendor_RateDeduction ?? rc.Vendor_RateDeduction ?? null;
            const delRate = rc.vendor_DeliveryRate ?? rc.Vendor_DeliveryRate ?? null;
            const picRate = rc.vendor_PickupRate ?? rc.Vendor_PickupRate ?? null;
            const tds = rc.vendor_TDSPercentage ?? rc.Vendor_TDSPercentage ?? null;
            const mfn = rc.vendor_MFNRate ?? rc.Vendor_MFNRate ?? null;

            const mType = modelName.toUpperCase();
            const isO = mType.includes('ODH');
            const isX = mType.includes('XRM');
            const isL = mType.includes('LARGE');
            const isD = mType.includes('DSP') || mType.includes('EDSP') || mType.includes('ESDP');
            const isF = mType.includes('FSE');
            const isLm = mType.includes('LMD');
            const isB = mType.includes('B2C');

            const effFrom = (rc.effectiveFrom || rc.EffectiveFrom) ? this.formatDateOnly(rc.effectiveFrom || rc.EffectiveFrom) : this.formatDateOnly(new Date());

            return {
              ...rc,
              Vendor_HFRID: hfrId,
              Vendor_RateType: rateType,
              rateTypeName: rc.rateTypeName || rc.RateTypeName || this.getRateTypeDisplayName(rateType),
              Vendor_Type: vType,
              Vendor_CategoryID: isO && catId ? Number(catId) : 0,
              Vendor_Rate: isO ? this.parseNumberOrNull(rate) : null,
              Vendor_RateDeduction: isO ? this.parseNumberOrNull(rateDed) : null,
              Vendor_DeliveryRate: (isX || isD || isLm || isB) ? this.parseNumberOrNull(delRate) : null,
              Vendor_PickupRate: (isX || isL || isD || isF || isLm) ? this.parseNumberOrNull(picRate) : null,
              Vendor_TDSPercentage: (isD || isF || isLm || isB) ? this.parseNumberOrNull(tds) : null,
              Vendor_MFNRate: isD ? this.parseNumberOrNull(mfn) : null,
              Vendor_FKClientId: clientId != null ? clientId.toString() : null,
              Vendor_FK_ModelId: modelId != null ? modelId.toString() : null,
              EffectiveFrom: effFrom,
              clientName: clientName,
              modelName: modelName,
              categoryName: isO ? categoryName : '-'
            };
          });
          this.rateCardsList = [...this.rateCardsList];
        }
        onDone?.();
      },
      error: (err) => {
        this.isTab2Loading = false;
        this.isHistoryLoading = false;
        if (!skipLoader) this.loader.stop();
        console.error(err);
        this.toastr.error('Error fetching rate cards.');
        onDone?.();
      }
    });
  }

  // Tab 3 Inline Rate Card Editor State & Handling
  isHistoryEditorOpen = false;
  isSavingHistoryUpdate = false;
  historyEditingItem: any = null;
  historyForm: any = {
    Vendor_FKClientId: null,
    Vendor_FK_ModelId: null,
    Vendor_RateType: null,
    Vendor_Type: null,
    Vendor_CategoryID: null,
    Vendor_HFRID: '',
    EffectiveFrom: '',
    Vendor_Rate: null,
    Vendor_RateDeduction: null,
    Vendor_DeliveryRate: null,
    Vendor_PickupRate: null,
    Vendor_TDSPercentage: null,
    Vendor_MFNRate: null
  };

  updateHistoryRateCard(item: any): void {
    this.historyEditingItem = item;
    this.isHistoryEditorOpen = true;

    const clientId = item.vendor_FKClientId ?? item.Vendor_FKClientId ?? item.fk_cost_centre_id;
    const modelId = item.vendor_FK_ModelId ?? item.Vendor_FK_ModelId ?? item.fk_modelId;

    let effDate = item.effectiveFrom || item.EffectiveFrom || new Date().toISOString().substring(0, 10);
    if (effDate && effDate !== '-') {
      if (effDate.includes('T')) {
        effDate = effDate.substring(0, 10);
      } else if (effDate.includes('/') || effDate.includes('-')) {
        const d = new Date(effDate);
        if (!isNaN(d.getTime())) {
          effDate = d.toISOString().substring(0, 10);
        }
      }
    } else {
      effDate = new Date().toISOString().substring(0, 10);
    }

    this.historyForm = {
      Vendor_FKClientId: clientId ? clientId.toString() : null,
      Vendor_FK_ModelId: modelId ? modelId.toString() : null,
      Vendor_RateType: item.Vendor_RateType || item.vendor_RateType || '',
      Vendor_Type: item.Vendor_Type || item.vendor_Type || '',
      Vendor_CategoryID: item.Vendor_CategoryID || item.vendor_CategoryID || null,
      Vendor_HFRID: item.Vendor_HFRID || item.vendor_HFRID || '',
      EffectiveFrom: effDate,
      Vendor_Rate: this.parseNumberOrNull(item.Vendor_Rate ?? item.vendor_Rate),
      Vendor_RateDeduction: this.parseNumberOrNull(item.Vendor_RateDeduction ?? item.vendor_RateDeduction),
      Vendor_DeliveryRate: this.parseNumberOrNull(item.Vendor_DeliveryRate ?? item.vendor_DeliveryRate),
      Vendor_PickupRate: this.parseNumberOrNull(item.Vendor_PickupRate ?? item.vendor_PickupRate),
      Vendor_TDSPercentage: this.parseNumberOrNull(item.Vendor_TDSPercentage ?? item.vendor_TDSPercentage),
      Vendor_MFNRate: this.parseNumberOrNull(item.Vendor_MFNRate ?? item.vendor_MFNRate)
    };

    window.scrollTo({ top: 180, behavior: 'smooth' });
  }

  closeHistoryEditor(): void {
    this.isHistoryEditorOpen = false;
    this.historyEditingItem = null;
  }

  isHistoryModelType(keyword: string): boolean {
    if (!this.historyEditingItem) return false;
    const modelName = (this.historyEditingItem.modelName || '').toUpperCase();
    return modelName.includes(keyword.toUpperCase());
  }

  showHistoryField(field: string): boolean {
    if (!this.historyEditingItem) return false;
    const mName = (this.historyEditingItem.modelName || '').toUpperCase();
    if (field === 'DeliveryRate') return mName.includes('XRM') || mName.includes('DSP') || mName.includes('LMD') || mName.includes('B2C');
    if (field === 'PickupRate') return mName.includes('XRM') || mName.includes('LARGE') || mName.includes('DSP') || mName.includes('FSE') || mName.includes('LMD');
    if (field === 'Rate' || field === 'RateDeduction') return mName.includes('ODH');
    if (field === 'TDSPercentage') return mName.includes('DSP') || mName.includes('FSE') || mName.includes('LMD') || mName.includes('B2C');
    if (field === 'MFNRate') return mName.includes('DSP');
    return false;
  }

  saveHistoryRateCardUpdate(): void {
    const currentRecId = this.vendorId || this.vendorForm.get('pk_recId')?.value;
    if (!currentRecId) return;

    this.isSavingHistoryUpdate = true;

    const clientIdStr = (this.historyForm.Vendor_FKClientId ?? '').toString();
    const modelIdStr = (this.historyForm.Vendor_FK_ModelId ?? '').toString();

    const selectedClient = this.clients.find(c => c.value && c.value.toString() === clientIdStr);
    const selectedModel = this.allModels.find(m => m.value && m.value.toString() === modelIdStr);
    const selectedCat = this.categories.find(c => c.value === Number(this.historyForm.Vendor_CategoryID));

    const updatedCard = {
      fk_cost_centre_id: Number(clientIdStr),
      Vendor_FKClientId: clientIdStr,
      fk_modelId: modelIdStr,
      Vendor_FK_ModelId: modelIdStr,
      Vendor_HFRID: this.historyForm.Vendor_HFRID || '',
      Vendor_RateType: this.historyForm.Vendor_RateType || '',
      Vendor_Type: this.historyForm.Vendor_Type || '',
      Vendor_CategoryID: this.historyForm.Vendor_CategoryID ? Number(this.historyForm.Vendor_CategoryID) : 0,
      Vendor_Rate: this.parseNumberOrNull(this.historyForm.Vendor_Rate),
      Vendor_RateDeduction: this.parseNumberOrNull(this.historyForm.Vendor_RateDeduction),
      Vendor_DeliveryRate: this.parseNumberOrNull(this.historyForm.Vendor_DeliveryRate),
      Vendor_PickupRate: this.parseNumberOrNull(this.historyForm.Vendor_PickupRate),
      Vendor_TDSPercentage: this.parseNumberOrNull(this.historyForm.Vendor_TDSPercentage),
      Vendor_MFNRate: this.parseNumberOrNull(this.historyForm.Vendor_MFNRate),
      EffectiveFrom: this.historyForm.EffectiveFrom,
      clientName: selectedClient ? selectedClient.name : 'Client #' + clientIdStr,
      modelName: selectedModel ? (selectedModel.displayName || selectedModel.name) : 'Model #' + modelIdStr,
      categoryName: selectedCat ? selectedCat.name : (this.historyForm.Vendor_CategoryID ? 'Category #' + this.historyForm.Vendor_CategoryID : '-')
    };

    // Update rateCardsList in frontend memory (Tab 2 Rate Card Details list)
    const updatedList = [...this.rateCardsList];
    const existingIdx = updatedList.findIndex(rc => {
      const rClientId = (rc.Vendor_FKClientId ?? rc.fk_cost_centre_id ?? '').toString();
      const rModelId = (rc.Vendor_FK_ModelId ?? rc.fk_modelId ?? '').toString();
      return rClientId === clientIdStr && rModelId === modelIdStr;
    });

    if (existingIdx >= 0) {
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...updatedCard };
    } else {
      updatedList.push(updatedCard);
    }

    this.rateCardsList = updatedList;

    const payload = {
      ...this.vendorForm.getRawValue(),
      pk_recId: currentRecId,
      RateCards: this.rateCardsList
    };

    this.vendorService.updateVendor(payload).subscribe({
      next: (res) => {
        this.isSavingHistoryUpdate = false;
        if (res && res.isSuccess) {
          this.toastr.success('Rate card updated successfully!');
          this.closeHistoryEditor();
          this.loadRateCardsAndHistory(currentRecId.toString());
          this.loadVendor(currentRecId.toString());
        } else {
          this.toastr.error(res?.message || 'Failed to update rate card.');
        }
      },
      error: () => {
        this.isSavingHistoryUpdate = false;
        this.toastr.error('Error updating rate card.');
      }
    });
  }

  // Helper to map API data to Excel format
  private mapFHRIDHistoryToExportData(data: any[]): any[] {
    return data.map((item: any, idx: number) => {
      const rates = [];
      const normal = this.getRateConfig(item, 'Normal', 'Normal');
      if (normal) rates.push(normal);
      const pickup = this.getRateConfig(item, 'Pickup', 'Pickup');
      if (pickup) rates.push(pickup);
      const mfn = this.getRateConfig(item, 'MFN', 'MFN');
      if (mfn) rates.push(mfn);
      const van = this.getRateConfig(item, 'Van', 'Van');
      if (van) rates.push(van);
      const u2s = this.getRateConfig(item, 'U2S', 'U2S');
      if (u2s) rates.push(u2s);
      const shopsy = this.getRateConfig(item, 'Shopsy', 'Shopsy', 'Shopsy_Deduction_Rate');
      if (shopsy) rates.push(shopsy);
      const prexo = this.getRateConfig(item, 'Prexo', 'Prexo');
      if (prexo) rates.push(prexo);
      const grocery = this.getRateConfig(item, 'Grocery', 'Grocery');
      if (grocery) rates.push(grocery);

      let ratesSummary: string[] = [];
      if (rates && rates.length > 0) {
        ratesSummary = rates.map((r: any) => {
          const typeStr = r.isFixed ? 'Fixed' : 'Slab';
          const valStr = (r.isFixed && r.type !== 'Base Rate') ? `₹ ${r.value}` : r.value;
          return `${r.label} (${typeStr}): ${valStr}`;
        });
      }

      let formattedDate = '-';
      const effFrom = item.EffectiveFrom || item.effectiveFrom || '';
      if (effFrom) {
        const d = new Date(effFrom);
        if (!isNaN(d.getTime())) {
          const day = ('0' + d.getDate()).slice(-2);
          const month = ('0' + (d.getMonth() + 1)).slice(-2);
          const year = d.getFullYear();
          formattedDate = `${day}-${month}-${year}`;
        }
      }

      const isActive = item.IsActive ?? item.isActive;

      return {
        'S.No': idx + 1,
        'Client': item.ClientName || item.clientName || this.getLinkedClientName(),
        'Model': item.ModelName || item.modelName || this.getLinkedModelName(),
        'FHR ID': item.FHRID || item.fHRID || item.fhrid || '',
        'Location': item.LocationName || item.locationName || '',
        'Effective From': formattedDate,
        'Status': isActive ? 'Active' : 'Inactive',
        'Configured Rates & Values': ratesSummary.join(' | '),
        'Assign By': item.AssignBy || item.assignBy || item.CreatedBy || item.createdBy || '-',
        'Assign Date': (item.CreatedDate || item.createdDate || item.CreatedOn || item.createdOn || '').toString().replace('T', ' ') || '-',
        'Update By': item.UpdateBy || item.updateBy || item.ModifiedBy || item.modifiedBy || '-',
        'Update Date': (item.UpdateDate || item.updateDate || item.ModifiedDate || item.modifiedDate || '').toString().replace('T', ' ') || '-',
      };
    });
  }

  // Export Active Rate Cards to Excel (.xlsx)
  exportActiveRateCardsToExcel(): void {
    if (!this.vendorId) return;
    this.toastr.info('Preparing download...');
    this.vendorService.getVendorFHRIDHistory(this.vendorId, 1, 100000).subscribe({
      next: (res) => {
        let rawData = [];
        if (res && res.isSuccess && res.data) {
          rawData = res.data.list || [];
        } else {
          rawData = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        }

        const activeData = rawData.filter((x: any) => (x.IsActive ?? x.isActive));
        if (!activeData || activeData.length === 0) {
          this.toastr.warning('No active rate cards available to export.');
          return;
        }

        const exportData = this.mapFHRIDHistoryToExportData(activeData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        worksheet['!cols'] = this.autoFitColumns(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'ActiveRateCards': worksheet }, SheetNames: ['ActiveRateCards'] };
        const vendorName = this.vendorForm.get('Vendor_Name')?.value || 'Vendor';
        XLSX.writeFile(workbook, `Latest_Rate_Cards_${vendorName.toString().replace(/\s+/g, '_')}.xlsx`);
        this.toastr.success('Latest rate cards exported to Excel successfully!');
      },
      error: () => {
        this.toastr.error('Error fetching data for export.');
      }
    });
  }

  // Export Rate Card History to Excel (.xlsx)
  exportRateCardHistoryToExcel(): void {
    if (!this.vendorId) return;
    this.toastr.info('Preparing download...');
    this.vendorService.getVendorFHRIDHistory(this.vendorId, 1, 100000).subscribe({
      next: (res) => {
        let rawData = [];
        if (res && res.isSuccess && res.data) {
          rawData = res.data.list || [];
        } else {
          rawData = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        }

        if (!rawData || rawData.length === 0) {
          this.toastr.warning('No rate card history records available to export.');
          return;
        }

        const exportData = this.mapFHRIDHistoryToExportData(rawData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        worksheet['!cols'] = this.autoFitColumns(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'RateCardHistory': worksheet }, SheetNames: ['RateCardHistory'] };
        const vendorName = this.vendorForm.get('Vendor_Name')?.value || 'Vendor';
        XLSX.writeFile(workbook, `Rate_Card_History_${vendorName.toString().replace(/\s+/g, '_')}.xlsx`);
        this.toastr.success('Rate card history exported to Excel successfully!');
      },
      error: () => {
        this.toastr.error('Error fetching data for export.');
      }
    });
  }

  // Helper to auto-fit Excel columns based on content length
  private autoFitColumns(exportData: any[]): any[] {
    if (!exportData || exportData.length === 0) return [];
    const keys = Object.keys(exportData[0]);
    return keys.map(key => {
      let maxLength = key.length;
      exportData.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          const valLength = val.toString().length;
          if (valLength > maxLength) {
            maxLength = valLength;
          }
        }
      });
      return { wch: maxLength + 2 }; // Add padding
    });
  }

  // Save Tab 1 Basic Vendor Details
  saveVendorBasicDetails(): void {
    this.submitted = true;

    if (this.vendorForm.get('sameAsCurrentAddress')?.value) {
      const curAddr = this.vendorForm.get('Vendor_Address')?.value || '';
      const curStateId = this.vendorForm.get('Vendor_FKStateId')?.value;
      const curState = this.vendorForm.get('Vendor_State')?.value || '';
      const curCityId = this.vendorForm.get('Vendor_FKCityId')?.value;
      const curCity = this.vendorForm.get('Vendor_City')?.value || '';

      this.vendorForm.patchValue({
        Vendor_PermanentAddress: curAddr,
        Vendor_FKPermStateId: curStateId,
        Vendor_PermState: curState,
        Vendor_FKPermCityId: curCityId,
        Vendor_PermCity: curCity
      }, { emitEvent: false });
    }

    const mandatoryKeys = [
      'Vendor_Name', 'Vendor_Gender', 'Vendor_FKStateId',
      'Vendor_FKBankId', 'Vendor_AccountNo', 'Vendor_IFSCCode',
      'AccountHolderName', 'Vendor_TaxTDSRate'
    ];

    let tab1Invalid = false;
    let firstInvalidField = '';
    mandatoryKeys.forEach(key => {
      const ctrl = this.vendorForm.get(key);
      if (!ctrl || ctrl.invalid || ctrl.value === null || ctrl.value === '' || ctrl.value === undefined) {
        tab1Invalid = true;
        if (!firstInvalidField) firstInvalidField = key;
      }
    });

    // Also check if any filled optional field in Tab 1 has invalid format
    const tab1AllFields = [
      'Vendor_Name', 'Vendor_FatherName', 'Vendor_ContactNo', 'Vendor_Gender', 'Vendor_DOB',
      'Vendor_Address', 'Vendor_PermanentAddress', 'Vendor_FKStateId', 'Vendor_FKCityId',
      'Vendor_FKPermStateId', 'Vendor_FKPermCityId', 'Vendor_FKBankId', 'Vendor_AccountNo',
      'Vendor_IFSCCode', 'Vendor_PanNo', 'Vendor_AaddharNo', 'Vendor_GSTNo', 'Vendor_GSTRate',
      'Vendor_TaxTDSRate', 'AgentCode', 'AgentName', 'LegalName', 'EmergencyContactNo',
      'EmailID', 'EShramCardNo', 'AyushmanCardNo', 'AccountHolderName', 'PermanentPinCode', 'CurrentPinCode'
    ];

    let formatInvalid = false;
    tab1AllFields.forEach(key => {
      const ctrl = this.vendorForm.get(key);
      if (ctrl && ctrl.invalid) {
        formatInvalid = true;
        if (!firstInvalidField) firstInvalidField = key;
      }
    });

    if (tab1Invalid || formatInvalid) {
      this.vendorForm.markAllAsTouched();
      this.toastr.warning('Please fill all mandatory Vendor Details fields.');
      return;
    }

    const payload = { ...this.vendorForm.getRawValue() };

    // Map Linked FHRID fields to the model fields expected by C#
    if (payload.Vendor_FKLinkedClientId) {
      if (Array.isArray(payload.Vendor_FKLinkedClientId)) {
        payload.Vendor_FKClientId = payload.Vendor_FKLinkedClientId.map((v: any) => typeof v === 'object' ? (v.value || v.id) : v).join(',');
      } else {
        payload.Vendor_FKClientId = payload.Vendor_FKLinkedClientId;
      }
    }
    if (payload.Vendor_FKLinkedModelId) {
      if (Array.isArray(payload.Vendor_FKLinkedModelId)) {
        payload.Vendor_FK_ModelId = payload.Vendor_FKLinkedModelId.map((v: any) => typeof v === 'object' ? (v.value || v.id) : v).join(',');
      } else {
        payload.Vendor_FK_ModelId = payload.Vendor_FKLinkedModelId;
      }
    }

    // Map FHR IDs array to comma separated string (send the full composite value clientId_modelId_fhrId)
    if (payload.Vendor_FKLinkedFHRId) {
      if (Array.isArray(payload.Vendor_FKLinkedFHRId)) {
        payload.Vendor_HFRID = payload.Vendor_FKLinkedFHRId.map((v: any) => v.value || v).join(',');
      } else {
        payload.Vendor_HFRID = payload.Vendor_FKLinkedFHRId.value || payload.Vendor_FKLinkedFHRId;
      }
    } else {
      payload.Vendor_HFRID = null;
    }

    // Map Tax Details
    if (payload.Vendor_TaxTDSRate != null) {
      payload.Vendor_TDSPercentage = payload.Vendor_TaxTDSRate;
    }

    // Also include GST fields so they can be sent to backend if backend gets updated
    payload.Vendor_GSTRate = payload.Vendor_GSTRate;
    payload.Vendor_IsGSTApplicable = payload.Vendor_IsGSTApplicable;
    payload.Vendor_IsTDSApplicable = payload.Vendor_IsTDSApplicable;

    if (!payload.Vendor_FKClientId || payload.Vendor_FKClientId === '0' || payload.Vendor_FKClientId === 0) {
      payload.Vendor_FKClientId = null;
    }
    if (!payload.Vendor_FK_ModelId || payload.Vendor_FK_ModelId === '0' || payload.Vendor_FK_ModelId === 0) {
      payload.Vendor_FK_ModelId = null;
    }
    if (payload.Vendor_PanNo) payload.Vendor_PanNo = payload.Vendor_PanNo.toString().trim().toUpperCase();
    if (payload.Vendor_IFSCCode) payload.Vendor_IFSCCode = payload.Vendor_IFSCCode.toString().trim().toUpperCase();
    if (payload.Vendor_GSTNo) payload.Vendor_GSTNo = payload.Vendor_GSTNo.toString().trim().toUpperCase();
    if (payload.Vendor_AaddharNo) payload.Vendor_AaddharNo = payload.Vendor_AaddharNo.toString().trim();
    if (payload.Vendor_AccountNo) payload.Vendor_AccountNo = payload.Vendor_AccountNo.toString().trim();

    if (!payload.AgentCode || payload.AgentCode.toString().trim() === '-' || payload.AgentCode.toString().trim().toLowerCase() === 'null') {
      payload.AgentCode = null;
      payload.AgentName = null;
    } else {
      payload.AgentCode = payload.AgentCode.toString().trim().toUpperCase();
    }

    payload.RateCards = this.rateCardsList;

    if (this.isEditMode || this.vendorId || this.vendorForm.get('pk_recId')?.value) {
      const currentRecId = this.vendorId || this.vendorForm.get('pk_recId')?.value;
      payload.pk_recId = currentRecId;
      this.loader.start();
      this.vendorService.updateVendor(payload).subscribe({
        next: (response) => {
          this.loader.stop();
          if (response.isSuccess) {
            this.submitted = false;
            this.rateCardSubmitted = false;
            this.toastr.success('Vendor details saved successfully! You can now configure rate cards.');
            this.activeTab = 2;
            if (currentRecId) {
              this.loadRateCardsAndHistory(currentRecId.toString());
              this.loadVendorFHRIDHistory(currentRecId.toString());
            }
          } else {
            this.toastr.error(response.message || 'Failed to save vendor details.');
          }
        },
        error: (err) => {
          this.loader.stop();
          console.error(err);
          this.toastr.error('Error saving vendor details.');
        }
      });
    } else {
      this.loader.start();
      this.vendorService.insertVendor(payload).subscribe({
        next: (response) => {
          this.loader.stop();
          if (response.isSuccess) {
            const savedRecId = response.data?.pk_recId || response.data?.Pk_recId || response.data;
            if (savedRecId) {
              this.vendorId = savedRecId.toString();
              this.vendorForm.patchValue({ pk_recId: this.vendorId });
            }
            this.isEditMode = true;
            this.submitted = false;
            this.rateCardSubmitted = false;
            this.toastr.success('Vendor details saved successfully! You can now configure rate cards.');
            this.activeTab = 2;
            if (this.vendorId) {
              this.loadRateCardsAndHistory(this.vendorId);
              this.loadVendorFHRIDHistory(this.vendorId);
            }
          } else {
            this.toastr.error(response.message || 'Failed to save vendor details.');
          }
        },
        error: (err) => {
          this.loader.stop();
          console.error(err);
          this.toastr.error('Error saving vendor details.');
        }
      });
    }
  }

  // Save Tab 2 Rate Card Details
  onSubmit(): void {
    this.submitted = true;

    // If user filled in rate card form controls without clicking "+ Add Rate Card to List", auto-commit it to grid first!
    const pendingClientId = this.vendorForm.get('Vendor_FKClientId')?.value;
    const pendingModelId = this.vendorForm.get('Vendor_FK_ModelId')?.value;
    if (pendingClientId && pendingModelId) {
      const added = this.addRateCardToGrid();
      if (!added) {
        // Validation failed for pending rate card inputs
        return;
      }
    }

    if (!this.rateCardsList || this.rateCardsList.length === 0) {
      this.toastr.warning('At least 1 Client Rate Card must be added to the table list before saving Rate Card Details.');
      return;
    }

    const currentRecId = this.vendorId || this.vendorForm.get('pk_recId')?.value;
    if (!currentRecId) {
      this.toastr.warning('Please save Vendor Details (Tab 1) first.');
      return;
    }

    const payload = {
      ...this.vendorForm.getRawValue(),
      pk_recId: currentRecId,
      RateCards: this.rateCardsList
    };

    if (!payload.Vendor_FKClientId || payload.Vendor_FKClientId === '0' || payload.Vendor_FKClientId === 0) {
      payload.Vendor_FKClientId = null;
    }
    if (!payload.Vendor_FK_ModelId || payload.Vendor_FK_ModelId === '0' || payload.Vendor_FK_ModelId === 0) {
      payload.Vendor_FK_ModelId = null;
    }
    this.loader.start();
    this.vendorService.updateVendor(payload).subscribe({
      next: (response) => {
        this.loader.stop();
        if (response.isSuccess) {
          this.toastr.success('Vendor Rate Cards saved successfully.');
          this.goBack();
        } else {
          this.toastr.error(response.message || 'Failed to save vendor rate cards.');
        }
      },
      error: (err) => {
        this.loader.stop();
        console.error(err);
        this.toastr.error('Error saving vendor rate cards.');
      }
    });
  }

  onTextInput(event: any, field: any): void {
    if (field && field.uppercase && event && event.target) {
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const upper = (event.target.value || '').toUpperCase();
      this.vendorForm.get(field.key)?.setValue(upper, { emitEvent: true });
      setTimeout(() => {
        if (event.target.setSelectionRange) {
          event.target.setSelectionRange(start, end);
        }
      }, 0);
    }
  }

  onlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key;
    if (!/^[0-9]$/.test(charCode)) {
      event.preventDefault();
    }
  }

  goBack(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_master_form_list']);
  }

  // Load all vendors for Agent Code lookup and Fact Box stats
  loadVendorsForLookup(): void {
    this.vendorService.getAllVendors(1, 10000, '').subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data && res.data.vendors) {
          this.allVendorsList = res.data.vendors || [];
          this.agentVendorsList = this.allVendorsList
            .filter((v: any) => {
              const c = (v.vendor_Code || v.Vendor_Code || '').toString().trim();
              return c !== '' && c !== '-' && c.toLowerCase() !== 'null';
            })
            .map((v: any) => ({
              code: (v.vendor_Code || v.Vendor_Code || '').toString().trim().toUpperCase(),
              name: v.vendor_Name || v.Vendor_Name || v.candidate_name || '',
              pan: v.vendor_PanNo || v.Vendor_PanNo || '',
              account: v.vendor_AccountNo || v.Vendor_AccountNo || '',
              displayText: `${(v.vendor_Code || v.Vendor_Code || '').toString().trim().toUpperCase()} ${v.vendor_Name || v.Vendor_Name || v.candidate_name || ''}`.trim(),
              raw: v
            }));

          // Calculate fact box stats directly from the single vendor list response
          if (res.data.counts) {
            this.stats.totalVendors = res.data.counts.totalVendors || res.data.counts.TotalVendors || res.data.totalCount || this.allVendorsList.length;
            this.stats.verifiedVendors = res.data.counts.verified || res.data.counts.Verified || 0;
            this.stats.pendingVerification = Math.max(0, this.stats.totalVendors - this.stats.verifiedVendors);
          } else {
            this.stats.totalVendors = this.allVendorsList.length;
            this.stats.verifiedVendors = this.allVendorsList.filter((v: any) => v.vendor_Status === 'Verified').length;
            this.stats.pendingVerification = this.allVendorsList.filter((v: any) => v.vendor_Status !== 'Verified').length;
          }

          const currentCode = this.vendorForm.get('AgentCode')?.value;
          if (currentCode && currentCode !== '-' && currentCode.toLowerCase() !== 'null') {
            const found = this.agentVendorsList.find(a => a.code === currentCode.toString().trim().toUpperCase());
            if (found) {
              this.patchAgentDetails(found.raw || found);
            }
          }
        }
      },
      error: () => {}
    });
  }

  // Handle typing / search in Agent Code ng-select
  onAgentSearch(event: any): void {
    const term = typeof event === 'string' ? event : (event?.term || '');
    const cleanTerm = (term || '').trim();
    if (!cleanTerm) {
      this.agentCodeInput$.next('');
      if (this.agentNgSelect && typeof this.agentNgSelect.close === 'function') {
        this.agentNgSelect.close();
      }
    }
  }

  // Handle clearing in Agent Code ng-select
  onAgentClear(): void {
    this.agentCodeInput$.next('');
    this.clearAgentDetails();
    if (this.agentNgSelect && typeof this.agentNgSelect.close === 'function') {
      this.agentNgSelect.close();
    }
  }

  // Handle agent selection change from ng-select autocomplete
  onAgentSelectChange(selected: any): void {
    if (!selected) {
      this.clearAgentDetails();
      return;
    }
    const code = typeof selected === 'object' ? (selected.code || selected.VendorCode || selected.value) : selected;
    if (code && code !== '-' && code.toString().trim().toLowerCase() !== 'null') {
      const codeUpper = code.toString().trim().toUpperCase();
      const matched = this.agentVendorsList.find(a => a.code === codeUpper)?.raw || (typeof selected === 'object' ? (selected.raw || selected) : null);
      if (matched) {
        this.patchAgentDetails(matched);
      } else {
        this.onAgentCodeChange(codeUpper);
      }
    } else {
      this.clearAgentDetails();
    }
  }

  // Handle blur on inputs (checks duplicates)
  onFieldBlur(field: any): void {
    if (field.dbFieldName) {
      this.checkDuplicate(field.key, field.dbFieldName);
    }
  }

  // Helper to patch Agent vendor details (Name, PAN, Bank Account, IFSC, Bank, Account Holder)
  patchAgentDetails(matched: any): void {
    const patchObj: any = {
      AgentName: matched.vendor_Name || matched.Vendor_Name || matched.candidate_name || ''
    };

    const agentPan = matched.vendor_PanNo || matched.Vendor_PanNo;
    if (agentPan) {
      patchObj.Vendor_PanNo = agentPan;
    }

    const agentAccount = matched.vendor_AccountNo || matched.Vendor_AccountNo;
    if (agentAccount) {
      patchObj.Vendor_AccountNo = agentAccount;
    }

    const agentIfsc = matched.vendor_IFSCCode || matched.Vendor_IFSCCode;
    if (agentIfsc) {
      patchObj.Vendor_IFSCCode = agentIfsc;
    }

    const agentBankId = matched.vendor_FKBankId || matched.Vendor_FKBankId;
    if (agentBankId) {
      patchObj.Vendor_FKBankId = agentBankId.toString();
      const selectedBank = this.banks.find(b => b.value && b.value.toString() === agentBankId.toString());
      if (selectedBank) {
        patchObj.Vendor_BankName = selectedBank.name;
      }
    }

    const agentBankName = matched.vendor_BankName || matched.Vendor_BankName;
    if (agentBankName && !patchObj.Vendor_BankName) {
      patchObj.Vendor_BankName = agentBankName;
    }

    const agentAccountHolder = matched.accountHolderName || matched.AccountHolderName;
    if (agentAccountHolder) {
      patchObj.AccountHolderName = agentAccountHolder;
    }

    this.vendorForm.patchValue(patchObj, { emitEvent: false });
  }

  // Helper to clear Agent & Bank details when Agent Code is cleared / backspaced / invalid
  clearAgentDetails(): void {
    this.vendorForm.patchValue({
      AgentName: '',
      Vendor_PanNo: '',
      Vendor_AccountNo: '',
      Vendor_IFSCCode: '',
      Vendor_FKBankId: null,
      Vendor_BankName: '',
      AccountHolderName: ''
    }, { emitEvent: false });

    // Clear duplicate errors if any on these fields
    ['Vendor_PanNo', 'Vendor_AccountNo'].forEach(key => {
      const ctrl = this.vendorForm.get(key);
      if (ctrl?.errors && ctrl.errors['duplicate']) {
        const errs = { ...ctrl.errors };
        delete errs['duplicate'];
        ctrl.setErrors(Object.keys(errs).length ? errs : null);
      }
    });
  }

  // Handle Agent Code change and auto-populate Agent Name, PAN, Account No, etc.
  onAgentCodeChange(val: any): void {
    const code = (val || '').toString().trim().toUpperCase();
    if (!code || code === '-' || code === 'NULL') {
      this.clearAgentDetails();
      return;
    }

    // When AgentCode is provided, clear any existing duplicate blocking errors for PAN & Account
    ['Vendor_PanNo', 'Vendor_AccountNo'].forEach(key => {
      const ctrl = this.vendorForm.get(key);
      if (ctrl?.errors && ctrl.errors['duplicate']) {
        const errs = { ...ctrl.errors };
        delete errs['duplicate'];
        ctrl.setErrors(Object.keys(errs).length ? errs : null);
      }
    });

    if (this.allVendorsList && this.allVendorsList.length > 0) {
      const matched = this.allVendorsList.find((v: any) =>
        (v.vendor_Code || v.Vendor_Code || '').toString().trim().toUpperCase() === code
      );
      if (matched) {
        this.patchAgentDetails(matched);
        return;
      }
    }

    // Fallback: search vendor API if not found in local cached list
    this.vendorService.getAllVendors(1, 10, code).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data && res.data.vendors && res.data.vendors.length > 0) {
          const matched = res.data.vendors.find((v: any) =>
            (v.vendor_Code || v.Vendor_Code || '').toString().trim().toUpperCase() === code
          );
          if (matched) {
            this.patchAgentDetails(matched);
            return;
          }
        }
        this.clearAgentDetails();
      },
      error: () => {
        this.clearAgentDetails();
      }
    });
  }

  // Load Vendor Stats for the Fact Box (re-uses cached vendors)
  loadStats(): void {
    if (this.allVendorsList && this.allVendorsList.length > 0) {
      this.stats.totalVendors = this.allVendorsList.length;
      this.stats.verifiedVendors = this.allVendorsList.filter((v: any) => v.vendor_Status === 'Verified').length;
      this.stats.pendingVerification = this.allVendorsList.filter((v: any) => v.vendor_Status !== 'Verified').length;
    }
  }

  // Calculate completeness progress percentage
  getOverallProgress(): number {
    const fieldsToTrack = [
      'Vendor_Name', 'Vendor_FatherName', 'Vendor_ContactNo', 'Vendor_Gender',
      'Vendor_DOB', 'Vendor_Address', 'Vendor_FKStateId', 'Vendor_FKCityId',
      'Vendor_FKBankId', 'Vendor_AccountNo', 'Vendor_IFSCCode', 'Vendor_PanNo',
      'Vendor_AaddharNo', 'Vendor_FKClientId', 'Vendor_RateType', 'Vendor_Type',
      'Vendor_FK_ModelId', 'Vendor_HFRID'
    ];
    let filledCount = 0;
    fieldsToTrack.forEach(field => {
      const ctrl = this.vendorForm.get(field);
      if (ctrl && ctrl.value !== null && ctrl.value !== '') {
        filledCount++;
      }
    });
    return Math.round((filledCount / fieldsToTrack.length) * 100);
  }

  // Toggle Fact Box sidebar open/close state
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  // Step Navigator Titles
  getCurrentStepTitle(): string {
    if (!this.vendorForm.get('Vendor_Name')?.value || !this.vendorForm.get('Vendor_Gender')?.value) {
      return 'Vendor Basic Details';
    }
    if (!this.vendorForm.get('Vendor_FKStateId')?.value) {
      return 'Address & Location';
    }
    if (!this.vendorForm.get('Vendor_FKBankId')?.value || !this.vendorForm.get('Vendor_AccountNo')?.value || !this.vendorForm.get('Vendor_IFSCCode')?.value || !this.vendorForm.get('AccountHolderName')?.value) {
      return 'Bank & Credentials';
    }
    if (this.vendorForm.get('Vendor_TaxTDSRate')?.value == null || this.vendorForm.get('Vendor_TaxTDSRate')?.value === '') {
      return 'Tax Details';
    }
    return 'Ready to Save';
  }

  // Step Navigator Descriptions
  getCurrentStepDescription(): string {
    if (!this.vendorForm.get('Vendor_Name')?.value || !this.vendorForm.get('Vendor_Gender')?.value) {
      return 'Please enter the vendor name and select gender.';
    }
    if (!this.vendorForm.get('Vendor_FKStateId')?.value) {
      return 'Select State for the vendor\'s location details.';
    }
    if (!this.vendorForm.get('Vendor_FKBankId')?.value || !this.vendorForm.get('Vendor_AccountNo')?.value || !this.vendorForm.get('Vendor_IFSCCode')?.value || !this.vendorForm.get('AccountHolderName')?.value) {
      return 'Enter Bank Name, Account Number, IFSC Code, and Account Holder Name.';
    }
    if (this.vendorForm.get('Vendor_TaxTDSRate')?.value == null || this.vendorForm.get('Vendor_TaxTDSRate')?.value === '') {
      return 'Please enter TDS Percentage (%).';
    }
    return 'All mandatory fields are configured. Click the Save Vendor Details button.';
  }

  // Toggle Same as Current Address Checkbox
  onSameAddressToggle(event: any): void {
    const isChecked = event.target ? event.target.checked : !!event;
    this.vendorForm.patchValue({ sameAsCurrentAddress: isChecked });
    if (isChecked) {
      const currentAddr = this.vendorForm.get('Vendor_Address')?.value || '';
      const currentStateId = this.vendorForm.get('Vendor_FKStateId')?.value;
      const currentState = this.vendorForm.get('Vendor_State')?.value || '';
      const currentCityId = this.vendorForm.get('Vendor_FKCityId')?.value;
      const currentCity = this.vendorForm.get('Vendor_City')?.value || '';

      this.permCities = [...this.cities];
      this.updateFieldOptions('Vendor_FKPermCityId', this.permCities);

      this.vendorForm.patchValue({
        Vendor_PermanentAddress: currentAddr,
        Vendor_FKPermStateId: currentStateId,
        Vendor_PermState: currentState,
        Vendor_FKPermCityId: currentCityId,
        Vendor_PermCity: currentCity
      });
    }
  }
  openVendorList(isMapped: boolean): void {
    this.vendorListTitle = isMapped ? 'Mapped Vendors' : 'Unmapped Vendors';
    this.vendorList = []; // clear previous
    this.searchVendorText = ''; // clear search
    this.vendorService.getVendorMappedUnmappedList(isMapped).subscribe({
      next: (res: any) => {
        if (res && res.isSuccess) {
          this.vendorList = res.data || [];
          this.showVendorListPopup = true;
        } else {
          this.toastr.error(res?.message || 'Failed to fetch vendor list');
        }
      },
      error: (err: any) => {
        console.error('Error fetching vendor list:', err);
        this.toastr.error('Error fetching vendor list');
      }
    });
  }

  closeVendorListPopup(): void {
    this.showVendorListPopup = false;
  }

  selectVendorFromList(vendor: any): void {
    this.closeVendorListPopup();
    if (vendor && vendor.pk_recId) {
      this.loadVendor(vendor.pk_recId);
    }
  }

  // --- Image Upload Logics (Local state) ---

  // Load Change History Log for Vendor FactBox directly from Vendor_RatecardMst (NO AUDIT TABLES)
  loadAuditLogs(pk_recId: string): void {
    if (!pk_recId) return;
    this.vendorService.getVendorRateCardHistory(pk_recId).subscribe({
      next: (res) => {
        if (res && res.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          this.processVendorRateCardTimeline(res.data);
        } else {
          this.auditTimeline = [];
        }
      },
      error: (err) => {
        console.error('Error loading rate card history for factbox:', err);
        this.auditTimeline = [];
      }
    });
  }

  // Process rate card versions from Vendor_RatecardMst for factbox timeline
  processVendorRateCardTimeline(rawCards: any[]): void {
    const timeline: any[] = [];

    // Group cards by client, model, category to compare consecutive versions
    const grouped: { [key: string]: any[] } = {};
    rawCards.forEach(card => {
      const cId = card.vendor_FKClientId ?? card.Vendor_FKClientId ?? card.fk_cost_centre_id;
      const mId = card.vendor_FK_ModelId ?? card.Vendor_FK_ModelId ?? card.fk_modelId;
      const catId = card.vendor_CategoryID ?? card.Vendor_CategoryID ?? 0;
      const key = `${cId}_${mId}_${catId}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(card);
    });

    rawCards.forEach(card => {
      const isCurrentActive = card.isActive || card.IsActive;
      const cId = card.vendor_FKClientId ?? card.Vendor_FKClientId ?? card.fk_cost_centre_id;
      const mId = card.vendor_FK_ModelId ?? card.Vendor_FK_ModelId ?? card.fk_modelId;
      const catId = card.vendor_CategoryID ?? card.Vendor_CategoryID ?? 0;
      const key = `${cId}_${mId}_${catId}`;
      const groupCards = grouped[key] || [];

      const currentIndex = groupCards.findIndex(c => (c.pk_rateCardId || c.RateCardId) === (card.pk_rateCardId || card.RateCardId));
      const prevCard = (currentIndex !== -1 && currentIndex < groupCards.length - 1) ? groupCards[currentIndex + 1] : null;

      const clientName = card.clientName || card.ClientName || ('Client #' + cId);
      const modelName = card.modelName || card.ModelName || mId;
      const categoryName = card.categoryName || card.CategoryName || '-';
      const rateType = card.rateTypeName || card.RateTypeName || this.getRateTypeDisplayName(card.vendor_RateType ?? card.Vendor_RateType);
      const vendorType = card.vendor_Type ?? card.Vendor_Type ?? '-';
      const hfrid = card.vendor_HFRID ?? card.Vendor_HFRID ?? '-';

      const changes: Array<{ field: string, oldVal: string, newVal: string }> = [];

      if (prevCard) {
        const prevRates = {
          Rate: this.parseNumberOrNull(prevCard.vendor_Rate ?? prevCard.Vendor_Rate),
          Deduction: this.parseNumberOrNull(prevCard.vendor_RateDeduction ?? prevCard.Vendor_RateDeduction),
          Delivery: this.parseNumberOrNull(prevCard.vendor_DeliveryRate ?? prevCard.Vendor_DeliveryRate),
          Pickup: this.parseNumberOrNull(prevCard.vendor_PickupRate ?? prevCard.Vendor_PickupRate),
          MFN: this.parseNumberOrNull(prevCard.vendor_MFNRate ?? prevCard.Vendor_MFNRate),
          TDS: this.parseNumberOrNull(prevCard.vendor_TDSPercentage ?? prevCard.Vendor_TDSPercentage)
        };

        const currentRates = {
          Rate: this.parseNumberOrNull(card.vendor_Rate ?? card.Vendor_Rate),
          Deduction: this.parseNumberOrNull(card.vendor_RateDeduction ?? card.Vendor_RateDeduction),
          Delivery: this.parseNumberOrNull(card.vendor_DeliveryRate ?? card.Vendor_DeliveryRate),
          Pickup: this.parseNumberOrNull(card.vendor_PickupRate ?? card.Vendor_PickupRate),
          MFN: this.parseNumberOrNull(card.vendor_MFNRate ?? card.Vendor_MFNRate),
          TDS: this.parseNumberOrNull(card.vendor_TDSPercentage ?? card.Vendor_TDSPercentage)
        };

        if (prevRates.Rate !== currentRates.Rate) changes.push({ field: 'Rate', oldVal: prevRates.Rate != null ? `₹${prevRates.Rate}` : 'None', newVal: currentRates.Rate != null ? `₹${currentRates.Rate}` : 'None' });
        if (prevRates.Deduction !== currentRates.Deduction) changes.push({ field: 'Rate Deduction', oldVal: prevRates.Deduction != null ? `₹${prevRates.Deduction}` : 'None', newVal: currentRates.Deduction != null ? `₹${currentRates.Deduction}` : 'None' });
        if (prevRates.Delivery !== currentRates.Delivery) changes.push({ field: 'Delivery Rate', oldVal: prevRates.Delivery != null ? `₹${prevRates.Delivery}` : 'None', newVal: currentRates.Delivery != null ? `₹${currentRates.Delivery}` : 'None' });
        if (prevRates.Pickup !== currentRates.Pickup) changes.push({ field: 'Pickup Rate', oldVal: prevRates.Pickup != null ? `₹${prevRates.Pickup}` : 'None', newVal: currentRates.Pickup != null ? `₹${currentRates.Pickup}` : 'None' });
        if (prevRates.MFN !== currentRates.MFN) changes.push({ field: 'MFN Rate', oldVal: prevRates.MFN != null ? `₹${prevRates.MFN}` : 'None', newVal: currentRates.MFN != null ? `₹${currentRates.MFN}` : 'None' });
        if (prevRates.TDS !== currentRates.TDS) changes.push({ field: 'TDS', oldVal: prevRates.TDS != null ? `${prevRates.TDS}%` : 'None', newVal: currentRates.TDS != null ? `${currentRates.TDS}%` : 'None' });
      }

      const ratesSummary: string[] = [];
      const rateVal = this.parseNumberOrNull(card.vendor_Rate ?? card.Vendor_Rate);
      const dedVal = this.parseNumberOrNull(card.vendor_RateDeduction ?? card.Vendor_RateDeduction);
      const delVal = this.parseNumberOrNull(card.vendor_DeliveryRate ?? card.Vendor_DeliveryRate);
      const picVal = this.parseNumberOrNull(card.vendor_PickupRate ?? card.Vendor_PickupRate);
      const mfnVal = this.parseNumberOrNull(card.vendor_MFNRate ?? card.Vendor_MFNRate);
      const tdsVal = this.parseNumberOrNull(card.vendor_TDSPercentage ?? card.Vendor_TDSPercentage);

      if (rateVal != null) ratesSummary.push(`Rate: ₹${rateVal}`);
      if (dedVal != null) ratesSummary.push(`Deduction: ₹${dedVal}`);
      if (delVal != null) ratesSummary.push(`Delivery: ₹${delVal}`);
      if (picVal != null) ratesSummary.push(`Pickup: ₹${picVal}`);
      if (mfnVal != null) ratesSummary.push(`MFN: ₹${mfnVal}`);
      if (tdsVal != null) ratesSummary.push(`TDS: ${tdsVal}%`);

      const rawDate = card.effectiveFrom || card.EffectiveFrom || card.dated || card.Dated || card.uploadTimestamp;
      const dateVal = rawDate ? new Date(rawDate) : null;

      timeline.push({
        auditLogId: card.pk_rateCardId || card.RateCardId || card.AuditLogId,
        action: isCurrentActive ? 'ACTIVE' : 'HISTORICAL',
        date: dateVal,
        clientName: clientName,
        modelName: modelName,
        categoryName: categoryName,
        rateType: rateType,
        vendorType: vendorType,
        hfrid: hfrid,
        changes: changes,
        summary: ratesSummary.join(' | ') || 'No rates specified',
        effectiveFrom: (card.effectiveFrom || card.EffectiveFrom) ? this.formatDateOnly(card.effectiveFrom || card.EffectiveFrom) : '-',
        effectiveTo: (card.effectiveTo || card.EffectiveTo) ? this.formatDateOnly(card.effectiveTo || card.EffectiveTo) : (isCurrentActive ? 'Current Active' : '-')
      });
    });

    this.auditTimeline = timeline;
  }

  checkDuplicate(controlName: string, dbFieldName: string): void {
    const control = this.vendorForm.get(controlName);
    if (!control || !control.value) return;

    // If AgentCode is present, allow duplicate PAN and Account on form blur (validated in SP on save)
    const agentCode = this.vendorForm.get('AgentCode')?.value;
    if (agentCode && (controlName === 'Vendor_PanNo' || controlName === 'Vendor_AccountNo')) {
      const errors = control.errors;
      if (errors && errors['duplicate']) {
        delete errors['duplicate'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
      return;
    }

    const fieldValue = control.value;
    const generalId = this.vendorId || '';

    this.designationService.CheckDuplicateValue(dbFieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          control.setErrors({ duplicate: response.message });
        } else {
          const errors = control.errors;
          if (errors) {
            delete errors['duplicate'];
            control.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        control.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }
}


