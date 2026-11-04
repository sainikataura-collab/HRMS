import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { VendorServiceMasterService } from '../Service/vendor-service-master.service';

@Component({
  selector: 'app-vendor-service-master-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgSelectModule],
  templateUrl: './vendor-service-master-form.component.html',
  styleUrls: ['./vendor-service-master-form.component.scss']
})
export class VendorServiceMasterFormComponent implements OnInit {
  isEditMode: boolean = false;
  editId: number = 0;
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Dropdown data sources
  vendors: any[] = [];
  locations: any[] = [];
  clients: any[] = [];

  // Service Type options (from General Master CodeType 9)
  serviceTypes: { label: string, value: string }[] = [];

  // Percentage of options (from General Master CodeType 10)
  percentageOfOptions: { label: string, value: string }[] = [];

  // Form model
  formData: any = {
    vendorID: null,
    locationID: null,
    clientID: null,
    serviceType: 'Flat',
    percentageType: '',
    serviceCharge: 0,
    isGratuity: false
  };

  constructor(
    private vendorServiceMaster: VendorServiceMasterService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editId = +params['id'];
        this.isEditMode = true;
        this.loadRecordForEdit(this.editId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_service_master_list']);
  }

  loadDropdowns(): void {
    const compId = sessionStorage.getItem('companyId') || '';

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
      error: (err) => console.error('Error fetching vendors dropdown:', err)
    });

