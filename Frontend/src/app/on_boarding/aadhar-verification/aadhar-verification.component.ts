import { Component, ElementRef, OnInit, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { KycService } from '../../pages/setting/service/kyc.service';
import { CandidateMasterService } from '../../pages/all-dashboard/recruitment/RecruitServices/candidate-master.service';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';

declare var bootstrap: any;

@Component({
  selector: 'app-aadhar-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, NgSelectModule],
  templateUrl: './aadhar-verification.component.html',
  styleUrl: './aadhar-verification.component.scss'
})
export class AadharVerificationComponent implements OnInit {
  @ViewChild('otpModal') otpModal!: ElementRef;
  aadhaarForm!: FormGroup;
  submitted = false;
  userId: string = '';
  fileName: { [key: string]: string } = {};
  IsverifyAddhar=false
  message: string = ''; 
  pk_recId: string = '';      
 isViewMode = false;
 aadhaarData: any;
 imageMap: { [filename: string]: string } = {};  // Stores base64 images
  otp: string[] = ['', '', '', '', '', ''];  // For 6-digit OTP
  // isAadhaarVerified = true
  previewAadhaarFront: string | null = null;
previewAadhaarBack: string | null = null;
previewFatherAadhaarFront: string | null = null;
previewFatherAadhaarBack: string | null = null;

originalAadhaarFrontUrl: string | null = null;
originalAadhaarBackUrl: string | null = null;
isAadhaarDuplicate: boolean = false;
aadhaarDuplicateMessage: string = '';

  // Aadhaar View & Rotation State (matching PAN verification)
  aadhaarRotations: { [key: string]: number } = {
    AadhaarFrontFile: 0,
    AadhaarBackFile: 0,
    FatherAadhaarFrontFile: 0,
    FatherAadhaarBackFile: 0
  };
  showAadhaarModal: boolean = false;
  lastScannedBackAadhaarNo: string = '';
  lastScannedFatherFrontAadhaarNo: string = '';
  lastScannedFatherBackAadhaarNo: string = '';

  private getCleanDigits(str: string): string {
    return (str || '').replace(/\D/g, '');
  }
  modalImageSrc: string = '';
  modalImageTitle: string = '';
  modalImageType: string = 'AadhaarFrontFile';

  rotateAadhaarImage(fileType: string, degrees: number = 90): void {
    const cur = this.aadhaarRotations[fileType] || 0;
    this.aadhaarRotations[fileType] = (cur + degrees + 360) % 360;
  }

  resetAadhaarImageRotation(fileType: string): void {
    this.aadhaarRotations[fileType] = 0;
  }

  openAadhaarModal(src: string, title: string, fileType: string): void {
    this.modalImageSrc = src;
    this.modalImageTitle = title;
    this.modalImageType = fileType;
    this.showAadhaarModal = true;
  }

  closeAadhaarModal(): void {
    this.showAadhaarModal = false;
  }

  // State/City lists
  statList: any[] = [];
  cityList: any[] = [];

  // OCR state properties
  isScanning: boolean = false;
  isScanningPerFile: { [key: string]: boolean } = {};
  ocrError: { [key: string]: string } = {};

     // Company Config Properties
  companyConfig: CompanyConfig | null = null;
  isAadhaarMandatory: boolean = false;
  isAadhaarVerificationRequired: boolean = false;
  previewImageSrc: string = '';
previewImageTitle: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
     private kycService: CandidateExperienceDetailService,
    private ngxUILoaderService: NgxUiLoaderService,
    private route: ActivatedRoute,
    private companyConfigService: CompanyConfigService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
ngOnInit(): void {
  // Load company config first
  this.loadCompanyConfig();

  this.route.queryParams.subscribe(p => {
    this.pk_recId = p['pk_recId'] ?? '';
    this.initializeForm();
    this.loadAadhaarDetails();
  });
}


private validateAadhaarFormat(aadhaarNo: string): boolean {
  if (!aadhaarNo || aadhaarNo.length !== 12) {
    return false;
  }
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaarNo);
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

checkAadhaarDuplicate(): void {
  let aadhaarNo = this.aadhaarForm.get('AadhaarNo')?.value || '';

  // Remove spaces
  aadhaarNo = aadhaarNo.replace(/\s+/g, '');

  // API call only for valid 12 digit Aadhaar
  if (!this.validateAadhaarFormat(aadhaarNo)) {
    return;
  }

  const existingSavedAadhaar = (this.aadhaarData?.aadhaarNo || '').replace(/\s+/g, '');
  const control = this.aadhaarForm.get('AadhaarNo');

  // If in edit/update mode and user enters their own already-saved Aadhaar
  if (existingSavedAadhaar && aadhaarNo === existingSavedAadhaar) {
    if (control?.hasError('duplicate')) {
      const errors = { ...control.errors };
      delete errors['duplicate'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    return;
  }

  this.kycService.CheckDuplicate(
    'Aadhaar No',
    aadhaarNo,
    this.pk_recId || undefined
  ).subscribe({
    next: (res: any) => {

      if (!res.isSuccess) {

        control?.setErrors({
          ...(control.errors || {}),
          duplicate: res.message || 'Aadhaar No already exists.'
        });

        this.toastrService.error(
          res.message || 'Aadhaar No already exists.',
          'Duplicate Aadhaar'
        );

      } else {

        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];

          control.setErrors(
            Object.keys(errors).length > 0 ? errors : null
          );
        }
      }
    },
    error: () => {
      this.toastrService.error(
        'Unable to check Aadhaar number.',
        'Error'
      );
    }
  });
}
  /**
   * Load company configuration from service or API
   */
  loadCompanyConfig(): void {
    // Try to get from service first
    this.companyConfig = this.companyConfigService.getConfig();
    
    if (!this.companyConfig) {
      // Load from API if not in service
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

  /**
   * Update component flags based on company config
   */
  updateConfigFlags(): void {
    if (this.companyConfig) {
      this.isAadhaarMandatory = this.companyConfig.aadhaarMandatory;
      this.isAadhaarVerificationRequired = this.companyConfig.aadhaarVerification;
    }
  }

  /**
   * Use default config if API fails
   */
  useDefaultConfig(): void {
    this.companyConfig = this.companyConfigService.getDefaultConfig();
    this.updateConfigFlags();
  }



// getMandatoryDetails() {
//   this.kycService.getMandatoryDetails().subscribe({
//     next: (res) => {
//   if(res.isSuccess){
//   this.isAadhaarVerified=  res.data.aadhaarMandatory
//   }
//   else{
//     this.isAadhaarVerified=true
//   }       
//     },
//     error: () => {    
//     }
//   });
// }


  initializeForm(): void {
    this.aadhaarForm = this.formBuilder.group({
     AadhaarNo: ['', [
      Validators.required,
      Validators.minLength(14), // 12 digits + 2 spaces (with mask format)
      Validators.maxLength(14)
    ]],
      AadhaarName: ['', Validators.required],
      AadhaarDob: ['', Validators.required],
      AadhaarAddress: ['', Validators.required],
      StateId: ['', Validators.required],
      CityId: [''],
      AadhaarFrontFile: [null, Validators.required],
      AadhaarBackFile: [null, Validators.required],
      FatherAadhaarFrontFile: [null, Validators.required],
      FatherAadhaarBackFile: [null, Validators.required]
    });
  }

  onStateChange(selectedState: string): void {
    if (!selectedState) {
      this.cityList = [];
      this.aadhaarForm.get('CityId')?.reset();
    } else {
      this.getCity(selectedState);
      this.aadhaarForm.get('CityId')?.reset();
    }
  }

  getStateList(fieldName: string): void {
    this.kycService.getStateList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // this.statList = res.data.map((state: any) => ({
          //   name: state.name,
          //   value: state.value ? state.value.toString() : state.value
          // }));
              
        this.statList = res.data.filter((state: any) => state.value != null);
          // Map State Name for View Mode
          if (this.aadhaarData && this.aadhaarData.stateId) {
            const foundState = this.statList.find(s => s.value == this.aadhaarData.stateId);
            if (foundState) {
              this.aadhaarData.stateName = foundState.name;
            }
          }
        }
      },
      error: () => {}
    });
  }

  getCity(StateId: string): void {
    this.kycService.getcityByStateId(StateId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          // this.cityList = res.data.map((city: any) => ({
          //   name: city.name,
          //   value: city.value ? city.value.toString() : city.value
          // }));
          
          this.cityList = res.data.filter((city: any) => city.value != null);
          // Map City Name for View Mode
          if (this.aadhaarData && this.aadhaarData.cityId) {
            const foundCity = this.cityList.find(c => c.value == this.aadhaarData.cityId);
            if (foundCity) {
              this.aadhaarData.cityName = foundCity.name;
            }
          }
        } else {
          this.cityList = [];
        }
      },
      error: () => { this.cityList = []; }
    });
  }

  
