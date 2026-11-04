import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { VendorService } from '../Service/vendor.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CandidateMasterService } from '../../recruitment/RecruitServices/candidate-master.service';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';

import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-vendor-master-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule, NgSelectModule],
  templateUrl: './vendor-master-list.component.html',
  styles: [`
    .vendor-table th { background: #f8f9fa; font-weight: 600; }
    .agent-row { background: #f1f5f9; cursor: pointer; }
    .agent-row:hover { background: #e2e8f0; }
    .child-row td { padding-left: 20px; }

    .kpi-box {
      height: 34px;
      padding: 0 10px;
    }
    .kpi-title {
      font-size: 0.65rem;
    }
    .kpi-total-title {
      font-size: 0.68rem;
    }
    .kpi-num {
      font-size: 0.8rem;
    }

    @media (min-width: 768px) {
      .kpi-box {
        height: 38px !important;
        padding: 0 12px !important;
      }
      .kpi-title {
        font-size: 0.78rem !important;
      }
      .kpi-total-title {
        font-size: 0.82rem !important;
      }
      .kpi-num {
        font-size: 0.95rem !important;
      }
    }

    @media (min-width: 1200px) {
      .kpi-box {
        height: 42px !important;
        padding: 0 14px !important;
      }
      .kpi-title {
        font-size: 0.82rem !important;
      }
      .kpi-total-title {
        font-size: 0.88rem !important;
      }
      .kpi-num {
        font-size: 1.05rem !important;
      }
    }
  `]
})
export class VendorMasterListComponent implements OnInit {
  vendorList: any[] = [];
  groupedVendors: any[] = [];
  allLoadedVendors: any[] = [];
  isSendingEmail: boolean = false;
  sendingEmailForId: string = '';
  models: any[] = [];
  
  searchTerm: string = '';
  locationId: string = '';
  agentCode: string = '';
  status: string = '';
  fhridMappingStatus: string = '';
  showMobileFilters: boolean = false;
  isDownloadingExcel: boolean = false;
  isDownloadingLinks: boolean = false;

  locations: any[] = [];
  agents: any[] = [];

