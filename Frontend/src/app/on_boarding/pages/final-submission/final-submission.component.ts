import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FinalSubmissionService } from '../../services/final-submission.service';
import { environment } from '../../../../environments/environment';
import {
  CompanyConfigService,
  CompanyConfig,
} from '../../services/company-config.service';
import { CandidateExperienceDetailService } from '../../services/candidate-experience-details.service';
import { FormsModule } from '@angular/forms';

//  Define proper interfaces
interface BasicInfo {
  pk_recId: string;
  candidate_name: string;
  email: string;
  mobile: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  pincode?: string;
  address?: string;
  photo?: string;
  isVendor?: boolean | number;
  vendor_Name?: string;
  vendor_HFRID?: string;
  vendor_Code?: string;
  vendor_Status?: string;
  onboardFormStatusId?: number;
  onboardFormStatusName?: string;
  onboardFormStatus?: string;
  eshram_UAN?: string;
  eshram_Photo?: string;
  ayushman_PMJAY_ID?: string;
  ayushman_Photo?: string;
  lifeInsurance_No?: string;
  lifeInsurance_Photo?: string;
}

interface AadhaarDetails {
  pk_recId: string;
  aadhaarNo?: string;
  aadhaarName?: string;
  aadhaarDob?: string;
  aadhaarAddress?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  fatherAadhaarFront?: string;
  fatherAadhaarBack?: string;
  entryDate?: string;
}

interface PANDetails {
  pk_recId: string;
  panNo?: string;
  panName?: string;
  panDob?: string;
  panCard?: string;
  entryDate?: string;
}

interface QualificationDetails {
  pk_cqualid: number;
  qualification: string;
  subject?: string;
  institute: string;
  passyear: number;
  marks: number;
  division: string;
  documentupload?: string;
}

interface ExperienceDetails {
  pk_cpjobid: number;
  compname: string;
  designation: string;
  department?: string;
  fromdate: string;
  todate: string;
  ctc: number;
  documentupload?: string;
  offerletter?: string;
  profile?: string;
  leavingreason?: string;
}

//  Family Details Interface
interface FamilyDetails {
  fk_recId: string;
  membername: string;
  relation: string;
  dob: string;
  qualification?: string;
  occupation?: string;
}

interface BankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
  passbookPhoto: string;
}

interface VoterDetails {
  pk_recId: string;
  voterNo: string;
  voterName: string;
  voterAddress: string;
  voterDOB: string;
  voterFrontPhoto: string;
  voterBackPhoto: string;
}



interface CandidateSummary {
  basicInfo: BasicInfo | null;
  aadhaarDetails: AadhaarDetails | null;
  panDetails: PANDetails | null;
  qualifications: QualificationDetails[];
  experience: ExperienceDetails[];
  family: FamilyDetails[];
  bankDetails: BankDetails | null;
  voterDetails: VoterDetails | null;
}

@Component({
  selector: 'app-final-submission',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './final-submission.component.html',
  styleUrl: './final-submission.component.scss',
})
export class FinalSubmissionComponent implements OnInit {
  isSubmitting: boolean = false;
  isDownloading: boolean = false;
  isLoading: boolean = true;
  candidateKey: string = '';
  candidateName: string = '';

  // Image Modal Stat
  modalOpen: boolean = false;
  modalImageUrl: string = '';
  modalImageTitle: string = '';

  // Submit Confirmation Modal State
  showSubmitConfirmModal: boolean = false;
 // OTP Verification State
  otpMobileNo: string = '';
  otpCode: string = '';
  isOtpSent: boolean = false;
  isOtpVerified: boolean = false;
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;
otpErrorMessage: string = '';
  //  Validation flags
  isDataComplete: boolean = false;
  missingFields: string[] = [];

  // Dynamic Progress Calculation
  progressPercentage: number = 0;
  completedStepsCount: number = 0;
  totalVisibleStepsCount: number = 0;

  // Company Config
  companyConfig: CompanyConfig | null = null;

  get isStampVisible(): boolean {
    const status = (this.candidateSummary?.basicInfo?.vendor_Status || '').trim().toLowerCase();
    const formStatusId = Number(this.candidateSummary?.basicInfo?.onboardFormStatusId || 0);
    return status === 'verified' && formStatusId === 5;
  }

  imageUrls = {
    profilePhoto: '',
    aadhaarFront: '',
    aadhaarBack: '',
    fatherAadhaarFront: '',
    fatherAadhaarBack: '',
    panCard: '',
    voterFrontPhoto: '',
    voterBackPhoto: '',
    passbookPhoto: '',
    dlPhoto: '',
    gstPhoto: '',
    signaturePhoto: '',
    recentPhoto: '',
    eshramPhoto: '',
    ayushmanPhoto: '',
    lifeInsurancePhoto: '',
    vehicleInsurancePhoto: '',
    vehicleRCPhoto: '',
    stampPhoto: '',
  };

  drivingLicenceData: any = null;
  vendorGstData: any = null;
  signatureData: any = null;
  photographData: any = null;

  // Vendor Agreement Properties
  isVendor: boolean = false;
  vendorAgreement: any = null;
  vendorActiveRateCards: any[] = [];
  agreementAccepted: boolean = false;
  todayDateFormatted: string = '';
  arePriorFormsComplete: boolean = false;

  candidateSummary: CandidateSummary = {
    basicInfo: null,
    aadhaarDetails: null,
    panDetails: null,
    qualifications: [],
    experience: [],
    family: [],
    bankDetails: null,
    voterDetails: null,
  };

  constructor(
    private finalSubmissionService: FinalSubmissionService,
    private toastrService: ToastrService,
    public router: Router,
    private candidateService: CandidateExperienceDetailService,
    private companyConfigService: CompanyConfigService
  ) {}

  ngOnInit(): void {
    // Check local storage / session state here
    this.checkUserSession();
  }

