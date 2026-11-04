import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';

@Component({
  selector: 'app-signature-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signature-verification.component.html',
  styleUrl: './signature-verification.component.scss'
})
export class SignatureVerificationComponent implements OnInit {
  signatureForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  signatureData: any = null;
  previewSignature: string | null = null;
  originalSignatureUrl: string | null = null;
  fileName: string = '';
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isSignatureMandatory: boolean = false;

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
    this.loadSignatureDetails();
  }

  initializeForm(): void {
    this.signatureForm = this.fb.group({
      SignaturePhotoFile: ['', Validators.required]
    });
  }

  get validate() {
    return this.signatureForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isSignatureMandatory = this.companyConfig.signatureMandatory;
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isSignatureMandatory = res.data.signatureMandatory;
          }
        }
      });
    }
  }

  loadSignatureDetails(): void {
    this.kycService.Get_Signature_ById().subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data || !res.data.signaturePhoto) {
          this.isViewMode = false;
          return;
        }

        this.signatureData = res.data;
        this.isViewMode = true;
        this.loadImageToView(res.data.signaturePhoto);
        this.signatureForm.get('SignaturePhotoFile')?.clearValidators();
        this.signatureForm.get('SignaturePhotoFile')?.updateValueAndValidity();
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
          this.originalSignatureUrl = reader.result as string;
          this.signatureData.signaturePhoto = this.originalSignatureUrl;
        };
        reader.readAsDataURL(blob);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Only JPG or PNG images are allowed for signature', 'Error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      this.toastr.error('File size cannot exceed 3MB', 'Error');
      return;
    }

    this.signatureForm.patchValue({ SignaturePhotoFile: file });
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewSignature = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  editSignature(): void {
    this.isViewMode = false;
    this.signatureForm.get('SignaturePhotoFile')?.clearValidators();
    this.signatureForm.get('SignaturePhotoFile')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;

    const file = this.signatureForm.get('SignaturePhotoFile')?.value;
    if (!file && !this.signatureData?.signaturePhoto) {
      this.toastr.error('Please upload your signature image.', 'Validation Error');
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);

    if (file && typeof file !== 'string') {
      fd.append('SignaturePhotoFile', file);
    }

    this.loader.start();
    this.kycService.verifySignature(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Signature saved successfully.', 'Success');
          this.loadSignatureDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save signature.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving signature.', 'Error');
      }
    });
  }

  reset(): void {
    this.signatureForm.reset();
    this.submitted = false;
    this.fileName = '';
    this.previewSignature = null;
  }
}
