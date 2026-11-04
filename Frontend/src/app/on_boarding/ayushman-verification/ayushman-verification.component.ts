import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';

@Component({
  selector: 'app-ayushman-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ayushman-verification.component.html',
  styleUrl: './ayushman-verification.component.scss'
})
export class AyushmanVerificationComponent implements OnInit {
  ayushmanForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  ayushmanData: any = null;
  previewImage: string | null = null;
  originalPhotoUrl: string | null = null;
  fileName: { [key: string]: string } = {};
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isAyushmanMandatory: boolean = false;

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
    this.loadAyushmanDetails();
  }

  initializeForm(): void {
    this.ayushmanForm = this.fb.group({
      ayushman_PMJAY_ID: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\s-]{5,30}$/i)]],
      ayushmanPhotoFile: ['', Validators.required]
    });
  }

  get validate() {
    return this.ayushmanForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isAyushmanMandatory = this.companyConfig.ayushmanMandatory;
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isAyushmanMandatory = res.data.ayushmanMandatory;
          }
        }
      });
    }
  }

  checkAyushmanDuplicate(): void {
    const pmjayId = this.ayushmanForm.get('ayushman_PMJAY_ID')?.value?.trim().toUpperCase() || '';
    if (!pmjayId) return;

    const existingSavedId = (this.ayushmanData?.ayushman_PMJAY_ID || '').trim().toUpperCase();
    const control = this.ayushmanForm.get('ayushman_PMJAY_ID');

    if (existingSavedId && pmjayId === existingSavedId) {
      if (control?.hasError('duplicate')) {
        const errors = { ...control.errors };
        delete errors['duplicate'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return;
    }

    this.kycService.CheckDuplicate('Ayushman ID', pmjayId, this.pk_recId || undefined).subscribe({
      next: (res: any) => {
        if (!res.isSuccess) {
          control?.setErrors({
            ...(control.errors || {}),
            duplicate: res.message || 'Ayushman ID already exists.'
          });
        } else {
          if (control?.hasError('duplicate')) {
            const errors = { ...control.errors };
            delete errors['duplicate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      },
      error: (err) => console.error('Ayushman Duplicate Check Error:', err)
    });
  }

  loadAyushmanDetails(): void {
    this.kycService.Get_Ayushman_ById().subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        const data = res.data;
        if (data.pk_recId) {
          this.pk_recId = data.pk_recId;
        }

        const control = this.ayushmanForm.get('ayushman_PMJAY_ID');
        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        // Check if Ayushman data exists
        if (data.ayushman_PMJAY_ID) {
          this.ayushmanData = {
            ayushman_PMJAY_ID: data.ayushman_PMJAY_ID,
            ayushman_Photo: data.ayushman_Photo
          };
          this.ayushmanForm.patchValue({
            ayushman_PMJAY_ID: data.ayushman_PMJAY_ID || ''
          });

          if (data.ayushman_Photo) {
            this.isViewMode = true;
            this.loadImageToView(data.ayushman_Photo);
            this.ayushmanForm.get('ayushmanPhotoFile')?.clearValidators();
            this.ayushmanForm.get('ayushmanPhotoFile')?.updateValueAndValidity();
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
          if (this.ayushmanData) {
            this.ayushmanData.ayushman_Photo_url = this.originalPhotoUrl;
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

    this.ayushmanForm.patchValue({ [key]: file });
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

  editAyushman(): void {
    this.isViewMode = false;
    const control = this.ayushmanForm.get('ayushman_PMJAY_ID');
    if (control?.hasError('duplicate')) {
      const errors = { ...control.errors };
      delete errors['duplicate'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    this.ayushmanForm.get('ayushmanPhotoFile')?.clearValidators();
    this.ayushmanForm.get('ayushmanPhotoFile')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.ayushmanForm.invalid) {
      this.toastr.error('Please enter a valid PM-JAY ID and upload the Ayushman card photo.', 'Validation Error');
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    fd.append('ayushman_PMJAY_ID', (this.ayushmanForm.get('ayushman_PMJAY_ID')?.value || '').trim().toUpperCase());

    const file = this.ayushmanForm.get('ayushmanPhotoFile')?.value;
    if (file && typeof file !== 'string') {
      fd.append('Ayushman_PhotoFile', file);
    }

    this.loader.start();
    this.kycService.Save_Ayushman(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Ayushman card saved successfully.', 'Success');
          this.loadAyushmanDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save Ayushman card.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving Ayushman card.', 'Error');
      }
    });
  }

  reset(): void {
    this.ayushmanForm.reset();
    this.submitted = false;
    this.fileName = {};
    this.previewImage = null;
  }
}