  // --- Modal Methods ---
  openModal(imageUrl: string, title: string): void {
    if (imageUrl) {
      this.modalImageUrl = imageUrl;
      this.modalImageTitle = title;
      this.modalOpen = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

  closeModal(): void {
    this.modalOpen = false;
    this.modalImageUrl = '';
    this.modalImageTitle = '';
    document.body.style.overflow = '';
  }

  checkUserSession(): void {
    this.candidateKey = sessionStorage.getItem('candidateKey') || '';
    this.candidateName = sessionStorage.getItem('candidateName') || 'Candidate';

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.todayDateFormatted = `${day}-${months[today.getMonth()]}-${today.getFullYear()}`;

    this.loadCompanyConfig();
    this.loadCandidateSummary();
    this.loadExtraDocuments();
  }

  /**
   * Load company configuration to determine mandatory fields
   */
  loadCompanyConfig(): void {
    // Try to get from service first
    this.companyConfig = this.companyConfigService.getConfig();

    if (!this.companyConfig) {
      // Load from API if not in service
      this.candidateService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            if (this.companyConfig?.is_stamp) {
              this.loadImage(this.companyConfig.is_stamp, 'stampPhoto');
            }
          } else {
            // Use default config
            this.companyConfig = this.companyConfigService.getDefaultConfig();
          }
          // Re-validate data after config is loaded
          this.validateData();
        },
        error: () => {
          // Use default config on error
          this.companyConfig = this.companyConfigService.getDefaultConfig();
          this.validateData();
        },
      });
    } else if (this.companyConfig?.is_stamp) {
      this.loadImage(this.companyConfig.is_stamp, 'stampPhoto');
    }
  }

  maskAccountNumber(accountNo: string | undefined): string {
    if (!accountNo || accountNo.length < 4) return accountNo || 'N/A';
    const visibleDigits = 4;
    const maskedPart = 'X'.repeat(accountNo.length - visibleDigits);
    return `${maskedPart}${accountNo.slice(-visibleDigits)}`;
  }

  loadCandidateSummary(): void {
    this.isLoading = true;

    this.finalSubmissionService.getCandidateFinalSummary().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.candidateSummary = {
            basicInfo: res.data.basicInfo || null,
            aadhaarDetails: res.data.aadhaarDetails || null,
            panDetails: res.data.panDetails || null,
            qualifications: res.data.qualifications || [],
            experience: res.data.experience || [],
            family: res.data.family || [],
            bankDetails: res.data.bankDetails || null,
            voterDetails: res.data.voterDetails || null,
          };

          this.candidateName =
            res.data.basicInfo?.candidate_name || 'Candidate';

          if (res.data.is_stamp) {
            if (this.companyConfig) {
              this.companyConfig.is_stamp = res.data.is_stamp;
            }
            this.loadImage(res.data.is_stamp, 'stampPhoto');
          }

          if (this.candidateSummary.basicInfo && !this.candidateSummary.basicInfo.address && this.candidateSummary.aadhaarDetails?.aadhaarAddress) {
            this.candidateSummary.basicInfo.address = this.candidateSummary.aadhaarDetails.aadhaarAddress;
          }

          if (res.data.basicInfo?.isVendor === true || res.data.basicInfo?.isVendor === 1 || res.data.basicInfo?.isVendor === '1') {
            this.isVendor = true;
          }

          // Map GST Data
          if (res.data.vendorGstDetails) {
            this.vendorGstData = res.data.vendorGstDetails;
            if (this.vendorGstData.gstPhoto) {
              this.loadImage(this.vendorGstData.gstPhoto, 'gstPhoto');
            }
          }

          // Map Agreement Data
          if (res.data.vendorAgreement) {
            this.vendorAgreement = res.data.vendorAgreement;
            this.isVendor = !!res.data.vendorAgreement.isVendor || this.isVendor;
            if (this.vendorAgreement.signaturePhoto && !this.imageUrls.signaturePhoto) {
              this.loadImage(this.vendorAgreement.signaturePhoto, 'signaturePhoto');
            }
          }

          // Map Active Rate Cards
          if (res.data.vendorActiveRateCards && res.data.vendorActiveRateCards.length > 0) {
            this.vendorActiveRateCards = this.mapAgreementActiveRateCards(res.data.vendorActiveRateCards);
          } else if (res.data.vendorAgreement && (res.data.vendorAgreement.fhrid || res.data.vendorAgreement.vendor_HFRID)) {
            this.vendorActiveRateCards = this.mapAgreementActiveRateCards([res.data.vendorAgreement]);
          } else {
            this.vendorActiveRateCards = [];
          }

          this.loadImages();

          // Validate if all required data is filled
          this.validateData();
        } else {
          this.toastrService.error(res.message || 'Failed to load summary');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to load candidate summary');
        this.isLoading = false;
      },
    });
  }

  loadImages(): void {
    // Load profile photo
    if (this.candidateSummary.basicInfo?.photo) {
      this.loadImage(this.candidateSummary.basicInfo.photo, 'profilePhoto');
    }

    // Load Aadhaar front
    if (this.candidateSummary.aadhaarDetails?.aadhaarFront) {
      this.loadImage(
        this.candidateSummary.aadhaarDetails.aadhaarFront,
        'aadhaarFront'
      );
    }

    // Load Aadhaar back
    if (this.candidateSummary.aadhaarDetails?.aadhaarBack) {
      this.loadImage(
        this.candidateSummary.aadhaarDetails.aadhaarBack,
        'aadhaarBack'
      );
    }

    // Load Father Aadhaar front
    if (this.candidateSummary.aadhaarDetails?.fatherAadhaarFront) {
      this.loadImage(
        this.candidateSummary.aadhaarDetails.fatherAadhaarFront,
        'fatherAadhaarFront'
      );
    }

    // Load Father Aadhaar back
    if (this.candidateSummary.aadhaarDetails?.fatherAadhaarBack) {
      this.loadImage(
        this.candidateSummary.aadhaarDetails.fatherAadhaarBack,
        'fatherAadhaarBack'
      );
    }

    // Load PAN card
    if (this.candidateSummary.panDetails?.panCard) {
      this.loadImage(this.candidateSummary.panDetails.panCard, 'panCard');
    }

    // Load Voter front
    if (this.candidateSummary.voterDetails?.voterFrontPhoto) {
      this.loadImage(
        this.candidateSummary.voterDetails.voterFrontPhoto,
        'voterFrontPhoto'
      );
    }

    // Load Voter back
    if (this.candidateSummary.voterDetails?.voterBackPhoto) {
      this.loadImage(
        this.candidateSummary.voterDetails.voterBackPhoto,
        'voterBackPhoto'
      );
    }

    // Load passbook
    if (this.candidateSummary.bankDetails?.passbookPhoto) {
      this.loadImage(
        this.candidateSummary.bankDetails.passbookPhoto,
        'passbookPhoto'
      );
    }

    // Load Driving Licence
    const dlPhoto = (this.candidateSummary.basicInfo as any)?.dlPhoto;
    if (dlPhoto) {
      this.loadImage(dlPhoto, 'dlPhoto');
    }

    // Load E-Shram photo
    if (this.candidateSummary.basicInfo?.eshram_Photo) {
      this.loadImage(
        this.candidateSummary.basicInfo.eshram_Photo,
        'eshramPhoto'
      );
    }

    // Load Ayushman photo
    if (this.candidateSummary.basicInfo?.ayushman_Photo) {
      this.loadImage(
        this.candidateSummary.basicInfo.ayushman_Photo,
        'ayushmanPhoto'
      );
    }

    // Load Life Insurance photo
    if (this.candidateSummary.basicInfo?.lifeInsurance_Photo) {
      this.loadImage(
        this.candidateSummary.basicInfo.lifeInsurance_Photo,
        'lifeInsurancePhoto'
      );
    }
  }

  loadImage(filename: string, imageType: keyof typeof this.imageUrls): void {
    this.finalSubmissionService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUrls[imageType] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (err: any) => {},
    });
  }

  loadExtraDocuments(): void {
    // DL
    this.candidateService.Get_DrivingLicence_ById().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.drivingLicenceData = res.data;
          if (res.data.dlPhoto) {
            this.loadImage(res.data.dlPhoto, 'dlPhoto');
          }
          if (res.data.vehicle_Insurance_Photo) {
            this.loadImage(res.data.vehicle_Insurance_Photo, 'vehicleInsurancePhoto');
          }
          if (res.data.vehicle_RC_Photo) {
            this.loadImage(res.data.vehicle_RC_Photo, 'vehicleRCPhoto');
          }
          this.validateData();
        }
      }
    });

    // Signature
    this.candidateService.Get_Signature_ById().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.signatureData = res.data;
          if (res.data.signaturePhoto) {
            this.loadImage(res.data.signaturePhoto, 'signaturePhoto');
          }
          this.validateData();
        }
      }
    });

    // Photograph
    this.candidateService.Get_Photograph_ById().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.photographData = res.data;
          if (res.data.photo) {
            this.loadImage(res.data.photo, 'recentPhoto');
          }
          this.validateData();
        }
      }
    });
  }

  getAgreementProp(obj: any, key: string): any {
    if (!obj) return null;
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === lowerKey) return obj[k];
    }
    return null;
  }

  getAgreementRateConfig(item: any, label: string, prefix: string, valKey: string = prefix + '_Rate'): any {
    const type = this.getAgreementProp(item, prefix + '_RateType');
    if (!type) return null;

    const isSlab = (type || '').toString().toLowerCase() === 'slab';
    const isFixed = (type || '').toString().toLowerCase() === 'fixed';

    let val = '';
    if (isSlab) {
      val = this.getAgreementProp(item, prefix + '_SlabExpr');
    } else {
      val = this.getAgreementProp(item, valKey);
    }

    return {
      label: label,
      type: type,
      isFixed: isFixed,
      isSlab: isSlab,
      value: val,
      slabs: isSlab ? this.parseSlabExpr(val) : []  // Pre-computed once, not in template
    };
  }

  // Parses "1-74:18,75-100:19" → [{range:"1-74", rate:"18"}, {range:"75-100", rate:"19"}]
  parseSlabExpr(expr: string): { range: string; rate: string }[] {
    if (!expr) return [];
    return expr.split(',').map(part => {
      const colonIdx = part.lastIndexOf(':');
      if (colonIdx === -1) return { range: part.trim(), rate: '' };
      return {
        range: part.substring(0, colonIdx).trim(),
        rate: part.substring(colonIdx + 1).trim()
      };
    }).filter(s => s.range !== '');
  }

  mapAgreementActiveRateCards(rateCards: any[]): any[] {
    if (!rateCards || rateCards.length === 0) return [];
    const mapped = rateCards.map((item: any) => {
      const rates = [];
      const normal = this.getAgreementRateConfig(item, 'Normal', 'Normal');
      if (normal) rates.push(normal);
      const pickup = this.getAgreementRateConfig(item, 'Pickup', 'Pickup');
      if (pickup) rates.push(pickup);
      const mfn = this.getAgreementRateConfig(item, 'MFN', 'MFN');
      if (mfn) rates.push(mfn);
      const van = this.getAgreementRateConfig(item, 'Van', 'Van');
      if (van) rates.push(van);
      const u2s = this.getAgreementRateConfig(item, 'U2S', 'U2S');
      if (u2s) rates.push(u2s);
      const shopsy = this.getAgreementRateConfig(item, 'Shopsy', 'Shopsy', 'Shopsy_Rate');
      if (shopsy) rates.push(shopsy);
      const prexo = this.getAgreementRateConfig(item, 'Prexo', 'Prexo');
      if (prexo) rates.push(prexo);
      const grocery = this.getAgreementRateConfig(item, 'Grocery', 'Grocery');
      if (grocery) rates.push(grocery);

      const fhrName = this.getAgreementProp(item, 'fhrid') || this.getAgreementProp(item, 'vendor_hfrid') || '';
      const clientName = this.getAgreementProp(item, 'clientname') || '';
      const modelName = this.getAgreementProp(item, 'modelname') || '';
      const location = this.getAgreementProp(item, 'locationname') || this.getAgreementProp(item, 'location') || '';
      const effFrom = this.getAgreementProp(item, 'effectivefrom') || '';
      const activeRaw = this.getAgreementProp(item, 'isactive');
      const isActive = activeRaw !== null && activeRaw !== undefined ? activeRaw : true;

      return {
        fhrid: fhrName,
        name: fhrName,
        clientName: clientName,
        modelName: modelName,
        location: location,
        effectiveFrom: effFrom,
        isActive: isActive,
        rates: rates
      };
    });

    const activeOnly = mapped.filter((x: any) => x.isActive);
    const grouped = new Map<string, any>();
    activeOnly.forEach((item: any) => {
      const key = `${item.clientName}_${item.modelName}_${item.location}_${item.fhrid}`;
      const effDate = new Date(item.effectiveFrom || 0).getTime();
      if (!grouped.has(key)) {
        grouped.set(key, item);
      } else {
        const existing = grouped.get(key);
        const existingEffDate = new Date(existing.effectiveFrom || 0).getTime();
        if (effDate > existingEffDate) {
          grouped.set(key, item);
        }
      }
    });

    // Sort by effectiveFrom descending so latest cards come first, exactly like Vendor Master Tab 2
    return Array.from(grouped.values()).sort((a: any, b: any) => {
      const dateA = new Date(a.effectiveFrom || 0).getTime();
      const dateB = new Date(b.effectiveFrom || 0).getTime();
      return dateB - dateA;
    });
  }

  onAgreementCheckChange(event: any): void {
    this.agreementAccepted = event.target.checked;
    this.validateData();
  }

  validateData(): void {
    this.missingFields = [];

    if (!this.companyConfig) {
      this.isDataComplete = false;
      return;
    }

    // Check PAN (only if visible AND mandatory)
    if (this.companyConfig.panVisible && this.companyConfig.panMandatory) {
      const panDetails = this.candidateSummary.panDetails;
      const hasPanNo = !!(panDetails?.panNo && panDetails.panNo.trim() !== '');
      const hasPanCard = !!(panDetails?.panCard && panDetails.panCard.trim() !== '' || this.imageUrls.panCard);
      const hasPanName = !!(panDetails?.panName && panDetails.panName.trim() !== '');
      const hasPanDob = !!panDetails?.panDob;

      if (!hasPanNo || !hasPanCard || !hasPanName || !hasPanDob) {
        this.missingFields.push('PAN Details');
      }
    }

    // Check Aadhaar (only if visible AND mandatory)
    if (
      this.companyConfig.aadhaarVisible &&
      this.companyConfig.aadhaarMandatory
    ) {
      const aadhaarDetails = this.candidateSummary.aadhaarDetails;
      const hasAadhaarNo = !!(aadhaarDetails?.aadhaarNo && aadhaarDetails.aadhaarNo.trim() !== '');
      const hasAadhaarName = !!(aadhaarDetails?.aadhaarName && aadhaarDetails.aadhaarName.trim() !== '');
      const hasAadhaarDob = !!aadhaarDetails?.aadhaarDob;
      const hasAadhaarAddress = !!(aadhaarDetails?.aadhaarAddress && aadhaarDetails.aadhaarAddress.trim() !== '');
      const hasAadhaarFront = !!(aadhaarDetails?.aadhaarFront && aadhaarDetails.aadhaarFront.trim() !== '' || this.imageUrls.aadhaarFront);
      const hasAadhaarBack = !!(aadhaarDetails?.aadhaarBack && aadhaarDetails.aadhaarBack.trim() !== '' || this.imageUrls.aadhaarBack);
      const hasFatherFront = !!(aadhaarDetails?.fatherAadhaarFront && aadhaarDetails.fatherAadhaarFront.trim() !== '' || this.imageUrls.fatherAadhaarFront);
      const hasFatherBack = !!(aadhaarDetails?.fatherAadhaarBack && aadhaarDetails.fatherAadhaarBack.trim() !== '' || this.imageUrls.fatherAadhaarBack);

      if (!hasAadhaarNo || !hasAadhaarName || !hasAadhaarDob || !hasAadhaarAddress || !hasAadhaarFront || !hasAadhaarBack || !hasFatherFront || !hasFatherBack) {
        this.missingFields.push('Aadhaar Details (including Father\'s Aadhaar)');
      }
    }

    // Check Basic Info (only if visible AND mandatory)
    if (
      this.companyConfig.basicInfoVisible &&
      this.companyConfig.basicInfoMandatory
    ) {
      if (
        !this.candidateSummary.basicInfo ||
        !this.candidateSummary.basicInfo.stateId ||
        !this.candidateSummary.basicInfo.address ||
        this.candidateSummary.basicInfo.address.trim() === ''
      ) {
        this.missingFields.push('Basic Information');
      }
    }

    // Check Qualification (only if visible AND mandatory)
    if (
      this.companyConfig.qualificationVisible &&
      this.companyConfig.qualificationMandatory
    ) {
      if (this.candidateSummary.qualifications.length === 0) {
        this.missingFields.push('Educational Qualification (at least one)');
      }
    }

    // Check Experience (only if visible AND mandatory)
    if (
      this.companyConfig.experienceVisible &&
      this.companyConfig.experienceMandatory
    ) {
      if (this.candidateSummary.experience.length === 0) {
        this.missingFields.push('Work Experience (at least one)');
      }
    }

    // Check Family (only if visible AND mandatory)
    if (
      this.companyConfig.familyVisible &&
      this.companyConfig.familyMandatory
    ) {
      if (this.candidateSummary.family.length === 0) {
        this.missingFields.push('Family Details (at least one member)');
      }
    }

    // Check Bank Account (only if visible AND mandatory)
    if (
      this.companyConfig.bankAccountVisible &&
      this.companyConfig.bankAccountMandatory
    ) {
      const bankDetails = this.candidateSummary.bankDetails;
      const hasAccountNo = !!(bankDetails?.accountNo && bankDetails.accountNo.trim() !== '');
      const hasBankName = !!(bankDetails?.bankName && bankDetails.bankName.trim() !== '');
      const hasIfsc = !!(bankDetails?.ifscCode && bankDetails.ifscCode.trim() !== '');
      const hasPassbook = !!(bankDetails?.passbookPhoto && bankDetails.passbookPhoto.trim() !== '' || this.imageUrls.passbookPhoto);

      if (!hasAccountNo || !hasBankName || !hasIfsc || !hasPassbook) {
        this.missingFields.push('Bank Account Details');
      }
    }

    // Check Voter (only if visible AND mandatory)
    if (this.companyConfig.voterVisible && this.companyConfig.voterMandatory) {
      const voterDetails = this.candidateSummary.voterDetails;
      const hasVoterNo = !!(voterDetails?.voterNo && voterDetails.voterNo.trim() !== '');
      const hasVoterPhoto = !!(voterDetails?.voterFrontPhoto && voterDetails.voterFrontPhoto.trim() !== '' || this.imageUrls.voterFrontPhoto);

      if (!hasVoterNo || !hasVoterPhoto) {
        this.missingFields.push('Voter ID Details');
      }
    }

    // Check E-Shram (only if visible AND mandatory)
    if (this.companyConfig.eshramVisible && this.companyConfig.eshramMandatory) {
      const hasUan = !!this.candidateSummary.basicInfo?.eshram_UAN;
      const hasPhoto = !!(this.candidateSummary.basicInfo?.eshram_Photo || this.imageUrls.eshramPhoto);
      if (!hasUan || !hasPhoto) {
        this.missingFields.push('E-Shram Details');
      }
    }

    // Check Ayushman (only if visible AND mandatory)
    if (this.companyConfig.ayushmanVisible && this.companyConfig.ayushmanMandatory) {
      const hasId = !!this.candidateSummary.basicInfo?.ayushman_PMJAY_ID;
      const hasPhoto = !!(this.candidateSummary.basicInfo?.ayushman_Photo || this.imageUrls.ayushmanPhoto);
      if (!hasId || !hasPhoto) {
        this.missingFields.push('Ayushman Details');
      }
    }

    // Check Life Insurance (only if visible AND mandatory)
    if (this.companyConfig.lifeinsuranceVisible && this.companyConfig.lifeinsuranceMandatory) {
      const hasNo = !!this.candidateSummary.basicInfo?.lifeInsurance_No;
      const hasPhoto = !!(this.candidateSummary.basicInfo?.lifeInsurance_Photo || this.imageUrls.lifeInsurancePhoto);
      if (!hasNo || !hasPhoto) {
        this.missingFields.push('Life Insurance Details');
      }
    }

    // Check Driving Licence (only if visible AND mandatory)
    if (this.companyConfig.drivingLicenceVisible && this.companyConfig.drivingLicenceMandatory) {
      const dlNo = this.drivingLicenceData?.dlNo || (this.candidateSummary?.basicInfo as any)?.dlNo;
      const dlPhoto = this.drivingLicenceData?.dlPhoto || (this.candidateSummary?.basicInfo as any)?.dlPhoto || this.imageUrls.dlPhoto;
      if (!dlNo || !dlPhoto) {
        this.missingFields.push('Driving Licence');
      }
    }

    // Check Vehicle Insurance
    if (this.companyConfig.vehicleInsuranceVisible && this.companyConfig.vehicleInsuranceMandatory) {
      const insNo = this.drivingLicenceData?.vehicle_Insurance_No;
      const insPhoto = this.drivingLicenceData?.vehicle_Insurance_Photo || this.imageUrls.vehicleInsurancePhoto;
      if (!insNo || !insPhoto) {
        this.missingFields.push('Vehicle Insurance');
      }
    }

    // Check Vehicle RC
    if (this.companyConfig.vehicleRCVisible && this.companyConfig.vehicleRCMandatory) {
      const rcNo = this.drivingLicenceData?.vehicle_RC_No;
      const rcPhoto = this.drivingLicenceData?.vehicle_RC_Photo || this.imageUrls.vehicleRCPhoto;
      if (!rcNo || !rcPhoto) {
        this.missingFields.push('Vehicle RC');
      }
    }

    // Check Vendor GST (Only if visible AND mandatory)
    if (this.companyConfig?.vendorGstVisible && this.companyConfig?.vendorGstMandatory) {
      if (this.vendorGstData) {
        const isApp =
          this.vendorGstData.vendor_IsGSTApplicable === true ||
          this.vendorGstData.vendor_IsGSTApplicable === 1 ||
          this.vendorGstData.vendor_IsGSTApplicable === '1' ||
          this.vendorGstData.vendor_IsGSTApplicable === 'true' ||
          this.vendorGstData.Vendor_IsGSTApplicable === true ||
          this.vendorGstData.Vendor_IsGSTApplicable === 1 ||
          this.vendorGstData.Vendor_IsGSTApplicable === '1' ||
          this.vendorGstData.Vendor_IsGSTApplicable === 'true' ||
          String(this.vendorGstData.vendor_IsGSTApplicable || '').toLowerCase() === 'yes';

        if (isApp) {
          const hasPhoto = !!(
            this.vendorGstData.gstPhoto ||
            this.vendorGstData.GSTPhoto ||
            this.imageUrls.gstPhoto
          );
          if (!hasPhoto) {
            this.missingFields.push('Vendor GST Certificate');
          }
          const gstNo = (this.vendorGstData.vendor_GSTNo || this.vendorGstData.Vendor_GSTNo || '').trim();
          if (!gstNo) {
            this.missingFields.push('Vendor GST Number');
          }
        }
      } else {
        this.missingFields.push('Vendor GST Details');
      }
    }

    // Check Signature (only if visible AND mandatory)
    if (this.companyConfig.signatureVisible && this.companyConfig.signatureMandatory) {
      if (!this.signatureData || !this.signatureData.signaturePhoto) {
        this.missingFields.push('Signature Image');
      }
    }

    // Check Photograph (only if visible AND mandatory)
    if (this.companyConfig.photographVisible && this.companyConfig.photographMandatory) {
      if (!this.photographData || !this.photographData.photo) {
        this.missingFields.push('Recent Photograph');
      }
    }

    this.arePriorFormsComplete = this.missingFields.length === 0;

    // Check Delivery Agreement (When candidate is Vendor)
    if (this.isVendor) {
      const vendorName = this.vendorAgreement?.vendor_Name || this.candidateName;
      if (!vendorName || vendorName.trim() === '' || vendorName.trim().toLowerCase() === 'candidate') {
        this.missingFields.push('Contractor Name in Agreement');
      }

      const vendorAddress = this.vendorAgreement?.vendor_Address || this.candidateSummary.basicInfo?.address || this.candidateSummary.aadhaarDetails?.aadhaarAddress;
      if (!vendorAddress || vendorAddress.trim() === '') {
        this.missingFields.push('Contractor Address in Agreement');
      }

      const hasSignature = !!(this.imageUrls.signaturePhoto || this.signatureData?.signaturePhoto || this.vendorAgreement?.signaturePhoto || this.vendorAgreement?.vendor_SignaturePhoto);
      if (!hasSignature && this.companyConfig?.signatureMandatory) {
        this.missingFields.push('Contractor Signature on Agreement');
      }
    }

    this.isDataComplete = this.missingFields.length === 0;
    this.calculateProgress();
  }

  calculateProgress(): void {
    if (!this.companyConfig) {
      this.progressPercentage = 0;
      this.completedStepsCount = 0;
      this.totalVisibleStepsCount = 0;
      return;
    }

    let total = 0;
    let completed = 0;

    // PAN Details
    if (this.companyConfig.panVisible) {
      total++;
      const panDetails = this.candidateSummary?.panDetails;
      const hasPanNo = !!(panDetails?.panNo && panDetails.panNo.trim() !== '');
      const hasPanCard = !!(panDetails?.panCard && panDetails.panCard.trim() !== '' || this.imageUrls.panCard);
      const hasPanName = !!(panDetails?.panName && panDetails.panName.trim() !== '');
      const hasPanDob = !!panDetails?.panDob;
      if (hasPanNo && hasPanCard && hasPanName && hasPanDob) completed++;
    }

    // Aadhaar Details
    if (this.companyConfig.aadhaarVisible) {
      total++;
      const aadhaarDetails = this.candidateSummary?.aadhaarDetails;
      const hasAadhaarNo = !!(aadhaarDetails?.aadhaarNo && aadhaarDetails.aadhaarNo.trim() !== '');
      const hasAadhaarName = !!(aadhaarDetails?.aadhaarName && aadhaarDetails.aadhaarName.trim() !== '');
      const hasAadhaarDob = !!aadhaarDetails?.aadhaarDob;
      const hasAadhaarAddress = !!(aadhaarDetails?.aadhaarAddress && aadhaarDetails.aadhaarAddress.trim() !== '');
      const hasAadhaarFront = !!(aadhaarDetails?.aadhaarFront && aadhaarDetails.aadhaarFront.trim() !== '' || this.imageUrls.aadhaarFront);
      const hasAadhaarBack = !!(aadhaarDetails?.aadhaarBack && aadhaarDetails.aadhaarBack.trim() !== '' || this.imageUrls.aadhaarBack);
      const hasFatherFront = !!(aadhaarDetails?.fatherAadhaarFront && aadhaarDetails.fatherAadhaarFront.trim() !== '' || this.imageUrls.fatherAadhaarFront);
      const hasFatherBack = !!(aadhaarDetails?.fatherAadhaarBack && aadhaarDetails.fatherAadhaarBack.trim() !== '' || this.imageUrls.fatherAadhaarBack);
      if (hasAadhaarNo && hasAadhaarName && hasAadhaarDob && hasAadhaarAddress && hasAadhaarFront && hasAadhaarBack && hasFatherFront && hasFatherBack) completed++;
    }

    // Basic Information
    if (this.companyConfig.basicInfoVisible) {
      total++;
      if (this.candidateSummary?.basicInfo && this.candidateSummary.basicInfo.stateId && this.candidateSummary.basicInfo.address && this.candidateSummary.basicInfo.address.trim() !== '') completed++;
    }

    // Qualification
    if (this.companyConfig.qualificationVisible) {
      total++;
      if (this.candidateSummary?.qualifications && this.candidateSummary.qualifications.length > 0) completed++;
    }

    // Experience
    if (this.companyConfig.experienceVisible) {
      total++;
      if (this.candidateSummary?.experience && this.candidateSummary.experience.length > 0) completed++;
    }

    // Family Details
    if (this.companyConfig.familyVisible) {
      total++;
      if (this.candidateSummary?.family && this.candidateSummary.family.length > 0) completed++;
    }

    // Cancelled Cheque / Bank
    if (this.companyConfig.bankAccountVisible) {
      total++;
      const bankDetails = this.candidateSummary?.bankDetails;
      const hasAccountNo = !!(bankDetails?.accountNo && bankDetails.accountNo.trim() !== '');
      const hasBankName = !!(bankDetails?.bankName && bankDetails.bankName.trim() !== '');
      const hasIfsc = !!(bankDetails?.ifscCode && bankDetails.ifscCode.trim() !== '');
      const hasPassbook = !!(bankDetails?.passbookPhoto && bankDetails.passbookPhoto.trim() !== '' || this.imageUrls.passbookPhoto);
      if (hasAccountNo && hasBankName && hasIfsc && hasPassbook) completed++;
    }

    // Driving Licence & Vehicle
    if (this.companyConfig.drivingLicenceVisible) {
      total++;
      const dlNo = this.drivingLicenceData?.dlNo || (this.candidateSummary?.basicInfo as any)?.dlNo;
      const dlPhoto = this.drivingLicenceData?.dlPhoto || (this.candidateSummary?.basicInfo as any)?.dlPhoto || this.imageUrls.dlPhoto;
      let dlOk = !!(dlNo && dlPhoto);
      if (this.companyConfig.vehicleInsuranceMandatory) {
        const insNo = this.drivingLicenceData?.vehicle_Insurance_No;
        const insPhoto = this.drivingLicenceData?.vehicle_Insurance_Photo || this.imageUrls.vehicleInsurancePhoto;
        if (!insNo || !insPhoto) dlOk = false;
      }
      if (this.companyConfig.vehicleRCMandatory) {
        const rcNo = this.drivingLicenceData?.vehicle_RC_No;
        const rcPhoto = this.drivingLicenceData?.vehicle_RC_Photo || this.imageUrls.vehicleRCPhoto;
        if (!rcNo || !rcPhoto) dlOk = false;
      }
      if (dlOk) completed++;
    }

    // Voter ID
    if (this.companyConfig.voterVisible) {
      total++;
      const voterDetails = this.candidateSummary?.voterDetails;
      const hasVoterNo = !!(voterDetails?.voterNo && voterDetails.voterNo.trim() !== '');
      const hasVoterPhoto = !!(voterDetails?.voterFrontPhoto && voterDetails.voterFrontPhoto.trim() !== '' || this.imageUrls.voterFrontPhoto);
      if (hasVoterNo && hasVoterPhoto) completed++;
    }

    // Vendor GST Details
    if (this.companyConfig.vendorGstVisible) {
      total++;
      if (this.vendorGstData && (this.vendorGstData.pk_recId || (this.vendorGstData.vendor_IsGSTApplicable !== null && this.vendorGstData.vendor_IsGSTApplicable !== undefined))) {
        const isApp =
          this.vendorGstData.vendor_IsGSTApplicable === true ||
          this.vendorGstData.vendor_IsGSTApplicable === 1 ||
          this.vendorGstData.vendor_IsGSTApplicable === '1' ||
          this.vendorGstData.vendor_IsGSTApplicable === 'true' ||
          String(this.vendorGstData.vendor_IsGSTApplicable || '').toLowerCase() === 'yes';
        if (isApp) {
          const hasPhoto = !!(this.vendorGstData.gstPhoto || this.vendorGstData.GSTPhoto || this.vendorGstData.vendor_GstPhoto || this.imageUrls.gstPhoto);
          const gstNo = (this.vendorGstData.vendor_GSTNo || this.vendorGstData.Vendor_GSTNo || '').trim();
          if (hasPhoto && gstNo) completed++;
        } else {
          completed++;
        }
      }
    }

    // Signature Image
    if (this.companyConfig.signatureVisible) {
      total++;
      if (this.imageUrls.signaturePhoto || this.signatureData?.signaturePhoto || this.vendorAgreement?.signaturePhoto || this.vendorAgreement?.vendor_SignaturePhoto) completed++;
    }

    // Recent Photograph
    if (this.companyConfig.photographVisible) {
      total++;
      if (this.imageUrls.profilePhoto || this.photographData?.photo || this.candidateSummary?.basicInfo?.photo) completed++;
    }

    // E-Shram Card
    if (this.companyConfig.eshramVisible) {
      total++;
      const hasUan = !!this.candidateSummary?.basicInfo?.eshram_UAN;
      const hasPhoto = !!(this.candidateSummary?.basicInfo?.eshram_Photo || this.imageUrls.eshramPhoto);
      if (hasUan && hasPhoto) completed++;
    }

    // Ayushman Card
    if (this.companyConfig.ayushmanVisible) {
      total++;
      const hasId = !!this.candidateSummary?.basicInfo?.ayushman_PMJAY_ID;
      const hasPhoto = !!(this.candidateSummary?.basicInfo?.ayushman_Photo || this.imageUrls.ayushmanPhoto);
      if (hasId && hasPhoto) completed++;
    }

    // Life Insurance
    if (this.companyConfig.lifeinsuranceVisible) {
      total++;
      const hasNo = !!this.candidateSummary?.basicInfo?.lifeInsurance_No;
      const hasPhoto = !!(this.candidateSummary?.basicInfo?.lifeInsurance_Photo || this.imageUrls.lifeInsurancePhoto);
      if (hasNo || hasPhoto) completed++;
    }

    this.totalVisibleStepsCount = total;
    this.completedStepsCount = completed;
    this.progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  submitOnboarding(): void {
    if (!this.candidateKey) {
      this.toastrService.error(
        'Session expired. Please use the link from your email again.',
        'Error'
      );
      this.router.navigate(['/on_boarding/access-denied']);
      return;
    }

    // Double-check validation before submit
    if (this.isVendor && !this.agreementAccepted) {
      this.toastrService.error(
        'Please accept the Service Agreement before submitting.',
        'Validation Error'
      );
      return;
    }

    // Specific check: if GST is applicable, ensure GST Certificate file is uploaded
    if (this.vendorGstData) {
      const isGstApp =
        this.vendorGstData.vendor_IsGSTApplicable === true ||
        this.vendorGstData.vendor_IsGSTApplicable === 1 ||
        this.vendorGstData.vendor_IsGSTApplicable === '1' ||
        this.vendorGstData.vendor_IsGSTApplicable === 'true' ||
        this.vendorGstData.Vendor_IsGSTApplicable === true ||
        this.vendorGstData.Vendor_IsGSTApplicable === 1 ||
        this.vendorGstData.Vendor_IsGSTApplicable === '1' ||
        this.vendorGstData.Vendor_IsGSTApplicable === 'true' ||
        String(this.vendorGstData.vendor_IsGSTApplicable || '').toLowerCase() === 'yes';

      const hasGstPhoto = !!(
        this.vendorGstData.gstPhoto ||
        this.vendorGstData.GSTPhoto ||
        this.imageUrls.gstPhoto
      );

      if (isGstApp && !hasGstPhoto) {
        this.toastrService.error(
          'GST Certificate file is mandatory when GST is applicable. Please upload your GST certificate before submitting.',
          'GST Certificate Required'
        );
        return;
      }
    }

    if (!this.isDataComplete) {
      this.toastrService.error(
        'Please complete all required sections before submitting',
        'Error'
      );
      return;
    }

    // Open custom confirmation modal instead of browser confirm popup
    this.showSubmitConfirmModal = true;
  }

  closeSubmitConfirmModal(): void {
    this.showSubmitConfirmModal = false;
  }

  confirmAndProceedSubmit(): void {
    this.showSubmitConfirmModal = false;
    this.isSubmitting = true;

    this.finalSubmissionService.submitOnboarding().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(
            'Onboarding submitted successfully!',
            'Success',
            {
              timeOut: 3000,
              progressBar: true,
            }
          );

          const currentKey = sessionStorage.getItem('candidateKey') || this.candidateKey || '';

          // Download PDF automatically with key preserved
          this.downloadPDF(currentKey, () => {
            sessionStorage.removeItem('candidateKey');
            sessionStorage.removeItem('candidateName');
            this.router.navigate(['/on_boarding/completed']);
          });

          // Fallback navigation after 3.5 seconds
          setTimeout(() => {
            sessionStorage.removeItem('candidateKey');
            sessionStorage.removeItem('candidateName');
            this.router.navigate(['/on_boarding/completed']);
          }, 3500);
        } else {
          this.toastrService.error(
            res.message || 'Failed to submit onboarding',
            'Error'
          );
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.toastrService.error(
            'Your session has expired. Please use the link from your email again.',
            'Error'
          );
          sessionStorage.removeItem('candidateKey');
          this.router.navigate(['/on_boarding/access-denied']);
        } else if (error.status === 403) {
          this.toastrService.info('Onboarding already completed', 'Info');
          this.router.navigate(['/on_boarding/completed']);
        } else {
          this.toastrService.error(
            error.error?.message || 'Failed to submit onboarding',
            'Error'
          );
        }
        this.isSubmitting = false;
      },
    });
  }

