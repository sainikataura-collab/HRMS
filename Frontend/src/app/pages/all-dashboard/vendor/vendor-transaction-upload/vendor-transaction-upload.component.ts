import { FactBoxComponent } from '../shared/fact-box/fact-box.component';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import { VendorService } from '../Service/vendor.service';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-vendor-transaction-upload',
  standalone: true,
  imports: [FactBoxComponent, CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './vendor-transaction-upload.component.html',
  styleUrls: ['./vendor-transaction-upload.component.scss']
})
export class VendorTransactionUploadComponent implements OnInit {
  transactionForm!: FormGroup;
  selectedFile: File | undefined;

  // Search & Filtering
  searchControl = new FormControl('');
  searchText = '';
  importedData: any[] = [];
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  // Dropdown options
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];

  // Excel Preview & Upload Results
  previewData: any[] = [];
  previewKeys: string[] = [];
  formulaMap: any = {};

  // Fact Box Sidebar state
  isFactBoxOpen: boolean = true;
  uploadedFiles: any[] = [];
  isLoadingFiles: boolean = false;
  factBoxPageIndex: number = 1;
  factBoxPageSize: number = 4;
  missingColumns: string[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private loader: NgxUiLoaderService,
    private vendorService: VendorService,
    private clientService: ClientMasterService,
    private commanService: ManualPunchBio,
    private dropdownService: DropdownService
  ) { }
  ngOnInit(): void {
    this.initForm();
    this.getCostCenterList();
    this.loadLocations();
    this.filterModelsByClient(0);
    this.loadUploadedFiles();

    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    });
  }

  isFiltering: boolean = false;

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    if (this.currentFilter === filter) return;
    this.currentFilter = filter;
    this.isFiltering = true;

    setTimeout(() => {
      this.filterData();
      this.isFiltering = false;
    }, 10);
  }

  filterData(): void {
    this.uploadedCount = this.importedData.filter(item => 
      item.status === 'Updated' || item.status === 'Uploaded' || item.Status === 'Inserted' || item.status === 'Inserted'
    ).length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      const isSuccess = item.status === 'Updated' || item.status === 'Uploaded' || item.Status === 'Inserted' || item.status === 'Inserted';
      if (this.currentFilter === 'Uploaded') {
        matchesStatus = isSuccess;
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesStatus = !isSuccess;
      }

      return matchesSearch && matchesStatus;
    });
  }

  private initForm(): void {
    this.transactionForm = this.fb.group({
      client: [null, Validators.required],
      model: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      file: [null, Validators.required]
    });

    // When Client changes, filter Model dropdown based on Client's mapped models
    this.transactionForm.get('client')?.valueChanges.subscribe((clientId: any) => {
      this.transactionForm.get('model')?.setValue(null);
      this.resetResults();
      this.filterModelsByClient(clientId || 0);
    });

    // Re-evaluate headers when model changes
    this.transactionForm.get('model')?.valueChanges.subscribe((model: any) => {
      const selectedClient = this.transactionForm.get('client')?.value;
      if (this.selectedFile && selectedClient) {
        this.parseAndValidateFile(this.selectedFile, selectedClient, model);
      }
    });
  }

  private filterModelsByClient(clientId: any = 0): void {
    const costCentreId = clientId ? (typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId) : 0;

    this.clientService.getModelListByClient(costCentreId || 0).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.modelList = res.data;
        } else {
          this.modelList = [];
        }
      },
      error: () => {
        this.modelList = [];
      }
    });
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.clientList = [
          ...res.data.slice(1)
        ];
      }
    });
  }

  loadLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        this.locationList = data || [];
      },
      error: () => {
        this.locationList = [];
      }
    });
  }

  isModelMappedToClient(clientInput: any, modelInput: any): boolean {
    if (!clientInput || !modelInput) return false;
    const modelIdStr = typeof modelInput === 'object' ? String(modelInput?.value || modelInput?.id || '') : String(modelInput).trim();
    const modelNameStr = this.getModelName(modelInput).toLowerCase().trim();
    if (!this.modelList || this.modelList.length === 0) return false;

    return this.modelList.some((m: any) =>
      String(m.value) === modelIdStr ||
      String(m.id) === modelIdStr ||
      String(m.codeId) === modelIdStr ||
      (m.name && String(m.name).toLowerCase().trim() === modelNameStr)
    );
  }

  isLocationActive(locInput: any): boolean {
    if (!locInput) return false;
    const locStr = String(locInput).toLowerCase().trim();
    if (!this.locationList || this.locationList.length === 0) return true;

    const isMatch = this.locationList.some((l: any) =>
      String(l.value || '').toLowerCase().trim() === locStr ||
      String(l.id || '').toLowerCase().trim() === locStr ||
      String(l.name || '').toLowerCase().trim() === locStr ||
      String(l.text || '').toLowerCase().trim() === locStr ||
      String(l.description || '').toLowerCase().trim() === locStr ||
      String(l.code || '').toLowerCase().trim() === locStr ||
      String(l.label || '').toLowerCase().trim() === locStr ||
      String(l.locationAlias || '').toLowerCase().trim() === locStr ||
      String(l.locname || '').toLowerCase().trim() === locStr
    );

    return isMatch || locStr.length > 0;
  }

  private getModelName(modelInput: any): string {
    if (!modelInput) return '';
    let name = '';
    if (typeof modelInput === 'object') {
      name = modelInput.name || modelInput.text || modelInput.codeDescription || modelInput.value || '';
    } else {
      const strInput = String(modelInput).trim();
      if (this.modelList && this.modelList.length > 0) {
        const found = this.modelList.find((m: any) =>
          String(m.value) === strInput ||
          String(m.id) === strInput ||
          String(m.codeId) === strInput ||
          (m.name && String(m.name).toUpperCase() === strInput.toUpperCase())
        );
        if (found) {
          name = found.name || found.text || found.codeDescription || found.value || strInput;
        } else {
          name = strInput;
        }
      } else {
        name = strInput;
      }
    }
    if (name.includes(':')) {
      name = name.split(':')[0].trim();
    }
    return name;
  }

  getActiveRateFields(clientInput: any, modelInput: any): { key: string; label: string }[] {
    const clientName = this.getClientName(clientInput).toLowerCase().trim();
    const modelName = this.getModelName(modelInput).toLowerCase().trim();

    if (!clientName || !modelName) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'MFN', label: 'MFN Rate' },
        { key: 'Van', label: 'Van Rate' },
        { key: 'U2S', label: 'U2S Rate' },
        { key: 'Shopsy', label: 'Shopsy Rate' },
        { key: 'Prexo', label: 'Prexo Rate' },
        { key: 'Grocery', label: 'Grocery Rate' }
      ];
    }

    if (clientName.includes('healthkart')) {
      return [
        { key: 'Normal', label: 'Normal Rate' }
      ];
    }
    
    if (clientName.includes('meesho')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' }
      ];
    }

    // 1. Flipkart / Large Model -> Normal Rate
    if (modelName.includes('large')) {
      return [
        { key: 'Normal', label: 'Normal Rate' }
      ];
    }

    // 2. Flipkart / ODH-MDH Model -> Normal, Shopsy, U2S, Prexo, Grocery
    if (modelName.includes('odh') || modelName.includes('mdh')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Shopsy', label: 'Shopsy Rate' },
        { key: 'U2S', label: 'U2S Rate' },
        { key: 'Prexo', label: 'Prexo Rate' },
        { key: 'Grocery', label: 'Grocery Rate' }
      ];
    }

    // 3. Flipkart + XRM -> Normal, Pickup
    if (clientName.includes('flipkart') && modelName.includes('xrm')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' }
      ];
    }

    //// 2. Flipkart + ODH-MDH -> Exclude Pickup and MFN Rate
    if (clientName.includes('flipkart') && modelName.includes('odh-mdh')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'U2S', label: 'U2S Rate' },
        { key: 'Shopsy Deduction', label: 'Shopsy Deduction Rate' },
        { key: 'Prexo', label: 'Prexo Rate' },
        { key: 'Grocery', label: 'Grocery Rate' }
      ];
    }



    // 4. Flipkart + FM / Variable -> Normal
    if (clientName.includes('flipkart') && (modelName.includes('fm') || modelName.includes('variable'))) {
      return [
        { key: 'Normal', label: 'Normal Rate' }
      ];
    }

    // 5. Airtel + FSE -> Normal
    

    if (clientName.includes('ebees') || clientName.includes('xbees')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' }
      ];
    }

    if (clientName.includes('airtel') && modelName.includes('fse')) {
      return [
        { key: 'Normal', label: 'Normal Rate' }
      ];
    }

    // 6. Shiprocket + Variable / Shiprocket -> Normal
    if (clientName.includes('shiprocket') && (modelName.includes('shiprocket') || modelName.includes('variable'))) {
      return [
        { key: 'Normal', label: 'Normal Rate' }
      ];
    }

    // 7. Ecom Express / Ebbes + Variable / Ebbes -> Normal, Pickup
    if (
      (clientName.includes('ecom') || clientName.includes('ebbes') || clientName.includes('ebees')) &&
      (modelName.includes('ebbes') || modelName.includes('ebees') || modelName.includes('variable'))
    ) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' }
      ];
    }

    // 8. Amazon + DSP -> Normal, Pickup, MFN, Van
    if (clientName.includes('amazon') && (modelName === 'dsp' || (modelName.includes('dsp') && !modelName.includes('edsp')))) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'MFN', label: 'MFN Rate' },
        { key: 'Van', label: 'Van Rate' }
      ];
    }

    // 9. Amazon + EDSP -> Normal, Pickup, MFN
    if (clientName.includes('amazon') && modelName.includes('edsp')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'MFN', label: 'MFN Rate' }
      ];
    }

    // 10. BlueDart + Variable(b) -> Normal
    if (
      (clientName.includes('bluedart') || clientName.includes('blue dart')) &&
      (modelName.includes('variable') || modelName.includes('(b)') || modelName.includes('b'))
    ) {
      return [
        { key: 'Normal', label: 'Normal Rate' }
      ];
    }

    // Default: Return all rate fields
    return [
      { key: 'Normal', label: 'Normal Rate' },
      { key: 'Pickup', label: 'Pickup Rate' },
      { key: 'MFN', label: 'MFN Rate' },
      { key: 'Van', label: 'Van Rate' },
      { key: 'U2S', label: 'U2S Rate' },
      { key: 'Shopsy', label: 'Shopsy Rate' },
      { key: 'Prexo', label: 'Prexo Rate' },
      { key: 'Grocery', label: 'Grocery Rate' }
    ];
  }

  getDynamicColumnsForModel(clientInput: any, modelInput: any): string[] {
    const fields = this.getActiveRateFields(clientInput, modelInput);
    const cols: string[] = [];
    fields.forEach(f => {
      cols.push(f.label);
      cols.push(`${f.key} Rate Type`);
    });
    return cols;
  }

    getExpectedHeaders(clientInput: any, modelInput: any): string[] {
    const clientName = this.getClientName(clientInput).toLowerCase();
    const modelName = this.getModelName(modelInput).toLowerCase();

    if (clientName.includes('healthkart')) {
      return [
        'Code', 'Name', 'Location', 'FHRID', 'AreaManager', 'Hub code',
        'Sum of Total OFD', 'Sum of Total Delivered', 'Shipment Deduction',
        'COD Deduction', 'Other Deduction', 'Arrear Amt', 'Insurance', 'SD', 'Welfare'
      ];
    }

    if (clientName.includes('meesho')) {
      return [
        'Code', 'Name', 'Location', 'FHRID', 'AreaManager', 'Hub code', 
        'Total OFD', 'Total Delivered', 'Pickup Assign', 'Pickup Done', 
        'Shipment Loss Deduction', 'COD Deduction', 'Other Deduction', 
        'Arrear Amt', 'Insurance', 'Hold', 'Karma Life', 'Welfare Deduction'
      ]; 
    }

    if (clientName.includes('flipkart') && modelName.includes('odh-mdh')) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code',
        'No. of Days', 'SR LM Return', 'SR FM Return', 'Assign RVP+Normal',
        'Total Delivered+RVP+Shopsy', 'U2S', 'Shopsy', 'Prexo',
        'Grocery Assigned', 'Grocery Delivered', 'Shipment Deduction',
        'COD Deduction', 'Other Deduction', 'Rent Deduction', 'Advance Deduction',
        'Hold', 'Karma Life Deduction', 'Arrear', 'SD', 'TNT Deduction', 'Welfare Deduction'
      ];
    }

    if (clientName.includes('amazon') && modelName.includes('dsp') && !modelName.includes('edsp')) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code', 'Route', 'Vehicle Type',
        'Total OFD', 'Total Delivered', 'Pickup Assign', 'Pickup Done',
        'MFN Assign', 'MFN Done', 'PresentDays', 'SC',
        'Shipment Deduction', 'COD Deduction', 'Other Deduction', 'Arrear',
        'Hold', 'Karmalife Deduction', 'Welfare Deduction', 'Advance Deduction'
      ];
    }

    if (clientName.includes('amazon') && modelName.includes('edsp')) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code', 'Vehicle Type',
        'Total OFD', 'Total Delivered', 'Pickup Assign', 'Pickup Done',
        'MFN Assign', 'MFN Done',
        'Shipment Deduction', 'COD Deduction', 'Other Deduction', 'Arrear',
        'Hold', 'Karmalife Deduction', 'Welfare Deduction'
      ];
    }

    if (clientName.includes('bluedart') && (modelName.includes('variable') || modelName.includes('b'))) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code',
        'Total Assigned', 'Total Delivered', 'Shipment Deduction',
        'COD Deduction', 'Other Deduction', 'Hold', 'Arrear Amt', 'SD'
      ];
    }

    if (clientName.includes('ebees') || clientName.includes('xbees')) {
      return [
        'Code',
        'Name',
        'Location',
        'AreaManager',
        'Hub code',
        'OFD',
        'Delivered',
        'Pickup Assign',
        'Pickup Done',
        'RTO Assign',    // NEW
        'RTO Done',      // NEW
        'DTO Assign',    // NEW
        'DTO Done',      // NEW
        'FM Assign',     // NEW
        'FM Done',       // NEW
        'Deduction',
        'COD Deduction',
        'Other Deduction'
      ];
    }

    if (clientName.includes('airtel') && modelName.includes('fse')) {
      return [
        'Code',
        'Name',
        'Location',
        'AreaManager',
        'Hub code',
        'Over System Pickup Count',
        'FSE System Pickup Count',
        'Deduction',
        'COD Deduction',
        'Other Deduction',
        'Arrear Amt',
        'Insurance',
        'SD',
        'Welfare'
      ];
    }

    if (clientName.includes('flipkart') && (modelName.includes('fm') || modelName.includes('variable'))) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code',
        'Assigned FM', 'Delivered FM', 'Assigned RVP', 'Delivered RVP',
        'Shipment Deduction', 'COD Deduction', 'Other Deduction', 'Arrear', 'Hold'
      ];
    }

    if (clientName.includes('flipkart') && modelName.includes('xrm')) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code',
        'Total OFD', 'Total Delivered', 'Pickup Assign', 'Pickup Done',
        'Deduction', 'COD Deduction', 'Other Deduction', 'Arrear Amt',
        'Insurance', 'Hold', 'Karma Life', 'Welfare Deduction'
      ];
    }

    if (clientName.includes('flipkart') && modelName.includes('large')) {
      return [
        'Code', 'Name', 'Location', 'AreaManager', 'Hub code',
        'Vehicle Type', 'Working Days', 'Delivered Count', 'Shipment Deduction',
        'COD Deduction', 'Other Deduction', 'Arrear', 'Hold',
        'KarmaLife Deduction', 'Welfare Deduction'
      ];
    }

    return [
      'Code',
      'Name',
      'Location',
      'AreaManager',
      'Hub code',
      'Sum of Total OFD',
      'Sum of Total Delivered',
      'Shipment Deduction',
      'COD Deduction',
      'Other Deduction',
      'Arrear Amt',
      'Insurance',
      'SD',
      'Welfare'
    ];
  }

  private getClientName(clientInput: any): string {
    if (!clientInput) return '';
    if (typeof clientInput === 'object') {
      return clientInput.text || clientInput.name || clientInput.description || clientInput.value || '';
    }
    const strInput = String(clientInput).trim();
    if (this.clientList && this.clientList.length > 0) {
      const found = this.clientList.find((c: any) =>
        String(c.value) === strInput ||
        String(c.id) === strInput ||
        (c.text && String(c.text).toUpperCase() === strInput.toUpperCase())
      );
      if (found) {
        return found.text || found.name || found.description || found.value || strInput;
      }
    }
    return strInput || '';
  }

    downloadTemplate(): void {
    const selectedClientVal = this.transactionForm.get('client')?.value;
    if (!selectedClientVal) {
      this.toastrService.warning('Please select a Client first.');
      return;
    }

    const selectedModelVal = this.transactionForm.get('model')?.value;
    if (!selectedModelVal) {
      this.toastrService.warning('Please select a Model first.');
      return;
    }

    const selectedClientName = this.getClientName(selectedClientVal);
    const selectedModelName = this.getModelName(selectedModelVal);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year4Digit = String(now.getFullYear());

    const cleanClientName = selectedClientName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const cleanModelName = selectedModelName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const fileDate = day + '_' + month + '_' + year4Digit;
    const fileName = `Transaction_Upload_Template_${cleanClientName}_${cleanModelName}_${fileDate}.xlsx`;

    this.loader.start();
    this.vendorService.downloadTransactionTemplate(selectedClientVal, selectedModelVal).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        FileSaver.saveAs(blob, fileName);
      },
      error: () => {
        this.loader.stop();
        this.toastrService.error('Failed to download template from server.');
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.selectedFile = file;
        this.transactionForm.get('file')?.setValue(file);
        const selectedClient = this.transactionForm.get('client')?.value;
        const selectedModel = this.transactionForm.get('model')?.value;
        this.parseAndValidateFile(file, selectedClient, selectedModel);
      } else {
        this.transactionForm.get('file')?.setErrors({ pattern: true });
        this.selectedFile = undefined;
        this.resetResults();
      }
    }
  }

  private parseAndValidateFile(file: File, clientVal: any, modelVal: any): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          this.toastrService.warning('Uploaded Excel file is empty.');
          this.previewData = [];
          this.previewKeys = [];
          return;
        }

        this.previewData = rawJson;
        this.previewKeys = Object.keys(rawJson[0] || {});

        const clientName = this.getClientName(clientVal);
        const modelName = this.getModelName(modelVal);

        if (clientVal && modelVal) {
          if (!this.isModelMappedToClient(clientVal, modelVal)) {
            this.toastrService.warning(`Selected Model [${modelName}] is not mapped to Client [${clientName}].`);
          }

          const isLarge = modelName.toLowerCase().includes('large');
          const expectedHeaders = this.getExpectedHeaders(clientVal, modelVal);
          const lowerKeys = this.previewKeys.map(k => k.toLowerCase().trim().replace(/[\_\s]+/g, ''));

          this.missingColumns = expectedHeaders.filter(col => {
            const normalizedCol = col.toLowerCase().trim().replace(/[\_\s]+/g, '');
            return !lowerKeys.includes(normalizedCol);
          });

          if (this.missingColumns.length > 0) {
            this.toastrService.error(`Excel missing mandatory column(s): ${this.missingColumns.join(', ')}`);
          } else {
            this.toastrService.success(`Excel layout verified for Client [${clientName}] & Model [${modelName}].`);
          }
        }
      } catch (err) {
        this.toastrService.error('Failed to parse Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  isUploading: boolean = false;

  uploadTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      this.toastrService.warning('Please select Client, Model and Excel file.');
      return;
    }

    if (!this.selectedFile) {
      this.toastrService.warning('Please select a valid Excel file to upload.');
      return;
    }

    const selectedClient = this.transactionForm.get('client')?.value;
    const selectedModel = this.transactionForm.get('model')?.value;

    if (!this.isModelMappedToClient(selectedClient, selectedModel)) {
      const clientName = this.getClientName(selectedClient);
      const modelName = this.getModelName(selectedModel);
      this.toastrService.error(`Selected Model [${modelName}] is not mapped to Client [${clientName}]. Please select a valid Model.`);
      return;
    }




    if (this.previewData && this.previewData.length > 0) {
      for (let i = 0; i < this.previewData.length; i++) {
        const row = this.previewData[i];
        const rowNum = i + 1;

        // 1. Location check
        const locVal = (row['Location'] || row['location'] || row['LocationName'] || '').toString().trim();
        if (!locVal) {
          this.toastrService.error(`Row ${rowNum}: Location is required in Excel.`);
          return;
        }
        if (!this.isLocationActive(locVal)) {
          this.toastrService.error(`Validation Failed (Row ${rowNum}): Location [${locVal}] in Excel is inactive or invalid. Must be an active location.`);
          return;
        }
      }
    }

    if (this.missingColumns.length > 0) {
      this.toastrService.error(`Cannot submit. Missing required column(s): ${this.missingColumns.join(', ')}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('clientId', this.transactionForm.value.client);
    formData.append('modelId', this.transactionForm.value.model);
    formData.append('fromDate', this.transactionForm.value.fromDate);
    formData.append('toDate', this.transactionForm.value.toDate);

    this.isUploading = true;
    this.importedData = [];

    this.vendorService.transactionExcelUpload(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        if (res && res.isSuccess) {
          this.toastrService.success(res.message || 'Transaction file uploaded successfully!');
          this.formulaMap = res.dataObj || {};
          this.processUploadResults(res.data || []);
          this.resetFileOnly();
          this.loadUploadedFiles();
        } else {
          this.toastrService.error(res?.message || 'Rate card processing failed.');
          if (res?.data) {
            this.formulaMap = res.dataObj || {};
            this.processUploadResults(res.data);
          }
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        const errMessage = err?.error?.message || err?.message || 'Server error occurred while uploading Rate Card.';
        this.toastrService.error(errMessage);
      }
    });
  }

  private formatHeaderName(key: string): string {
    const map: { [k: string]: string } = {
      'client_name': 'Client Name',
      'model': 'Model Name',
      'locationid': 'Location',
      'location': 'Location',
      'fhrid': 'FHRID',
      'vendor_hfrid': 'FHRID',
      'effectivefrom': 'Effective From',
      'vehicletype': 'Vehicle Type',
      'vehicle_type': 'Vehicle Type',
      'large_vehicletypename': 'Vehicle Type',
      'large_vehicletypeid': 'Vehicle Type',
      'vehicletypename': 'Vehicle Type',
      'normal_rate': 'Normal Rate',
      'normal_ratetype': 'Normal Rate Type',
      'normal_slabexpr': 'Normal Slab Expr',
      'pickup_rate': 'Pickup Rate',
      'pickup_ratetype': 'Pickup Rate Type',
      'pickup_slabexpr': 'Pickup Slab Expr',
      'mfn_rate': 'MFN Rate',
      'mfn_ratetype': 'MFN Rate Type',
      'mfn_slabexpr': 'MFN Slab Expr',
      'van_rate': 'Van Rate',
      'van_ratetype': 'Van Rate Type',
      'van_slabexpr': 'Van Slab Expr',
      'u2s_rate': 'U2S Rate',
      'u2s_ratetype': 'U2S Rate Type',
      'u2s_slabexpr': 'U2S Slab Expr',
      'shopsy_deduction_rate': 'Shopsy Deduction Rate',
      'shopsy_ratetype': 'Shopsy Rate Type',
      'shopsy_slabexpr': 'Shopsy Slab Expr',
      'prexo_rate': 'Prexo Rate',
      'prexo_ratetype': 'Prexo Rate Type',
      'prexo_slabexpr': 'Prexo Slab Expr',
      'grocery_rate': 'Grocery Rate',
      'grocery_ratetype': 'Grocery Rate Type',
      'grocery_slabexpr': 'Grocery Slab Expr',
      'source': 'Source',
      'filepath': 'File Path',
      'remarks': 'Remarks',
      'status': 'Status',
      'applied_rate': 'Applied_Rate',
      'rate_type': 'Rate_Type'
    };
    const lowerKey = key.toLowerCase();
    if (map[lowerKey]) return map[lowerKey];

    if (key.includes(' ') || key.includes('%') || key === 'SC' || key === 'totalPayable' || key === 'net payable') {
      return key;
    }

    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private processUploadResults(rows: any[]): void {
    if (!rows || rows.length === 0) {
      this.importedData = [];
      this.filteredData = [];
      this.previewKeys = [];
      return;
    }

    const excludeKeys = new Set([
      'totalrows', 'totalrecords', 'transactionid', 'uploadbatchid', 'fk_cost_centre_id', 'fk_model_id', 'fk_rec_id', 
      'clientid', 'modelid', 'locationid', 'createdby', 'createddate', 'isprocessed', 'fk_file_id', 'fhrid', 
      'fromdate', 'todate', 'cyclename', 'budgetarycode', 'statename', 'payment_status', 'payment status', 
      'hr_remark', 'hr remark', 'central_remark', 'central remark', 'transactionrange', 'uploadedbyname'
    ]);

    this.importedData = rows.map((r) => {
      const mappedRow: any = {};

      const statusVal = r.status || r.Status || 'Updated';
      mappedRow['status'] = statusVal;
      mappedRow['Status'] = statusVal;

      Object.keys(r).forEach((rawKey) => {
        const normKey = rawKey.toLowerCase().trim();
        if (normKey === 'status' || normKey.includes('fkclientid') || normKey.includes('fkmodelid') || 
            normKey.startsWith('fk_') || normKey.startsWith('pk_') || normKey === 'rowid' || 
            excludeKeys.has(normKey)) {
          return;
        }

        const headerName = this.formatHeaderName(rawKey);
        mappedRow[headerName] = r[rawKey];
      });

      return mappedRow;
    });

    if (this.importedData.length > 0) {
      const firstRow = this.importedData[0];
      const keys = Object.keys(firstRow).filter(k => k !== 'status' && k !== 'Status');
      
      const hasRemarks = keys.includes('Remarks');
      const otherKeys = keys.filter(k => k !== 'Remarks');
      this.previewKeys = hasRemarks ? ['Remarks', ...otherKeys] : otherKeys;
    }

    this.filterData();
  }

  downloadExcelList(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.toastrService.warning('No data available to export.');
      return;
    }

    const exportData = this.filteredData.map(row => {
      const exportRow: any = {};
      exportRow['Status'] = row.status || row.Status || 'Updated';

      this.previewKeys.forEach(key => {
        exportRow[key] = row[key];
      });

      return exportRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
     // --- ADD THIS BLOCK FOR AUTO-SIZING THE EXPORTED LIST ---
    if (exportData.length > 0) {
      const keys = Object.keys(exportData[0]);
      worksheet['!cols'] = keys.map(key => {
        const maxLen = Math.max(
          key.length, 
          ...exportData.map(row => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxLen + 5 }; // +5 for padding
      });
    }
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Transactions': worksheet },
      SheetNames: ['Transactions']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const selectedModelVal = this.transactionForm.get('model')?.value;
    const selectedModelName = selectedModelVal ? this.getModelName(selectedModelVal) : 'List';
    FileSaver.saveAs(data, `Transaction_List_${selectedModelName}.xlsx`);
  }

  resetFileOnly(): void {
    this.selectedFile = undefined;
    this.transactionForm.get('file')?.reset();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  resetResults(): void {
    this.previewData = [];
    this.previewKeys = [];
    this.missingColumns = [];
    this.importedData = [];
    this.filteredData = [];
    this.resetFileOnly();
  }

  resetForm(): void {
    this.transactionForm.reset();
    this.filterModelsByClient(0);
    this.resetResults();
    this.toastrService.info('Form cleared.');
  }


  /**
   * Fact Box: Toggle visibility
   */
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  /**
   * Fact Box: Load uploaded file history sorted descending by date
   */
  loadUploadedFiles(): void {
    this.isLoadingFiles = true;
    this.vendorService.getTransactionUploadedFiles().subscribe({
      next: (res: any) => {
        this.isLoadingFiles = false;
        if (res && res.isSuccess && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
          this.uploadedFiles = list.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.Date).getTime();
            const dateB = new Date(b.date || b.Date).getTime();
            return dateB - dateA;
          });
        } else if (Array.isArray(res)) {
          this.uploadedFiles = res.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.Date).getTime();
            const dateB = new Date(b.date || b.Date).getTime();
            return dateB - dateA;
          });
        } else {
          this.uploadedFiles = [];
        }
      },
      error: (err: any) => {
        this.isLoadingFiles = false;
        console.error('Error loading uploaded files for fact box:', err);
      }
    });
  }

  /**
   * Fact Box: Download uploaded original file
   */
    downloadUploadedFile(fileItem: any): void {
    const fileId = fileItem?.id || fileItem?.Id;
    const fileName = fileItem?.name || fileItem?.Name;
    if (!fileId) return;

    this.loader.start();
    this.vendorService.downloadTransactionFile(fileId).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        FileSaver.saveAs(blob, fileName);
        this.toastrService.success(`Downloaded ${fileName}`);
      },
      error: (err: any) => {
        this.loader.stop();
        console.error('Error downloading file:', err);
        this.toastrService.error('Failed to download file. Please check if the file exists on the server.');
      }
    });
  }

  /**
   * Fact Box: Resolve uploader display name
   */
  getUploaderDisplayName(fileItem: any): string {
    const raw = fileItem?.uploadedBy || fileItem?.UploadedBy;
    if (!raw) return '';

    const currentUserName = sessionStorage.getItem('username') || localStorage.getItem('username') || '';
    const currentUserId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';

    if (currentUserName && (raw === currentUserId || raw.startsWith('GU-') || raw.startsWith('USR-'))) {
      return currentUserName;
    }
    return raw;
  }

}





























