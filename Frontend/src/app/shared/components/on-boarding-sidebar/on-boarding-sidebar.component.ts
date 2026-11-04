import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { CandidateExperienceDetailService } from '../../../on_boarding/services/candidate-experience-details.service';
import { CandidateQualificationService } from '../../../on_boarding/services/candidate-qualification.service';
import { CompanyConfigService,CompanyConfig } from '../../../on_boarding/services/company-config.service';
import { FinalSubmissionService } from '../../../on_boarding/services/final-submission.service';


interface MenuItem {
  label: string;
  route: string;  
  visible: boolean;
  mandatory: boolean;
  completed: boolean;
}


@Component({
  selector: 'app-on-boarding-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './on-boarding-sidebar.component.html',
  styleUrl: './on-boarding-sidebar.component.scss'
})
export class OnBoardingSidebarComponent implements OnInit {

    // Company Config
  companyConfig: CompanyConfig | null = null;
  menuItems: MenuItem[] = [];
  
  completionStatus = {
    aadhaar: false,
    lifeInsurance: false,
    pan: false,
    basicInfo: false,
    education: false,
    experience: false,
    family: false,
    voter: false,        
    bankAccount: false,
    drivingLicence: false,
    vendorGst: false,
    signature: false,
    photograph: false,
    eshram: false,
    ayushman: false
  };

