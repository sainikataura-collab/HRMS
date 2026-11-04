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
  selector: 'app-ratecard-excel-upload',
  standalone: true,
  imports: [FactBoxComponent, CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './ratecard-excel-upload.component.html',
  styleUrls: ['./ratecard-excel-upload.component.scss']
})
export class RatecardExcelUploadComponent implements OnInit {
  rateCardForm!: FormGroup;
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
  missingColumns: string[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Fact Box Sidebar state
  isFactBoxOpen: boolean = true;
  uploadedFiles: any[] = [];
  isLoadingFiles: boolean = false;
  factBoxPageIndex: number = 1;
  factBoxPageSize: number = 4;

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
    this.rateCardForm = this.fb.group({
      client: [null, Validators.required],
      model: [null, Validators.required],
      file: [null, Validators.required]
    });

    // When Client changes, filter Model dropdown based on Client's mapped models
    this.rateCardForm.get('client')?.valueChanges.subscribe((clientId: any) => {
      this.rateCardForm.get('model')?.setValue(null);
      this.resetResults();
      this.filterModelsByClient(clientId || 0);
    });

    // Re-evaluate headers when model changes
    this.rateCardForm.get('model')?.valueChanges.subscribe((model: any) => {
      const selectedClient = this.rateCardForm.get('client')?.value;
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
        { key: 'Grocery', label: 'Grocery Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 1. Flipkart / Large Model -> Normal Rate
    if (modelName.includes('large')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 2. Flipkart / ODH-MDH Model -> Normal, Shopsy, U2S, Prexo, Grocery
    if (modelName.includes('odh') || modelName.includes('mdh')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Shopsy', label: 'Shopsy Rate' },
        { key: 'U2S', label: 'U2S Rate' },
        { key: 'Prexo', label: 'Prexo Rate' },
        { key: 'Grocery', label: 'Grocery Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 3. Flipkart + XRM -> Normal, Pickup
    if (clientName.includes('flipkart') && modelName.includes('xrm')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    //// 2. Flipkart + ODH-MDH -> Exclude Pickup and MFN Rate
    //commented by aryan on 6oct starts
    // if (clientName.includes('flipkart') && modelName.includes('odh-mdh')) {
    //   return [
    //     { key: 'Normal', label: 'Normal Rate' },
    //     { key: 'U2S', label: 'U2S Rate' },
    //     { key: 'Shopsy Deduction', label: 'Shopsy Deduction Rate' },
    //     { key: 'Prexo', label: 'Prexo Rate' },
    //     { key: 'Grocery', label: 'Grocery Rate' }
    //   ];
    // }
    //commented by aryan on 6oct ends


    // 4. Flipkart + FM / Variable -> Normal
    if (clientName.includes('flipkart') && (modelName.includes('fm') || modelName.includes('variable'))) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 5. Airtel + FSE -> Normal
    if (clientName.includes('airtel') && modelName.includes('fse')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 6. Shiprocket + Variable / Shiprocket -> Normal
    if (clientName.includes('shiprocket') && (modelName.includes('shiprocket') || modelName.includes('variable'))) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 7. Ecom Express / Ebbes + Variable / Ebbes -> Normal, Pickup, RTO, DTO, FM
    if (
      (clientName.includes('ecom') || clientName.includes('ebbes') || clientName.includes('ebees')) &&
      (modelName.includes('ebbes') || modelName.includes('ebees') || modelName.includes('variable'))
    ) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'Rto',    label: 'RTO Rate' },
        { key: 'Dto',    label: 'DTO Rate' },
        { key: 'Fm',     label: 'FM Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 8. Amazon + DSP -> Normal, Pickup, MFN, Van
    if (clientName.includes('amazon') && (modelName === 'dsp' || (modelName.includes('dsp') && !modelName.includes('edsp')))) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'MFN', label: 'MFN Rate' },
        { key: 'Van', label: 'Van Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 9. Amazon + EDSP -> Normal, Pickup, MFN
    if (clientName.includes('amazon') && modelName.includes('edsp')) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'MFN', label: 'MFN Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    // 10. BlueDart + Variable(b) -> Normal
    if (
      (clientName.includes('bluedart') || clientName.includes('blue dart')) &&
      (modelName.includes('variable') || modelName.includes('(b)') || modelName.includes('b'))
    ) {
      return [
        { key: 'Normal', label: 'Normal Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

    //11.healthkart
    if(clientName.includes('healthkart') && modelName.includes('variable') || modelName.includes('h') || modelName.includes('(h)')){
      return [
        {key: 'Normal', label: 'Normal Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
      ];
    }

     //12.Meesho
    if(clientName.includes('meesho') && modelName.includes('variable') || modelName.includes('m') || modelName.includes('(m)')){
      return [
        {key: 'Normal', label: 'Normal Rate' },
        { key: 'Pickup', label: 'Pickup Rate' },
        { key: 'Incentive', label: 'Incentive Rate' }
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
      { key: 'Grocery', label: 'Grocery Rate' },
      { key: 'Incentive', label: 'Incentive Rate' }
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
    const clientName = this.getClientName(clientInput).toLowerCase().trim();
    const modelName = this.getModelName(modelInput).toLowerCase().trim();
    const isLarge = modelName.includes('large');
    const isAmazonEdsp = clientName.includes('amazon') && modelName.includes('edsp');
    const baseHeaders = [
      'Client Name',
      'Model Name',
      'Location',
      ...(isLarge ? ['Large_VehicleTypeName'] : []),
      'FHRID',
      'Effective From'
    ];
    let dynamicHeaders = this.getDynamicColumnsForModel(clientInput, modelInput);
    if (isAmazonEdsp) {
      dynamicHeaders = dynamicHeaders.filter(h => h !== 'Incentive Rate' && h !== 'Incentive Rate Type');
      return [...baseHeaders, ...dynamicHeaders, 'AmazonEdsp_VehicleTypeName', 'Incentive Rate', 'Incentive Rate Type'];
    }
    return [...baseHeaders, ...dynamicHeaders];
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
    const selectedClientVal = this.rateCardForm.get('client')?.value;
    if (!selectedClientVal) {
      this.toastrService.warning('Please select a Client first.');
      return;
    }

    const selectedModelVal = this.rateCardForm.get('model')?.value;
    if (!selectedModelVal) {
      this.toastrService.warning('Please select a Model first.');
      return;
    }

    const selectedClientName = this.getClientName(selectedClientVal);
    const selectedModelName = this.getModelName(selectedModelVal);
    const headers = this.getExpectedHeaders(selectedClientVal, selectedModelVal);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year4Digit = String(now.getFullYear());
    const dateFormatted = `${year4Digit}-${month}-${day}`;

    let locName = 'Gurgaon';
    if (this.locationList && this.locationList.length > 0) {
      const firstLoc = this.locationList[0];
      locName = firstLoc.name || firstLoc.text || firstLoc.value || 'Gurgaon';
    }

    const isLarge = selectedModelName.toLowerCase().includes('large');

    // Dummy Row 1: Sample Fixed Rate
    const dummyRowFixed: string[] = [
      selectedClientName,
      selectedModelName,
      locName,
      ...(isLarge ? ['VAN'] : []),
      'FHR1001',
      dateFormatted
    ];

    // Dummy Row 2: Sample Slab Rate
    const dummyRowSlab: string[] = [
      selectedClientName,
      selectedModelName,
      locName,
      ...(isLarge ? ['Bike'] : []),
      'FHR1002',
      dateFormatted
    ];

      // Dummy Row 3: Sample Packet Slab Rate (Only for Shiprocket)
    let dummyRowPacketSlab: string[] | null = null;
    if (selectedClientName.toLowerCase().includes('shiprocket')) {
      dummyRowPacketSlab = [
        selectedClientName,
        selectedModelName,
        locName,
        ...(isLarge ? ['Bike'] : []),
        'FHR1003',
        dateFormatted
      ];
    }

    let activeFields = this.getActiveRateFields(selectedClientVal, selectedModelVal);
    const isAmazonEdsp = selectedClientName.toLowerCase().includes('amazon') && selectedModelName.toLowerCase().includes('edsp');
    if (isAmazonEdsp) {
      activeFields = activeFields.filter(f => f.key !== 'Incentive');
    }

    activeFields.forEach(f => {
      // Row 1 (Fixed)
      dummyRowFixed.push('150.00');
      dummyRowFixed.push('Fixed');

      // Row 2 (Slab)
      if (f.key === 'U2S') {
        dummyRowSlab.push('10'); // Example percentage value
        dummyRowSlab.push('Percentage');
      } else if (f.key === 'Shopsy' || f.key === 'Prexo' || f.key === 'Shopsy Deduction' || f.key === 'Incentive') {
        dummyRowSlab.push('150.00'); // Shopsy, Prexo, and Incentive are strictly Fixed
        dummyRowSlab.push('Fixed');
        if (dummyRowPacketSlab) { dummyRowPacketSlab.push('150.00'); dummyRowPacketSlab.push('Fixed'); }
      } else {
        dummyRowSlab.push('1-10:12,11-50:13,51-75:14,76-100:15');
        dummyRowSlab.push('Slab');
        if (dummyRowPacketSlab) {
          if (f.key === 'Normal') {
            dummyRowPacketSlab.push('1-30:20,31-40:23,41-50:24');
            dummyRowPacketSlab.push('Packet Slab');
          } else {
            dummyRowPacketSlab.push('1-10:12,11-50:13,51-75:14,76-100:15');
            dummyRowPacketSlab.push('Slab');
          }
        }
      }
    });

    if (isAmazonEdsp) {
      dummyRowFixed.push('VAN');
      dummyRowFixed.push('150.00');
      dummyRowFixed.push('Fixed');

      dummyRowSlab.push('Bike');
      dummyRowSlab.push('150.00');
      dummyRowSlab.push('Fixed');
    }

    // const ws = XLSX.utils.aoa_to_sheet([headers, dummyRowFixed, dummyRowSlab]);
    const sheetData = [headers, dummyRowFixed, dummyRowSlab];
    if (dummyRowPacketSlab) {
      sheetData.push(dummyRowPacketSlab);
    }
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: '0D6EFD' }
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' },
            sz: 11
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          }
        };
      }
    });

      // Replace: ws['!cols'] = headers.map(() => ({ wch: 22 }));
    // With this dynamic auto-sizing:
    ws['!cols'] = headers.map((header, colIdx) => {
      const headerLen = header ? header.toString().length : 10;
      const fixedRowLen = dummyRowFixed[colIdx] ? dummyRowFixed[colIdx].toString().length : 0;
      const slabRowLen = dummyRowSlab[colIdx] ? dummyRowSlab[colIdx].toString().length : 0;
      
      // Find the longest text in the column and add some padding (+5)
      // const maxLen = Math.max(headerLen, fixedRowLen, slabRowLen);
        const packetSlabRowLen = (dummyRowPacketSlab && dummyRowPacketSlab[colIdx]) ? dummyRowPacketSlab[colIdx].toString().length : 0;
      const maxLen = Math.max(headerLen, fixedRowLen, slabRowLen, packetSlabRowLen);
      return { wch: maxLen + 5 }; 
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RateCardTemplate');

    const cleanClientName = selectedClientName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const cleanModelName = selectedModelName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const fileDate = `${day}_${month}_${year4Digit}`;
    XLSX.writeFile(wb, `Rate_Card_Template_${cleanClientName}_${cleanModelName}_${fileDate}.xlsx`);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.selectedFile = file;
        this.rateCardForm.get('file')?.setValue(file);
        const selectedClient = this.rateCardForm.get('client')?.value;
        const selectedModel = this.rateCardForm.get('model')?.value;
        this.parseAndValidateFile(file, selectedClient, selectedModel);
      } else {
        this.rateCardForm.get('file')?.setErrors({ pattern: true });
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
          // Mandatory core identification headers
          const mandatoryBaseHeaders = [
            'Client Name',
            'Model Name',
            'Location',
            ...(isLarge ? ['Large_VehicleTypeName'] : []),
            ...(clientName.includes('amazon') && modelName.toLowerCase().includes('edsp') ? ['AmazonEdsp_VehicleTypeName'] : []),
            'FHRID',
            'Effective From'
          ];
          const lowerKeys = this.previewKeys.map(k => k.toLowerCase().trim().replace(/[\_\s]+/g, ''));

          this.missingColumns = mandatoryBaseHeaders.filter(col => {
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

  uploadRateCard(): void {
    if (this.rateCardForm.invalid) {
      this.rateCardForm.markAllAsTouched();
      this.toastrService.warning('Please select Client, Model and Excel file.');
      return;
    }

    if (!this.selectedFile) {
      this.toastrService.warning('Please select a valid Excel file to upload.');
      return;
    }

    const selectedClient = this.rateCardForm.get('client')?.value;
    const selectedModel = this.rateCardForm.get('model')?.value;

    if (!this.isModelMappedToClient(selectedClient, selectedModel)) {
      const clientName = this.getClientName(selectedClient);
      const modelName = this.getModelName(selectedModel);
      this.toastrService.error(`Selected Model [${modelName}] is not mapped to Client [${clientName}]. Please select a valid Model.`);
      return;
    }




    if (this.previewData && this.previewData.length > 0) {
      const selectedClientName = this.getClientName(selectedClient).toLowerCase().trim();
      const selectedModelName = this.getModelName(selectedModel).toLowerCase().trim();

      for (let i = 0; i < this.previewData.length; i++) {
        const row = this.previewData[i];
        const rowNum = i + 1;

        // 1. Client Name check
        const rowClient = (row['Client Name'] || row['client_name'] || row['Client'] || '').toString().toLowerCase().trim();
        if (!rowClient) {
          this.toastrService.error(`Row ${rowNum}: Client Name is required in Excel.`);
          return;
        }

        if (rowClient !== selectedClientName) {
          this.toastrService.error(`Row ${rowNum}: Client Name "${row['Client Name']}" in Excel does not match the selected Client in dropdown.`);
          return;
        }

        // 2. Model Name check
        let rowModel = (row['Model Name'] || row['model'] || row['Model'] || '').toString().trim();
        if (rowModel.includes(':')) {
          rowModel = rowModel.split(':')[0].trim();
        }
        const rowModelLower = rowModel.toLowerCase();
        if (!rowModelLower) {
          this.toastrService.error(`Row ${rowNum}: Model Name is required in Excel.`);
          return;
        }
         if (rowModelLower !== selectedModelName) {
          this.toastrService.error(`Row ${rowNum}: Model Name "${row['Model Name']}" in Excel does not match the selected Model in dropdown.`);
          return;
        }

        // 3. Location check
        const locVal = (row['Location'] || row['location'] || row['LocationID'] || row['locationid'] || '').toString().trim();
        if (!locVal) {
          this.toastrService.error(`Row ${rowNum}: Location is required in Excel.`);
          return;
        }
        if (!this.isLocationActive(locVal)) {
          this.toastrService.error(`Validation Failed (Row ${rowNum}): Location [${locVal}] in Excel is inactive or invalid. Must be an active location.`);
          return;
        }

        // 4. Vehicle Type check for Large Model
        if (selectedModelName.includes('large')) {
          const vehicleVal = (row['Vehicle Type'] || row['vehicle_type'] || row['vehicletype'] || row['Large_VehicleTypeName'] || row['VehicleType'] || '').toString().trim();
          if (!vehicleVal) {
            this.toastrService.error(`Row ${rowNum}: Vehicle Type is required for Large Model in Excel.`);
            return;
          }
        }
      }
    }

    if (this.missingColumns.length > 0) {
      this.toastrService.error(`Cannot submit. Missing required column(s): ${this.missingColumns.join(', ')}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.isUploading = true;
    this.importedData = [];

    this.vendorService.rateCardExcelUpload(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        if (res && res.isSuccess) {
          this.toastrService.success(res.message || 'Rate Card uploaded successfully!');
          this.processUploadResults(res.data || []);
          this.resetFileOnly();
          this.loadUploadedFiles();
        } else {
          this.toastrService.error(res?.message || 'Rate card processing failed.');
          if (res?.data) {
            this.processUploadResults(res.data);
            this.loadUploadedFiles();
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
      'shopsy_rate': 'Shopsy Rate',
      'shopsy_deduction_rate': 'Shopsy Deduction Rate',
      'shopsy_ratetype': 'Shopsy Rate Type',
      'shopsy_slabexpr': 'Shopsy Slab Expr',
      'prexo_rate': 'Prexo Rate',
      'prexo_ratetype': 'Prexo Rate Type',
      'prexo_slabexpr': 'Prexo Slab Expr',
      'grocery_rate': 'Grocery Rate',
      'grocery_ratetype': 'Grocery Rate Type',
      'grocery_slabexpr': 'Grocery Slab Expr',
      'rto_rate': 'RTO Rate',
      'rto_ratetype': 'RTO Rate Type',
      'rto_slabexpr': 'RTO Slab Expr',
      'dto_rate': 'DTO Rate',
      'dto_ratetype': 'DTO Rate Type',
      'dto_slabexpr': 'DTO Slab Expr',
      'fm_rate': 'FM Rate',
      'fm_ratetype': 'FM Rate Type',
      'fm_slabexpr': 'FM Slab Expr',
      'incentive_rate': 'Incentive Rate',
      'incentive_ratetype': 'Incentive Rate Type',
      'incentive_slabexpr': 'Incentive Slab Expr',
      'amazonedsp_vehicletypeid': 'Amazon EDSP Vehicle Type ID',
      'amazonedsp_vehicletypename': 'Amazon EDSP Vehicle Type',
      'source': 'Source',
      'filepath': 'File Path',
      'remarks': 'Remarks',
      'status': 'Status'
    };
    const lowerKey = key.toLowerCase();
    if (map[lowerKey]) return map[lowerKey];

    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private processUploadResults(rows: any[]): void {
    if (!rows || rows.length === 0) {
      this.importedData = [];
      this.filteredData = [];
      this.previewKeys = [];
      return;
    }

    this.importedData = rows.map((r) => {
      const mappedRow: any = {};

      const statusVal = r.status || r.Status || 'Updated';
      mappedRow['status'] = statusVal;
      mappedRow['Status'] = statusVal;

      Object.keys(r).forEach((rawKey) => {
        const normKey = rawKey.toLowerCase();
        if (normKey === 'status' || normKey.includes('fkclientid') || normKey.includes('fkmodelid') || normKey.startsWith('fk_') || normKey.startsWith('pk_') || normKey === 'rowid') {
          return;
        }

        const headerName = this.formatHeaderName(rawKey);
        mappedRow[headerName] = r[rawKey];
      });

      return mappedRow;
    });

    if (this.importedData.length > 0) {
      const firstRow = this.importedData[0];
      this.previewKeys = Object.keys(firstRow).filter(k => 
        k !== 'status' && k !== 'Status' && k !== 'Remarks' && k !== 'remarks'
      );
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

      const st = row.status || row.Status;
      const rem = row['Remarks'] || row.remarks || row.message || row.Message || '';
      if (st === 'Failed' || st === 'Error' || st === 'Not Uploaded' || (st !== 'Uploaded' && st !== 'Inserted' && st !== 'Updated')) {
        exportRow['Status / Remarks'] = `Failed - ${rem || 'Validation error'}`;
      } else if (st === 'Already Exists' || st === 'Skipped') {
        exportRow['Status / Remarks'] = 'Already Exists';
      } else {
        exportRow['Status / Remarks'] = 'Uploaded';
      }

      this.previewKeys.filter(k => k !== 'Remarks' && k !== 'remarks').forEach(key => {
        exportRow[key] = row[key];
      });

      return exportRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    if (exportData.length > 0) {
      const keys = Object.keys(exportData[0]);
      worksheet['!cols'] = keys.map(key => {
        const maxLen = Math.max(
          key.length, 
          ...exportData.map(row => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxLen + 5 };
      });
    }
    const workbook: XLSX.WorkBook = {
      Sheets: { 'RateCard': worksheet },
      SheetNames: ['RateCard']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const selectedModelVal = this.rateCardForm.get('model')?.value;
    const selectedModelName = selectedModelVal ? this.getModelName(selectedModelVal) : 'List';
    FileSaver.saveAs(data, `Rate_Card_${selectedModelName}.xlsx`);
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
    this.vendorService.getRateCardUploadedFiles().subscribe({
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
        console.error('Error loading uploaded files for rate card fact box:', err);
      }
    });
  }

  /**
   * Fact Box: Download uploaded original file
   */
  downloadUploadedFile(fileItem: any): void {
    const fileId = fileItem?.file_Id ?? fileItem?.File_Id ?? fileItem?.id ?? fileItem?.Id;
    if (!fileId) return;

    this.loader.start();
    this.vendorService.downloadRateCardFile(fileId).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        const fileName = fileItem.name || `Rate_Card_${fileId}.xlsx`;
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

  resetFileOnly(): void {
    this.selectedFile = undefined;
    this.rateCardForm.get('file')?.reset();
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
    this.rateCardForm.reset();
    this.filterModelsByClient(0);
    this.resetResults();
    this.toastrService.info('Form cleared.');
  }
}


