import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { VendorEmpDocService } from '../Service/vendor-emp-doc.service';

declare var bootstrap: any;

@Component({
  selector: 'app-vendor-emp-doc-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgSelectModule, CommonSearchComponent],
  templateUrl: './vendor-emp-doc-form.component.html',
  styleUrl: './vendor-emp-doc-form.component.scss'
})
export class VendorEmpDocFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  vendorDocService = inject(VendorEmpDocService);
  encryptionService = inject(EncryptionService);
  toastr = inject(ToastrService);
  sanitizer = inject(DomSanitizer);

  empForm!: FormGroup;
  employees: any[] = [];
  initialEmployeeList: any[] = [];
  loadingEmployees = false;
  searchTimer: any;
  documentTypeList: any[] = [];

  isEditMode: boolean = false;
  selectedEmpId: string = '';
  selectedEmpDetails: any = null;
  selectedDocTypeCodeId: number | null = null;
  selectedFiles: File[] = [];
  uploadedDocuments: any[] = [];

  isUploading = false;
  isLoadingDocs = false;
  selectedDocument: any = null;
  previewModal: any;

  ngOnInit(): void {
    this.initForm();
    this.loadDocumentTypes();
    this.loadEmployees();

    this.route.paramMap.subscribe(params => {
      const rawEmpId = params.get('empId');
      if (rawEmpId) {
        this.isEditMode = true;
        const decryptedEmpId = this.encryptionService.decryptText(rawEmpId);
        const empId = decryptedEmpId || rawEmpId;
        this.selectedEmpId = empId;
        this.empForm.patchValue({ fk_empId: empId });
        this.onEmployeeSelect({ value: empId });
      }
    });
  }

  initForm(): void {
    this.empForm = this.fb.group({
      fk_empId: [null, Validators.required]
    });
  }

  loadDocumentTypes(): void {
    this.vendorDocService.getDocumentTypes().subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.documentTypeList = res.data.map((d: any) => ({
            name: d.name,
            value: Number(d.value)
          }));
        } else {
          this.documentTypeList = [];
        }
      },
      error: () => {
        this.documentTypeList = [];
      }
    });
  }

  loadEmployees(search: string = ''): void {
    this.loadingEmployees = true;
    this.vendorDocService.getEmployees('', search).subscribe({
      next: (res: any) => {
        this.loadingEmployees = false;
        if (res?.isSuccess && res.data) {
          this.employees = res.data.map((emp: any) => ({
            name: emp.name ? emp.name : `${emp.empcode || ''} - ${emp.empname || ''}`,
            value: emp.value ? emp.value : (emp.pk_empid || emp.empId),
            raw: emp
          }));
          if (!search) {
            this.initialEmployeeList = [...this.employees];
          }
          if (this.selectedEmpId && !this.selectedEmpDetails) {
            const emp = this.employees.find(e => String(e.value) === String(this.selectedEmpId));
            if (emp) {
              this.selectedEmpDetails = emp.raw;
            }
          }
        } else {
          this.employees = [];
        }
      },
      error: () => {
        this.loadingEmployees = false;
        this.employees = [];
      }
    });
  }

  onEmployeeSearch(event: any): void {
    const search = (event?.term || '').trim().toLowerCase();
    clearTimeout(this.searchTimer);

    if (!search) {
      this.employees = [...this.initialEmployeeList];
      this.loadingEmployees = false;
      return;
    }

    const local = this.initialEmployeeList.filter(x =>
      x.name.toLowerCase().includes(search)
    );

    if (local.length > 0) {
      this.employees = local;
      this.loadingEmployees = false;
      return;
    }

    this.loadingEmployees = true;
    this.searchTimer = setTimeout(() => {
      this.loadEmployees(search);
    }, 500);
  }

  handleFilters(filters: any): void {
    const search = filters?.empCode || filters?.empName || filters?.search || '';
    this.loadEmployees(search);
  }

  onEmployeeSelect(item: any): void {
    const val = item?.value !== undefined ? item.value : item;
    if (val) {
      this.selectedEmpId = val;
      const emp = this.employees.find(e => e.value === val);
      this.selectedEmpDetails = emp?.raw || null;
      this.loadUploadedDocuments(this.selectedEmpId);
    } else {
      this.selectedEmpId = '';
      this.selectedEmpDetails = null;
      this.uploadedDocuments = [];
    }
  }

  loadUploadedDocuments(empId: string): void {
    if (!empId) return;
    this.isLoadingDocs = true;
    const vendorId = this.selectedEmpDetails?.vendorId || this.selectedEmpDetails?.fk_vendorId || '';
    this.vendorDocService.getDocsByEmpAndVendor(empId, vendorId).subscribe({
      next: (res: any) => {
        this.isLoadingDocs = false;
        if (res?.isSuccess && res.data) {
          this.uploadedDocuments = res.data;
        } else {
          this.uploadedDocuments = [];
        }
      },
      error: () => {
        this.isLoadingDocs = false;
        this.uploadedDocuments = [];
      }
    });
  }

  // ── FILE DRAG & DROP ───────────────────────────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDropFiles(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  addFiles(files: File[]): void {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    for (const f of files) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!allowed.includes(ext)) {
        this.toastr.warning(`File "${f.name}" format not supported.`, 'Warning');
        continue;
      }
      if (f.size > maxBytes) {
        this.toastr.warning(`File "${f.name}" exceeds 5MB limit.`, 'Warning');
        continue;
      }
      this.selectedFiles.push(f);
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  // ── UPLOAD ALL FILES ──────────────────────────────────────────────────────
  uploadAllFiles(): void {
    if (!this.selectedEmpId) {
      this.toastr.warning('Please select an employee first.', 'Warning');
      return;
    }
    if (!this.selectedDocTypeCodeId) {
      this.toastr.warning('Please select a Document Type.', 'Warning');
      return;
    }
    if (this.selectedFiles.length === 0) {
      this.toastr.warning('Please attach at least one file.', 'Warning');
      return;
    }

    const docTypeObj = this.documentTypeList.find(d => d.value === this.selectedDocTypeCodeId);
    const docTypeName = docTypeObj?.name || 'Document';

    const formData = new FormData();
    formData.append('empId', this.selectedEmpId);
    const vendorId = this.selectedEmpDetails?.vendorId || this.selectedEmpDetails?.fk_vendorId || '';
    if (vendorId) {
      formData.append('vendorId', vendorId);
    }
    formData.append('docTypeCodeId', this.selectedDocTypeCodeId.toString());
    formData.append('docTypeName', docTypeName);

    for (const f of this.selectedFiles) {
      formData.append('files', f, f.name);
    }

    this.isUploading = true;
    this.vendorDocService.uploadEmployeeDocuments(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Documents uploaded successfully.', 'Success');
          this.selectedFiles = [];
          this.selectedDocTypeCodeId = null;
          this.loadUploadedDocuments(this.selectedEmpId);
        } else {
          this.toastr.error(res?.message || 'Upload failed.', 'Error');
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        this.toastr.error(err?.error?.message || 'Failed to upload documents.', 'Error');
      }
    });
  }

  // ── DELETE DOCUMENT ───────────────────────────────────────────────────────
  deleteDocument(docId: number): void {
    if (!confirm('Are you sure you want to delete this document?')) return;
    this.vendorDocService.deleteDocument(docId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toastr.success('Document deleted successfully.', 'Success');
          this.loadUploadedDocuments(this.selectedEmpId);
        } else {
          this.toastr.error(res?.message || 'Failed to delete.', 'Error');
        }
      },
      error: () => {
        this.toastr.error('Error deleting document.', 'Error');
      }
    });
  }

  // ── VIEW DOCUMENT MODAL ───────────────────────────────────────────────────
  viewDocument(doc: any): void {
    const docId = doc.pk_docId || doc.Pk_docId;
    this.selectedDocument = { ...doc, safeUrl: null };

    const modalEl = document.getElementById('viewVendorDocModal');
    if (modalEl) {
      this.previewModal = new bootstrap.Modal(modalEl);
      this.previewModal.show();
    }

    this.vendorDocService.downloadFileBlob(docId).subscribe({
      next: (blob: Blob) => {
        const mimeType = doc.mimeType || doc.MimeType || blob.type || 'application/pdf';
        const fileBlob = new Blob([blob], { type: mimeType });
        let blobUrl = URL.createObjectURL(fileBlob);
        if (mimeType.toLowerCase().includes('pdf')) {
          blobUrl += '#toolbar=0&navpanes=0&scrollbar=0';
        }
        this.selectedDocument.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      },
      error: () => {
        this.toastr.error('Failed to load document preview.', 'Error');
      }
    });
  }

  // ── PROGRESS HELPERS ───────────────────────────────────────────────────────
  getApprovedCount(): number {
    if (!this.uploadedDocuments || this.uploadedDocuments.length === 0) return 0;
    return this.uploadedDocuments.filter(d => (d.verificationStatus || d.VerificationStatus) === 'Approved').length;
  }

  getApprovalPercent(): number {
    if (!this.uploadedDocuments || this.uploadedDocuments.length === 0) return 0;
    const approved = this.getApprovedCount();
    return Math.round((approved / this.uploadedDocuments.length) * 100);
  }
}
