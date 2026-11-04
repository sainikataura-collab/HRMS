import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';


@Component({
  selector: 'app-pan-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './pan-verification.component.html',
  styleUrl: './pan-verification.component.scss'
})
export class PanVerificationComponent implements OnInit {
  panForm!: FormGroup;
  isVerifying: boolean = false;
  submitted = false;
  isVerified = false;
  userId: string = '';
  fileName: string = '';

  panData: any;
  isViewMode = false;
  pk_recId: string = '';

  previewPanImage: string | null = null;
  originalPanUrl: string = '';
  panImageRotation: number = 0;
  showPanImageModal: boolean = false;

  // OCR state properties
  isScanning: boolean = false;
  ocrError: string = '';
  ocrInfo: string = '';

  // Company Config Properties
  companyConfig: CompanyConfig | null = null;
  isPanMandatory: boolean = false;
  isPanVerificationRequired: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private kycService: CandidateExperienceDetailService,
    private ngxUILoaderService: NgxUiLoaderService,
    private companyConfigService: CompanyConfigService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanyConfig();

    this.route.queryParams.subscribe(p => {
      this.pk_recId = p['pk_recId'] ?? '';
      this.initializeForm();
      this.loadPanDetails();
    });
  }

  /** Load company configuration from service or API */
  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();

    if (!this.companyConfig) {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.updateConfigFlags();
          } else {
            this.useDefaultConfig();
          }
        },
        error: () => {
          this.useDefaultConfig();
        }
      });
    } else {
      this.updateConfigFlags();
    }
  }

  updateConfigFlags(): void {
    if (this.companyConfig) {
      this.isPanMandatory = this.companyConfig.panMandatory;
      this.isPanVerificationRequired = this.companyConfig.panVerification;
    }
  }

  useDefaultConfig(): void {
    this.companyConfig = this.companyConfigService.getDefaultConfig();
    this.updateConfigFlags();
  }

  initializeForm(): void {
    this.panForm = this.formBuilder.group({
      PANNo: ['', [Validators.required]],
      PANName: ['', Validators.required],
      PANDob: ['', Validators.required],
      PanCardFile: [null, Validators.required]
    });
  }

  private validatePANFormat(panNo: string): boolean {
    if (!panNo || panNo.length !== 10) {
      return false;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panNo.toUpperCase());
  }

  formatDateForInput(dateVal: any): string {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
      const trimmed = dateVal.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      if (trimmed.includes('T')) {
        const datePart = trimmed.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
      }
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (typeof dateVal === 'string') {
      const datePart = dateVal.trim().split(' ')[0];
      const parts = datePart.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        } else if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      }
    }
    return '';
  }

  checkPANAvailability(panNo: string): void {
    if (!panNo || panNo.trim().length !== 10) {
      return;
    }

    const trimmedPan = panNo.trim().toUpperCase();
    const existingSavedPan = (this.panData?.panNo || '').trim().toUpperCase();
    const panControl = this.panForm.get('PANNo');

    // If user enters their own already-saved PAN in update mode, do not show duplicate error
    if (existingSavedPan && trimmedPan === existingSavedPan) {
      if (panControl?.errors?.['duplicate']) {
        const errors = { ...(panControl.errors || {}) };
        delete errors['duplicate'];
        panControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return;
    }

    const fieldName = 'PAN No';
    const fieldValue = trimmedPan;
    const generalId = this.pk_recId || '';

    this.kycService.CheckDuplicate(fieldName, fieldValue, generalId).subscribe({
      next: (response: any) => {
        if (response && response.isSuccess === false) {
          panControl?.setErrors({
            ...(panControl.errors || {}),
            duplicate: response.message
          });
        } else {
          if (panControl?.errors?.['duplicate']) {
            const errors = { ...(panControl.errors || {}) };
            delete errors['duplicate'];
            panControl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      },
      error: (err) => {
        console.error('PAN Duplicate Check API Error:', err);
      }
    });
  }

  editPan(): void {
    this.isViewMode = false;
    const panControl = this.panForm.get('PANNo');
    if (panControl?.errors?.['duplicate']) {
      const errors = { ...(panControl.errors || {}) };
      delete errors['duplicate'];
      panControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    if (this.panData?.panCard) {
      this.panForm.get('PanCardFile')?.clearValidators();
      this.panForm.get('PanCardFile')?.updateValueAndValidity();
    }
  }

  loadPanDetails() {
    this.kycService.Get_Pan_ById(this.pk_recId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.panData = res.data;
          if (res.data.pk_recId) {
            this.pk_recId = res.data.pk_recId;
          }
          if (res.data.panNo) {
            this.isVerified = true;
          }
          this.panForm.patchValue({
            PANNo: res.data.panNo || '',
            PANName: res.data.panName || '',
            PANDob: this.formatDateForInput(res.data.panDob)
          });

          const panControl = this.panForm.get('PANNo');
          if (panControl?.errors?.['duplicate']) {
            const errors = { ...(panControl.errors || {}) };
            delete errors['duplicate'];
            panControl.setErrors(Object.keys(errors).length ? errors : null);
          }

          if (res.data.panCard) {
            const fileStr = res.data.panCard.toString();
            this.fileName = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing PAN Card';
            this.loadImageToView(this.panData.panCard);
            this.isViewMode = true;
            this.panForm.get('PanCardFile')?.clearValidators();
            this.panForm.get('PanCardFile')?.updateValueAndValidity();
          } else {
            this.isViewMode = false;
          }
        } else {
          this.isViewMode = false;
        }
      },
      error: () => {
        this.isViewMode = false;
      }
    });
  }

  get validate() {
    return this.panForm.controls;
  }

  // Verify PAN Number
  verifyPAN(): void {
    const panNo = (this.panForm.get('PANNo')?.value || '').toUpperCase();

    if (!this.validatePANFormat(panNo)) {
      this.toastrService.error('Please enter a valid 10-character PAN number!', 'Error');
      return;
    }

    this.isVerifying = true;

    this.kycService.Verify_PAN(panNo, this.userId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.panForm.patchValue({
            PANName: res.data.fullName || '',
            PANDob: this.formatDateForInput(res.data.dob)
          });

          this.isVerified = true;
          this.toastrService.success('PAN verified successfully!', 'Success');
        } else {
          this.isVerified = false;
          this.toastrService.error(res.message || 'Invalid PAN number', 'Error');
        }
        this.isVerifying = false;
      },
      error: () => {
        this.isVerified = false;
        this.isVerifying = false;
        this.toastrService.error('An error occurred while verifying PAN. Please try again.', 'Error');
      }
    });
  }

  // Handle file selection
  onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastrService.error('Only JPG, PNG files are allowed', 'Error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastrService.error('File size should not exceed 5MB', 'Error');
        return;
      }

      this.panForm.patchValue({ [fileType]: file });
      this.fileName = file.name;
      this.ocrError = '';
      this.ocrInfo = '';

      // When uploading a new PAN card image and OCR is enabled, clear out previous extracted/entered values
      if (fileType === 'PanCardFile' && this.companyConfig?.panOcr) {
        this.panForm.patchValue({
          PANNo: '',
          PANName: '',
          PANDob: ''
        });
        const panControl = this.panForm.get('PANNo');
        if (panControl?.errors) {
          panControl.setErrors(null);
        }
        this.isVerified = false;
        this.cdr.detectChanges();
      }

      this.panImageRotation = 0;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewPanImage = e.target.result;
      };
      reader.readAsDataURL(file);

      // Trigger OCR ONLY if panOcr is enabled in company master config (same as Aadhaar verification)
      if (fileType === 'PanCardFile' && this.companyConfig?.panOcr) {
        this.processPanOCR(file);
      }

      // allow selecting the same file again
      input.value = '';
    }
  }

  rotatePanImage(degrees: number = 90): void {
    this.panImageRotation = (this.panImageRotation + degrees) % 360;
    if (this.panImageRotation < 0) {
      this.panImageRotation += 360;
    }
  }

  resetPanImageRotation(): void {
    this.panImageRotation = 0;
  }

  openPanImageModal(): void {
    this.showPanImageModal = true;
  }

  closePanImageModal(): void {
    this.showPanImageModal = false;
  }

  /** Clear PAN fields and reset upload on invalid document */
  clearPanFields(errorMessage?: string, keepPreview: boolean = true): void {
    this.panForm.patchValue({
      PANNo: '',
      PANName: '',
      PANDob: ''
    });
    if (!keepPreview) {
      this.panForm.patchValue({ PanCardFile: null });
      this.fileName = '';
      this.previewPanImage = null;
    }
    this.ocrInfo = '';
    if (errorMessage) {
      this.ocrError = errorMessage;
    }
    this.cdr.detectChanges();
  }

    // =====================================================================
  //                           OCR ENGINE (100% Backend Native OCR)
  // =====================================================================

  async processPanOCR(file: File): Promise<void> {
    this.isScanning = true;
    this.ocrError = '';
    this.ocrInfo = '';
    this.panForm.patchValue({
      PANNo: '',
      PANName: '',
      PANDob: ''
    });
    const panControl = this.panForm.get('PANNo');
    if (panControl?.errors) {
      panControl.setErrors(null);
    }
    this.isVerified = false;
    this.cdr.detectChanges();

    try {
      const backendRes: any = await this.kycService.scanPanCardWithOcr(file).toPromise();
      if (backendRes && backendRes.isSuccess && backendRes.data) {
        const { panNo, name, dob } = backendRes.data;
        this.zone.run(() => {
          if (panNo) {
            this.panForm.patchValue({ PANNo: panNo });
            this.panForm.get('PANNo')?.markAsDirty();
            this.panForm.get('PANNo')?.markAsTouched();
            this.checkPANAvailability(panNo);
          }
          if (dob) {
            this.panForm.patchValue({ PANDob: dob });
            this.panForm.get('PANDob')?.markAsDirty();
            this.panForm.get('PANDob')?.markAsTouched();
          }
          if (name) {
            this.panForm.patchValue({ PANName: name });
            this.panForm.get('PANName')?.markAsDirty();
            this.panForm.get('PANName')?.markAsTouched();
          }

          const missing = [
            !panNo && 'PAN No',
            !name && 'Name',
            !dob && 'Date of Birth'
          ].filter(Boolean);

          if (missing.length) {
            this.ocrInfo = `Could not read: ${missing.join(', ')}. Please verify/enter manually.`;
          } else {
            this.ocrInfo = 'PAN card scanned successfully. Please verify details.';
            this.toastrService.success('PAN details extracted successfully!', 'Scan Complete');
          }
          this.cdr.detectChanges();
        });
      } else if (backendRes && !backendRes.isSuccess) {
        this.zone.run(() => {
          this.clearPanFields(backendRes.message || 'Invalid PAN Card image. Please upload a clear and valid PAN card.');
        });
      }
    } catch (backendErr: any) {
      this.zone.run(() => {
        const msg = backendErr?.error?.message || 'Could not scan PAN card. Please enter details manually.';
        this.clearPanFields(msg);
      });
    } finally {
      this.zone.run(() => {
        this.isScanning = false;
        this.cdr.detectChanges();
      });
    }
  }

  // Submit form and save to database
  OnSubmit(): void {
    this.submitted = true;

    if (this.isPanVerificationRequired && !this.isVerified) {
      this.toastrService.warning('Please verify PAN number first', 'Warning');
      return;
    }

    if (!this.isPanVerificationRequired) {
      const panNo = this.panForm.get('PANNo')?.value?.toUpperCase() || '';
      if (!this.validatePANFormat(panNo)) {
        this.toastrService.error('Please enter a valid PAN number', 'Error');
        return;
      }
    }

    if (this.panForm.invalid) {
      return;
    }

    const formData = new FormData();

    formData.append('pk_recId', this.pk_recId);
    formData.append('PANNo', this.panForm.get('PANNo')?.value?.toUpperCase() || '');
    formData.append('PANName', this.panForm.get('PANName')?.value);
    formData.append('PANDob', this.panForm.get('PANDob')?.value);

    const panFile = this.panForm.get('PanCardFile')?.value;
    if (panFile) {
      formData.append('PanCardFile', panFile);
    }

    this.ngxUILoaderService.start();

    this.kycService.verifypan(formData).subscribe({
      next: (result) => {
        this.ngxUILoaderService.stop();
        if (result.isSuccess) {
          this.toastrService.success(result.message || 'PAN details saved successfully!', 'Success');
          this.loadPanDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastrService.error(result.message || 'Failed to save PAN details', 'Error');
        }
      },
      error: () => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('An error occurred while saving PAN details', 'Error');
      }
    });
  }

  // Navigate back
  goBack(): void {
    this.router.navigate(['/dash/setting']);
  }

  // Convert PAN to uppercase and manage verification status
  onPANInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.panForm.patchValue({ PANNo: input.value });

    const existingSavedPan = (this.panData?.panNo || '').trim().toUpperCase();
    if (existingSavedPan && input.value === existingSavedPan) {
      this.isVerified = true;
      const panControl = this.panForm.get('PANNo');
      if (panControl?.errors?.['duplicate']) {
        const errors = { ...(panControl.errors || {}) };
        delete errors['duplicate'];
        panControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    } else if (existingSavedPan && input.value !== existingSavedPan) {
      this.isVerified = false;
    }
  }

  downloadImage(filename: string) {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Failed to download image:', err)
    });
  }

  loadImageToView(filename: string) {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!this.panData) this.panData = {};
          this.panData.panCard = reader.result as string;
          this.originalPanUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {}
    });
  }
}