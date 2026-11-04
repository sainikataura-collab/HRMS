import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VendorServiceMasterService } from '../Service/vendor-service-master.service';

@Component({
  selector: 'app-vendor-service-master-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule, NgSelectModule],
  templateUrl: './vendor-service-master-list.component.html',
  styleUrls: ['./vendor-service-master-list.component.scss']
})
export class VendorServiceMasterListComponent implements OnInit {
  vendorServiceList: any[] = [];
  isLoading: boolean = false;

  // Pagination & Search
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  // 3 Filter Dropdowns
  selectedVendorId: string | null = null;
  selectedLocationId: string | null = null;
  selectedClientId: string | null = null;

  vendors: any[] = [];
  locations: any[] = [];
  clients: any[] = [];

  // Master copies of all locations and clients for when filter is cleared
  allLocations: any[] = [];
  allClients: any[] = [];

  private searchSubject = new Subject<string>();

  constructor(
    private vendorServiceMaster: VendorServiceMasterService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.loadVendorServices();
    });

    this.loadDropdowns();
    this.loadVendorServices();
  }

  loadDropdowns(): void {
    // 1. Vendors (from General/dropdownList/Vendor)
    this.vendorServiceMaster.getVendors().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.vendors = list
          .filter((v: any) => v.value != null && v.value !== '' && v.value !== 'null')
          .map((v: any) => ({
            value: (v.value ?? v.Value ?? '').toString(),
            text: v.name ?? v.Name ?? v.text ?? v.Text ?? v.value
          }));
      },
      error: (err) => console.error('Error loading vendors dropdown:', err)
    });

    // 2. Locations (from General/dropdownList/Location - stores all locations)
    this.vendorServiceMaster.getLocations().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.allLocations = list
          .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
          .map((l: any) => ({
            value: (l.value ?? l.Value ?? '').toString(),
            text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.locname ?? l.value
          }));
        // If vendor not currently selected, display all locations
        if (!this.selectedVendorId) {
          this.locations = [...this.allLocations];
        }
      },
      error: (err) => console.error('Error loading locations dropdown:', err)
    });

    // 3. Clients (from General/dropdownList/Client - stores all clients)
    this.vendorServiceMaster.getClients().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.allClients = list
          .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
          .map((c: any) => ({
            value: (c.value ?? c.Value ?? '').toString(),
            text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
          }));
        // If location not currently selected, display all clients
        if (!this.selectedLocationId) {
          this.clients = [...this.allClients];
        }
      },
      error: (err) => console.error('Error loading clients dropdown:', err)
    });
  }

  onVendorChange(): void {
    const vendorId = this.selectedVendorId ? this.selectedVendorId.toString() : '';
    if (vendorId) {
      this.vendorServiceMaster.getLocationsByVendor(vendorId).subscribe({
        next: (res: any) => {
          const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
          this.locations = list
            .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
            .map((l: any) => ({
              value: (l.value ?? l.Value ?? '').toString(),
              text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.locname ?? l.value
            }));

          // Prune selected location if not in the new filtered list
          if (this.selectedLocationId && !this.locations.some(l => l.value === this.selectedLocationId?.toString())) {
            this.selectedLocationId = null;
          }
          this.onLocationChange();
        },
        error: (err) => {
          console.error('Error fetching locations by vendor:', err);
          this.locations = [];
          this.selectedLocationId = null;
          this.onLocationChange();
        }
      });
    } else {
      // If vendor is unselected, show all locations
      this.locations = [...this.allLocations];
      if (this.selectedLocationId && !this.locations.some(l => l.value === this.selectedLocationId?.toString())) {
        this.selectedLocationId = null;
      }
      this.onLocationChange();
    }
  }

  onLocationChange(): void {
    const locationId = this.selectedLocationId ? this.selectedLocationId.toString() : '';
    if (locationId) {
      this.vendorServiceMaster.getClientsByLocation(locationId).subscribe({
        next: (res: any) => {
          const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
          this.clients = list
            .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
            .map((c: any) => ({
              value: (c.value ?? c.Value ?? '').toString(),
              text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
            }));

          // Prune selected client if not in the new filtered list
          if (this.selectedClientId && !this.clients.some(c => c.value === this.selectedClientId?.toString())) {
            this.selectedClientId = null;
          }
          this.pageIndex = 1;
          this.loadVendorServices();
        },
        error: (err) => {
          console.error('Error fetching clients by location:', err);
          this.clients = [];
          this.selectedClientId = null;
          this.pageIndex = 1;
          this.loadVendorServices();
        }
      });
    } else {
      // If location is unselected, show all clients
      this.clients = [...this.allClients];
      if (this.selectedClientId && !this.clients.some(c => c.value === this.selectedClientId?.toString())) {
        this.selectedClientId = null;
      }
      this.pageIndex = 1;
      this.loadVendorServices();
    }
  }

  onClientChange(): void {
    this.pageIndex = 1;
    this.loadVendorServices();
  }

  loadVendorServices(): void {
    this.isLoading = true;
    const filter = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      searchTerm: (this.searchTerm || '').trim(),
      vendorId: this.selectedVendorId || undefined,
      locationId: this.selectedLocationId || undefined,
      clientId: this.selectedClientId || undefined
    };

    this.vendorServiceMaster.getAll(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const resData = res?.data ?? res?.Data ?? res;
        const list = resData?.vendorServices ?? resData?.VendorServices ?? resData?.list ?? (Array.isArray(resData) ? resData : []);
        this.vendorServiceList = list;
        this.totalItems = resData?.totalCount ?? resData?.TotalCount ?? list.length;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastr.error('Failed to load vendor services from server.');
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.loadVendorServices();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedVendorId = null;
    this.selectedLocationId = null;
    this.selectedClientId = null;
    this.locations = [...this.allLocations];
    this.clients = [...this.allClients];
    this.pageIndex = 1;
    this.loadVendorServices();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadVendorServices();
  }

  editRecord(item: any): void {
    const id = item.pK_VendorServiceID || item.pk_VendorServiceID;
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_service_master_form', id]);
  }

  formatServiceCharge(item: any): string {
    const charge = item.serviceCharge != null ? item.serviceCharge : 0;
    const isPercentage = item.serviceType === 'Percentage' || item.percentageType;
    if (isPercentage && item.percentageType) {
      return `${charge}% of ${item.percentageType}`;
    } else if (isPercentage) {
      return `${charge}%`;
    }
    return `₹ ${charge}`;
  }

  exportToExcel(): void {
    if (!this.vendorServiceList || this.vendorServiceList.length === 0) {
      this.toastr.warning('No data available to export.');
      return;
    }

    // Fetch all filtered records for export
    const exportFilter = {
      pageIndex: 1,
      pageSize: 100000,
      searchTerm: (this.searchTerm || '').trim(),
      vendorId: this.selectedVendorId || undefined,
      locationId: this.selectedLocationId || undefined,
      clientId: this.selectedClientId || undefined
    };

    this.vendorServiceMaster.getAll(exportFilter).subscribe({
      next: (res) => {
        const dataToExport = (res?.data?.vendorServices || this.vendorServiceList).map((item: any, index: number) => ({
          'Sr.': index + 1,
          'Vendor Name': item.vendorName || item.vendorID || '',
          'Vendor Code': item.vendorCode || '',
          'Location Name': item.locationName || item.locationID || '',
          'Client Name': item.clientName || item.clientID || '',
          'Service Type': item.serviceType || 'Flat',
          'Percentage Type': item.percentageType || '-',
          'Service Charge': this.formatServiceCharge(item),
          'Created By': item.createdBy || '-',
          'Created Date': item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : '-'
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook: XLSX.WorkBook = {
          Sheets: { 'Vendor_Service_Master': worksheet },
          SheetNames: ['Vendor_Service_Master']
        };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        const fileName = `Vendor_Service_Master_${new Date().toISOString().slice(0, 10)}.xlsx`;
        FileSaver.saveAs(data, fileName);
        this.toastr.success('Excel exported successfully.');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to export Excel.');
      }
    });
  }
}