    // 2. Service Types (from General Master CodeType 11)
    this.vendorServiceMaster.getDdlListBasedOnCodeType('11', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.serviceTypes = list.map((item: any) => {
          let label = item.name ?? item.Name ?? item.text ?? item.Text ?? item.codeDescription ?? '';
          if (label.includes(':')) label = label.split(':')[1];
          return { label: label.trim(), value: label.trim() };
        });
      },
      error: (err) => console.error('Error fetching service types from general master:', err)
    });

    // 3. Percentage Types (from General Master CodeType 12)
    this.vendorServiceMaster.getDdlListBasedOnCodeType('12', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.percentageOfOptions = list.map((item: any) => {
          let label = item.name ?? item.Name ?? item.text ?? item.Text ?? item.codeDescription ?? '';
          if (label.includes(':')) label = label.split(':')[1];
          return { label: label.trim(), value: label.trim() };
        });
      },
      error: (err) => console.error('Error fetching percentage types from general master:', err)
    });
  }

  onVendorChange(): void {
    const vendorId = this.formData.vendorID ? this.formData.vendorID.toString() : '';
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

          // Prune selected location if not in list
          if (this.formData.locationID && !this.locations.some(l => l.value === this.formData.locationID.toString())) {
            this.formData.locationID = null;
          }
          this.onLocationChange();
        },
        error: (err) => {
          console.error('Error fetching locations by vendor:', err);
          this.locations = [];
          this.formData.locationID = null;
          this.onLocationChange();
        }
      });
    } else {
      this.locations = [];
      this.formData.locationID = null;
      this.onLocationChange();
    }
  }

  onLocationChange(): void {
    const locationId = this.formData.locationID ? this.formData.locationID.toString() : '';
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

          // Prune selected client if not in list
          if (this.formData.clientID && !this.clients.some(c => c.value === this.formData.clientID.toString())) {
            this.formData.clientID = null;
          }
        },
        error: (err) => {
          console.error('Error fetching clients by location:', err);
          this.clients = [];
          this.formData.clientID = null;
        }
      });
    } else {
      this.clients = [];
      this.formData.clientID = null;
    }
  }

  loadRecordForEdit(id: number): void {
    this.isLoading = true;
    this.vendorServiceMaster.getById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.isSuccess && res?.data) {
          const d = res.data;
          const vId = d.vendorID ?? d.VendorID ?? null;
          const lId = d.locationID ?? d.LocationID ?? null;
          const cId = d.clientID ?? d.ClientID ?? null;
          const sType = d.serviceType ?? d.ServiceType ?? 'Flat';
          const pType = d.percentageType ?? d.PercentageType ?? '';
          const sCharge = d.serviceCharge ?? d.ServiceCharge ?? 0;
          const isGrat = d.isGratuity ?? d.IsGratuity ?? false;
          const pkId = d.pK_VendorServiceID ?? d.pk_VendorServiceID ?? d.PK_VendorServiceID ?? id;

          this.formData = {
            pk_VendorServiceID: pkId,
            vendorID: vId ? vId.toString() : null,
            locationID: lId ? lId.toString() : null,
            clientID: cId ? cId.toString() : null,
            serviceType: sType === 'Percentage' ? 'Percentage' : 'Flat',
            percentageType: pType,
            serviceCharge: sCharge,
            isGratuity: isGrat === true || isGrat === 1 || isGrat === 'true' || isGrat === '1'
          };

          // Populate locations for the loaded vendor
          if (this.formData.vendorID) {
            this.vendorServiceMaster.getLocationsByVendor(this.formData.vendorID).subscribe({
              next: (locRes: any) => {
                const list = locRes?.data ?? locRes?.Data ?? (Array.isArray(locRes) ? locRes : []);
                this.locations = list
                  .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
                  .map((l: any) => ({
                    value: (l.value ?? l.Value ?? '').toString(),
                    text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.locname ?? l.value
                  }));
              }
            });
          }

          // Populate clients for the loaded location
          if (this.formData.locationID) {
            this.vendorServiceMaster.getClientsByLocation(this.formData.locationID).subscribe({
              next: (clientRes: any) => {
                const list = clientRes?.data ?? clientRes?.Data ?? (Array.isArray(clientRes) ? clientRes : []);
                this.clients = list
                  .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
                  .map((c: any) => ({
                    value: (c.value ?? c.Value ?? '').toString(),
                    text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
                  }));
              }
            });
          }
        } else {
          this.toastr.error(res?.message || 'Failed to load record details.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading vendor service:', err);
        this.toastr.error('Error loading record.');
      }
    });
  }

  onServiceTypeChange(): void {
    if (this.formData.serviceType !== 'Percentage') {
      this.formData.percentageType = '';
    } else {
      if (!this.formData.percentageType) {
        this.formData.percentageType = 'CTC';
      }
    }
  }

  onSave(): void {
    // Validations
    if (!this.formData.vendorID) {
      this.toastr.warning('Please select a Vendor.');
      return;
    }
    if (!this.formData.locationID) {
      this.toastr.warning('Please select a Location.');
      return;
    }
    if (!this.formData.clientID) {
      this.toastr.warning('Please select a Client.');
      return;
    }
    if (!this.formData.serviceType) {
      this.toastr.warning('Please select a Service Type.');
      return;
    }
    if (this.formData.serviceType === 'Percentage' && !this.formData.percentageType) {
      this.toastr.warning('Please select Percentage of (CTC / Gross).');
      return;
    }
    if (this.formData.serviceCharge == null || this.formData.serviceCharge < 0) {
      this.toastr.warning('Please enter a valid Service Charge.');
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.formData,
      vendorID: this.formData.vendorID.toString(),
      locationID: this.formData.locationID.toString(),
      clientID: this.formData.clientID.toString()
    };

    if (this.isEditMode) {
      this.vendorServiceMaster.update(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res?.isSuccess) {
            this.toastr.success(res.message || 'Vendor service updated successfully.');
            this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_service_master_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to update vendor service.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error(err);
          this.toastr.error('Error updating vendor service.');
        }
      });
    } else {
      this.vendorServiceMaster.insert(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res?.isSuccess) {
            this.toastr.success(res.message || 'Vendor service created successfully.');
            this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_service_master_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to add vendor service.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error(err);
          this.toastr.error('Error adding vendor service.');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_service_master_list']);
  }
}