  stats: any = {
    totalVendors: 0,
    notInitiated: 0,
    initiated: 0,
    submitted: 0,
    verified: 0,
    reInitiated: 0,
    totalAgents: 0
  };

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private vendorService: VendorService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService,
    private candidateMasterService: CandidateMasterService
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.getAllVendors();
    });

    this.loadModels();
    this.loadLocations();
    this.loadAgents();
    this.getAllVendors();
  }

  loadModels(): void {
    const compId = sessionStorage.getItem('companyId') || 'GU-1';
    this.vendorService.getDdlListBasedOnCodeType('4', compId).subscribe(res => {
      if (res.isSuccess && res.data) {
        this.models = res.data.map((m: any) => {
          let cleanName = m.name || '';
          if (cleanName.includes(':')) {
            cleanName = cleanName.split(':')[1];
          }
          return {
            value: m.value,
            name: m.name,
            displayName: cleanName
          };
        });
      }
    });
  }

  loadLocations(): void {
    this.vendorService.getDropdownList('Location').pipe(catchError(() => of({ isSuccess: false }))).subscribe(res => {
      if (res && res.isSuccess) {
        this.locations = res.data || [];
      }
    });
  }

  loadAgents(): void {
    this.vendorService.getAgentDropdown().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.agents = res.data;
          // Re-group if vendor list was already loaded before agents
          if (this.vendorList.length > 0) {
            this.groupVendors();
          }
        }
      },
      error: (err) => {
        console.error('Error fetching agents:', err);
      }
    });
  }

  getModelName(modelId: any): string {
    if (!modelId) return '';
    const found = this.models.find(m => m.value?.toString() === modelId?.toString());
    return found ? found.displayName : modelId;
  }

  clearFilters(): void {
    this.locationId = '';
    this.agentCode = '';
    this.status = '';
    this.fhridMappingStatus = '';
    this.searchTerm = '';
    this.pageIndex = 1;
    this.getAllVendors();
  }

  getAllVendors(): void {
    this.vendorService.getAllVendors(this.pageIndex, this.pageSize, this.searchTerm, this.locationId, this.agentCode, this.status, this.fhridMappingStatus).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          const vendors = response.data.vendors || [];
          this.vendorList = [...vendors];

          if (response.data.counts) {
            this.stats = response.data.counts;
          }
          this.totalItems = response.data.totalCount || 0;
          this.groupVendors();
        } else {
          this.toastrService.error(response.message || 'Failed to fetch vendor list.');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastrService.error('Error fetching vendors from server.');
      }
    });
  }

  groupVendors(): void {
    const map = new Map<string, { agentName: string, agentCode: string, isExpanded: boolean, isAgentGroup: boolean, agentRecord: any, vendors: any[] }>();
    
    this.vendorList.forEach(v => {
      // Check if this vendor is an agent themselves
      const isAgentHimself = this.agents.some(a => a.value === v.vendor_Code);
      
      let pCode = v.parentAgentCode;
      let pName = v.parentAgentName;

      // If the vendor is an agent, they act as the parent for themselves
      if (isAgentHimself) {
        pCode = v.vendor_Code;
        pName = v.vendor_Name;
      } else if (!pCode) {
        // If no parent and not an agent, they are standalone
        pCode = '-';
        pName = '';
      }
      
      if (!map.has(pCode)) {
        map.set(pCode, { 
          agentName: pName, 
          agentCode: pCode, 
          isExpanded: true, 
          isAgentGroup: pCode !== '-',
          agentRecord: null,
          vendors: [] 
        });
      }

      if (v.vendor_Code === pCode) {
        map.get(pCode)!.agentRecord = v; // This is the agent himself
      } else {
        map.get(pCode)!.vendors.push(v); // This is a sub-vendor
      }
    });

    // Ensure the standalone group ('-') is at the end or handle it properly
    this.groupedVendors = Array.from(map.values()).sort((a, b) => {
      if (a.agentCode === '-') return 1;
      if (b.agentCode === '-') return -1;
      return a.agentName.localeCompare(b.agentName);
    });
  }

  toggleGroup(group: any): void {
    group.isExpanded = !group.isExpanded;
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.getAllVendors();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.getAllVendors();
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-danger-subtle text-danger border border-danger';
    status = status.toLowerCase().replace(/\s+/g, '');
    if (status === 'verified') return 'bg-success-subtle text-success border border-success';
    if (status === 'submitted') return 'bg-warning-subtle text-warning border border-warning';
    if (status === 'reinitiated') return 'bg-primary-subtle text-primary border border-primary';
    if (status === 'initiated') return 'bg-info-subtle text-info border border-info';
    if (status === 'notinitiated') return 'bg-danger-subtle text-danger border border-danger';
    
    // Default fallback
    return 'bg-secondary-subtle text-secondary border border-secondary';
  }

  getCardSubtleBg(status: string): string {
    if (!status) return 'bg-danger-subtle border-danger-subtle';
    status = status.toLowerCase().replace(/\s+/g, '');
    if (status === 'verified') return 'bg-success-subtle border-success-subtle';
    if (status === 'submitted') return 'bg-warning-subtle border-warning-subtle';
    if (status === 'reinitiated') return 'bg-primary-subtle border-primary-subtle';
    if (status === 'initiated') return 'bg-info-subtle border-info-subtle';
    if (status === 'notinitiated') return 'bg-danger-subtle border-danger-subtle';
    
    return 'bg-secondary-subtle border-secondary-subtle';
  }

  getStatusIcon(status: string): string {
    if (!status) return 'fa-regular fa-circle-xmark';
    status = status.toLowerCase().replace(/\s+/g, '');
    if (status === 'verified') return 'fa-regular fa-circle-check';
    if (status === 'submitted') return 'fa-solid fa-file-arrow-up';
    if (status === 'reinitiated') return 'fa-solid fa-rotate-right';
    if (status === 'initiated') return 'fa-solid fa-hourglass-start';
    if (status === 'notinitiated') return 'fa-regular fa-circle-xmark';
    
    return 'fa-regular fa-circle';
  }

  editVendor(pk_recId: string): void {
    const encryptedId = this.encryptionService.encryptText(pk_recId);
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_master_form', encryptedId]);
  }

  sendOnboardingEmail(pk_recId: string, vendorName: string): void {
    if (this.isSendingEmail) return;
    this.isSendingEmail = true;
    this.sendingEmailForId = pk_recId;
    
    this.candidateMasterService.sendOnboardingEmail(pk_recId).subscribe({
      next: (res: any) => {
        this.isSendingEmail = false;
        this.sendingEmailForId = '';
        if (res && res.isSuccess) {
          this.toastrService.success(`Verification email sent to ${vendorName} successfully.`);
        } else {
          this.toastrService.error(res?.message || 'Failed to send email.');
        }
      },
      error: (err: any) => {
        this.isSendingEmail = false;
        this.sendingEmailForId = '';
        this.toastrService.error('Error occurred while sending email.');
      }
    });
  }

  viewVendor(pk_recId: string): void {
    const encryptedId = this.encryptionService.encryptText(pk_recId);
    this.router.navigate(['/dash/on_boarding/on_boardingdashboard/OnboardCandidateView', encryptedId], { queryParams: { source: 'vendor_master' } });
  }

  deleteVendor(pk_recId: string): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      this.vendorService.deleteVendor(pk_recId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success('Vendor deleted successfully.');
            this.getAllVendors();
          } else {
            this.toastrService.error(response.message || 'Failed to delete vendor.');
          }
        },
        error: (err: any) => {
          console.error(err);
          this.toastrService.error('Error deleting vendor.');
        }
      });
    }
  }



  exportToExcel(): void {
    this.isDownloadingExcel = true;
    this.vendorService.getAllVendors(1, 100000, this.searchTerm, this.locationId, this.agentCode, this.status, this.fhridMappingStatus).subscribe({
      next: (res: any) => {
        this.isDownloadingExcel = false;
        const list = res?.data?.vendors || [];
        if (!list || list.length === 0) {
          this.toastrService.warning('No vendor data available to export.');
          return;
        }

        const exportData = list.map((item: any, index: number) => ({
          'Sr. No.': index + 1,
          'Agent Code': item.parentAgentCode || item.vendor_Code || '-',
          'Agent Name': item.parentAgentName || item.vendor_Name || '',
          'Vendor Code': item.vendor_Code || item.vendorCode || item.Vendor_Code || '',
          'Vendor Name': item.vendor_Name || item.vendorName || item.Vendor_Name || '',
          'Father Name': item.vendor_FatherName || item.Vendor_FatherName || '',
          'Contact No': item.vendor_ContactNo || item.Vendor_ContactNo || '',
          'Gender': item.vendor_Gender || item.Vendor_Gender || '',
          'Date of Birth': item.vendor_DOB || item.Vendor_DOB ? new Date(item.vendor_DOB || item.Vendor_DOB).toLocaleDateString('en-GB') : '',
          'Registration Date': item.vendor_RegistrationDate || item.Vendor_RegistrationDate ? new Date(item.vendor_RegistrationDate || item.Vendor_RegistrationDate).toLocaleDateString('en-GB') : '',
          'Current Address': item.vendor_Address || item.Vendor_Address || '',
          'State': item.stateName || item.StateName || item.vendor_State || item.Vendor_State || '',
          'City': item.cityName || item.CityName || item.vendor_City || item.Vendor_City || '',
          'Permanent Address': item.vendor_PermanentAddress || item.Vendor_PermanentAddress || item.vendor_Address || item.Vendor_Address || '',
          'Permanent State': item.vendor_PermState || item.Vendor_PermState || item.stateName || item.StateName || item.vendor_State || item.Vendor_State || '',
          'Permanent City': item.vendor_PermCity || item.Vendor_PermCity || item.cityName || item.CityName || item.vendor_City || item.Vendor_City || '',
          'Bank Name': item.bankMasterName || item.BankMasterName || item.vendor_BankName || item.Vendor_BankName || '',
          'Account No': item.vendor_AccountNo || item.Vendor_AccountNo || '',
          'IFSC Code': item.bankIFSC || item.BankIFSC || item.vendor_IFSCCode || item.Vendor_IFSCCode || '',
          'PAN No': item.vendor_PanNo || item.Vendor_PanNo || '',
          'Aadhaar No': item.vendor_AaddharNo || item.Vendor_AaddharNo || '',
          'GST No': item.vendor_GSTNo || item.Vendor_GSTNo || '',
          'GST Applicable': (item.vendor_IsGSTApplicable || item.Vendor_IsGSTApplicable) ? 'Yes' : 'No',
          'GST %': item.vendor_GSTRate ?? item.Vendor_GSTRate ?? '',
          'TDS Applicable': (item.vendor_IsTDSApplicable || item.Vendor_IsTDSApplicable) ? 'Yes' : 'No',
          'TDS %': item.vendor_TDSPercentage ?? item.Vendor_TDSPercentage ?? ''
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

        // Apply blue background to header row (row 0)
        const headerStyle = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "0D6EFD" } }
        };
        const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1");
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: 0 });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = headerStyle;
        }

        const columnWidths: any[] = [];
        Object.keys(exportData[0]).forEach((key) => {
          let maxWidth = key.length;
          exportData.forEach((row: any) => {
            const val = row[key];
            if (val) {
              const valLen = val.toString().length;
              if (valLen > maxWidth) maxWidth = valLen;
            }
          });
          columnWidths.push({ wch: maxWidth + 2 });
        });
        worksheet["!cols"] = columnWidths;

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor Master List');
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, 'Vendor_Master_List');
      },
      error: (err: any) => {
        this.isDownloadingExcel = false;
        console.error(err);
        this.toastrService.error('Error exporting to Excel.');
      }
    });
  }

downloadVendorVerificationExcel(): void {
    this.isDownloadingLinks = true;
    this.toastrService.info('Preparing Vendor Excel download...');
    this.vendorService.downloadVendorVerificationExcel(this.searchTerm, this.locationId).subscribe({
      next: (blob: Blob) => {
        this.isDownloadingLinks = false;
        FileSaver.saveAs(blob, `Vendor_Verification_List_${new Date().getTime()}.xlsx`);
        this.toastrService.success('Vendor Excel downloaded successfully!');
      },
      error: (err: any) => {
        this.isDownloadingLinks = false;
        console.error(err);
        this.toastrService.error('Failed to download vendor excel from server.');
      }
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }
}
