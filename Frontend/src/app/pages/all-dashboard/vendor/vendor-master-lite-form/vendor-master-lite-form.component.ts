import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VendorLiteService } from '../Service/vendor-lite.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';

declare var bootstrap: any;

@Component({
  selector: 'app-vendor-master-lite-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgSelectModule],
  templateUrl: './vendor-master-lite-form.component.html',
  styleUrls: ['./vendor-master-lite-form.component.scss']
})
export class VendorMasterLiteFormComponent implements OnInit {
  vendorForm!: FormGroup;
  activeTab: number = 1;
  vendorId: string | null = null;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  submitted: boolean = false;

  // Dropdowns
  stateList: any[] = [];
  cityList: any[] = [];
  permStateList: any[] = [];
  permCityList: any[] = [];
  bankList: any[] = [];
  vendorDocumentTypeList: any[] = [];
  locationList: any[] = [];
  servicesList: any[] = [];
  selectedServices: string[] = [];

  // Service Type Dropdown (Static options)
  serviceTypeList: any[] = [
    { name: 'Percentage of CTC (%)', value: 'Percentage of CTC (%)' },
    { name: 'Fixed Amount', value: 'Fixed Amount' }
  ];

  // Tab 2 - Document Upload
  selectedDocTypeCodeId: number | null = null;
  selectedFiles: File[] = [];
  uploadedDocuments: any[] = [];
  isUploading: boolean = false;
  selectedDocument: any = null;