  constructor(
    private kycService: CandidateExperienceDetailService,
    private qualificationService: CandidateQualificationService,
    private companyConfigService: CompanyConfigService,
    private finalSubmissionService: FinalSubmissionService,
    private router: Router
  ) {
    // Auto-refresh sidebar when route changes (after form submission/navigation)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAllStatus();
      this.updateMenuCompletionStatus();
    });

     // Listen for manual refresh events
  window.addEventListener('refresh-onboarding-status', () => {
    this.checkAllStatus();
    this.updateMenuCompletionStatus();
  });
  }

  ngOnInit(): void {
    // this.checkAllStatus();
    this.loadCompanyConfig();
  }

  /**
   * Load company configuration and build menu
   */
  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    
    if (!this.companyConfig) {
      // Load from API if not in service
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.buildMenu();
            this.checkAllStatus();
          } else {
            this.useDefaultConfig();
          }
        },
        error: () => {
          this.useDefaultConfig();
        }
      });
    } else {
      this.buildMenu();
      this.checkAllStatus();
    }
  }

  /**
   * Use default config if API fails
   */
  useDefaultConfig(): void {
    this.companyConfig = this.companyConfigService.getDefaultConfig();
    this.buildMenu();
    this.checkAllStatus();
  }

  /**
   * Build menu items based on company config
   */
  buildMenu(): void {
    if (!this.companyConfig) return;

    this.menuItems = [
      // 1. Personal Information & Profile Photo (Top Priority)
      {
        label: 'Basic Information',
        route: '/on_boarding/basicInfo',
        visible: this.companyConfig.basicInfoVisible,
        mandatory: this.companyConfig.basicInfoMandatory,
        completed: this.completionStatus.basicInfo
      },
      {
        label: 'Recent Photograph',
        route: '/on_boarding/photograph',
        visible: this.companyConfig.photographVisible,
        mandatory: this.companyConfig.photographMandatory,
        completed: this.completionStatus.photograph
      },

      // 2. Identity, Government ID Proofs & Vehicle Documents (KYC)
      {
        label: 'Aadhaar Details',
        route: '/on_boarding/aadhaar',
        visible: this.companyConfig.aadhaarVisible,
        mandatory: this.companyConfig.aadhaarMandatory,
        completed: this.completionStatus.aadhaar
      },
      {
        label: 'PAN Details',
        route: '/on_boarding/pan',
        visible: this.companyConfig.panVisible,
        mandatory: this.companyConfig.panMandatory,
        completed: this.completionStatus.pan
      },
      {
        label: 'Voter ID',
        route: '/on_boarding/voter',
        visible: this.companyConfig.voterVisible,
        mandatory: this.companyConfig.voterMandatory,
        completed: this.completionStatus.voter
      },
      {
        label: 'Driving Licence & Vehicle',
        route: '/on_boarding/driving-licence',
        visible: this.companyConfig.drivingLicenceVisible || this.companyConfig.vehicleInsuranceVisible || this.companyConfig.vehicleRCVisible,
        mandatory: this.companyConfig.drivingLicenceMandatory || this.companyConfig.vehicleInsuranceMandatory || this.companyConfig.vehicleRCMandatory,
        completed: this.completionStatus.drivingLicence
      },

      // 3. Academic & Professional Background
      {
        label: 'Qualification',
        route: '/on_boarding/education',
        visible: this.companyConfig.qualificationVisible,
        mandatory: this.companyConfig.qualificationMandatory,
        completed: this.completionStatus.education
      },
      {
        label: 'Experience',
        route: '/on_boarding/previous_experience',
        visible: this.companyConfig.experienceVisible,
        mandatory: this.companyConfig.experienceMandatory,
        completed: this.completionStatus.experience
      },

      // 4. Family & Nominee / Emergency Contact
      {
        label: 'Family Details',
        route: '/on_boarding/family_details',
        visible: this.companyConfig.familyVisible,
        mandatory: this.companyConfig.familyMandatory,
        completed: this.completionStatus.family
      },

      // 5. Financial, Commercial & Welfare Details
      {
        label: 'Cancelled Cheque / Bank',
        route: '/on_boarding/bank',
        visible: this.companyConfig.bankAccountVisible,
        mandatory: this.companyConfig.bankAccountMandatory,
        completed: this.completionStatus.bankAccount
      },
      {
        label: 'Vendor GST Details',
        route: '/on_boarding/vendor-gst',
        visible: this.companyConfig.vendorGstVisible,
        mandatory: this.companyConfig.vendorGstMandatory,
        completed: this.completionStatus.vendorGst
      },
      {
        label: 'E-Shram Card',
        route: '/on_boarding/eshram',
        visible: this.companyConfig.eshramVisible,
        mandatory: this.companyConfig.eshramMandatory,
        completed: this.completionStatus.eshram
      },
      {
        label: 'Ayushman Card',
        route: '/on_boarding/ayushman',
        visible: this.companyConfig.ayushmanVisible,
        mandatory: this.companyConfig.ayushmanMandatory,
        completed: this.completionStatus.ayushman
      },
      {
        label: 'Life Insurance',
        route: '/on_boarding/life-insurance',
        visible: this.companyConfig.lifeinsuranceVisible,
        mandatory: this.companyConfig.lifeinsuranceMandatory,
        completed: this.completionStatus.lifeInsurance
      },

      // 6. Declaration & Final Submission
      {
        label: 'Signature Image',
        route: '/on_boarding/signature',
        visible: this.companyConfig.signatureVisible,
        mandatory: this.companyConfig.signatureMandatory,
        completed: this.completionStatus.signature
      },
      {
        label: 'Final Submission',
        route: '/on_boarding/final-submission',
        visible: true, // Always visible
        mandatory: false,
        completed: false
      }
    ];
  }

  //Check completion status for all forms
  // checkAllStatus(): void {
  //   // Check Aadhaar
  //   this.kycService.Get_Aadhaar_ById('').subscribe({
  //     next: (res: any) => {
  //       this.completionStatus.aadhaar = res.isSuccess && res.data != null;
  //       this.updateMenuCompletionStatus();
  //     },
  //     error: () => this.completionStatus.aadhaar = false
  //   });

  //   // Check PAN
  //   this.kycService.Get_Pan_ById('').subscribe({
  //     next: (res: any) => {
  //       this.completionStatus.pan = res.isSuccess && res.data != null;
  //     },
  //     error: () => this.completionStatus.pan = false
  //   });

  //   // Check Basic Info
  //   this.kycService.Get_BasicInfo().subscribe({
  //     next: (res: any) => {
  //       this.completionStatus.basicInfo = res.isSuccess && res.data != null && res.data.stateId != null;
  //     },
  //     error: () => this.completionStatus.basicInfo = false
  //   });

  //   // Check Education/Qualification
  //   this.qualificationService.getCandidateQualificationList(0, 1).subscribe({
  //     next: (res: any) => {
  //       this.completionStatus.education = res.isSuccess && res.data && res.data.length > 0;
  //     },
  //     error: () => this.completionStatus.education = false
  //   });

  //   // Check Experience
  //   this.kycService.getCandidateExperienceList(0, 1).subscribe({
  //     next: (res: any) => {
  //       this.completionStatus.experience = res.isSuccess && res.data && res.data.length > 0;
  //     },
  //     error: () => this.completionStatus.experience = false
  //   });

  //   // Check Family Details
  //   this.kycService.getCandidateFamilyList(0, 1).subscribe({
  //     next: (res: any) => {
  //       this.completionStatus.family = res.isSuccess && res.data && res.data.length > 0;
  //     },
  //     error: () => this.completionStatus.family = false
  //   });
  // }

  checkAllStatus(): void {
    const candidateKey = sessionStorage.getItem('candidateKey');
    if (!candidateKey) return;

    this.finalSubmissionService.getCandidateFinalSummary().subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          const data = res.data;
          // PAN Details: non-empty panNo, panName, panDob, and panCard photo
          this.completionStatus.pan = !!(
            data.panDetails?.panNo &&
            data.panDetails.panNo.trim() !== '' &&
            data.panDetails?.panCard &&
            data.panDetails.panCard.trim() !== '' &&
            data.panDetails?.panName &&
            data.panDetails.panName.trim() !== '' &&
            data.panDetails?.panDob
          );

          // Aadhaar Details: non-empty aadhaarNo, aadhaarName, aadhaarDob, aadhaarAddress, front & back photos, and Father's front & back photos
          this.completionStatus.aadhaar = !!(
            data.aadhaarDetails?.aadhaarNo &&
            data.aadhaarDetails.aadhaarNo.trim() !== '' &&
            data.aadhaarDetails?.aadhaarName &&
            data.aadhaarDetails.aadhaarName.trim() !== '' &&
            data.aadhaarDetails?.aadhaarDob &&
            data.aadhaarDetails?.aadhaarAddress &&
            data.aadhaarDetails.aadhaarAddress.trim() !== '' &&
            data.aadhaarDetails?.aadhaarFront &&
            data.aadhaarDetails?.aadhaarBack &&
            data.aadhaarDetails?.fatherAadhaarFront &&
            data.aadhaarDetails?.fatherAadhaarBack
          );

          // Basic Info: stateId and address
          this.completionStatus.basicInfo = !!(
            data.basicInfo &&
            data.basicInfo.stateId &&
            data.basicInfo.address &&
            data.basicInfo.address.trim() !== ''
          );

          // Qualification
          this.completionStatus.education = !!(data.qualifications && data.qualifications.length > 0);

          // Experience
          this.completionStatus.experience = !!(data.experience && data.experience.length > 0);

           this.completionStatus.lifeInsurance = !!(data.basicInfo?.lifeInsurance_No || data.basicInfo?.lifeInsurance_Photo);


          // Family Details
          this.completionStatus.family = !!(data.family && data.family.length > 0);

          // Bank Account: accountNo, bankName, ifscCode, and passbookPhoto
          this.completionStatus.bankAccount = !!(
            data.bankDetails?.accountNo &&
            data.bankDetails.accountNo.trim() !== '' &&
            data.bankDetails?.bankName &&
            data.bankDetails.bankName.trim() !== '' &&
            data.bankDetails?.ifscCode &&
            data.bankDetails.ifscCode.trim() !== '' &&
            data.bankDetails?.passbookPhoto &&
            data.bankDetails.passbookPhoto.trim() !== ''
          );

          // Driving Licence & Vehicle
          let isDLComplete = !!(
            (data.drivingLicenceData?.dlNo || (data.basicInfo as any)?.dlNo) &&
            (data.drivingLicenceData?.dlPhoto || (data.basicInfo as any)?.dlPhoto)
          );
          if (this.companyConfig?.vehicleInsuranceMandatory) {
            if (!data.drivingLicenceData?.vehicle_Insurance_No || !data.drivingLicenceData?.vehicle_Insurance_Photo) {
              isDLComplete = false;
            }
          }
          if (this.companyConfig?.vehicleRCMandatory) {
            if (!data.drivingLicenceData?.vehicle_RC_No || !data.drivingLicenceData?.vehicle_RC_Photo) {
              isDLComplete = false;
            }
          }
          this.completionStatus.drivingLicence = isDLComplete;

          // Voter ID: voterNo and voterFrontPhoto
          this.completionStatus.voter = !!(
            data.voterDetails?.voterNo &&
            data.voterDetails.voterNo.trim() !== '' &&
            data.voterDetails?.voterFrontPhoto &&
            data.voterDetails.voterFrontPhoto.trim() !== ''
          );

          // Vendor GST Details
          if (data.vendorGstDetails && (data.vendorGstDetails.pk_recId || (data.vendorGstDetails.vendor_IsGSTApplicable !== null && data.vendorGstDetails.vendor_IsGSTApplicable !== undefined))) {
            const isApp =
              data.vendorGstDetails.vendor_IsGSTApplicable === true ||
              data.vendorGstDetails.vendor_IsGSTApplicable === 1 ||
              data.vendorGstDetails.vendor_IsGSTApplicable === '1' ||
              data.vendorGstDetails.vendor_IsGSTApplicable === 'true' ||
              String(data.vendorGstDetails.vendor_IsGSTApplicable || '').toLowerCase() === 'yes';
            if (isApp) {
              const hasPhoto = !!(data.vendorGstDetails.gstPhoto || data.vendorGstDetails.GSTPhoto || data.vendorGstDetails.vendor_GstPhoto);
              const gstNo = (data.vendorGstDetails.vendor_GSTNo || data.vendorGstDetails.Vendor_GSTNo || '').trim();
              this.completionStatus.vendorGst = !!(hasPhoto && gstNo);
            } else {
              this.completionStatus.vendorGst = true;
            }
          } else {
            this.completionStatus.vendorGst = false;
          }

          // Signature
          this.completionStatus.signature = !!(data.vendorAgreement?.signaturePhoto || data.vendorAgreement?.vendor_SignaturePhoto);

          // Photograph
          this.completionStatus.photograph = !!(data.basicInfo?.photo);

          // E-Shram
          this.completionStatus.eshram = !!(data.basicInfo?.eshram_UAN && data.basicInfo?.eshram_Photo);

          // Ayushman
          this.completionStatus.ayushman = !!(data.basicInfo?.ayushman_PMJAY_ID && data.basicInfo?.ayushman_Photo);

          this.updateMenuCompletionStatus();
        }
      },
      error: () => {
        // Silently preserve current status on transient error
      }
    });
  }

  /**
   * Update completion status in menu items
   */
  updateMenuCompletionStatus(): void {
    if (this.menuItems.length === 0) return;

    // Update each menu item's completion status
    this.menuItems.forEach(item => {
      switch(item.route) {
        case '/on_boarding/basicInfo':
          item.completed = this.completionStatus.basicInfo;
          break;
        case '/on_boarding/pan':
          item.completed = this.completionStatus.pan;
          break;
        case '/on_boarding/aadhaar':
          item.completed = this.completionStatus.aadhaar;
          break;
        case '/on_boarding/education':
          item.completed = this.completionStatus.education;
          break;
        case '/on_boarding/previous_experience':
          item.completed = this.completionStatus.experience;
          break;
        case '/on_boarding/family_details':
          item.completed = this.completionStatus.family;
          break;
        case '/on_boarding/bank':
          item.completed = this.completionStatus.bankAccount;
          break;
        case '/on_boarding/driving-licence':
          item.completed = this.completionStatus.drivingLicence;
          break;
        case '/on_boarding/voter':
          item.completed = this.completionStatus.voter;
          break;
        case '/on_boarding/vendor-gst':
          item.completed = this.completionStatus.vendorGst;
          break;
        case '/on_boarding/signature':
          item.completed = this.completionStatus.signature;
          break;
        case '/on_boarding/photograph':
          item.completed = this.completionStatus.photograph;
          break;
        case '/on_boarding/eshram':
          item.completed = this.completionStatus.eshram;
          break;
        case '/on_boarding/ayushman':
          item.completed = this.completionStatus.ayushman;
          break;
        case '/on_boarding/life-insurance':
          item.completed = this.completionStatus.lifeInsurance;
          break;
  
      }
    });
  }

  
  //Get visible menu items only
  
  get visibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.visible);
  }

  // Get countable visible menu items (excluding Final Submission)
  get countableVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.visible && item.route !== '/on_boarding/final-submission');
  }

  get completedStepsCount(): number {
    return this.countableVisibleMenuItems.filter(item => item.completed).length;
  }

  get totalVisibleStepsCount(): number {
    return this.countableVisibleMenuItems.length;
  }

  get completionPercentage(): number {
    const total = this.totalVisibleStepsCount;
    if (total === 0) return 0;
    return Math.round((this.completedStepsCount / total) * 100);
  }
}