sendOtp(): void {
  if (!this.otpMobileNo || this.otpMobileNo.length < 10) {
    this.toastrService.warning('Please enter a valid mobile number.');
    return;
  }

  this.isSendingOtp = true;
    this.otpErrorMessage = '';

  this.finalSubmissionService.sendOtp(this.otpMobileNo, this.candidateName).subscribe({
    next: (res: any) => {
      this.isSendingOtp = false;
      if (res.isSuccess) {
        this.isOtpSent = true;
        this.otpCode = '';
        this.toastrService.success(res.message);
      } else {
        this.otpErrorMessage = res.message || 'Failed to send OTP';
        this.toastrService.error(res.message || 'Failed to send OTP');
      }
    },
    error: (err) => {
      this.isSendingOtp = false;
      // show server message if available
      this.toastrService.error(err?.error?.message || 'Failed to send OTP. Please try again later.');
    }
  });
}

verifyOtp(): void {
  if (!this.otpCode) {
    this.toastrService.warning('Please enter the OTP.');
    return;
  }

  this.isVerifyingOtp = true;

  this.finalSubmissionService.verifyOtp(this.otpMobileNo, this.otpCode).subscribe({
    next: (res: any) => {
      this.isVerifyingOtp = false;
      if (res.isSuccess) {
        this.isOtpVerified = true;
        this.toastrService.success('OTP Verified Successfully!');
      } else {
        this.handleOtpFailure(res.message);
      }
    },
    error: (err) => {
      this.isVerifyingOtp = false;
      // Backend returns 400 with {isSuccess:false, message:"OTP Expired or Invalid"}
      this.handleOtpFailure(err?.error?.message);
    }
  });
}

