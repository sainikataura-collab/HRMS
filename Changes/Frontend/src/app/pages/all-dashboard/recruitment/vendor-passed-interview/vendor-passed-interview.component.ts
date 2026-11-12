import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AtsService } from '../../../../shared/services/ats.service';

@Component({
  selector: 'app-vendor-passed-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-passed-interview.component.html',
  styleUrls: ['./vendor-passed-interview.component.scss']
})
export class VendorPassedInterviewComponent implements OnInit {
  get companyId(): string {
    return sessionStorage.getItem('companyId') ||
           localStorage.getItem('fk_companyId') ||
           localStorage.getItem('companyId') ||
           sessionStorage.getItem('fk_companyId') || '';
  }

  selectedVendorId: string = '';
  vendorProfile: any = null;
  isVendorUser: boolean = false;
  vendors: any[] = [];

  // Candidate Data State
  selectedCandidates: any[] = [];
  loadingData: boolean = false;
  searchQuery: string = '';
  selectedJobFilter: string = '';

  // Active View: 'list' (all selected candidates) | 'detail' (complete remaining candidate details)
  activeView: 'list' | 'detail' = 'list';
  selectedCandidate: any = null;
  dossierActiveTab: 'statutory' | 'bank' | 'nominee' | 'docs' = 'statutory';

  religions: string[] = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other'];

  // Dossier Form for Candidate Details & Onboarding (Editable Prefilled + Remaining)
  dossierForm: any = {
    candidateName: '',
    mobile: '',
    email: '',
    gender: 'Male',
    religion: 'Hindu',
    religionId: '',
    dateOfBirth: '',
    fatherName: '',
    aadhaarNo: '',
    panNo: '',
    bankAccNo: '',
    bankIfsc: '',
    bankName: '',
    bankBranch: '',
    nomineeName: '',
    nomineeRelation: 'Father',
    nomineeDOB: '',
    nomineeContact: '',
    uanNo: '',
    esicNo: ''
  };

  candidateDocs: any[] = [];
  loadingDocs: boolean = false;
  uploadingDocCode: string | null = null;
  savingDossier: boolean = false;
  submittingToHR: boolean = false;
  aadhaarStatus: 'idle' | 'checking' | 'verified' | 'duplicate' = 'idle';
  aadhaarMessage: string = '';

  previewDocUrl: SafeResourceUrl | null = null;
  previewDocRawUrl: string = '';
  previewDocTitle: string = '';
  showDocPreviewModal: boolean = false;

  // Modular Popups State: 'personal' | 'statutory' | 'bank' | 'nominee' | 'docs' | null
  activeSectionPopup: 'personal' | 'statutory' | 'bank' | 'nominee' | 'docs' | null = null;

  openSectionPopup(section: 'personal' | 'statutory' | 'bank' | 'nominee' | 'docs'): void {
    this.activeSectionPopup = section;
  }

  closeSectionPopup(): void {
    this.activeSectionPopup = null;
  }

  saveSectionAndClose(): void {
    this.saveDossierDetails();
    this.closeSectionPopup();
  }

  get isPersonalComplete(): boolean {
    return !!(this.dossierForm?.candidateName && this.dossierForm?.mobile);
  }

  get isStatutoryComplete(): boolean {
    return !!(this.dossierForm?.panNo && this.dossierForm?.aadhaarNo);
  }

  get isBankComplete(): boolean {
    return !!(this.dossierForm?.bankAccNo && this.dossierForm?.bankIfsc && this.dossierForm?.bankName);
  }

  get isNomineeComplete(): boolean {
    return !!(this.dossierForm?.nomineeName && this.dossierForm?.nomineeContact);
  }

  get isDocsComplete(): boolean {
    return this.uploadedDocsCount > 0 && this.missingMandatoryDocsCount === 0;
  }

