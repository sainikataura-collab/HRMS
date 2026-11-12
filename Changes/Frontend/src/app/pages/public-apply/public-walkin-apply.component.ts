import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AtsService } from '../../shared/services/ats.service';
import { EncryptionService } from '../../shared/services/encryption.service';
import { environment } from '../../../environments/environment';

export interface PublicJobItem {
  jobId: string;
  jobTitle: string;
  designation?: string;
  department?: string;
  locationName?: string;
  locationId?: string;
  openPositions?: number;
}

export interface PublicVendorItem {
  vendorId: string;
  vendorName: string;
  vendorCode?: string;
}

@Component({
  selector: 'app-public-walkin-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './public-walkin-apply.component.html',
  styleUrls: ['./public-walkin-apply.component.scss']
})
export class PublicWalkinApplyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private atsService = inject(AtsService);
  private encryptionService = inject(EncryptionService);

  // Security & Authorization State
  qrToken: string = '';
  isAuthorized: boolean = false;
  isInitializing: boolean = true;
  authorizationErrorMessage: string = '';

  // Location & Hub Metadata
  companyId: string = '';
  locationId: string = '';
  locationName: string = 'Operational Hub';
  locationCode: string = 'HUB';
  state: string = 'Operational State';
  zone: string = 'General Zone';
  companyName: string = 'Empower Logics HRMS';
  companyLogo: string = '';
  companyLogoUrl: string = 'assets/Image/Logo/logo.png';

  // Master Lists
  companiesList: any[] = [];
  openJobsList: PublicJobItem[] = [];
  vendorList: PublicVendorItem[] = [];
  locationsList: any[] = [];
  isLocationLocked: boolean = false;
  isCompanyLocked: boolean = false;

  // Form Model (Streamlined to 4 Fields)
  formCandidateName: string = '';
  formMobileNumber: string = '';
  formAadharNo: string = '';
  formSelectedVendorId: string = '';
  formSelectedJobId: string = '';

  // Aadhaar Validation State
  isCheckingAadhaar: boolean = false;
  aadhaarValidationStatus: 'idle' | 'checking' | 'verified' | 'blocked' = 'idle';
  aadhaarErrorMessage: string = '';
  lastCheckedAadhaar: string = '';

  // Submission State
  isSubmitting: boolean = false;
  isSubmittedSuccess: boolean = false;
  submissionResponse: any = null;

  ngOnInit(): void {
    this.extractAndVerifyQrToken();
  }

  // Helper to resolve company logo URL with fallback
  resolveLogoUrl(logoName?: string): string {
    if (!logoName || !logoName.trim()) {
      return 'assets/Image/Logo/logo.png';
    }
    const clean = logoName.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('assets/')) {
      return clean;
    }
    const base = environment.baseURL1 || environment.baseURL || '';
    return `${base}/CandidateExperienceDetails/logoimages/${encodeURIComponent(clean)}`;
  }

  onLogoError(event: any): void {
    if (event?.target) {
      event.target.src = 'assets/Image/Logo/logo.png';
    }
  }

  // ── 1. EXTRACT & VERIFY ENCRYPTED QR TOKEN ────────────────────────────────
  extractAndVerifyQrToken(): void {
    this.isInitializing = true;
    this.qrToken = this.route.snapshot.params['qrToken'] || this.route.snapshot.queryParams['token'] || '';

    if (!this.qrToken) {
      // Dynamic resolution for direct URL access (e.g. #/public-apply?companyId=... or direct browser access)
      const qCompanyId = this.route.snapshot.queryParams['companyId'] || 
                         sessionStorage.getItem('companyId') || 
                         sessionStorage.getItem('fk_companyId') || 
                         localStorage.getItem('companyId') || 
                         localStorage.getItem('fk_companyId') || '';
      const qLocationId = this.route.snapshot.queryParams['locationId'] || '';

      this.companyId = qCompanyId;
      this.locationId = qLocationId;
      this.isLocationLocked = !!qLocationId;
      this.isCompanyLocked = !!qCompanyId;
      this.isAuthorized = true;
      this.loadLocationJobsAndVendors();
      return;
    }

    try {
      const decryptedJson = this.encryptionService.decryptText(this.qrToken);
      const payload = JSON.parse(decryptedJson);

      if (!payload || !payload.locationId || payload.source !== 'WALKIN_LOCATION_QR') {
        this.isAuthorized = false;
        this.isInitializing = false;
        this.authorizationErrorMessage = 'Invalid or tampered QR Code. Please scan the official location QR code again.';
        return;
      }

      this.companyId = payload.companyId || '';
      this.locationId = payload.locationId;
      this.locationName = payload.locationName || 'Operational Hub';
      this.locationCode = payload.locationCode || 'HUB';
      this.state = payload.state || 'Operational State';
      this.zone = payload.zone || 'General Zone';
      this.isLocationLocked = true;
      this.isCompanyLocked = !!payload.companyId;
      this.isAuthorized = true;

      // Load Open Jobs & Vendors with Header Authorization
      this.loadLocationJobsAndVendors();
    } catch (err) {
      console.error('Error verifying QR token:', err);
      this.companyId = '';
      this.isLocationLocked = false;
      this.isCompanyLocked = false;
      this.isAuthorized = true;
      this.loadLocationJobsAndVendors();
    }
  }

  onCompanyChange(newCompId: string): void {
    this.companyId = newCompId;
    this.locationId = '';
    this.formSelectedJobId = '';
    this.formSelectedVendorId = '';
    this.loadLocationJobsAndVendors();
  }

  onLocationChange(newLocId: string): void {
    this.locationId = newLocId;
    this.formSelectedJobId = '';
    this.formSelectedVendorId = '';
    this.loadLocationJobsAndVendors();
  }

  // ── 2. LOAD OPEN JOBS & VENDORS VIA SECURE API (Company & Location Scoped) ─
  loadLocationJobsAndVendors(): void {
    this.atsService.getPublicLocationJobsWithVendors(this.locationId, this.companyId, this.qrToken).subscribe({
      next: (res) => {
        this.isInitializing = false;
        if (res && res.isSuccess) {
          this.locationName = res.locationName || this.locationName;
          this.locationCode = res.locationCode || this.locationCode;
          this.state = res.state || this.state;
          this.zone = res.zone || this.zone;
          this.companyName = res.companyName || this.companyName;
          this.companyLogo = res.companyLogo || '';
          this.companyLogoUrl = this.resolveLogoUrl(this.companyLogo);

          // Populate enterprises / companies
          if (res.companies && Array.isArray(res.companies)) {
            this.companiesList = res.companies;
          }

          // Auto-bind current company if not explicitly selected yet
          if (!this.companyId && res.companyCode) {
            this.companyId = res.companyCode;
          }

          // Populate active company locations
          if (res.locations && Array.isArray(res.locations)) {
            this.locationsList = res.locations;
          }

          // Dynamic open jobs strictly for this company & location
          this.openJobsList = res.openJobs || [];
          
          // Pure Vendor list from IsVendor = 1 strictly for this company & location
          this.vendorList = (res.vendors || []).filter((v: any) => v.vendorId !== 'DIRECT' && v.vendorCode !== 'DIRECT');

          // Auto-select first job for this location if available
          if (this.openJobsList.length > 0) {
            if (!this.formSelectedJobId || !this.openJobsList.some(j => String(j.jobId) === String(this.formSelectedJobId))) {
              this.formSelectedJobId = String(this.openJobsList[0].jobId);
            }
          } else {
            this.formSelectedJobId = '';
          }
          this.formSelectedVendorId = '';
        }
      },
      error: (err) => {
        this.isInitializing = false;
        console.error('Error fetching location walkin data:', err);
        this.openJobsList = [];
        this.vendorList = [];
        this.formSelectedJobId = '';
        this.formSelectedVendorId = '';
      }
    });
  }

  // ── 3. REAL-TIME AADHAAR CARD VALIDATION AGAINST REC_CANDIDATE_APPLICATION ─
  onAadhaarInput(): void {
    // Sanitize to digits only, limit to 12
    this.formAadharNo = (this.formAadharNo || '').replace(/\D/g, '').slice(0, 12);

    if (this.formAadharNo.length < 12) {
      this.aadhaarValidationStatus = 'idle';
      this.aadhaarErrorMessage = '';
      return;
    }

    if (this.formAadharNo.length === 12 && this.formAadharNo !== this.lastCheckedAadhaar) {
      this.validateAadhaarStatus();
    }
  }

  validateAadhaarStatus(): void {
    if (this.formAadharNo.length !== 12) return;

    this.isCheckingAadhaar = true;
    this.aadhaarValidationStatus = 'checking';
    this.lastCheckedAadhaar = this.formAadharNo;

    const payload = {
      aadharNo: this.formAadharNo,
      companyId: this.companyId,
      locationId: this.locationId
    };

    this.atsService.checkCandidateAadhaarStatus(payload, this.qrToken).subscribe({
      next: (res) => {
        this.isCheckingAadhaar = false;
        const canProceed = res?.canProceed !== undefined 
          ? (res.canProceed === true || res.canProceed === 1) 
          : (res?.CanProceed === 1 || res?.CanProceed === true);
        const isDuplicate = res?.isDuplicate === true || res?.ExistsStatus === 1;
        const msg = res?.message || res?.Message || '';

        if (!canProceed || isDuplicate) {
          // Aadhaar found with active employee or active application -> BLOCK SUBMISSION
          this.aadhaarValidationStatus = 'blocked';
          this.aadhaarErrorMessage = msg || 'Candidate with this Aadhaar number already exists with active interview status.';
          this.toastr.error(this.aadhaarErrorMessage, 'Duplicate Aadhaar Application');
        } else {
          // Aadhaar is clear -> PROCEED
          this.aadhaarValidationStatus = 'verified';
          this.aadhaarErrorMessage = '';
        }
      },
      error: (err) => {
        this.isCheckingAadhaar = false;
        console.error('Error validating Aadhaar:', err);
        // Allow user to proceed if service is momentarily offline
        this.aadhaarValidationStatus = 'verified';
        this.aadhaarErrorMessage = '';
      }
    });
  }

  onJobSelect(jobId: string): void {
    this.formSelectedJobId = jobId;
    const selectedJob = this.openJobsList.find(j => String(j.jobId) === String(jobId));
    if (selectedJob && (!this.qrToken || !this.locationId)) {
      if (selectedJob.locationId) {
        this.locationId = selectedJob.locationId;
      }
      if (selectedJob.locationName) {
        this.locationName = selectedJob.locationName;
      }
    }
  }

  // ── 4. FORM SUBMISSION (Candidate Name, Mobile, and Job are Mandatory; Vendor & Aadhaar are Optional) ──────
  get isFormValid(): boolean {
    const isNameValid = !!this.formCandidateName && this.formCandidateName.trim().length >= 2;
    const isMobileValid = !!this.formMobileNumber && /^\d{10}$/.test(this.formMobileNumber.trim());
    const isJobValid = this.openJobsList.length === 0 || !!this.formSelectedJobId;

    // Aadhaar is optional: valid if blank OR if 12 digits and not blocked
    const trimmedAadhaar = (this.formAadharNo || '').trim();
    const isAadhaarValid = trimmedAadhaar.length === 0 || (/^\d{12}$/.test(trimmedAadhaar) && this.aadhaarValidationStatus !== 'blocked');

    return isNameValid && isMobileValid && isJobValid && isAadhaarValid && !this.isCheckingAadhaar;
  }

  submitApplication(): void {
    if (!this.isFormValid) {
      if (this.aadhaarValidationStatus === 'blocked') {
        this.toastr.error(this.aadhaarErrorMessage || 'This Aadhaar number is restricted from submitting a new application.', 'Application Blocked');
        return;
      }
      this.toastr.warning('Please fill in all mandatory fields correctly.', 'Validation');
      return;
    }

    this.isSubmitting = true;

    const selectedJob = this.openJobsList.find(j => String(j.jobId) === String(this.formSelectedJobId));
    const selectedVendor = this.vendorList.find(v => v.vendorId === this.formSelectedVendorId);

    const payload = {
      candidateName: this.formCandidateName.trim(),
      mobileNumber: this.formMobileNumber.trim(),
      aadharNo: this.formAadharNo.trim(),
      vendorId: this.formSelectedVendorId || '',
      vendorName: selectedVendor?.vendorName || (this.formSelectedVendorId ? 'Vendor Sourced' : 'Direct Walk-In / Self'),
      jobId: this.formSelectedJobId,
      jobTitle: selectedJob?.jobTitle || 'Spot Walk-In Candidate',
      locationId: this.locationId || selectedJob?.locationId || '',
      companyId: this.companyId || ''
    };

    this.atsService.submitWalkInCandidate(payload, this.qrToken).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res && res.isSuccess) {
          this.isSubmittedSuccess = true;
          this.submissionResponse = res;
          this.toastr.success('Your application has been registered successfully!', 'Success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.toastr.error(res?.message || 'Failed to submit application.', 'Submission Error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error submitting walkin candidate:', err);
        const errMsg = err?.error?.message || err?.message || 'Failed to submit application. Please check your network or try again.';
        this.toastr.error(errMsg, 'Submission Error');
      }
    });
  }

  resetForm(): void {
    this.formCandidateName = '';
    this.formMobileNumber = '';
    this.formAadharNo = '';
    this.aadhaarValidationStatus = 'idle';
    this.aadhaarErrorMessage = '';
    this.isSubmittedSuccess = false;
    this.submissionResponse = null;
    if (this.openJobsList.length > 0) {
      this.formSelectedJobId = String(this.openJobsList[0].jobId);
    }
  }
}
