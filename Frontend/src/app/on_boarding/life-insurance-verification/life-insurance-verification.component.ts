import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';

@Component({
  selector: 'app-life-insurance-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './life-insurance-verification.component.html',
  styleUrl: './life-insurance-verification.component.scss'
})
export class LifeInsuranceVerificationComponent implements OnInit {
  lifeInsuranceForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  lifeInsuranceData: any = null;
  previewImage: string | null = null;
  originalPhotoUrl: string | null = null;
  fileName: { [key: string]: string } = {};
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isLifeInsuranceMandatory: boolean = false;

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
    this.loadLifeInsuranceDetails();
  }

  initializeForm(): void {
    this.lifeInsuranceForm = this.fb.group({
      lifeInsurance_No: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\s-]{3,30}$/i)]],
      lifeInsurancePhotoFile: ['', Validators.required]
    });
  }

  get validate() {
    return this.lifeInsuranceForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isLifeInsuranceMandatory = this.companyConfig.lifeinsuranceMandatory;
      this.updateValidators();
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isLifeInsuranceMandatory = res.data.lifeinsuranceMandatory;
            this.updateValidators();
          }
        }
      });
    }
  }

  updateValidators(): void {
    const noControl = this.lifeInsuranceForm.get('lifeInsurance_No');
    const fileControl = this.lifeInsuranceForm.get('lifeInsurancePhotoFile');

    if (!this.isLifeInsuranceMandatory) {
      noControl?.clearValidators();
      noControl?.setValidators([Validators.pattern(/^[A-Z0-9\s-]{3,30}$/i)]);
      fileControl?.clearValidators();
    } else {
      noControl?.setValidators([Validators.required, Validators.pattern(/^[A-Z0-9\s-]{3,30}$/i)]);
      if (!this.lifeInsuranceData?.lifeInsurance_Photo) {
        fileControl?.setValidators([Validators.required]);
      }
    }
    noControl?.updateValueAndValidity();
    fileControl?.updateValueAndValidity();
  }

  loadLifeInsuranceDetails(): void {
    this.kycService.Get_LifeInsurance_ById().subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        const data = res.data;
        if (data.pk_recId) {
          this.pk_recId = data.pk_recId;
        }

        // Check if Life Insurance data exists
        if (data.lifeInsurance_No || data.lifeInsurance_Photo) {
          this.lifeInsuranceData = {
            lifeInsurance_No: data.lifeInsurance_No,
            lifeInsurance_Photo: data.lifeInsurance_Photo
          };
          this.lifeInsuranceForm.patchValue({
            lifeInsurance_No: data.lifeInsurance_No || ''
          });

          if (data.lifeInsurance_Photo) {
            this.isViewMode = true;
            this.loadImageToView(data.lifeInsurance_Photo);
            this.lifeInsuranceForm.get('lifeInsurancePhotoFile')?.clearValidators();
            this.lifeInsuranceForm.get('lifeInsurancePhotoFile')?.updateValueAndValidity();
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
          if (this.lifeInsuranceData) {
            this.lifeInsuranceData.lifeInsurance_Photo_url = this.originalPhotoUrl;
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

    this.lifeInsuranceForm.patchValue({ [key]: file });
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

  editLifeInsurance(): void {
    this.isViewMode = false;
    this.lifeInsuranceForm.get('lifeInsurancePhotoFile')?.clearValidators();
    this.lifeInsuranceForm.get('lifeInsurancePhotoFile')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.isLifeInsuranceMandatory && this.lifeInsuranceForm.invalid) {
      this.toastr.error('Please enter a valid Policy Number and upload the document.', 'Validation Error');
      return;
    }

    const policyNo = (this.lifeInsuranceForm.get('lifeInsurance_No')?.value || '').trim().toUpperCase();
    const file = this.lifeInsuranceForm.get('lifeInsurancePhotoFile')?.value;

    if (!policyNo && !file && !this.isLifeInsuranceMandatory) {
      // Optional and empty, move forward
      this.toastr.info('Life Insurance is optional and has been skipped.', 'Info');
      this.router.navigate(['/on_boarding/signature'], { queryParamsHandling: 'preserve' });
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    fd.append('LifeInsurance_No', policyNo);

    if (file && typeof file !== 'string') {
      fd.append('LifeInsurance_PhotoFile', file);
    }

    this.loader.start();
    this.kycService.Save_LifeInsurance(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Life Insurance saved successfully.', 'Success');
          this.loadLifeInsuranceDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save Life Insurance.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving Life Insurance.', 'Error');
      }
    });
  }

  reset(): void {
    this.lifeInsuranceForm.reset();
    this.submitted = false;
    this.fileName = {};
    this.previewImage = null;
  }
}

