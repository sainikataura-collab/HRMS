import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';

import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';
import { NgSelectModule } from '@ng-select/ng-select';

declare var bootstrap: any;

@Component({
  selector: 'app-bank-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './bank-verification.component.html',
  styleUrls: ['./bank-verification.component.scss'],
})
export class BankVerificationComponent implements OnInit {
  @ViewChild('otpModal') otpModal!: ElementRef;

  bankForm!: FormGroup;
  submitted = false;
  pk_recId: string = '';
  isViewMode = false;
  isAgent = false;
  bankData: any;
  Isverifybank = false;
  previewPassbookImage: string | null = null;
  originalPassbookUrl: string = '';
  fileName: any = {};
  isBankVerified = false;

  otp: string[] = ['', '', '', '', '', ''];

  // Company Config Properties
  companyConfig: CompanyConfig | null = null;
  isBankAccountMandatory: boolean = false;
  isBankAccountVerificationRequired: boolean = false;

  banks: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private kycService: CandidateExperienceDetailService,
    private loader: NgxUiLoaderService,
    private route: ActivatedRoute,
    private companyConfigService: CompanyConfigService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      this.pk_recId = p['pk_recId'] ?? '';
    });


    //  Load company config first
    this.loadCompanyConfig();
    this.getBanks();

    this.initializeForm();
    this.loadBankDetails();
  }

  getBanks(): void {
    this.kycService.getStateList('Bank').subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.banks = res.data;
          if (this.bankData?.bankName && !this.bankForm.get('Vendor_FKBankId')?.value) {
            const matchedBank = this.banks.find((b: any) => 
              b.name?.trim().toLowerCase() === this.bankData.bankName?.trim().toLowerCase()
            );
            if (matchedBank) {
              this.bankForm.patchValue({ Vendor_FKBankId: matchedBank.value });
            }
          }
        }
      },
      error: () => {}
    });
  }

  initializeForm(): void {
    this.bankForm = this.fb.group({
      Vendor_FKBankId: [null, Validators.required],
      BankName: [null],
      AccountNo: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{9,18}$/)],
      ],
      IFSCCode: [
        '',
        [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')],
      ],
      BranchName: ['', Validators.required],
      PassbookImageFile: ['',Validators.required],
    });
  }

  get validate() {
    return this.bankForm.controls;
  }

  /**
 * Load company configuration from service or API
 */
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

/**
 * Update component flags based on company config
 */
updateConfigFlags(): void {
  if (this.companyConfig) {
    this.isBankAccountMandatory = this.companyConfig.bankAccountMandatory;
    this.isBankAccountVerificationRequired = this.companyConfig.bankAccountVerification;
  }
}

/**
 * Use default config if API fails
 */
useDefaultConfig(): void {
  this.companyConfig = this.companyConfigService.getDefaultConfig();
  this.updateConfigFlags();
}

