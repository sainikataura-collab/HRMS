import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';

@Component({
  selector: 'app-eshram-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './eshram-verification.component.html',
  styleUrl: './eshram-verification.component.scss'
})
export class EshramVerificationComponent implements OnInit {
  eshramForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  eshramData: any = null;
  previewImage: string | null = null;
  originalPhotoUrl: string | null = null;
  fileName: { [key: string]: string } = {};
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isEshramMandatory: boolean = false;

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
    this.loadEshramDetails();
  }

  initializeForm(): void {
    this.eshramForm = this.fb.group({
      eshram_UAN: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\s-]{5,30}$/i)]],
      eshramPhotoFile: ['', Validators.required]
    });
  }

  get validate() {
    return this.eshramForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isEshramMandatory = this.companyConfig.eshramMandatory;
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isEshramMandatory = res.data.eshramMandatory;
          }
        }
      });
    }
  }

  checkEshramDuplicate(): void {
    const uan = this.eshramForm.get('eshram_UAN')?.value?.trim().toUpperCase() || '';
    if (!uan) return;

    const existingSavedUAN = (this.eshramData?.eshram_UAN || '').trim().toUpperCase();
    const control = this.eshramForm.get('eshram_UAN');

    if (existingSavedUAN && uan === existingSavedUAN) {
      if (control?.hasError('duplicate')) {
        const errors = { ...control.errors };
        delete errors['duplicate'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return;
    }

    this.kycService.CheckDuplicate('eShram UAN', uan, this.pk_recId || undefined).subscribe({
      next: (res: any) => {
        if (!res.isSuccess) {
          control?.setErrors({
            ...(control.errors || {}),
            duplicate: res.message || 'eShram UAN already exists.'
          });
        } else {
          if (control?.hasError('duplicate')) {
            const errors = { ...control.errors };
            delete errors['duplicate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      },
      error: (err) => console.error('eShram Duplicate Check Error:', err)
    });
  }

  loadEshramDetails(): void {
    this.kycService.Get_Eshram_ById().subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        const data = res.data;
        if (data.pk_recId) {
          this.pk_recId = data.pk_recId;
        }

        const control = this.eshramForm.get('eshram_UAN');
        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        // Check if E-Shram data exists
        if (data.eshram_UAN) {
          this.eshramData = {
            eshram_UAN: data.eshram_UAN,
            eshram_Photo: data.eshram_Photo
          };
          this.eshramForm.patchValue({
            eshram_UAN: data.eshram_UAN || ''
          });

          if (data.eshram_Photo) {
            this.isViewMode = true;
            this.loadImageToView(data.eshram_Photo);
            this.eshramForm.get('eshramPhotoFile')?.clearValidators();
            this.eshramForm.get('eshramPhotoFile')?.updateValueAndValidity();
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

  loadImageToView(filename: string): void {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.originalPhotoUrl = reader.result as string;
          if (this.eshramData) {
            this.eshramData.eshram_Photo_url = this.originalPhotoUrl;
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

    this.eshramForm.patchValue({ [key]: file });
    this.fileName[key] = file.name;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewImage = null;
    }
  }

  editEshram(): void {
    this.isViewMode = false;
    const control = this.eshramForm.get('eshram_UAN');
    if (control?.hasError('duplicate')) {
      const errors = { ...control.errors };
      delete errors['duplicate'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    this.eshramForm.get('eshramPhotoFile')?.clearValidators();
    this.eshramForm.get('eshramPhotoFile')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.eshramForm.invalid) {
      this.toastr.error('Please enter a valid UAN and upload the E-Shram card photo.', 'Validation Error');
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    fd.append('eshram_UAN', (this.eshramForm.get('eshram_UAN')?.value || '').trim().toUpperCase());

    const file = this.eshramForm.get('eshramPhotoFile')?.value;
    if (file && typeof file !== 'string') {
      fd.append('Eshram_PhotoFile', file);
    }

    this.loader.start();
    this.kycService.Save_Eshram(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'E-Shram card saved successfully.', 'Success');
          this.loadEshramDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save E-Shram card.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving E-Shram card.', 'Error');
      }
    });
  }

  reset(): void {
    this.eshramForm.reset();
    this.submitted = false;
    this.fileName = {};
    this.previewImage = null;
  }
}
