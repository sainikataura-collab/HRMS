import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';
declare var bootstrap: any;

@Component({
  selector: 'app-driving-licence-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './driving-licence-verification.component.html',
  styleUrl: './driving-licence-verification.component.scss'
})
export class DrivingLicenceVerificationComponent implements OnInit {
  dlForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  dlData: any = null;
  previewDLImage: string | null = null;
  previewInsuranceImage: string | null = null;
  previewRCImage: string | null = null;
  originalDLUrl: string | null = null;
  originalDLPath: string = '';
  originalInsurancePath: string = '';
  originalRCPath: string = '';
  originalInsuranceUrl: string | null = null;
  originalRCUrl: string | null = null;
  fileName: { [key: string]: string } = {};
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isDLMandatory: boolean = false;
  previewImageSrc: string = '';
previewImageTitle: string = '';

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
    this.loadDLDetails();
  }

  initializeForm(): void {
    this.dlForm = this.fb.group({
      DLNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\s-]{5,25}$/i)]],
      DLPhotoFile: ['', Validators.required],
      Vehicle_Insurance_No: [''],
      Vehicle_Insurance_PhotoFile: [''],
      Vehicle_RC_No: [''],
      Vehicle_RC_PhotoFile: ['']
    });
  }

  get validate() {
    return this.dlForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isDLMandatory = this.companyConfig.drivingLicenceMandatory;
      this.applyValidators();
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isDLMandatory = res.data.drivingLicenceMandatory;
            this.applyValidators();
          }
        }
      });
    }
  }

  applyValidators(): void {
    if (this.companyConfig?.vehicleInsuranceMandatory) {
      this.dlForm.get('Vehicle_Insurance_No')?.setValidators([Validators.required]);
      this.dlForm.get('Vehicle_Insurance_PhotoFile')?.setValidators([Validators.required]);
    } else {
      this.dlForm.get('Vehicle_Insurance_No')?.clearValidators();
      this.dlForm.get('Vehicle_Insurance_PhotoFile')?.clearValidators();
    }

    if (this.companyConfig?.vehicleRCMandatory) {
      this.dlForm.get('Vehicle_RC_No')?.setValidators([Validators.required]);
      this.dlForm.get('Vehicle_RC_PhotoFile')?.setValidators([Validators.required]);
    } else {
      this.dlForm.get('Vehicle_RC_No')?.clearValidators();
      this.dlForm.get('Vehicle_RC_PhotoFile')?.clearValidators();
    }

    this.dlForm.get('Vehicle_Insurance_No')?.updateValueAndValidity();
    this.dlForm.get('Vehicle_Insurance_PhotoFile')?.updateValueAndValidity();
    this.dlForm.get('Vehicle_RC_No')?.updateValueAndValidity();
    this.dlForm.get('Vehicle_RC_PhotoFile')?.updateValueAndValidity();
  }

  checkDLDuplicate(): void {
    const dlNo = this.dlForm.get('DLNo')?.value?.trim().toUpperCase() || '';
    if (!dlNo) return;

    const existingSavedDL = (this.dlData?.dlNo || '').trim().toUpperCase();
    const control = this.dlForm.get('DLNo');

    if (existingSavedDL && dlNo === existingSavedDL) {
      if (control?.hasError('duplicate')) {
        const errors = { ...control.errors };
        delete errors['duplicate'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return;
    }

    this.kycService.CheckDuplicate('Driving Licence', dlNo, this.pk_recId || undefined).subscribe({
      next: (res: any) => {
        if (!res.isSuccess) {
          control?.setErrors({
            ...(control.errors || {}),
            duplicate: res.message || 'Driving Licence already exists.'
          });
        } else {
          if (control?.hasError('duplicate')) {
            const errors = { ...control.errors };
            delete errors['duplicate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      },
      error: (err) => console.error('DL Duplicate Check Error:', err)
    });
  }

  loadDLDetails(): void {
    this.kycService.Get_DrivingLicence_ById().subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        this.dlData = res.data;
        if (res.data.pk_recId) {
          this.pk_recId = res.data.pk_recId;
        }

        const control = this.dlForm.get('DLNo');
        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        this.dlForm.patchValue({
          DLNo: res.data.dlNo || '',
          Vehicle_Insurance_No: res.data.vehicle_Insurance_No || '',
          Vehicle_RC_No: res.data.vehicle_RC_No || ''
        });

        // Set View Mode if at least DL Photo exists (adjust logic if all 3 are required)
        if (res.data.dlPhoto || res.data.vehicle_Insurance_Photo || res.data.vehicle_RC_Photo) {
          this.isViewMode = true;
          
          if (res.data.dlPhoto) {
            this.originalDLPath = res.data.dlPhoto.toString();
              this.loadImageToView(res.data.dlPhoto, 'dlPhoto');
            this.dlForm.get('DLPhotoFile')?.clearValidators();
            this.dlForm.get('DLPhotoFile')?.updateValueAndValidity();
          }
          if (res.data.vehicle_Insurance_Photo) {
            this.originalInsurancePath = res.data.vehicle_Insurance_Photo.toString();
              this.loadImageToView(res.data.vehicle_Insurance_Photo, 'vehicle_Insurance_Photo');
            this.dlForm.get('Vehicle_Insurance_PhotoFile')?.clearValidators();
            this.dlForm.get('Vehicle_Insurance_PhotoFile')?.updateValueAndValidity();
          }
          if (res.data.vehicle_RC_Photo) {
            this.originalRCPath = res.data.vehicle_RC_Photo.toString();
              this.loadImageToView(res.data.vehicle_RC_Photo, 'vehicle_RC_Photo');
            this.dlForm.get('Vehicle_RC_PhotoFile')?.clearValidators();
            this.dlForm.get('Vehicle_RC_PhotoFile')?.updateValueAndValidity();
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

  loadImageToView(filename: string, type: string): void {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (type === 'dlPhoto') {
            this.originalDLUrl = reader.result as string;
            this.dlData.dlPhoto = this.originalDLUrl;
              this.previewDLImage = this.originalDLUrl;
          } else if (type === 'vehicle_Insurance_Photo') {
            this.originalInsuranceUrl = reader.result as string;
            this.dlData.vehicle_Insurance_Photo = this.originalInsuranceUrl;
              this.previewInsuranceImage = this.originalInsuranceUrl;
          } else if (type === 'vehicle_RC_Photo') {
            this.originalRCUrl = reader.result as string;
            this.dlData.vehicle_RC_Photo = this.originalRCUrl;
              this.previewRCImage = this.originalRCUrl;
          }
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

    this.dlForm.patchValue({ [key]: file });
    this.fileName[key] = file.name;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (key === 'DLPhotoFile') {
          this.previewDLImage = reader.result as string;
        } else if (key === 'Vehicle_Insurance_PhotoFile') {
          this.previewInsuranceImage = reader.result as string;
        } else if (key === 'Vehicle_RC_PhotoFile') {
          this.previewRCImage = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (key === 'DLPhotoFile') {
        this.previewDLImage = null;
      } else if (key === 'Vehicle_Insurance_PhotoFile') {
        this.previewInsuranceImage = null;
      } else if (key === 'Vehicle_RC_PhotoFile') {
        this.previewRCImage = null;
      }
    }
  }

  editDL(): void {
    this.isViewMode = false;
    const control = this.dlForm.get('DLNo');
    if (control?.hasError('duplicate')) {
      const errors = { ...control.errors };
      delete errors['duplicate'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    
    if (this.dlData?.dlPhoto) {
      this.dlForm.get('DLPhotoFile')?.clearValidators();
      this.dlForm.get('DLPhotoFile')?.updateValueAndValidity();
    }
    
    if (this.dlData?.vehicle_Insurance_Photo) {
      this.dlForm.get('Vehicle_Insurance_PhotoFile')?.clearValidators();
      this.dlForm.get('Vehicle_Insurance_PhotoFile')?.updateValueAndValidity();
    }
    
    if (this.dlData?.vehicle_RC_Photo) {
      this.dlForm.get('Vehicle_RC_PhotoFile')?.clearValidators();
      this.dlForm.get('Vehicle_RC_PhotoFile')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.dlForm.invalid) {
      this.toastr.error('Please enter a valid Driving Licence number and upload the photo.', 'Validation Error');
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    fd.append('DLNo', (this.dlForm.get('DLNo')?.value || '').trim().toUpperCase());
    fd.append('Vehicle_Insurance_No', (this.dlForm.get('Vehicle_Insurance_No')?.value || '').trim().toUpperCase());
    fd.append('Vehicle_RC_No', (this.dlForm.get('Vehicle_RC_No')?.value || '').trim().toUpperCase());

    const dlFile = this.dlForm.get('DLPhotoFile')?.value;
    if (dlFile && typeof dlFile !== 'string') {
      fd.append('DLPhotoFile', dlFile);
    }

    const insuranceFile = this.dlForm.get('Vehicle_Insurance_PhotoFile')?.value;
    if (insuranceFile && typeof insuranceFile !== 'string') {
      fd.append('Vehicle_Insurance_PhotoFile', insuranceFile);
    }

    const rcFile = this.dlForm.get('Vehicle_RC_PhotoFile')?.value;
    if (rcFile && typeof rcFile !== 'string') {
      fd.append('Vehicle_RC_PhotoFile', rcFile);
    }

    this.loader.start();
    this.kycService.verifyDrivingLicence(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Driving Licence saved successfully.', 'Success');
          this.loadDLDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save Driving Licence.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving Driving Licence.', 'Error');
      }
    });
  }

  reset(): void {
    this.dlForm.reset();
    this.submitted = false;
    this.fileName = {};
    this.previewDLImage = null;
  }

  openImagePreview(src: string, title: string) {
  this.previewImageSrc = src;
  this.previewImageTitle = title;
  const modalEl = document.getElementById('imagePreviewModal');
  const modal = new bootstrap.Modal(modalEl!);
  modal.show();
}
}
