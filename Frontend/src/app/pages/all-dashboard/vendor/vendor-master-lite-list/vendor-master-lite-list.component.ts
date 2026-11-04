import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { VendorLiteService } from '../Service/vendor-lite.service';
import { CompanyParameterService } from '../../payroll/services/company-parameter.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSXStyle from 'xlsx-js-style';

@Component({
  selector: 'app-vendor-master-lite-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './vendor-master-lite-list.component.html',
  styleUrls: ['./vendor-master-lite-list.component.scss']
})
export class VendorMasterLiteListComponent implements OnInit {
  vendorList: any[] = [];
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;
  isLoading: boolean = false;
  isExporting: boolean = false;

  selectedVendorId: string = '';
  selectedLogoFile: File | null = null;
  previewLogo: string = 'assets/Image/Logo/empower.jpeg';
  imageMap: { [filename: string]: string } = {};
  vendorLogoMap: { [vendorId: string]: string } = {};

  constructor(
    private vendorLiteService: VendorLiteService,
    private companyParameterService: CompanyParameterService,
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.isLoading = true;
    this.vendorLiteService.getAllVendorLite(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.vendorList = res.data.list || [];
          this.totalCount = res.data.totalCount || 0;

          // Load vendor logos for items that have logo path
          this.vendorList.forEach(item => {
            const logo = item.Vendor_LogoPath || item.vendor_LogoPath || item.Vendor_Logo || item.logoPath || item.LogoPath;
            if (logo) {
              this.loadImage(logo);
            }
          });
        } else {
          this.vendorList = [];
          this.totalCount = 0;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading vendors', err);
        this.isLoading = false;
      }
    });
  }

  openLogoModal(item: any) {
    this.selectedVendorId = item.pk_recId || item.vendor_Id || '';
    const logo = item.Vendor_LogoPath || item.vendor_LogoPath || item.Vendor_Logo || item.logoPath || item.LogoPath;
    this.previewLogo = this.vendorLogoMap[this.selectedVendorId]
      || (logo && this.imageMap[logo])
      || 'assets/Image/Logo/empower.jpeg';
    this.selectedLogoFile = null;
  }

  onLogoSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedLogoFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewLogo = e.target.result;
      };
      reader.readAsDataURL(this.selectedLogoFile!);
    }
  }

  uploadLogo() {
    if (!this.selectedLogoFile) {
      this.toastr.warning('Please select a logo image first.');
      return;
    }

    const currentVendorId = this.selectedVendorId;
    const currentPreview = this.previewLogo;

    const formData = new FormData();
    formData.append('VendorId', currentVendorId || '');
    formData.append('Logo', this.selectedLogoFile);

    this.vendorLiteService.uploadVendorLogo(formData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Vendor logo uploaded successfully.');

          // Instantly map uploaded image to vendor ID in grid
          if (currentVendorId && currentPreview) {
            this.vendorLogoMap[currentVendorId] = currentPreview;
          }

          // Close modal
          const modalElem = document.getElementById('logoModal');
          if (modalElem) {
            const closeBtn = modalElem.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
            if (closeBtn) closeBtn.click();
          }

          this.loadVendors();
        } else {
          this.toastr.error(res.message || 'Failed to upload logo.');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Error occurred while uploading logo.');
      }
    });
  }

  loadImage(filename: string) {
    if (this.imageMap[filename]) return;

    this.companyParameterService.getImage(filename).subscribe({
      next: (blob: any) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageMap[filename] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {}
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.loadVendors();
  }

  editVendor(pk_recId: string): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_master_lite_form', pk_recId]);
  }

  onPageChange(event: any): void {
    this.pageIndex = event;
    this.loadVendors();
  }

  exportToExcel(): void {
    if (this.isExporting) return;
    this.isExporting = true;
    this.loader.start();

    this.vendorLiteService.getAllVendorLite(0, 10000, this.searchTerm).subscribe({
      next: (res) => {
        this.isExporting = false;
        this.loader.stop();
        const list = res?.data?.list || this.vendorList;
        if (!list || list.length === 0) {
          this.toastr.info('No vendor data available to export.');
          return;
        }

        const headers = [
          'Sr.', 'Vendor Code', 'Vendor Name', 'Contact No',
          'Registration Date', 'Service Type', 'Service Value / Rate',
          'Bank Name', 'Account No', 'PAN No', 'Aadhaar No', 'Address', 'Status'
        ];

        const wsData: any[][] = [headers];
        const styleMap: { [cellRef: string]: any } = {};

        for (let c = 0; c < headers.length; c++) {
          const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c });
          styleMap[cellRef] = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '2563EB' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: { bottom: { style: 'thin', color: { rgb: '1E40AF' } } }
          };
        }

        list.forEach((item: any, idx: number) => {
          let regDate = '';
          if (item.vendor_RegistrationDate) {
            const d = new Date(item.vendor_RegistrationDate);
            if (!isNaN(d.getTime())) {
              regDate = d.toLocaleDateString('en-GB');
            }
          }

          const row = [
            idx + 1,
            item.vendor_Code || '',
            item.vendor_Name || '',
            item.vendor_ContactNo || '',
            regDate,
            item.serviceType || item.ServiceType || item.vendor_ServiceType || '',
            item.serviceTax ?? item.ServiceTax ?? item.vendor_ServiceTax ?? '',
            item.vendor_BankName || '',
            item.vendor_AccountNo || '',
            item.vendor_PanNo || '',
            item.vendor_AaddharNo || '',
            item.vendor_Address || '',
            item.vendor_Status || 'Active'
          ];
          wsData.push(row);

          const rIdx = idx + 1;
          const isAlt = idx % 2 === 1;
          for (let c = 0; c < headers.length; c++) {
            const cellRef = XLSXStyle.utils.encode_cell({ r: rIdx, c });
            styleMap[cellRef] = {
              font: { color: { rgb: '1F2937' } },
              fill: { fgColor: { rgb: isAlt ? 'F9FAFB' : 'FFFFFF' } },
              alignment: { vertical: 'center' },
              border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
            };
          }
        });

        const ws: XLSXStyle.WorkSheet = XLSXStyle.utils.aoa_to_sheet(wsData);
        for (const cellRef of Object.keys(styleMap)) {
          if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
          ws[cellRef].s = styleMap[cellRef];
        }

        ws['!cols'] = [
          { wch: 6 },
          { wch: 14 },
          { wch: 25 },
          { wch: 15 },
          { wch: 15 },
          { wch: 22 },
          { wch: 18 },
          { wch: 20 },
          { wch: 18 },
          { wch: 14 },
          { wch: 15 },
          { wch: 30 },
          { wch: 12 }
        ];

        const wb: XLSXStyle.WorkBook = XLSXStyle.utils.book_new();
        XLSXStyle.utils.book_append_sheet(wb, ws, 'Vendors');
        XLSXStyle.writeFile(wb, 'Vendor_Master_List.xlsx');
        this.toastr.success('Vendor list exported successfully!');
      },
      error: (err) => {
        this.isExporting = false;
        this.loader.stop();
        this.toastr.error('Failed to export vendor list.');
        console.error('Export error:', err);
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