  get completedSectionsCount(): number {
    let count = 0;
    if (this.isPersonalComplete) count++;
    if (this.isStatutoryComplete) count++;
    if (this.isBankComplete) count++;
    if (this.isNomineeComplete) count++;
    if (this.isDocsComplete) count++;
    return count;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atsService: AtsService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    // Decrypt vendorId from query param (City Master encryption pattern)
    const encVendorId = this.route.snapshot.queryParamMap.get('vendorId');
    if (encVendorId) {
      const decryptedVendorId = this.encryptionService.decryptText(encVendorId);
      this.selectedVendorId = decryptedVendorId || encVendorId; // fallback: use raw if decryption fails
    }

    // Decrypt appId from query param
    const encAppId = this.route.snapshot.queryParamMap.get('appId') ||
                     this.route.snapshot.paramMap.get('appId');
    let targetAppId: number | null = null;
    if (encAppId) {
      const decryptedAppId = this.encryptionService.decryptText(encAppId);
      targetAppId = Number(decryptedAppId) || Number(encAppId);
    }

    this.resolveVendorAndLoadData(targetAppId);
  }

  resolveVendorAndLoadData(targetAppId: number | null = null): void {
    this.loadingData = true;

    // Check if session or localStorage has vendor identification
    const sessionIsVendor = sessionStorage.getItem('isVendor') === 'true' || 
                            localStorage.getItem('isVendor') === 'true';
    const sessionVendorId = sessionStorage.getItem('fk_vendorId') || 
                            localStorage.getItem('fk_vendorId') || '';

    if (sessionIsVendor && sessionVendorId) {
      this.isVendorUser = true;
      if (!this.selectedVendorId) {
        this.selectedVendorId = sessionVendorId;
      }
    }

    this.atsService.getMyVendorProfile().subscribe({
      next: (profile: any) => {
        if (profile && profile.isVendor && profile.vendorId) {
          this.isVendorUser = true;
          this.vendorProfile = profile;
          if (!this.selectedVendorId) {
            this.selectedVendorId = profile.vendorId;
          }
          sessionStorage.setItem('isVendor', 'true');
          sessionStorage.setItem('fk_vendorId', profile.vendorId);
        }
        this.fetchVendorsAndCandidates(targetAppId);
      },
      error: () => {
        this.fetchVendorsAndCandidates(targetAppId);
      }
    });
  }