editAadhaar(): void {
  this.isViewMode = false;
  const control = this.aadhaarForm.get('AadhaarNo');
  if (control?.hasError('duplicate')) {
    const errors = { ...control.errors };
    delete errors['duplicate'];
    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }
  if (this.aadhaarData?.aadhaarFront) {
    this.aadhaarForm.get('AadhaarFrontFile')?.clearValidators();
    this.aadhaarForm.get('AadhaarFrontFile')?.updateValueAndValidity();
  }
  if (this.aadhaarData?.aadhaarBack) {
    this.aadhaarForm.get('AadhaarBackFile')?.clearValidators();
    this.aadhaarForm.get('AadhaarBackFile')?.updateValueAndValidity();
  }
  if (this.aadhaarData?.fatherAadhaarFront) {
    this.aadhaarForm.get('FatherAadhaarFrontFile')?.clearValidators();
    this.aadhaarForm.get('FatherAadhaarFrontFile')?.updateValueAndValidity();
  }
  if (this.aadhaarData?.fatherAadhaarBack) {
    this.aadhaarForm.get('FatherAadhaarBackFile')?.clearValidators();
    this.aadhaarForm.get('FatherAadhaarBackFile')?.updateValueAndValidity();
  }
}

loadAadhaarDetails() {
  this.kycService.Get_Aadhaar_ById(this.pk_recId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.aadhaarData = res.data;  // <-- Store data for View Mode
        if (res.data.pk_recId) {
          this.pk_recId = res.data.pk_recId;
        }

        const control = this.aadhaarForm.get('AadhaarNo');
        if (control?.hasError('duplicate')) {
          const errors = { ...control.errors };
          delete errors['duplicate'];
          control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        let formattedAadhaar = res.data.aadhaarNo || '';
        const cleanAadhaar = formattedAadhaar.replace(/\s+/g, '');
        if (cleanAadhaar.length === 12) {
          formattedAadhaar = `${cleanAadhaar.substring(0, 4)} ${cleanAadhaar.substring(4, 8)} ${cleanAadhaar.substring(8, 12)}`;
        }

        this.aadhaarForm.patchValue({
          AadhaarNo: formattedAadhaar,
          AadhaarName: res.data.aadhaarName || '',
          AadhaarDob: this.formatDateForInput(res.data.aadhaarDob),
          AadhaarAddress: res.data.aadhaarAddress || '',
          StateId: res.data.stateId || '',
          CityId: res.data.cityId || ''
        });

        // Load state/city lists if editing
        if (res.data.stateId) {
          this.getStateList('State');
          this.getCity(res.data.stateId);
        } else {
          this.getStateList('State');
        }

        // Load Father Aadhaar images
        if (res.data.fatherAadhaarFront) {
          const fileStr = res.data.fatherAadhaarFront.toString();
          this.fileName['FatherAadhaarFrontFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing File';
          this.loadFatherImageToView(res.data.fatherAadhaarFront, 'fatherFront');
          this.aadhaarForm.get('FatherAadhaarFrontFile')?.clearValidators();
          this.aadhaarForm.get('FatherAadhaarFrontFile')?.updateValueAndValidity();
        }
        if (res.data.fatherAadhaarBack) {
          const fileStr = res.data.fatherAadhaarBack.toString();
          this.fileName['FatherAadhaarBackFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing File';
          this.loadFatherImageToView(res.data.fatherAadhaarBack, 'fatherBack');
          this.aadhaarForm.get('FatherAadhaarBackFile')?.clearValidators();
          this.aadhaarForm.get('FatherAadhaarBackFile')?.updateValueAndValidity();
        }

        if (res.data.aadhaarFront) {
          const fileStr = res.data.aadhaarFront.toString();
          this.fileName['AadhaarFrontFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing File';
          this.loadImageToView(res.data.aadhaarFront, 'front');
          this.aadhaarForm.get('AadhaarFrontFile')?.clearValidators();
          this.aadhaarForm.get('AadhaarFrontFile')?.updateValueAndValidity();
        }
        if (res.data.aadhaarBack) {
          const fileStr = res.data.aadhaarBack.toString();
          this.fileName['AadhaarBackFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing File';
          this.loadImageToView(res.data.aadhaarBack, 'back');
          this.aadhaarForm.get('AadhaarBackFile')?.clearValidators();
          this.aadhaarForm.get('AadhaarBackFile')?.updateValueAndValidity();
        }

        if (res.data.aadhaarFront && res.data.aadhaarBack && res.data.fatherAadhaarFront && res.data.fatherAadhaarBack) {
          this.isViewMode = true;
        } else {
          this.isViewMode = false;
        }
      } else {
        this.isViewMode = false;
        this.getStateList('State');
      }
    },
    error: () => {
      this.isViewMode = false;
      this.getStateList('State');
    }
  });
}


  get validate() {
    return this.aadhaarForm.controls;
  }


   OTPAadhaar() {    
   let aadhaarNo = this.aadhaarForm.get('AadhaarNo')?.value || '';

    aadhaarNo = aadhaarNo?.replace(/\s+/g, '');
    // if (!aadhaarNo || aadhaarNo.trim().length === 0) {
    //   this.toastrService.error('Please enter a valid Aadhaar number!', 'Error');
    //   return;
    // }
  
    // Use validation method
  if (!this.validateAadhaarFormat(aadhaarNo)) {
    this.toastrService.error('Please enter a valid 12-digit Aadhaar number!', 'Error');
    return;
  }


    this.ngxUILoaderService.start()
    
    this.kycService.Verify_Aadhaar(aadhaarNo).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // Extract client_id from the nested response
          const clientId = res.data?.client_id || 'Unknown Client ID';
          sessionStorage.setItem('client_id', clientId);
         // this.ClientId = clientId; // Store client_id for future use
          this.open_OTP_Modal();
          this.IsverifyAddhar = true;
          this.toastrService.success(res.Message||`OTP sent successfully!`, 'Success');
        }
         else {
          this.IsverifyAddhar = false;
          this.toastrService.error('Please enter Valid Number', 'Error');
        }
        
      },
      error: (error) => {
      
        this.IsverifyAddhar = false;
        this.toastrService.error('An error occurred while verifying Aadhaar. Please try again.', 'Error');
      },
    });
    this.ngxUILoaderService.stop()
  }

    open_OTP_Modal() {
    const modalElement = this.otpModal.nativeElement;
    const modalInstance = new bootstrap.Modal(modalElement, {
      backdrop: 'static', // Keeps modal open until explicitly closed
      keyboard: false,   // Prevents closing with keyboard ESC
    });
    modalInstance.show();
  }
  
  close_OTP_Modal() {
    const modalElement = this.otpModal.nativeElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
   closeMessage() {
    this.message = ''; 
  }
 
   SubmitOtp() {
    const otp = this.otp.join(''); // Combine digits into a single string
    const client_id = sessionStorage.getItem('client_id') || '';
   
     // Create SendData object for submission
    var SendData = {
      client_id: client_id,
      otp: otp
    };

  
    if (!otp || otp.length !== 6) {
      this.toastrService.error('Please enter a valid 6-digit OTP!', 'Error');
      return;
    }
    // Submit the OTP
    this.kycService.Verify_Aadhaar_Submit_OTP(SendData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.aadhaarForm.patchValue({
            AadhaarName: response.data.full_name,
            AadhaarDob: this.formatDateForInput(response.data.dob),
            AadhaarAddress: response.data.address
          });
          this.toastrService.success(response.Message ||'Adhar Verification  Successfully', 'Success');
         this.close_OTP_Modal();
        } else {
          this.toastrService.error(response.Message || 'Please enter valid Otp', 'Error');
        }
      },
      error: () => {
        this.toastrService.error('An error occurred while submitting . Please try again.', 'Error');
      }
    });
    
  }


  


  /**
   * Clear Aadhaar fields and reset upload on invalid document
   */
  clearAadhaarFields(fileType: string, errorMessage?: string): void {
    if (fileType === 'AadhaarFrontFile') {
      this.aadhaarForm.patchValue({
        AadhaarFrontFile: null,
        AadhaarNo: '',
        AadhaarName: '',
        AadhaarDob: ''
      });
      delete this.fileName['AadhaarFrontFile'];
      this.previewAadhaarFront = null;
    } else if (fileType === 'AadhaarBackFile') {
      this.aadhaarForm.patchValue({
        AadhaarBackFile: null,
        AadhaarAddress: ''
      });
      delete this.fileName['AadhaarBackFile'];
      this.previewAadhaarBack = null;
      this.lastScannedBackAadhaarNo = '';
    } else if (fileType === 'FatherAadhaarFrontFile') {
      this.aadhaarForm.patchValue({ FatherAadhaarFrontFile: null });
      delete this.fileName['FatherAadhaarFrontFile'];
      this.previewFatherAadhaarFront = null;
    } else if (fileType === 'FatherAadhaarBackFile') {
      this.aadhaarForm.patchValue({ FatherAadhaarBackFile: null });
      delete this.fileName['FatherAadhaarBackFile'];
      this.previewFatherAadhaarBack = null;
    }

    if (errorMessage) {
      this.ocrError[fileType] = errorMessage;
    }
    this.cdr.detectChanges();
  }

    // =====================================================================
  //                           OCR ENGINE (100% Backend Native OCR)
  // =====================================================================

  /**
   * Process Father's Aadhaar Front/Back image with Backend OCR
   */
  async processFatherAadhaarOCR(file: File, fileType: string): Promise<void> {
    this.isScanningPerFile[fileType] = true;
    this.ocrError[fileType] = '';
    this.cdr.detectChanges();

    const side = fileType === 'FatherAadhaarBackFile' ? 'back' : 'front';

    try {
      const backendRes: any = await this.kycService.scanAadhaarCardWithOcr(file, side).toPromise();
      if (backendRes && backendRes.isSuccess) {
        this.zone.run(() => {
          this.ocrError[fileType] = '';
          const msg = fileType === 'FatherAadhaarFrontFile'
            ? "Father's Aadhaar Front verified successfully!"
            : "Father's Aadhaar Back verified successfully!";
          this.toastrService.success(msg, 'OCR Complete');
          this.isScanningPerFile[fileType] = false;
          this.cdr.detectChanges();
        });
      } else {
        this.zone.run(() => {
          this.clearAadhaarFields(fileType, backendRes?.message || 'Invalid Aadhaar Card image.');
          this.isScanningPerFile[fileType] = false;
          this.cdr.detectChanges();
        });
      }
    } catch (backendErr: any) {
      this.zone.run(() => {
        const msg = backendErr?.error?.message || 'Could not scan Aadhaar card. Please enter details manually.';
        this.clearAadhaarFields(fileType, msg);
        this.isScanningPerFile[fileType] = false;
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Process Candidate's Aadhaar Front/Back image with High-Accuracy Backend Native OCR & Cross-Validation
   */
  async processAadhaarOCR(file: File, fileType: string): Promise<void> {
    this.isScanning = true;
    this.isScanningPerFile[fileType] = true;
    this.ocrError[fileType] = '';
    this.cdr.detectChanges();

    const side = fileType === 'AadhaarBackFile' ? 'back' : 'front';
    const currentFrontAadhaar = this.aadhaarForm.get('AadhaarNo')?.value || '';
    const currentFrontDigits = this.getCleanDigits(currentFrontAadhaar);

    try {
      const expectedNo = fileType === 'AadhaarBackFile' ? currentFrontAadhaar : undefined;
      const backendRes: any = await this.kycService.scanAadhaarCardWithOcr(file, side, expectedNo).toPromise();

      if (backendRes && !backendRes.isSuccess && backendRes.message) {
        // Backend detected document mismatch, wrong side, or invalid image
        this.zone.run(() => {
          this.clearAadhaarFields(fileType, backendRes.message);
        });
        return;
      }

      if (backendRes && backendRes.isSuccess && backendRes.data) {
        const backendAadhaarNo = backendRes.data.aadhaarNo || '';
        const backendName = backendRes.data.name || '';
        const backendDob = backendRes.data.dob || '';
        const backendAddress = backendRes.data.address || '';

        // Cross-check: If Back has an Aadhaar number, compare with Front
        if (fileType === 'AadhaarBackFile' && backendAadhaarNo && currentFrontDigits.length === 12) {
          const backDigits = this.getCleanDigits(backendAadhaarNo);
          if (backDigits.length === 12 && backDigits !== currentFrontDigits) {
            this.zone.run(() => {
              this.clearAadhaarFields(
                'AadhaarBackFile',
                `Front and Back Aadhaar cards do not match! Front Aadhaar is ${currentFrontAadhaar}, but Back belongs to another Aadhaar card (${backendAadhaarNo}). Please upload both sides of the same Aadhaar card.`
              );
            });
            return;
          }
        }

        if (fileType === 'AadhaarFrontFile') {
          // Check with previously uploaded Back if any
          const frontDigits = this.getCleanDigits(backendAadhaarNo);
          if (this.lastScannedBackAadhaarNo && frontDigits !== this.getCleanDigits(this.lastScannedBackAadhaarNo)) {
            this.zone.run(() => {
              this.clearAadhaarFields(
                'AadhaarFrontFile',
                `Front Aadhaar (${backendAadhaarNo}) does not match previously uploaded Back Aadhaar (${this.lastScannedBackAadhaarNo}). Please upload both sides of the same Aadhaar card.`
              );
            });
            return;
          }

          this.zone.run(() => {
            if (backendAadhaarNo) {
              this.aadhaarForm.patchValue({ AadhaarNo: backendAadhaarNo });
              this.aadhaarForm.get('AadhaarNo')?.markAsDirty();
              this.aadhaarForm.get('AadhaarNo')?.markAsTouched();
            }
            if (backendName) {
              this.aadhaarForm.patchValue({ AadhaarName: backendName });
              this.aadhaarForm.get('AadhaarName')?.markAsDirty();
              this.aadhaarForm.get('AadhaarName')?.markAsTouched();
            }
            if (backendDob) {
              this.aadhaarForm.patchValue({ AadhaarDob: backendDob });
              this.aadhaarForm.get('AadhaarDob')?.markAsDirty();
              this.aadhaarForm.get('AadhaarDob')?.markAsTouched();
            }

            const missing = [
              !backendAadhaarNo && 'Aadhaar Number',
              !backendName && 'Name',
              !backendDob && 'Date of Birth'
            ].filter(Boolean);

            if (missing.length) {
              this.ocrError[fileType] = `Could not read: ${missing.join(', ')}. Please verify/enter manually.`;
            } else {
              this.ocrError[fileType] = '';
              this.toastrService.success('Aadhaar details extracted successfully!', 'Scan Complete');
            }
            this.isScanningPerFile[fileType] = false;
            this.isScanning = Object.values(this.isScanningPerFile).some(s => s);
            this.cdr.detectChanges();
          });
          return;
        }

        if (fileType === 'AadhaarBackFile') {
          if (backendAadhaarNo) {
            this.lastScannedBackAadhaarNo = backendAadhaarNo;
          }
          this.zone.run(() => {
            if (backendAddress) {
              this.aadhaarForm.patchValue({ AadhaarAddress: backendAddress });
              this.aadhaarForm.get('AadhaarAddress')?.markAsDirty();
              this.aadhaarForm.get('AadhaarAddress')?.markAsTouched();
              this.ocrError[fileType] = '';
              this.toastrService.success('Address extracted from Aadhaar Back successfully!', 'Scan Complete');
            } else {
              this.ocrError[fileType] = 'Could not read address from Back page. Please enter manually.';
            }
            this.isScanningPerFile[fileType] = false;
            this.isScanning = Object.values(this.isScanningPerFile).some(s => s);
            this.cdr.detectChanges();
          });
          return;
        }
      } else {
        this.zone.run(() => {
          this.clearAadhaarFields(fileType, backendRes?.message || 'Could not scan Aadhaar card.');
        });
      }
    } catch (backendErr: any) {
      this.zone.run(() => {
        const msg = backendErr?.error?.message || 'Could not scan Aadhaar card. Please enter details manually.';
        this.clearAadhaarFields(fileType, msg);
      });
    }
  }

  onFileSelected(event: any, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.toastrService.error('Only image files (JPG, PNG, WEBP) are allowed!', 'Invalid File');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastrService.error('File size must not exceed 5MB!', 'File Too Large');
      input.value = '';
      return;
    }

    this.fileName[fileType] = file.name;
    this.ocrError[fileType] = '';
    this.aadhaarRotations[fileType] = 0;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (fileType === 'AadhaarFrontFile') this.previewAadhaarFront = result;
      else if (fileType === 'AadhaarBackFile') this.previewAadhaarBack = result;
      else if (fileType === 'FatherAadhaarFrontFile') this.previewFatherAadhaarFront = result;
      else if (fileType === 'FatherAadhaarBackFile') this.previewFatherAadhaarBack = result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);

    this.aadhaarForm.patchValue({ [fileType]: file });
    this.aadhaarForm.get(fileType)?.clearValidators();
    this.aadhaarForm.get(fileType)?.updateValueAndValidity();

    // OCR scanning if enabled in Company Config
    if (this.companyConfig?.aadhaarOcr) {
      if (fileType === 'AadhaarFrontFile' || fileType === 'AadhaarBackFile') {
        this.processAadhaarOCR(file, fileType);
      } else if (fileType === 'FatherAadhaarFrontFile' || fileType === 'FatherAadhaarBackFile') {
        this.processFatherAadhaarOCR(file, fileType);
      }
    }
  }

  // Submit form and save to database
  OnSubmit(): void {
    this.submitted = true;
    // Check verification requirement based on company config
    if (this.isAadhaarVerificationRequired && !this.IsverifyAddhar) {
      this.toastrService.warning('Please verify Aadhaar number first', 'Warning');
      return;
    }

    //  If verification NOT required, validate Aadhaar format manually
  if (!this.isAadhaarVerificationRequired) {
    const aadhaarNo = this.aadhaarForm.get('AadhaarNo')?.value?.replace(/\s+/g, '') || '';
    if (!this.validateAadhaarFormat(aadhaarNo)) {
      this.toastrService.error('Please enter a valid 12-digit Aadhaar number', 'Error');
      return;
    }
  }

 
  if (this.aadhaarForm.get('AadhaarNo')?.hasError('duplicate')) {
  this.toastrService.error(
    'Aadhaar No already exists. Please enter another Aadhaar No.',
    'Duplicate Aadhaar'
  );
  return;
}
    if (this.aadhaarForm.invalid) {
      // this.toastrService.error('Please fill all required fields', 'Error');
      return;
    }

    const formData = new FormData();
    const aadhaarNo = this.aadhaarForm.get('AadhaarNo')?.value.replace(/\s+/g, '');

    // Append all form data
    formData.append("pk_recId", this.pk_recId);
    formData.append('AadhaarNo', aadhaarNo);
    formData.append('AadhaarName', this.aadhaarForm.get('AadhaarName')?.value);
    formData.append('AadhaarDob', this.aadhaarForm.get('AadhaarDob')?.value);
    formData.append('AadhaarAddress', this.aadhaarForm.get('AadhaarAddress')?.value);
    formData.append('StateId', (this.aadhaarForm.get('StateId')?.value?.value || this.aadhaarForm.get('StateId')?.value || ''));
    formData.append('CityId', (this.aadhaarForm.get('CityId')?.value?.value || this.aadhaarForm.get('CityId')?.value || ''));

    // Append files
    const frontFile = this.aadhaarForm.get('AadhaarFrontFile')?.value;
    const backFile = this.aadhaarForm.get('AadhaarBackFile')?.value;
    const fatherFrontFile = this.aadhaarForm.get('FatherAadhaarFrontFile')?.value;
    const fatherBackFile = this.aadhaarForm.get('FatherAadhaarBackFile')?.value;

    if (frontFile) formData.append('AadhaarFrontFile', frontFile);
    if (backFile) formData.append('AadhaarBackFile', backFile);
    if (fatherFrontFile) formData.append('FatherAadhaarFrontFile', fatherFrontFile);
    if (fatherBackFile) formData.append('FatherAadhaarBackFile', fatherBackFile);

    this.ngxUILoaderService.start();

    // Save to database
    this.kycService.verifyaadhaar(formData).subscribe({
      next: (result) => {
        this.ngxUILoaderService.stop();
        if (result.isSuccess) {
          this.toastrService.success(result.message || 'Aadhaar details saved successfully!', 'Success');
          this.loadAadhaarDetails();   // Load data
         this.isViewMode = true;
         window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastrService.error(result.message || 'Failed to save Aadhaar details', 'Error');
        }
      },
      error: (error) => {
        this.ngxUILoaderService.stop();
        
        this.toastrService.error('An error occurred while saving Aadhaar details', 'Error');
      }
    });
  }

  // Reset form
  reset(): void {
    this.aadhaarForm.reset();
    this.submitted = false;
    this.IsverifyAddhar = false;
    this.fileName = {};
  }

  // Navigate back
  goBack(): void {
    this.router.navigate(['/dash/setting']);
  }

    onKeyUp(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
  
    // Allow only numeric values
    if (/^\d$/.test(input.value)) {
      this.otp[index] = input.value; // Update OTP array
      const nextInput = document.querySelector(`#otp input:nth-child(${index + 2})`) as HTMLInputElement;
      if (nextInput) nextInput.focus(); // Move focus to the next input
    } else {
      input.value = ''; // Clear invalid input
    }
  
    // Handle backspace
    if (event.key === 'Backspace' && index > 0) {
      const prevInput = document.querySelector(`#otp input:nth-child(${index})`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

    isOtpComplete(): boolean {
    return this.otp.every((digit) => digit !== ''); // Return true if all boxes are filled
  }

  downloadImage(filename: string) {
  this.kycService.getImageOnboard(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      
    }
  });
}


loadImageToView(filename: string, type: 'front' | 'back') {
  this.kycService.getImageOnboard(filename).subscribe({
    next: (blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!this.aadhaarData) this.aadhaarData = {};

        if (type === 'front') {
          this.aadhaarData.aadhaarFront = reader.result as string; this.previewAadhaarFront = reader.result as string;
        } else {
          this.aadhaarData.aadhaarBack = reader.result as string; this.previewAadhaarBack = reader.result as string;
        }
      };
      reader.readAsDataURL(blob);  // Convert blob → Base64 for <img>
    },
    error: () => {
     
    }
  });
}

loadFatherImageToView(filename: string, type: 'fatherFront' | 'fatherBack') {
  this.kycService.getImageOnboard(filename).subscribe({
    next: (blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (!this.aadhaarData) this.aadhaarData = {};
        if (type === 'fatherFront') {
          this.previewFatherAadhaarFront = reader.result as string;
          this.aadhaarData.fatherAadhaarFront = reader.result as string;
        } else {
          this.previewFatherAadhaarBack = reader.result as string;
          this.aadhaarData.fatherAadhaarBack = reader.result as string;
        }
      };
      reader.readAsDataURL(blob);
    },
    error: () => {}
  });
}


openImagePreview(src: string, title: string) {
  this.previewImageSrc = src;
  this.previewImageTitle = title;
  const modalEl = document.getElementById('imagePreviewModal');
  const modal = new bootstrap.Modal(modalEl!);
  modal.show();
}

}
