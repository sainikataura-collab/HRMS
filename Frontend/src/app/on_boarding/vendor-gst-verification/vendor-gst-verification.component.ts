import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';

@Component({
  selector: 'app-vendor-gst-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendor-gst-verification.component.html',
  styleUrl: './vendor-gst-verification.component.scss'
})
export class VendorGstVerificationComponent implements OnInit {
  gstForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  gstData: any = null;
  previewGSTImage: string | null = null;
  originalGSTUrl: string | null = null;
  fileName: { [key: string]: string } = {};
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isGSTMandatory: boolean = false;
  isGSTApplicableFromDb: boolean = false;
  isLoadingGST: boolean = true;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private loader: NgxUiLoaderService,
    private kycService: CandidateExperienceDetailService,
    private companyConfigService: CompanyConfigService
  ) {}

  ngOnInit(): void {
    this.pk_recId = sessionStorage.getItem('candidateKey') || '';
    this.initializeForm();
    this.loadCompanyConfig();
    this.loadGSTDetails();
  }

  initializeForm(): void {
    this.gstForm = this.fb.group({
      Vendor_IsGSTApplicable: [false],
      Vendor_GSTNo: [''],
      GSTPhotoFile: ['']
    });
  }

  updateGSTValidators(isApplicable: boolean): void {
    const gstNoControl = this.gstForm.get('Vendor_GSTNo');
    const photoControl = this.gstForm.get('GSTPhotoFile');

    if (isApplicable) {
      gstNoControl?.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      ]);
      if (!this.gstData?.gstPhoto) {
        photoControl?.setValidators([Validators.required]);
      } else {
        photoControl?.clearValidators();
      }
    } else {
      gstNoControl?.clearValidators();
      photoControl?.clearValidators();
    }
    gstNoControl?.updateValueAndValidity();
    photoControl?.updateValueAndValidity();
  }

  get validate() {
    return this.gstForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isGSTMandatory = this.companyConfig.vendorGstMandatory;
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isGSTMandatory = res.data.vendorGstMandatory;
          }
        }
      });
    }
  }

  checkGSTDuplicate(): void {
    const gstNo = this.gstForm.get('Vendor_GSTNo')?.value?.trim().toUpperCase() || '';
    if (!gstNo) return;

    const existingSavedGST = (this.gstData?.vendor_GSTNo || '').trim().toUpperCase();
    const control = this.gstForm.get('Vendor_GSTNo');

    if (existingSavedGST && gstNo === existingSavedGST) {
      if (control?.hasError('duplicate')) {
        const errors = { ...control.errors };
        delete errors['duplicate'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return;
    }

    this.kycService.CheckDuplicate('GST No', gstNo, this.pk_recId || undefined).subscribe({
      next: (res: any) => {
        if (!res.isSuccess) {
          control?.setErrors({
            ...(control.errors || {}),
            duplicate: res.message || 'GST No already exists.'
          });
        } else {
          if (control?.hasError('duplicate')) {
            const errors = { ...control.errors };
            delete errors['duplicate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      },
      error: (err) => console.error('GST Duplicate Check Error:', err)
    });
  }

  loadGSTDetails(): void {
    this.isLoadingGST = true;
    this.kycService.Get_VendorGST_ById().subscribe({
      next: (res) => {
        this.isLoadingGST = false;
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        this.gstData = res.data;
        if (res.data.pk_recId) {
          this.pk_recId = res.data.pk_recId;
        }

        const control = this.gstForm.get('Vendor_GSTNo');
        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        const isApplicable = res.data.vendor_IsGSTApplicable === true || res.data.vendor_IsGSTApplicable === 1;
        this.isGSTApplicableFromDb = isApplicable;

        this.gstForm.patchValue({
          Vendor_IsGSTApplicable: isApplicable,
          Vendor_GSTNo: res.data.vendor_GSTNo || ''
        });

        this.updateGSTValidators(isApplicable);

        if (isApplicable && res.data.gstPhoto) {
          this.isViewMode = true;
          this.loadImageToView(res.data.gstPhoto);
        } else {
          this.isViewMode = false;
        }
      },
      error: () => {
        this.isLoadingGST = false;
        this.isViewMode = false;
      }
    });
  }

  loadImageToView(filename: string): void {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.originalGSTUrl = reader.result as string;
          this.gstData.gstPhoto = this.originalGSTUrl;
        };
        reader.readAsDataURL(blob);
      }
    });
  }

  onFileSelected(event: any, key: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Only JPG, PNG, or PDF files are allowed', 'Error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File size cannot exceed 5MB', 'Error');
      return;
    }

    this.gstForm.patchValue({ [key]: file });
    this.fileName[key] = file.name;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewGSTImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewGSTImage = null;
    }
  }

  editGST(): void {
    this.isViewMode = false;
    const control = this.gstForm.get('Vendor_GSTNo');
    if (control?.hasError('duplicate')) {
      const errors = { ...control.errors };
      delete errors['duplicate'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const isApplicable = this.gstForm.get('Vendor_IsGSTApplicable')?.value;

    if (isApplicable && this.gstForm.invalid) {
      this.toastr.error('Please enter a valid GST number and upload the certificate.', 'Validation Error');
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    fd.append('Vendor_IsGSTApplicable', isApplicable ? 'true' : 'false');
    fd.append('Vendor_GSTNo', isApplicable ? (this.gstForm.get('Vendor_GSTNo')?.value || '').trim().toUpperCase() : '');

    const file = this.gstForm.get('GSTPhotoFile')?.value;
    if (file && typeof file !== 'string') {
      fd.append('GSTPhotoFile', file);
    }

    this.loader.start();
    this.kycService.verifyVendorGST(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Vendor GST details saved successfully.', 'Success');
          this.loadGSTDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save Vendor GST details.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving Vendor GST details.', 'Error');
      }
    });
  }

  reset(): void {
    this.gstForm.reset({ Vendor_IsGSTApplicable: false });
    this.submitted = false;
    this.fileName = {};
    this.previewGSTImage = null;
  }
}