  private fetchVendorsAndCandidates(targetAppId: number | null = null): void {
    this.atsService.getVendorsForMapping(this.companyId).subscribe({
      next: (res: any) => {
        const vList = (res && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        this.vendors = vList;

        if (!this.selectedVendorId && vList.length > 0) {
          const userVendorId = sessionStorage.getItem('vendorId') || localStorage.getItem('vendorId');
          const matched = vList.find((v: any) => v.vendorId === userVendorId);
          this.selectedVendorId = matched ? matched.vendorId : vList[0].vendorId;
        }

        if (this.selectedVendorId) {
          this.loadPassedInterviewCandidates(targetAppId);
        } else {
          this.loadingData = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        if (this.selectedVendorId) {
          this.loadPassedInterviewCandidates(targetAppId);
        } else {
          this.loadingData = false;
        }
      }
    });
  }

  loadPassedInterviewCandidates(targetAppId: number | null = null): void {
    if (!this.selectedVendorId) return;

    this.loadingData = true;
    this.loaderService.start();
    this.atsService.getVendorSelectedCandidates(this.selectedVendorId, this.companyId).subscribe({
      next: (candidates: any[]) => {
        this.loaderService.stop();
        this.selectedCandidates = candidates || [];
        this.loadingData = false;

        // If targetAppId specified, immediately open its details
        if (targetAppId) {
          const target = this.selectedCandidates.find(c => c.appId === targetAppId);
          if (target) {
            this.selectCandidate(target);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loaderService.stop();
        this.loadingData = false;
        this.toastr.error('Failed to load passed interview candidates.', 'Error');
      }
    });
  }

  onVendorChange(newVendorId: string): void {
    this.selectedVendorId = newVendorId;
    this.activeView = 'list';
    this.selectedCandidate = null;
    this.loadPassedInterviewCandidates();
  }

  // ── Filters & Computed ──────────────────────────────────────────────────
  get availableJobs(): string[] {
    const jobs = this.selectedCandidates
      .map(c => (c.jobTitle || '').trim())
      .filter((j, idx, self) => !!j && self.indexOf(j) === idx);
    return jobs.sort();
  }

  get filteredCandidates(): any[] {
    let list = this.selectedCandidates;

    if (this.selectedJobFilter) {
      list = list.filter(c => (c.jobTitle || '').trim().toLowerCase() === this.selectedJobFilter.trim().toLowerCase());
    }

    if (!this.searchQuery || !this.searchQuery.trim()) {
      return list;
    }

    const q = this.searchQuery.toLowerCase().trim();
    return list.filter(c =>
      (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
      (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.aadhaarNo && c.aadhaarNo.includes(q)) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(q)) ||
      (c.mrfCode && c.mrfCode.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q))
    );
  }

  get uploadedDocsCount(): number {
    return this.candidateDocs.filter(d => !!d.fileName).length;
  }

  get missingMandatoryDocsCount(): number {
    return this.candidateDocs.filter(d => d.isMandatory && !d.fileName).length;
  }

  // ── Select Candidate & Open Completion Form ──────────────────────────────
  selectCandidate(candidate: any): void {
    this.selectedCandidate = candidate;
    this.activeView = 'detail';
    this.dossierActiveTab = 'statutory';

    // Populate Dossier Form with existing details (editable prefilled + remaining)
    this.dossierForm = {
      candidateName: candidate.candidateName || '',
      mobile: candidate.mobile || '',
      email: candidate.email || '',
      gender: candidate.gender || 'Male',
      religion: candidate.religion || 'Hindu',
      religionId: candidate.religionId || '',
      dateOfBirth: candidate.dateOfBirth ? candidate.dateOfBirth.split('T')[0] : '',
      fatherName: candidate.fatherName || '',
      aadhaarNo: candidate.aadhaarNo || '',
      panNo: candidate.panNo || '',
      bankAccNo: candidate.bankAccNo || '',
      bankIfsc: candidate.bankIfsc || '',
      bankName: candidate.bankName || '',
      bankBranch: candidate.bankBranch || '',
      nomineeName: candidate.nomineeName || '',
      nomineeRelation: candidate.nomineeRelation || 'Father',
      nomineeDOB: candidate.nomineeDOB ? candidate.nomineeDOB.split('T')[0] : '',
      nomineeContact: candidate.nomineeContact || '',
      uanNo: candidate.uanNo || '',
      esicNo: candidate.esicNo || ''
    };

    this.candidateDocs = [];
    this.loadCandidateDocuments(candidate.appId);
  }

  switchDossierTab(tab: string): void {
    if (tab === 'statutory' || tab === 'bank' || tab === 'nominee' || tab === 'docs') {
      this.dossierActiveTab = tab as any;
      this.cdr.detectChanges();
    }
  }

  backToList(): void {
    this.activeView = 'list';
    this.selectedCandidate = null;
    this.candidateDocs = [];
  }

  loadCandidateDocuments(appId: number): void {
    this.loadingDocs = true;
    this.atsService.getCandidateDocuments(appId, this.companyId).subscribe({
      next: (res: any) => {
        this.loadingDocs = false;
        const docsList = res?.documents || (Array.isArray(res) ? res : []);
        this.candidateDocs = (docsList || []).map((d: any) => ({
          ...d,
          docId: d.docId || d.pk_docId,
          appId: d.appId || d.fk_appId || appId,
          isVerified: d.verificationStatus === 'Approved'
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDocs = false;
        this.candidateDocs = [];
        this.cdr.detectChanges();
      }
    });
  }

  onAadhaarInput(): void {
    if (this.dossierForm.aadhaarNo) {
      this.dossierForm.aadhaarNo = this.dossierForm.aadhaarNo.replace(/\D/g, '').slice(0, 12);
    }
    if (!this.dossierForm.aadhaarNo || this.dossierForm.aadhaarNo.length < 12) {
      this.aadhaarStatus = 'idle';
      this.aadhaarMessage = '';
      return;
    }
    if (this.dossierForm.aadhaarNo.length === 12) {
      this.validateAadhaar();
    }
  }

  validateAadhaar(): void {
    const cleanAadhaar = (this.dossierForm.aadhaarNo || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) return;

    this.aadhaarStatus = 'checking';
    const currentAppId = this.selectedCandidate?.appId;
    this.atsService.verifyAadhaarUniqueness({ aadhaarNo: cleanAadhaar, companyId: this.companyId, currentAppId }).subscribe({
      next: (res: any) => {
        const canProceed = res?.canProceed !== undefined 
          ? (res.canProceed === true || res.canProceed === 1) 
          : (res?.CanProceed === 1 || res?.CanProceed === true);
        const isDuplicate = res?.isDuplicate === true || res?.ExistsStatus === 1;
        const msg = res?.message || res?.Message || '';

        if (!canProceed || isDuplicate) {
          this.aadhaarStatus = 'duplicate';
          this.aadhaarMessage = msg || 'Aadhaar is already registered in company records or recruitment pipeline.';
          this.toastr.error(this.aadhaarMessage, 'Duplicate Aadhaar');
        } else {
          this.aadhaarStatus = 'verified';
          this.aadhaarMessage = '';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.aadhaarStatus = 'verified';
        this.aadhaarMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  saveDossierDetails(): void {
    if (!this.selectedCandidate) return;

    if (this.aadhaarStatus === 'duplicate') {
      this.toastr.error(this.aadhaarMessage || 'Cannot save: Duplicate Aadhaar card detected in records.', 'Duplicate Aadhaar');
      return;
    }

    const payload = {
      appId: this.selectedCandidate.appId,
      candidateName: (this.dossierForm.candidateName || '').trim(),
      mobile: (this.dossierForm.mobile || '').trim(),
      email: (this.dossierForm.email || '').trim(),
      gender: this.dossierForm.gender,
      religion: (this.dossierForm.religion || 'Hindu').trim(),
      religionId: this.dossierForm.religionId || null,
      dateOfBirth: this.dossierForm.dateOfBirth || null,
      fatherName: (this.dossierForm.fatherName || '').trim(),
      aadhaarNo: (this.dossierForm.aadhaarNo || '').trim(),
      panNo: (this.dossierForm.panNo || '').trim(),
      bankAccNo: (this.dossierForm.bankAccNo || '').trim(),
      bankIfsc: (this.dossierForm.bankIfsc || '').trim(),
      bankName: (this.dossierForm.bankName || '').trim(),
      nomineeName: (this.dossierForm.nomineeName || '').trim(),
      nomineeRelation: this.dossierForm.nomineeRelation,
      nomineeDOB: this.dossierForm.nomineeDOB || null,
      nomineeContact: (this.dossierForm.nomineeContact || '').trim(),
      uanNo: (this.dossierForm.uanNo || '').trim(),
      esicNo: (this.dossierForm.esicNo || '').trim(),
      companyId: this.companyId
    };

    this.savingDossier = true;
    this.loaderService.start();
    this.atsService.saveCandidateOnboardingDossier(payload).subscribe({
      next: (res: any) => {
        this.loaderService.stop();
        this.savingDossier = false;
        if (res && res.success === false) {
          this.toastr.error(res.message || 'Error saving candidate details.', 'Save Restricted');
          return;
        }
        this.toastr.success('Candidate profile & statutory details saved successfully.', 'Saved');
        Object.assign(this.selectedCandidate, payload);
        this.loadPassedInterviewCandidates();
      },
      error: (err) => {
        this.loaderService.stop();
        this.savingDossier = false;
        this.toastr.error(err?.error?.message || 'Failed to save dossier details.', 'Save Error');
      }
    });
  }

  submitToSiteHR(): void {
    if (!this.selectedCandidate) return;

    if (this.missingMandatoryDocsCount > 0) {
      this.toastr.error(
        `Cannot submit: ${this.missingMandatoryDocsCount} mandatory document(s) are still missing. Please upload all required documents first.`,
        'Mandatory Documents Required'
      );
      this.switchDossierTab('docs');
      return;
    }

    const cleanAadhaar = (this.dossierForm.aadhaarNo || '').replace(/\D/g, '');
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      this.toastr.warning('Please enter a valid 12-digit Aadhaar Card Number before submitting.', 'Aadhaar Required');
      this.switchDossierTab('statutory');
      return;
    }

    if (this.aadhaarStatus === 'duplicate') {
      this.toastr.error(this.aadhaarMessage || 'Duplicate Aadhaar card cannot be submitted.', 'Validation Error');
      this.switchDossierTab('statutory');
      return;
    }

    const payload = {
      appId: this.selectedCandidate.appId,
      candidateName: (this.dossierForm.candidateName || '').trim(),
      mobile: (this.dossierForm.mobile || '').trim(),
      email: (this.dossierForm.email || '').trim(),
      gender: this.dossierForm.gender,
      religion: (this.dossierForm.religion || 'Hindu').trim(),
      religionId: this.dossierForm.religionId || null,
      dateOfBirth: this.dossierForm.dateOfBirth || null,
      fatherName: (this.dossierForm.fatherName || '').trim(),
      aadhaarNo: cleanAadhaar,
      panNo: (this.dossierForm.panNo || '').trim(),
      bankAccNo: (this.dossierForm.bankAccNo || '').trim(),
      bankIfsc: (this.dossierForm.bankIfsc || '').trim(),
      bankName: (this.dossierForm.bankName || '').trim(),
      nomineeName: (this.dossierForm.nomineeName || '').trim(),
      nomineeRelation: this.dossierForm.nomineeRelation,
      nomineeDOB: this.dossierForm.nomineeDOB || null,
      nomineeContact: (this.dossierForm.nomineeContact || '').trim(),
      uanNo: (this.dossierForm.uanNo || '').trim(),
      esicNo: (this.dossierForm.esicNo || '').trim(),
      companyId: this.companyId
    };

    this.submittingToHR = true;
    this.loaderService.start();

    // 1. Save dossier first
    this.atsService.saveCandidateOnboardingDossier(payload).subscribe({
      next: (res: any) => {
        if (res && res.success === false) {
          this.loaderService.stop();
          this.submittingToHR = false;
          this.toastr.error(res.message || 'Error saving candidate details.', 'Submission Restricted');
          return;
        }

        // 2. Move stage to Docs_Submitted (Next step)
        const stagePayload = {
          appId: this.selectedCandidate.appId,
          targetStage: 'Docs_Submitted',
          remarks: `All onboarding documents and statutory details submitted by staffing partner [${this.vendorProfile?.vendorName || 'Authorized Vendor'}] for Site HR verification.`,
          movedBy: this.vendorProfile?.vendorName || 'Staffing Partner',
          companyId: this.companyId
        };

        this.atsService.moveCandidateStage(stagePayload).subscribe({
          next: () => {
            this.loaderService.stop();
            this.submittingToHR = false;
            this.toastr.success(
              `Candidate ${this.selectedCandidate.candidateName} successfully forwarded to Site HR Document Verification Queue!`,
              'Candidate Moved to Next Step'
            );
            this.backToList();
            this.loadPassedInterviewCandidates();
          },
          error: (err) => {
            this.loaderService.stop();
            this.submittingToHR = false;
            this.toastr.error(err?.error?.message || 'Failed to move candidate to next stage.', 'Stage Advance Error');
          }
        });
      },
      error: (err) => {
        this.loaderService.stop();
        this.submittingToHR = false;
        this.toastr.error(err?.error?.message || 'Failed to save candidate details.', 'Save Error');
      }
    });
  }

  onFileSelected(event: any, docTypeCode: string): void {
    const file: File = event.target?.files?.[0];
    if (!file || !this.selectedCandidate) return;

    // Validate format (PDF/JPG/JPEG/PNG) and size (<= 10MB)
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      this.toastr.error('Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.', 'Format Validation');
      if (event.target) event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.toastr.error('File size exceeds the 10MB limit.', 'File Too Large');
      if (event.target) event.target.value = '';
      return;
    }

    const formData = new FormData();
    const appId = String(this.selectedCandidate.appId);
    formData.append('file', file);
    formData.append('appId', appId);
    formData.append('docTypeCode', docTypeCode);
    formData.append('companyId', this.companyId);

    this.uploadingDocCode = docTypeCode;
    this.atsService.uploadCandidateDocument(formData).subscribe({
      next: () => {
        this.uploadingDocCode = null;
        if (event.target) event.target.value = '';
        this.toastr.success(`${file.name} uploaded successfully.`, 'Document Uploaded');

        // Optimistically update document in current table view so user instantly sees it
        const doc = this.candidateDocs.find(d => d.docTypeCode === docTypeCode);
        if (doc) {
          doc.fileName = file.name;
          doc.fileSize = file.size;
          doc.appId = Number(appId);
          doc.verificationStatus = 'Pending';
          doc.isVerified = false;
        }

        this.loadCandidateDocuments(this.selectedCandidate.appId);
        this.loadPassedInterviewCandidates();
      },
      error: (err) => {
        this.uploadingDocCode = null;
        if (event.target) event.target.value = '';
        this.toastr.error(err?.error?.message || 'Failed to upload document.', 'Upload Error');
      }
    });
  }

  previewDocument(doc: any): void {
    if (!doc.fileName && !doc.filePath) {
      this.toastr.info('No document has been uploaded yet for this credential.', 'Pending Upload');
      return;
    }
    const appId = doc.appId || doc.fk_appId || this.selectedCandidate?.appId;
    const docId = doc.docId || doc.pk_docId;
    const rawUrl = this.atsService.getDocumentViewUrl(docId, appId, doc.docTypeCode, this.companyId);
    this.previewDocRawUrl = rawUrl;
    this.previewDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    this.previewDocTitle = `${doc.docTypeName || doc.docTypeCode} (${doc.fileName || 'Document'})`;
    this.showDocPreviewModal = true;
  }

  openDocInNewWindow(doc?: any): void {
    const appId = doc?.appId || doc?.fk_appId || this.selectedCandidate?.appId;
    const docId = doc?.docId || doc?.pk_docId;
    const url = doc 
      ? this.atsService.getDocumentViewUrl(docId, appId, doc.docTypeCode, this.companyId)
      : this.previewDocRawUrl;
    if (url) {
      window.open(url, '_blank');
    }
  }

  closeDocPreviewModal(): void {
    this.showDocPreviewModal = false;
    this.previewDocUrl = null;
    this.previewDocRawUrl = '';
  }

  formatFileSize(bytes: number | null): string {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  }

  goBackToVendorPortal(): void {
    const qParams: any = {};
    if (this.selectedVendorId) {
      qParams.vendorId = this.encryptionService.encryptText(String(this.selectedVendorId));
    }
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-portal'], { queryParams: qParams }).catch(() => {
      this.router.navigate(['../vendor-portal'], { relativeTo: this.route, queryParams: qParams });
    });
  }
}
