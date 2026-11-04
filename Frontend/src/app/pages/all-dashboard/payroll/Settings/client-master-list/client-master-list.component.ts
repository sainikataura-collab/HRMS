import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ClientMasterService } from '../../services/client-master.service';
import { CompanyParameterService } from '../../services/company-parameter.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-client-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './client-master-list.component.html',
  styleUrl: './client-master-list.component.scss'
})
export class ClientMasterListComponent {
  searchText: string = '';
  searchTerm: string = '';
  list: any[] = [];
  filteredMaster: any[] = [];
  page: number = 1;         // ✅ same name as Bank Master
  pageSize: number = 10;
  totalItems: number = 0;
  ngxUILoaderService = inject(NgxUiLoaderService);

  selectedClientId: any = null;
  selectedLogoFile: File | null = null;
  previewLogo: string = 'assets/Image/Logo/empower.jpeg';
  imageMap: { [filename: string]: string } = {};
  clientLogoMap: { [clientId: string]: string } = {};

  constructor(
    private service: ClientMasterService,
    private companyParameterService: CompanyParameterService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService   // ✅ same name as Bank Master
  ) { }

  ngOnInit(): void {
    this.getList();
  }

  onPageChange(event: number): void {
    this.page = event;       // ✅ same as Bank Master
    this.getList();
  }


  getList() {
    this.ngxUILoaderService.start();
    this.service.get_All_clientmaster(this.page - 1, this.pageSize, this.searchText).subscribe({  // ✅ page-1 same as Bank Master
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.list = res.data.list;
          this.totalItems = res.data.totalCount;
          this.applyFilter();

          // Load client logos for items that have logo path
          if (this.list && this.list.length > 0) {
            this.list.forEach(item => {
              const logo = item.client_LogoPath || item.Client_LogoPath;
              if (logo) {
                this.loadImage(logo);
              }
            });
          }
        } else {
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("An error occurred while loading client list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  openLogoModal(client: any): void {
    this.selectedClientId = client.pk_cost_centre_id;
    const logoName = client.client_LogoPath || client.Client_LogoPath;
    if (this.clientLogoMap[this.selectedClientId]) {
      this.previewLogo = this.clientLogoMap[this.selectedClientId];
    } else if (logoName && this.imageMap[logoName]) {
      this.previewLogo = this.imageMap[logoName];
    } else {
      this.previewLogo = 'assets/Image/Logo/empower.jpeg';
    }
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
      this.toastrService.warning('Please select a logo image first.');
      return;
    }

    const currentClientId = this.selectedClientId;
    const currentPreview = this.previewLogo;

    const formData = new FormData();
    formData.append('ClientId', currentClientId ? currentClientId.toString() : '');
    formData.append('Logo', this.selectedLogoFile);

    this.service.uploadClientLogo(formData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Client logo uploaded successfully.');
          if (currentClientId && currentPreview) {
            this.clientLogoMap[currentClientId] = currentPreview;
          }
          const modalElem = document.getElementById('clientLogoModal');
          if (modalElem) {
            const closeBtn = modalElem.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
            if (closeBtn) closeBtn.click();
          }
          this.getList();
        } else {
          this.toastrService.error(res.message || 'Failed to upload logo.');
        }
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || 'Error occurred while uploading logo.');
      }
    });
  }

  loadImage(filename: string) {
    if (this.imageMap[filename]) return;

    this.companyParameterService.getImage(filename).subscribe({
      next: (blob: any) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imageMap[filename] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => { }
    });
  }




  applyFilter() {
    if (!this.searchText) {
      this.filteredMaster = this.list;
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    const local = this.list.filter(req =>
      req.clientName?.toLowerCase().includes(searchLower) ||
      req.clientCode?.toLowerCase().includes(searchLower) ||
      req.grouping?.toLowerCase().includes(searchLower) ||
      req.contactPerson?.toLowerCase().includes(searchLower) ||
      req.phone?.toLowerCase().includes(searchLower) ||
      req.emailID?.toLowerCase().includes(searchLower) ||
      req.location?.toLowerCase().includes(searchLower) ||
      req.zoneName?.toLowerCase().includes(searchLower) ||
      req.cityName?.toLowerCase().includes(searchLower) ||
      req.stateName?.toLowerCase().includes(searchLower) ||
      req.empCodePrefix?.toLowerCase().includes(searchLower) ||
      req.cinNo?.toLowerCase().includes(searchLower) ||
      req.tan?.toLowerCase().includes(searchLower) ||
      req.gst?.toLowerCase().includes(searchLower) ||
      req.pan?.toLowerCase().includes(searchLower) ||
      req.address?.toLowerCase().includes(searchLower) ||
      req.pincode?.toLowerCase().includes(searchLower) ||
      req.startDate?.toLowerCase().includes(searchLower) ||
      req.endDate?.toLowerCase().includes(searchLower) ||
      req.leavePolicy?.toLowerCase().includes(searchLower) ||
      req.commissionPercent?.toString().toLowerCase().includes(searchLower)
    );
    this.filteredMaster = local;
  }

  onSearchTextChanged(): void {
    this.applyFilter();
    if (this.filteredMaster.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.page = 1;
      this.getList();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getList();
    }
  }
  edit(encryptedId: any) {
    this.router.navigate(["/dash/user/userdashboard/clientMaster", encryptedId]);
  }

  deleteRecord(pk_cost_centre_id: any) {
    if (confirm("Are you sure you want to delete this Client Master record?")) {
      this.ngxUILoaderService.start();
      this.service.delete_clientmaster(pk_cost_centre_id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || "Deleted successfully!");
            this.getList();
          } else {
            this.toastrService.error(res.message || "Failed to delete.");
            this.ngxUILoaderService.stop();
          }
        },
        error: () => {
          this.toastrService.error("An error occurred while deleting.");
          this.ngxUILoaderService.stop();
        }
      });
    }
  }

  exportToExcel(): void {
    this.ngxUILoaderService.start();
    this.service.DownloadExcel().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data && res.data.list && res.data.list.length > 0) {
          const excludedColumns = ['pk_cost_centre_id'];

          const columnMappings: Record<string, string> = {
            clientCode: 'Client Code',
            clientName: 'Client Name',
            grouping: 'Grouping',
            contactPerson: 'Contact Person',
            phone: 'Phone',
            emailID: 'Email ID',
            zoneName: 'Zone',
            cityName: 'City',
            stateName: 'State',
            empCodePrefix: 'Emp Code Prefix',
            cinNo: 'CIN No',
            tan: 'TAN',
            address: 'Address',
            pincode: 'Pincode',
            startDate: 'Start Date',
            endDate: 'End Date',
            leavePolicy: 'Leave Policy',
            commissionPercent: 'Commission Percent',
            location: 'Location',
            createdBy: 'Created By',
            createdDate: 'Created Date',
            modifiedBy: 'Updated By',
            modifiedDate: 'Updated Date'
          };

          const filteredData = res.data.list.map((item: Record<string, any>) => {
            return Object.keys(item)
              .filter(key => !excludedColumns.includes(key))
              .reduce((obj: Record<string, any>, key: string) => {
                obj[columnMappings[key] || key] = item[key];
                return obj;
              }, {});
          });

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          const fileName = 'ClientList.xlsx';
          const link = document.createElement('a');
          link.href = URL.createObjectURL(data);
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.ngxUILoaderService.stop();
        } else {
          this.toastrService.warning('No data available to export');
          this.ngxUILoaderService.stop();
        }
      },
      error: () => {
        this.toastrService.error('Failed to download excel');
        this.ngxUILoaderService.stop();
      }
    });
  }
}