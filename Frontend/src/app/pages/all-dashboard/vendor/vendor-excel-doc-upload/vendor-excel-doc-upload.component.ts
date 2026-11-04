import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VendorService } from '../Service/vendor.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-vendor-excel-doc-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterLink],
  templateUrl: './vendor-excel-doc-upload.component.html',
  styleUrl: './vendor-excel-doc-upload.component.scss'
})
export class VendorExcelDocUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  fileError: string = '';

  clients: any[] = [];
  models: any[] = [];
  isLoadingModels: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private loader: NgxUiLoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      clientId: [null, [Validators.required]],
      clientName: [''],
      modelId: [null, [Validators.required]],
      modelName: [''],
      file: [null, [Validators.required]],
      fromDate: [null, [Validators.required]],
      toDate: [null, [Validators.required]]
    }, { validators: this.dateRangeValidator });

    // Listen to client selection change
    this.uploadForm.get('clientId')?.valueChanges.subscribe(clientId => {
      this.onClientSelect(clientId);
    });

    // Listen to model selection change
    this.uploadForm.get('modelId')?.valueChanges.subscribe(modelId => {
      const selectedModel = this.models.find(m => m.value?.toString() === modelId?.toString() || m.pk_recId?.toString() === modelId?.toString() || m.id?.toString() === modelId?.toString());
      const name = selectedModel ? (selectedModel.name || selectedModel.modelName || selectedModel.displayName || '') : '';
      this.uploadForm.patchValue({ modelName: name }, { emitEvent: false });
    });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const fromDate = group.get('fromDate')?.value;
    const toDate = group.get('toDate')?.value;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  loadClients(): void {
    this.vendorService.getDropdownList('CostCenter').subscribe({
      next: (res: any) => {
        if (res && res.isSuccess) {
          this.clients = res.data || [];
        } else if (Array.isArray(res)) {
          this.clients = res;
        }
      },
      error: (err: any) => {
        console.error('Error fetching clients list:', err);
      }
    });
  }

  onClientSelect(clientId: any): void {
    this.models = [];
    this.uploadForm.patchValue({ modelId: null, modelName: '', clientName: '' }, { emitEvent: false });

    if (!clientId) return;

    const selectedClient = this.clients.find(c => c.value?.toString() === clientId?.toString() || c.id?.toString() === clientId?.toString());
    if (selectedClient) {
      this.uploadForm.patchValue({ clientName: selectedClient.name || selectedClient.clientName || '' }, { emitEvent: false });
    }

    this.isLoadingModels = true;
    this.vendorService.getModelListByClient(clientId).subscribe({
      next: (res: any) => {
        this.isLoadingModels = false;
        if (res && res.isSuccess && res.data) {
          this.models = res.data;
        } else if (Array.isArray(res)) {
          this.models = res;
        } else if (res && res.data) {
          this.models = res.data;
        }
      },
      error: (err: any) => {
        this.isLoadingModels = false;
        console.error('Error loading models by client:', err);
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.fileError = '';

    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        this.selectedFile = file;
        this.uploadForm.get('file')?.setValue(file);
      } else {
        this.selectedFile = null;
        this.uploadForm.get('file')?.setValue(null);
        this.fileError = 'Only Excel files (.xlsx, .xls) are allowed.';
      }
    } else {
      this.selectedFile = null;
      this.uploadForm.get('file')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.fileError = 'Please select an Excel file.';
      return;
    }

    const formValues = this.uploadForm.value;
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('fk_clientId', formValues.clientId || '');
    formData.append('clientName', formValues.clientName || '');
    formData.append('modelId', formValues.modelId || '');
    formData.append('modelName', formValues.modelName || '');
    if (formValues.fromDate) {
      formData.append('fromDate', formValues.fromDate);
    }
    if (formValues.toDate) {
      formData.append('toDate', formValues.toDate);
    }

    this.isSubmitting = true;
    this.loader.start();

    this.vendorService.saveVendorExcelDoc(formData).subscribe({
      next: (res: any) => {
        this.loader.stop();
        this.isSubmitting = false;

        if (res && (res.isSuccess || res.statusCode === 200)) {
          alert('Excel file saved successfully!');
          this.resetForm();
          this.navigateToList();
        } else {
          alert(res?.message || 'Failed to upload Excel file.');
        }
      },
      error: (err: any) => {
        this.loader.stop();
        this.isSubmitting = false;
        console.error('Error saving Excel file:', err);
        alert(err?.error?.message || err?.message || 'Error occurred while saving file.');
      }
    });
  }

  resetForm(): void {
    this.selectedFile = null;
    this.fileError = '';
    this.models = [];
    this.uploadForm.reset();
  }

  navigateToList(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_excel_list']);
  }
}
