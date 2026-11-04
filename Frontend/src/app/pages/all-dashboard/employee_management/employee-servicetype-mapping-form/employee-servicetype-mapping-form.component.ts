import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import {
  EmployeeServiceTypeMappingService,
  ServiceTypeMappingModel
} from '../service/employee-servicetype-mapping.service';

@Component({
  selector: 'app-employee-servicetype-mapping-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgSelectModule],
  templateUrl: './employee-servicetype-mapping-form.component.html',
  styleUrls: ['./employee-servicetype-mapping-form.component.scss']
})
export class EmployeeServiceTypeMappingFormComponent implements OnInit {
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;

  recordId: number = 0;

  serviceTypes: { name: string; value: string }[] = [];
  existingMappedTypes: Set<string> = new Set<string>();

  formData: ServiceTypeMappingModel = {
    pk_servicetypeid: 0,
    serviceType: '',
    esi: false,
    pf: false,
    lwf: false,
    pt: false
  };

  constructor(
    private mappingService: EmployeeServiceTypeMappingService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.recordId = +idParam;
      this.isEditMode = true;
    }

    this.loadServiceTypes();
    if (!this.isEditMode) {
      this.loadExistingMappings();
    } else {
      this.loadRecord(this.recordId);
    }
  }

  loadServiceTypes(): void {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    this.mappingService.getServiceTypes(compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.serviceTypes = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? item.name ?? '').toString().trim()
        }));
      },
      error: (err: any) => {
        console.error('Error fetching Service Types:', err);
      }
    });
  }

  loadExistingMappings(): void {
    this.mappingService.getAll({ pageIndex: 1, pageSize: 1000 }).subscribe({
      next: (res: any) => {
        const list = res?.data?.list || res?.list || [];
        this.existingMappedTypes = new Set(list.map((m: any) => (m.serviceType ?? m.ServiceType ?? '').toString().trim()));
      },
      error: (err: any) => {
        console.error('Error fetching existing mappings:', err);
      }
    });
  }

  loadRecord(id: number): void {
    this.isLoading = true;
    this.mappingService.getById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.isSuccess && res?.data) {
          const d = res.data;
          this.formData = {
            pk_servicetypeid: d.pk_servicetypeid ?? id,
            serviceType: (d.serviceType ?? d.ServiceType ?? '').toString(),
            serviceTypeName: d.serviceTypeName ?? d.ServiceTypeName ?? '',
            esi: d.esi ?? d.ESI ?? false,
            pf: d.pf ?? d.PF ?? false,
            lwf: d.lwf ?? d.LWF ?? false,
            pt: d.pt ?? d.PT ?? false
          };
        } else {
          this.toastr.error(res?.message || 'Failed to load mapping record.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading record:', err);
        this.toastr.error('Error loading mapping record.');
      }
    });
  }

  onServiceTypeChange(): void {
    if (!this.isEditMode && this.formData.serviceType) {
      if (this.existingMappedTypes.has(this.formData.serviceType.trim())) {
        this.toastr.warning('A mapping for this Service Type already exists. You can modify the existing record from the list.');
      }
    }
  }

  onSave(): void {
    if (!this.formData.serviceType) {
      this.toastr.warning('Please select a Service Type.');
      return;
    }

    if (!this.isEditMode && this.existingMappedTypes.has(this.formData.serviceType.trim())) {
      this.toastr.error('Mapping for this Service Type already exists. Duplicate entries are not allowed. Please modify the existing record.');
      return;
    }

    this.isSaving = true;

    if (this.isEditMode) {
      this.mappingService.update(this.formData).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          if (res?.isSuccess) {
            this.toastr.success(res.message || 'Service type mapping updated successfully.');
            this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/servicetype_mapping_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to update mapping.');
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error(err);
          this.toastr.error(err?.error?.message || 'Error updating mapping.');
        }
      });
    } else {
      this.mappingService.insert(this.formData).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          if (res?.isSuccess) {
            this.toastr.success(res.message || 'Service type mapping created successfully.');
            this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/servicetype_mapping_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to create mapping.');
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error(err);
          this.toastr.error(err?.error?.message || 'Error creating mapping.');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/servicetype_mapping_list']);
  }
}