private validateIFSCFormat(ifscCode: string): boolean {
  if (!ifscCode || ifscCode.length !== 11) {
    return false;
  }
  //  Convert to uppercase before testing regex
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifscCode.toUpperCase());
}

  loadBankDetails() {
    this.kycService.Get_Bank_ById(this.pk_recId).subscribe({
      next: (res) => {
        if (!res.isSuccess || !res.data) {
          this.isViewMode = false;
          return;
        }

        this.bankData = res.data;
        
        // Check if AgentName is present. If yes, disable the form.
        if (this.bankData.agentName && this.bankData.agentName.trim() !== '') {
          this.isAgent = true;
          this.bankForm.disable();
          this.isViewMode = true; // Optional: set view mode
        }

        let vendorFKBankId = this.bankData.vendor_FKBankId || null;
        if (!vendorFKBankId && this.bankData.bankName && this.banks.length > 0) {
          const matchedBank = this.banks.find((b: any) => 
            b.name?.trim().toLowerCase() === this.bankData.bankName?.trim().toLowerCase()
          );
          if (matchedBank) {
            vendorFKBankId = matchedBank.value;
          }
        }

        // Populate the form with existing data
        this.bankForm.patchValue({
          Vendor_FKBankId: vendorFKBankId,
          BankName: this.bankData.bankName || '',
          AccountNo: this.bankData.accountNo || '',
          IFSCCode: this.bankData.ifscCode || '',
          BranchName: this.bankData.branchName || ''
        });

        if (!res.data.passbookPhoto) {
          this.isViewMode = false;
          return;
        }

        // Show filename in input
        const fileStr = res.data.passbookPhoto.toString();
        this.fileName['PassbookImageFile'] = fileStr.substring(fileStr.lastIndexOf('/') + 1) || 'Existing Passbook';

        this.isViewMode = true;
        this.loadImageToView(this.bankData.passbookPhoto);
      },
    });
  }

  onBankChange(val: any): void {
    if (val) {
      this.bankForm.patchValue({
        BankName: val.name
      });
    } else {
      this.bankForm.patchValue({
        BankName: ''
      });
    }
  }

  editBank(): void {
    this.isViewMode = false;
    if (this.bankData?.passbookPhoto) {
      this.bankForm.get('PassbookImageFile')?.clearValidators();
      this.bankForm.get('PassbookImageFile')?.updateValueAndValidity();
    }
  }

  OTPBank() {
    const accountNo = this.bankForm.get('AccountNo')?.value || '';
     //  Use validation method
  if (!this.validateBankAccountFormat(accountNo)) {
    this.toastr.error('Please enter a valid bank account number (9-18 digits)!', 'Error');
    return;
  }
   
    this.loader.start();
    // Uncomment when API ready
  // this.kycService.Verify_Bank(accountNo).subscribe({
  //   next: res => {
  //     this.loader.stop();
  //     if (res.isSuccess) {
  //       sessionStorage.setItem('bank_client_id', res.data.client_id || '');
  //       this.open_OTP_Modal();
  //       this.Isverifybank = true;
  //       this.toastr.success('OTP sent successfully!', 'Success');
  //     } else {
  //       this.Isverifybank = false;
  //       this.toastr.error(res.message || 'Verification failed', 'Error');
  //     }
  //   },
  //   error: () => {
  //     this.loader.stop();
  //     this.Isverifybank = false;
  //     this.toastr.error('Error verifying bank', 'Error');
  //   }
  // });
      this.loader.stop();

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

  SubmitOtpBank() {
    const otpStr = this.otp.join('');
    if (otpStr.length !== 6) {
      this.toastr.error('Enter valid 6-digit OTP', 'Error');
      return;
    }
    const client_id = sessionStorage.getItem('bank_client_id') || '';
    
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
    this.bankForm.patchValue({ [key]: file });
    this.fileName[key] = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewPassbookImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  loadImageToView(filename: string) {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.originalPassbookUrl = reader.result as string;
          this.bankData.passbookPhoto = this.originalPassbookUrl;
        };
        reader.readAsDataURL(blob);
      },
    });
  }

  private validateBankAccountFormat(accountNo: string): boolean {
  if (!accountNo || accountNo.length < 9 || accountNo.length > 18) {
    return false;
  }
  const bankAccountRegex = /^[0-9]{9,18}$/;
  return bankAccountRegex.test(accountNo);
}

  OnSubmit() {
    this.submitted = true;

     //  Check verification requirement based on company config
  if (this.isBankAccountVerificationRequired && !this.Isverifybank) {
    this.toastr.warning('Please verify Bank Account first', 'Warning');
    return;
  }

  // Validate IFSC Code
    const ifscCode = this.bankForm.get('IFSCCode')?.value || '';
    if (!this.validateIFSCFormat(ifscCode)) {
      this.toastr.error('Please enter a valid IFSC Code (e.g., ABCD0123456)', 'Error');
      return;
    }

  //  If verification NOT required, validate format manually
  if (!this.isBankAccountVerificationRequired) {
    const accountNo = this.bankForm.get('AccountNo')?.value || '';
    if (!this.validateBankAccountFormat(accountNo)) {
      this.toastr.error('Please enter a valid bank account number (9-18 digits)', 'Error');
      return;
    }
  }


    if (this.bankForm.invalid) return;

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);
    const vendorFkId = this.bankForm.get('Vendor_FKBankId')?.value;
    if (vendorFkId !== null && vendorFkId !== undefined && vendorFkId !== '') {
      fd.append('Vendor_FKBankId', vendorFkId);
    }
    fd.append('BankName', this.bankForm.get('BankName')?.value || '');
    fd.append('AccountNo', this.bankForm.get('AccountNo')?.value);
    fd.append('IFSCCode', this.bankForm.get('IFSCCode')?.value?.toUpperCase() || '');  // Always uppercase
    fd.append('BranchName', this.bankForm.get('BranchName')?.value);

    const file = this.bankForm.get('PassbookImageFile')?.value;
    if (file) fd.append('PassbookPhotoFile', file);

    this.loader.start();
    this.kycService.verifyBank(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Bank details saved', 'Success');
          this.loadBankDetails();
          this.isViewMode = true;
        window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Error saving bank details', 'Error');
      },
    });
  }

  reset() {
    this.bankForm.reset();
    this.submitted = false;
    this.fileName = {};
    this.Isverifybank = false;
  }

  goBack() {
    this.router.navigate(['/dash/setting']);
  }

  numberOnly(event: KeyboardEvent): boolean {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
    return false;
  }
  return true;
}

}