  constructor(
    private fb: FormBuilder,
    private vendorLiteService: VendorLiteService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private ngxUILoaderService: NgxUiLoaderService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadStates();
    this.loadBanks();
    this.loadDocumentTypes();
    this.loadLocations();
    this.loadServices();

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_recId');
      if (id) {
        this.isEditMode = true;
        this.vendorId = id;
        this.loadVendorData(id);
        this.loadUploadedDocuments();
      }
    });
  }

  initForm(): void {
    this.vendorForm = this.fb.group({
      pk_recId: [''],
      vendor_Name: ['', Validators.required],
      vendor_ContactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      vendor_Address: ['', Validators.required],
      vendor_FKStateId: [null, Validators.required],
      vendor_FKCityId: [null, Validators.required],
      vendor_PermanentAddress: ['', Validators.required],
      vendor_FKPermStateId: [null, Validators.required],
      vendor_FKPermCityId: [null, Validators.required],

      // Bank & Identity - all optional
      vendor_FKBankId: [null],
      vendor_AccountNo: [''],
      vendor_IFSCCode: [''],
      vendor_PanNo: [''],
      vendor_AaddharNo: [''],
      vendor_GSTNo: [''],

      // Tax Details
      vendor_IsGSTApplicable: [false],
      vendor_GSTRate: [0],
      vendor_IsTDSApplicable: [false],
      vendor_TaxTDSRate: [0],

      // Service Details
      vendor_ServiceType: [null],
      vendor_ServiceTax: [0],

      vendor_RegistrationDate: [new Date().toISOString().substring(0, 10), Validators.required],
      vendor_ContractStartDate: [''],
      vendor_ContractEndDate: [''],
      vendor_Services: [[]],
      vendor_Location: [[]],
      showDetailsOnSlalrySlip: [false],
      emailID: [''],
    });
  }

  // ── DROPDOWNS ─────────────────────────────────────────────────────────────

  loadStates(): void {
    this.vendorLiteService.getDropdownList('State').subscribe(res => {
      if (res?.isSuccess) {
        this.stateList = res.data;
        this.permStateList = res.data;
      }
    });
  }

  onStateChange(stateId: string, isPermanent: boolean = false): void {
    if (!stateId) return;
    this.vendorLiteService.getCitiesByState(stateId).subscribe(res => {
      if (res?.isSuccess) {
        if (isPermanent) {
          this.permCityList = res.data;
          this.vendorForm.patchValue({ vendor_FKPermCityId: null });
        } else {
          this.cityList = res.data;
          this.vendorForm.patchValue({ vendor_FKCityId: null });
        }
      }
    });
  }

  loadBanks(): void {
    this.vendorLiteService.getDropdownList('Bank').subscribe(res => {
      if (res?.isSuccess) {
        this.bankList = res.data;
      }
    });
  }

  loadDocumentTypes(): void {
    const companyId = localStorage.getItem('companyId') || '';
    this.vendorLiteService.getDdlListBasedOnCodeType('9', companyId).subscribe(res => {
      if (res?.isSuccess) {
        this.vendorDocumentTypeList = res.data || [];
      }
    });
  }

  loadLocations(): void {
    this.vendorLiteService.getDropdownList('Location').subscribe(res => {
      if (res?.isSuccess) {
        this.locationList = res.data;
      }
    });
  }

  loadServices(): void {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    this.vendorLiteService.getDdlListBasedOnCodeType('14', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        const mapped = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? item.codeId ?? item.name ?? '').toString().trim()
        }));
        this.servicesList = [
          { name: 'Select All', value: '__select_all__' },
          ...mapped
        ];
        this.syncSelectedServicesFromForm();
      },
      error: (err: any) => console.error('Error fetching Service Type list:', err)
    });
  }

  toggleSelectAllServices(event?: any): void {
    let isChecked: boolean;
    if (event && event.target && typeof event.target.checked === 'boolean') {
      isChecked = event.target.checked;
    } else {
      isChecked = !this.isAllServicesSelected();
    }
    const realValues = this.servicesList
      .filter(s => s.value !== '__select_all__')
      .map(s => s.value);
    this.selectedServices = isChecked ? [...realValues] : [];
    this.vendorForm.controls['vendor_Services'].setValue([...this.selectedServices]);
  }

  toggleService(serviceValue: string): void {
    if (!serviceValue || serviceValue === '__select_all__') return;
    const index = this.selectedServices.indexOf(serviceValue);
    if (index === -1) {
      this.selectedServices.push(serviceValue);
    } else {
      this.selectedServices.splice(index, 1);
    }
    this.vendorForm.controls['vendor_Services'].setValue([...this.selectedServices]);
  }

  isAllServicesSelected(): boolean {
    const realServices = this.servicesList.filter(item => item.value !== '__select_all__');
    if (realServices.length === 0) return false;
    return (
      this.selectedServices.length === realServices.length &&
      realServices.every(c => this.selectedServices.includes(c.value))
    );
  }

  getServicesDisplayText(): string {
    const realServices = this.servicesList.filter(c => c.value !== '__select_all__');
    const selectedReal = this.selectedServices.filter(value => value !== '__select_all__');

    if (
      realServices.length > 0 &&
      selectedReal.length === realServices.length &&
      realServices.every(c => selectedReal.includes(c.value as string))
    ) {
      return "All Selected";
    } else if (selectedReal.length === 1) {
      return this.servicesList.find(item => item.value === selectedReal[0])?.name || "--Select --";
    } else if (selectedReal.length > 1) {
      const firstSelected = this.servicesList.find(item => item.value === selectedReal[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select --";
    } else {
      return "--Select --";
    }
  }

  clearServices(): void {
    this.selectedServices = [];
    this.vendorForm.controls['vendor_Services'].setValue([]);
  }

  syncSelectedServicesFromForm(): void {
    const val = this.vendorForm.get('vendor_Services')?.value;
    if (Array.isArray(val)) {
      this.selectedServices = val.filter(v => v !== '__select_all__');
    } else if (typeof val === 'string' && val.trim()) {
      this.selectedServices = val.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== '__select_all__');
    } else {
      this.selectedServices = [];
    }
  }

  copyAddress(event: any): void {
    if (event.target.checked) {
      const formVal = this.vendorForm.value;
      this.vendorForm.patchValue({
        vendor_PermanentAddress: formVal.vendor_Address,
        vendor_FKPermStateId: formVal.vendor_FKStateId,
      });
      if (formVal.vendor_FKStateId) {
        this.vendorLiteService.getCitiesByState(formVal.vendor_FKStateId).subscribe(res => {
          if (res?.isSuccess) {
            this.permCityList = res.data;
            this.vendorForm.patchValue({ vendor_FKPermCityId: formVal.vendor_FKCityId });
          }
        });
      }
    } else {
      this.vendorForm.patchValue({
        vendor_PermanentAddress: '',
        vendor_FKPermStateId: null,
        vendor_FKPermCityId: null
      });
    }
  }

  // ── SAVE TAB 1 ────────────────────────────────────────────────────────────

  saveVendorDetails(): void {
    this.submitted = true;

    if (this.vendorForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly.');
      return;
    }

    this.isSaving = true;
    const raw = this.vendorForm.value;
    const model: any = { ...raw };
    model.vendor_Status = 'Active';
    model.ShowDetailsOnSlalrySlip = raw.showDetailsOnSlalrySlip;
    if (raw.emailID) {
      model.EmailID = raw.emailID
        .split(/[,;]+/)
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0)
        .join(', ');
    } else {
      model.EmailID = '';
    }

    // Format date if needed
    if (model.vendor_RegistrationDate && typeof model.vendor_RegistrationDate === 'string' && model.vendor_RegistrationDate.includes('T')) {
      model.vendor_RegistrationDate = model.vendor_RegistrationDate.split('T')[0];
    }

    model.vendor_ContractStartDate = model.vendor_ContractStartDate ? model.vendor_ContractStartDate.split('T')[0] : null;
    model.vendor_ContractEndDate = model.vendor_ContractEndDate ? model.vendor_ContractEndDate.split('T')[0] : null;

    if (Array.isArray(model.vendor_Services)) {
      const realValues = model.vendor_Services.filter((s: string) => s && s !== '__select_all__');
      model.vendor_Services = realValues.length > 0 ? realValues.join(',') : null;
    } else if (!model.vendor_Services) {
      model.vendor_Services = null;
    }

    if (Array.isArray(model.vendor_Location)) {
      model.vendor_Location = model.vendor_Location.length > 0 ? model.vendor_Location.join(',') : null;
    } else if (!model.vendor_Location) {
      model.vendor_Location = null;
    }

    // Clean optional string fields from '' to null
    const optionalFields = [
      'vendor_FKBankId',
      'vendor_AccountNo',
      'vendor_IFSCCode',
      'vendor_PanNo',
      'vendor_AaddharNo',
      'vendor_GSTNo',
      'vendor_ServiceType',
      'vendor_ServiceTax'
    ];
    for (const f of optionalFields) {
      if (model[f] === '' || model[f] === undefined) {
        model[f] = null;
      }
    }

    if (!model.vendor_IsGSTApplicable) {
      model.vendor_GSTRate = 0;
    }
    if (!model.vendor_IsTDSApplicable) {
      model.vendor_TaxTDSRate = 0;
    }

    const saveObs = this.isEditMode
      ? this.vendorLiteService.updateVendorLite(model)
      : this.vendorLiteService.insertVendorLite(model);

    saveObs.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Vendor details saved successfully.');
          this.vendorId = res.data; // pk_recId
          this.isEditMode = true;
          this.vendorForm.patchValue({ pk_recId: this.vendorId });
          this.activeTab = 2; // Auto-move to document tab
          this.loadUploadedDocuments();
        } else {
          this.toastr.error(res.message || 'Failed to save vendor details.');
        }
        this.isSaving = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Error occurred while saving.');
        this.isSaving = false;
      }
    });
  }

  loadVendorData(id: string): void {
    this.vendorLiteService.getVendorLiteById(id).subscribe(res => {
      if (res?.isSuccess && res.data) {
        const d = res.data;

        // Handle potential PascalCase from JSON serialization and missing mappings
        const patchData = {
          ...d,
          vendor_RegistrationDate: d.vendor_RegistrationDate || d.Vendor_RegistrationDate,
          vendor_IsTDSApplicable: d.vendor_IsTDSApplicable ?? d.Vendor_IsTDSApplicable ?? false,
          vendor_TaxTDSRate: d.vendor_TDSPercentage ?? d.Vendor_TDSPercentage ?? d.vendor_TDSPercentage ?? d.Vendor_TDSPercentage ?? 0,
          vendor_IsGSTApplicable: d.vendor_IsGSTApplicable ?? d.Vendor_IsGSTApplicable ?? false,
          vendor_GSTRate: d.vendor_GSTRate ?? d.Vendor_GSTRate ?? 0,
          vendor_ContractStartDate: d.vendor_ContractStartDate ?? d.Vendor_ContractStartDate ?? '',
          vendor_ContractEndDate: d.vendor_ContractEndDate ?? d.Vendor_ContractEndDate ?? '',
          vendor_Location: d.vendor_Location ?? d.Vendor_Location ?? '',
          vendor_Services: d.vendor_Services ?? d.Vendor_Services ?? '',
          vendor_ServiceType: d.vendor_ServiceType || d.Vendor_ServiceType || d.serviceType || d.ServiceType || null,
          vendor_ServiceTax: d.vendor_ServiceTax ?? d.Vendor_ServiceTax ?? d.serviceTax ?? d.ServiceTax ?? 0,
          showDetailsOnSlalrySlip: d.showDetailsOnSlalrySlip === true || d.showDetailsOnSlalrySlip === 1 || d.ShowDetailsOnSlalrySlip === true || d.ShowDetailsOnSlalrySlip === 1,
          emailID: d.emailID || d.EmailID || d.email || '',
        };

        if (patchData.vendor_RegistrationDate) {
          const dateStr = patchData.vendor_RegistrationDate;
          if (dateStr.includes('T')) {
            patchData.vendor_RegistrationDate = dateStr.split('T')[0];
          } else {
            // Fallback parse if it comes as MM/DD/YYYY without T
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              const offset = parsedDate.getTimezoneOffset();
              const adjustedDate = new Date(parsedDate.getTime() - (offset * 60 * 1000));
              patchData.vendor_RegistrationDate = adjustedDate.toISOString().split('T')[0];
            }
          }
        }

        if (patchData.vendor_ContractStartDate && patchData.vendor_ContractStartDate.includes('T')) {
          patchData.vendor_ContractStartDate = patchData.vendor_ContractStartDate.split('T')[0];
        }
        if (patchData.vendor_ContractEndDate && patchData.vendor_ContractEndDate.includes('T')) {
          patchData.vendor_ContractEndDate = patchData.vendor_ContractEndDate.split('T')[0];
        }

        if (patchData.vendor_Location) {
          patchData.vendor_Location = patchData.vendor_Location.split(',').map((id: string) => id.trim());
        } else {
          patchData.vendor_Location = [];
        }

        if (patchData.vendor_Services) {
          patchData.vendor_Services = patchData.vendor_Services
            .split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id && id !== '__select_all__');
          this.selectedServices = [...patchData.vendor_Services];
        } else {
          patchData.vendor_Services = [];
          this.selectedServices = [];
        }

        // Load cities for states
        if (d.vendor_FKStateId || d.Vendor_FKStateId) {
          this.vendorLiteService.getCitiesByState(d.vendor_FKStateId || d.Vendor_FKStateId).subscribe(c => {
            if (c?.isSuccess) this.cityList = c.data;
            this.vendorForm.patchValue({ vendor_FKCityId: d.vendor_FKCityId || d.Vendor_FKCityId });
          });
        }
        if (d.vendor_FKPermStateId || d.Vendor_FKPermStateId) {
          this.vendorLiteService.getCitiesByState(d.vendor_FKPermStateId || d.Vendor_FKPermStateId).subscribe(c => {
            if (c?.isSuccess) this.permCityList = c.data;
            this.vendorForm.patchValue({ vendor_FKPermCityId: d.vendor_FKPermCityId || d.Vendor_FKPermCityId });
          });
        }

        this.vendorForm.patchValue(patchData);
      }
    });
  }

  // ── TAB 2: DOCUMENT UPLOAD ────────────────────────────────────────────────

  onDropFiles(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFilesSelected(event: any): void {
    if (event.target.files) {
      this.addFiles(Array.from(event.target.files));
    }
    // reset input so same file can be selected again if removed
    event.target.value = '';
  }

  addFiles(files: File[]): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    files.forEach(f => {
      if (f.size > maxSize) {
        this.toastr.warning(`File ${f.name} is too large. Max 5MB.`);
      } else if (!allowedTypes.includes(f.type)) {
        this.toastr.warning(`File ${f.name} has invalid format.`);
      } else {
        // Prevent duplicate selection
        if (!this.selectedFiles.some(existing => existing.name === f.name && existing.size === f.size)) {
          this.selectedFiles.push(f);
        }
      }
    });
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  uploadAllFiles(): void {
    if (!this.vendorId) {
      this.toastr.error('Vendor ID is missing. Please save vendor details first.');
      return;
    }
    if (!this.selectedDocTypeCodeId) {
      this.toastr.warning('Please select a Document Type.');
      return;
    }
    if (this.selectedFiles.length === 0) return;

    const docTypeObj = this.vendorDocumentTypeList.find(x => x.codeId === this.selectedDocTypeCodeId || x.value === this.selectedDocTypeCodeId);
    const docTypeName = docTypeObj?.name || docTypeObj?.codeDescription || '';

    const formData = new FormData();
    formData.append('vendorId', this.vendorId);
    formData.append('docTypeCodeId', this.selectedDocTypeCodeId.toString());
    formData.append('docTypeName', docTypeName);

    this.selectedFiles.forEach((f, index) => {
      formData.append('files', f);
      formData.append('docIndices', (index + 1).toString());
    });

    this.isUploading = true;
    this.vendorLiteService.uploadVendorDocuments(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Documents uploaded successfully.');
          this.selectedFiles = [];
          this.selectedDocTypeCodeId = null;
          this.loadUploadedDocuments();
        } else {
          this.toastr.error(res.message || 'Failed to upload documents.');
        }
        this.isUploading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Error occurred during upload.');
        this.isUploading = false;
      }
    });
  }

  loadUploadedDocuments(): void {
    if (!this.vendorId) return;
    this.vendorLiteService.getVendorDocuments(this.vendorId).subscribe(res => {
      if (res?.isSuccess) {
        this.uploadedDocuments = res.data || [];
      }
    });
  }

  deleteDocument(pk_docId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.vendorLiteService.deleteVendorDocument(pk_docId).subscribe(res => {
        if (res?.isSuccess) {
          this.toastr.success('Document deleted successfully.');
          this.loadUploadedDocuments();
        } else {
          this.toastr.error(res?.message || 'Failed to delete document.');
        }
      });
    }
  }

  viewDocument(doc: any): void {
    if (!doc || !doc.pk_docId) return;

    this.selectedDocument = doc;
    this.ngxUILoaderService.start();

    this.vendorLiteService.downloadVendorDocumentBlob(doc.pk_docId).subscribe({
      next: (response: Blob) => {
        this.ngxUILoaderService.stop();
        if (!response) {
          this.toastr.error("File not received");
          return;
        }

        const blob = new Blob([response], { type: response.type });
        const blobUrl = window.URL.createObjectURL(blob); // Removed toolbar=0 to allow zoom controls

        const extension = doc.originalFileName ? doc.originalFileName.split('.').pop()?.toLowerCase() : '';

        if (extension === 'doc' || extension === 'docx') {
          // Direct download for Word documents
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = doc.originalFileName || `document.${extension}`;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.toastr.success('Document downloaded successfully.');
        } else {
          // View in modal for PDFs/Images
          this.selectedDocument.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

          const modalElement = document.getElementById('viewDocumentModal');
          if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
          }
        }
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        this.toastr.error('Failed to load document.', 'Error');
        console.error(err);
      }
    });
  }

  switchTab(tabId: number): void {
    if (tabId === 2 && !this.vendorId) {
      this.toastr.warning('Please save vendor details first before uploading documents.');
      return;
    }
    this.activeTab = tabId;
  }
}
