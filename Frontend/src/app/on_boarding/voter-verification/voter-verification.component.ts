import { Component, OnInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
declare var bootstrap: any;

@Component({
  selector: 'app-voter-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './voter-verification.component.html',
  styleUrl: './voter-verification.component.scss'
})
export class VoterVerificationComponent implements OnInit {
  @ViewChild('otpModal') otpModal!: ElementRef;

  voterForm!: FormGroup;
  submitted = false;
  pk_recId: string = '';
  isViewMode = false;
  voterData: any;
  Isverifyvoter = false;
  previewFrontImage: string | null = null;
  previewBackImage: string | null = null;
  originalFrontUrl: string = '';
  originalVoterFrontPath: string = '';
  originalVoterBackPath: string = '';
  originalBackUrl: string = '';
  fileName: any = {};
  isVoterVerified = false;
  isVerifying: boolean = false;

  // OCR state properties
  isScanning: boolean = false;
  isScanningPerFile: { [key: string]: boolean } = {};
  ocrError: { [key: string]: string } = {};

  otp: string[] = ['', '', '', '', '', ''];
  companyConfig: any;

  // View & Rotation State (matching PAN and Aadhaar)
  voterRotations: { [key: string]: number } = {
    VoterFrontPhotoFile: 0,
    VoterBackPhotoFile: 0
  };
  showVoterModal: boolean = false;
  modalImageSrc: string = '';
  modalImageTitle: string = '';
  modalImageType: string = 'VoterFrontPhotoFile';

  rotateVoterImage(fileType: string, degrees: number = 90): void {
    const cur = this.voterRotations[fileType] || 0;
    this.voterRotations[fileType] = (cur + degrees + 360) % 360;
  }

  resetVoterImageRotation(fileType: string): void {
    this.voterRotations[fileType] = 0;
  }

  openVoterModal(src: string, title: string, fileType: string): void {
    this.modalImageSrc = src;
    this.modalImageTitle = title;
    this.modalImageType = fileType;
    this.showVoterModal = true;
  }

  closeVoterModal(): void {
    this.showVoterModal = false;
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private kycService: CandidateExperienceDetailService,
    private loader: NgxUiLoaderService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      this.pk_recId = p['pk_recId'] ?? '';
    });
    this.getMandatoryDetails();
    this.initializeForm();
    this.loadVoterDetails();
  }

  editVoter() {
    this.isViewMode = false;
    const control = this.voterForm.get('VoterNo');
    if (control?.hasError('duplicate')) {
      const errors = { ...control.errors };
      delete errors['duplicate'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  checkVoterDuplicate(): void {
    const voterNo = this.voterForm.get('VoterNo')?.value?.trim().toUpperCase() || '';
    if (!voterNo) return;

    const existingSavedVoter = (this.voterData?.voterNo || '').trim().toUpperCase();
    const control = this.voterForm.get('VoterNo');

    if (existingSavedVoter && voterNo === existingSavedVoter) {
      if (control?.hasError('duplicate')) {
        const errors = { ...control.errors };
        delete errors['duplicate'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return;
    }

    this.kycService.CheckDuplicate('Voter ID', voterNo, this.pk_recId || undefined).subscribe({
      next: (res: any) => {
        if (!res.isSuccess) {
          control?.setErrors({
            ...(control.errors || {}),
            duplicate: res.message || 'Voter ID already exists.'
          });
        } else {
          if (control?.hasError('duplicate')) {
            const errors = { ...control.errors };
            delete errors['duplicate'];
            control.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      },
      error: (err) => console.error('Voter Duplicate Check Error:', err)
    });
  }

  initializeForm(): void {
    this.voterForm = this.fb.group({
      VoterNo: ['', Validators.required],
      VoterName: [''],
      VoterDOB: [''],
      VoterAddress: [''],
      VoterFrontPhotoFile: ['', Validators.required],
      VoterBackPhotoFile: ['']
    });
  }

  get validate() {
    return this.voterForm.controls;
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

  loadVoterDetails() {
    this.kycService.Get_Voter_ById(this.pk_recId).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        this.voterData = res.data;
        if (res.data.pk_recId) {
          this.pk_recId = res.data.pk_recId;
        }

        const control = this.voterForm.get('VoterNo');
        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        this.voterForm.patchValue({
          VoterNo: res.data.voterNo || '',
          VoterName: res.data.voterName || '',
          VoterDOB: this.formatDateForInput(res.data.voterDOB),
          VoterAddress: res.data.voterAddress || ''
        });

        if (this.voterData.voterFrontPhoto || this.voterData.voterBackPhoto) {
          this.isViewMode = true;
          if (this.voterData.voterFrontPhoto) {
            this.originalVoterFrontPath = this.voterData.voterFrontPhoto.toString();
            const fileStr = this.voterData.voterFrontPhoto.toString();
            this.fileName['VoterFrontPhotoFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing File';
            this.loadImageToView(this.voterData.voterFrontPhoto, 'front');
            this.voterForm.get('VoterFrontPhotoFile')?.clearValidators();
            this.voterForm.get('VoterFrontPhotoFile')?.updateValueAndValidity();
          }
          if (this.voterData.voterBackPhoto) {
            this.originalVoterBackPath = this.voterData.voterBackPhoto.toString();
            const fileStr = this.voterData.voterBackPhoto.toString();
            this.fileName['VoterBackPhotoFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing File';
            this.loadImageToView(this.voterData.voterBackPhoto, 'back');
            this.voterForm.get('VoterBackPhotoFile')?.clearValidators();
            this.voterForm.get('VoterBackPhotoFile')?.updateValueAndValidity();
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

  getMandatoryDetails() {
    this.kycService.getMandatoryDetails().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.companyConfig = res.data;
          this.isVoterVerified = false;
        } else {
          this.isVoterVerified = true;
        }
      },
      error: () => {},
    });
  }

  verifyVoter(): void {
    const voterNo = this.voterForm.get('VoterNo')?.value;

    if (!voterNo) {
      this.toastr.error('Please enter Voter ID number!', 'Error');
      return;
    }

    this.isVerifying = true;

    // Call API to verify Voter ID
    // this.kycService.Verify_Voter(voterNo).subscribe({
    //   next: (res) => {
    //     if (res.isSuccess && res.data) {
    //       // Auto-fill form with API data
    //       this.voterForm.patchValue({
    //         VoterName: res.data.fullName || '',
    //         VoterDOB: res.data.dob || '',
    //         VoterAddress: res.data.address || ''
    //       });

    //       this.Isverifyvoter = true;
    //       this.toastr.success('Voter ID verified successfully!', 'Success');
    //     } else {
    //       this.Isverifyvoter = false;
    //       this.toastr.error(res.message || 'Invalid Voter ID', 'Error');
    //     }
    //     this.isVerifying = false;
    //   },
    //   error: (error) => {
    //     this.Isverifyvoter = false;
    //     this.isVerifying = false;
    //     this.toastr.error('An error occurred while verifying Voter ID. Please try again.', 'Error');
    //   }
    // });
  }

  OTPVoter() {
    const voterNo = this.voterForm.get('VoterNo')?.value || '';
    if (!voterNo) {
      this.toastr.error('Please enter Voter ID No', 'Error');
      return;
    }
    this.loader.start();
    // Uncomment when API is ready
    // this.kycService.Verify_Voter_OTP(voterNo).subscribe({
    //   next: res => {
    //     this.loader.stop();
    //     if (res.isSuccess) {
    //       sessionStorage.setItem('voter_client_id', res.data.client_id || '');
    //       this.open_OTP_Modal();
    //       this.toastr.success('OTP sent successfully!', 'Success');
    //     } else {
    //       this.toastr.error(res.message || 'Verification failed', 'Error');
    //     }
    //   },
    //   error: () => {
    //     this.loader.stop();
    //     this.toastr.error('Error verifying voter', 'Error');
    //   }
    // });
  }

  open_OTP_Modal() {
    const modal = new bootstrap.Modal(this.otpModal.nativeElement, {
      backdrop: 'static',
      keyboard: false,
    });
    modal.show();
  }

  close_OTP_Modal() {
    const modal = bootstrap.Modal.getInstance(this.otpModal.nativeElement);
    modal?.hide();
  }

  onKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (/^\d$/.test(input.value)) {
      this.otp[index] = input.value;
      const nextInput = document.querySelector(
        `#otp input:nth-child(${index + 2}`
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    } else {
      input.value = '';
    }
    if (event.key === 'Backspace' && index > 0) {
      const prevInput = document.querySelector(
        `#otp input:nth-child(${index})`
      ) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otp.every((d) => d !== '');
  }

  SubmitOtpVoter() {
    const otpStr = this.otp.join('');
    if (otpStr.length !== 6) {
      this.toastr.error('Enter valid 6-digit OTP', 'Error');
      return;
    }
    const client_id = sessionStorage.getItem('voter_client_id') || '';
    // Uncomment when API is ready
    // this.kycService.Verify_Voter_Submit_OTP({ client_id, otp: otpStr }).subscribe({
    //   next: res => {
    //     if (res.isSuccess) {
    //       this.toastr.success(res.message || 'Voter verified successfully', 'Success');
    //       this.Isverifyvoter = true;
    //       this.close_OTP_Modal();
    //     } else { this.toastr.error(res.message || 'Invalid OTP', 'Error'); }
    //   },
    //   error: () => { this.toastr.error('Error submitting OTP', 'Error'); }
    // });
  }

  /**
   * Clear Voter fields and reset upload on invalid document
   */
  clearVoterFields(fileType: string, errorMessage?: string): void {
    if (fileType === 'VoterFrontPhotoFile') {
      this.voterForm.patchValue({
        VoterFrontPhotoFile: null,
        VoterNo: '',
        VoterName: '',
        VoterDOB: ''
      });
      delete this.fileName['VoterFrontPhotoFile'];
      this.previewFrontImage = null;
    } else if (fileType === 'VoterBackPhotoFile') {
      this.voterForm.patchValue({
        VoterBackPhotoFile: null,
        VoterAddress: ''
      });
      delete this.fileName['VoterBackPhotoFile'];
      this.previewBackImage = null;
    }
    if (errorMessage) {
      this.ocrError[fileType] = errorMessage;
    }
    this.cdr.detectChanges();
  }

    // =====================================================================
  //                           OCR ENGINE (100% Backend Native OCR)
  // =====================================================================

  async processVoterOCR(file: File, fileType: string): Promise<void> {
    this.isScanningPerFile[fileType] = true;
    this.isScanning = true;
    this.ocrError[fileType] = '';
    this.cdr.detectChanges();

    const side = fileType === 'VoterBackPhotoFile' ? 'back' : 'front';

    try {
      const backendRes: any = await this.kycService.scanVoterCardWithOcr(file, side).toPromise();
      if (backendRes && backendRes.isSuccess && backendRes.data) {
        const { voterNo, name, dob, address } = backendRes.data;

        this.zone.run(() => {
          if (fileType === 'VoterFrontPhotoFile') {
            if (voterNo) {
              this.voterForm.patchValue({ VoterNo: voterNo });
              this.voterForm.get('VoterNo')?.markAsDirty();
              this.voterForm.get('VoterNo')?.markAsTouched();
            }
            if (name) {
              this.voterForm.patchValue({ VoterName: name });
              this.voterForm.get('VoterName')?.markAsDirty();
              this.voterForm.get('VoterName')?.markAsTouched();
            }
            if (dob) {
              this.voterForm.patchValue({ VoterDOB: dob });
              this.voterForm.get('VoterDOB')?.markAsDirty();
              this.voterForm.get('VoterDOB')?.markAsTouched();
            }
            this.ocrError[fileType] = '';
            this.toastr.success('Voter ID details extracted successfully!', 'Scan Complete');
          } else if (fileType === 'VoterBackPhotoFile') {
            if (address) {
              this.voterForm.patchValue({ VoterAddress: address });
              this.voterForm.get('VoterAddress')?.markAsDirty();
              this.voterForm.get('VoterAddress')?.markAsTouched();
            }
            this.ocrError[fileType] = '';
            this.toastr.success('Address extracted from Voter ID Back successfully!', 'Scan Complete');
          }

          this.isScanningPerFile[fileType] = false;
          this.isScanning = Object.values(this.isScanningPerFile).some(s => s === true);
          this.cdr.detectChanges();
        });
      } else if (backendRes && !backendRes.isSuccess) {
        this.zone.run(() => {
          this.clearVoterFields(fileType, backendRes.message || 'Invalid Voter ID Card image.');
          this.isScanningPerFile[fileType] = false;
          this.isScanning = Object.values(this.isScanningPerFile).some(s => s === true);
          this.cdr.detectChanges();
        });
      }
    } catch (backendErr: any) {
      this.zone.run(() => {
        const msg = backendErr?.error?.message || 'Could not scan Voter ID. Please enter details manually.';
        this.clearVoterFields(fileType, msg);
        this.isScanningPerFile[fileType] = false;
        this.isScanning = Object.values(this.isScanningPerFile).some(s => s === true);
        this.cdr.detectChanges();
      });
    }
  }

  onFileSelected(event: any, key: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      this.toastr.error('Only JPG/PNG allowed', 'Error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('Max size 5MB', 'Error');
      return;
    }

    this.voterForm.patchValue({ [key]: file });
    this.fileName[key] = file.name;
    this.ocrError[key] = '';

    // Clear previous values when uploading new image and OCR is enabled
    if (this.companyConfig?.voterOcr) {
      if (key === 'VoterFrontPhotoFile') {
        this.voterForm.patchValue({
          VoterNo: '',
          VoterName: '',
          VoterDOB: ''
        });
        const voterControl = this.voterForm.get('VoterNo');
        if (voterControl?.errors) voterControl.setErrors(null);
      } else if (key === 'VoterBackPhotoFile') {
        this.voterForm.patchValue({
          VoterAddress: ''
        });
      }
      this.cdr.detectChanges();
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (key === 'VoterFrontPhotoFile') {
        this.previewFrontImage = reader.result as string;
      } else if (key === 'VoterBackPhotoFile') {
        this.previewBackImage = reader.result as string;
      }
    };
    reader.readAsDataURL(file);

    // Trigger OCR scan if enabled in company configuration
    if (this.companyConfig?.voterOcr) {
      this.processVoterOCR(file, key);
    }
  }

  loadImageToView(filename: string, type: 'front' | 'back') {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (type === 'front') {
            this.originalFrontUrl = reader.result as string;
            this.voterData.voterFrontPhoto = this.originalFrontUrl;
          } else {
            this.originalBackUrl = reader.result as string;
            this.voterData.voterBackPhoto = this.originalBackUrl;
          }
        };
        reader.readAsDataURL(blob);
      },
    });
  }

  OnSubmit() {
    this.submitted = true;

    if (this.isVoterVerified) {
      if (!this.Isverifyvoter) {
        this.toastr.warning('Please verify Voter ID first', 'Warning');
        return;
      }
    }

    if (this.voterForm.invalid) return;

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    fd.append('VoterNo', this.voterForm.get('VoterNo')?.value);
    fd.append('VoterName', this.voterForm.get('VoterName')?.value);
    fd.append('VoterDOB', this.voterForm.get('VoterDOB')?.value);
    fd.append('VoterAddress', this.voterForm.get('VoterAddress')?.value);

    const frontFile = this.voterForm.get('VoterFrontPhotoFile')?.value;
    const backFile = this.voterForm.get('VoterBackPhotoFile')?.value;
    
    if (frontFile) { fd.append('VoterFrontPhotoFile', frontFile); } else if (this.originalVoterFrontPath) { fd.append('VoterFrontPhoto', this.originalVoterFrontPath); }
    if (backFile) { fd.append('VoterBackPhotoFile', backFile); } else if (this.originalVoterBackPath) { fd.append('VoterBackPhoto', this.originalVoterBackPath); }

    this.loader.start();
    this.kycService.verifyVoter(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Voter details saved', 'Success');
          this.loadVoterDetails();
          this.isViewMode = true;
          
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Error saving voter details', 'Error');
      },
    });
  }

  reset() {
    this.voterForm.reset();
    this.submitted = false;
    this.fileName = {};
    this.Isverifyvoter = false;
    this.previewFrontImage = null;
    this.previewBackImage = null;
    this.isScanning = false;
    this.isScanningPerFile = {};
    this.ocrError = {};
  }

  goBack() {
    this.router.navigate(['/dash/setting']);
  }
}