private handleOtpFailure(message?: string): void {
  this.toastrService.error(message || 'OTP Expired or Invalid');
  this.isOtpVerified = false;
  this.otpCode = '';          // clear the box so the user can type again
}

// Lets user re-enter mobile number / request a fresh OTP
resetOtp(): void {
  this.isOtpSent = false;
  this.isOtpVerified = false;
  this.otpCode = '';
}

  getFileUrl(fileName: string): string {
    if (!fileName || !this.candidateKey) return '';
    return `${environment.baseURL1}/CandidateQualificationDetails/documents/${fileName}?key=${this.candidateKey}`;
  }

  // ✅ Direct download onboarding summary PDF generated from backend iTextSharp
  downloadPDF(keyOverride?: string, onComplete?: () => void): void {
    const key = keyOverride || this.candidateKey || sessionStorage.getItem('candidateKey') || '';
    if (!key) {
      this.toastrService.error('Candidate session key is missing', 'Error');
      return;
    }

    const url = `${environment.baseURL1}/CandidateExperienceDetails/download-onboarding-pdf?key=${encodeURIComponent(key)}`;
    window.location.href = url;

    this.toastrService.success('PDF download initiated!', 'Success');

    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }

  formatDate(date: string | Date | undefined | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);

    // Check if valid date
    if (isNaN(d.getTime())) return 'N/A';

    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  }

  maskAadhaar(aadhaar: string | undefined): string {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar || 'N/A';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  }

  maskPAN(pan: string | undefined): string {
    if (!pan || pan.length !== 10) return pan || 'N/A';
    return `${pan.slice(0, 2)}XXX${pan.slice(-4)}`;
  }

  //   formatIndianCurrency(amount: number): string {
  //   return amount.toLocaleString('en-IN', {
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 2
  //   });
  // }

  formatIndianCurrency(amount: number): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    });
  }

  // Show full Aadhaar number
  formatAadhaar(aadhaar: string | undefined): string {
    if (!aadhaar) return 'N/A';
    return aadhaar;
  }

  // Show full PAN number
  formatPAN(pan: string | undefined): string {
    if (!pan) return 'N/A';
    return pan;
  }

  // Show full Account Number
  formatAccountNumber(accountNo: string | undefined): string {
    if (!accountNo) return 'N/A';
    return accountNo;
  }

  // Show full Voter ID
  formatVoterID(voterNo: string | undefined): string {
    if (!voterNo) return 'N/A';
    return voterNo;
  }
}

