import { Component, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { AtsService } from '../../../../shared/services/ats.service';
import { JobMasterService } from '../RecruitServices/job-master.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { GenerateLettersService } from '../../hr/HRservices/generate-letters.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-candidate-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './candidate-pipeline.component.html',
  styleUrl: './candidate-pipeline.component.scss'
})
export class CandidatePipelineComponent implements OnInit, OnDestroy {
  // Navigation tabs: 'positions' | 'pipeline' | 'mis'
  activeTab: 'positions' | 'pipeline' | 'mis' = 'pipeline';

  // Offer Letter Company Salary Heads & Vendor Dispatch Tracking
  companySalaryHeads: any[] = [];
  loadingSalaryHeads: boolean = false;
  isSendingVendorOfferBatch: boolean = false;
  offerEmailFilter: 'ALL' | 'PENDING' | 'SENT' = 'ALL';

  // Positions & Requisitions
  jobList: any[] = [];
  selectedJob: any | null = null;
  jobSearchQuery: string = '';
  departmentFilter: string = 'ALL';

  // Pipeline Roster & Kanban
  candidateRoster: any[] = [];
  searchQuery: string = '';
  activeStageFilter: string = 'ALL';
  selectedCandidate: any | null = null;

  // Stages loaded dynamically from DB (company-wise enable/disable)
  stages: { code: string; label: string; color: string; icon: string; isEnabled: boolean; stageOrder: number }[] = [];

  // All stages (including disabled) — used in Stage Settings modal
  allStageConfigs: any[] = [];

  // Stage Settings modal
  showStageSettingsModal: boolean = false;

  // Modals & Drawers state
  showVendorModal: boolean = false;
  showRegisterModal: boolean = false;
  isRegisteringCandidate: boolean = false;
  showPoolModal: boolean = false;
  showInterviewModal: boolean = false;
  showEvaluationModal: boolean = false;
  showDocsModal: boolean = false;
  showOfferModal: boolean = false;
  showAuditDrawer: boolean = false;
  showQrModal: boolean = false;
  selectedCandidateIds: Set<number> = new Set<number>();
  isBatchMoving: boolean = false;

  // Complete Employee Details & Hire In-Place Modal State
  showHireModal: boolean = false;
  isHiringCandidate: boolean = false;
  hireAadhaarStatus: 'idle' | 'checking' | 'verified' | 'duplicate' = 'idle';
  hireAadhaarMessage: string = '';
  hireAadhaarDuplicateDetails: any = null;
  private hireAadhaarDebounceTimer: any = null;
  categoryList: any[] = [];
  religionList: any[] = [];
  natureList: any[] = [];
  bankMasterList: any[] = [];
  hireForm: any = {
    appId: 0,
    candidateName: '',
    fatherName: '',
    motherName: '',
    gender: 'Male',
    dateOfBirth: '',
    mobile: '',
    email: '',
    aadhaarNo: '',
    panNo: '',
    bankAccNo: '',
    bankIfsc: '',
    bankName: '',
    uanNo: '',
    esicNo: '',
    nomineeName: '',
    nomineeRelation: 'Spouse',
    nomineeContact: '',
    categoryId: '',
    religionId: '',
    natureId: '',
    departmentId: '',
    departmentName: '',
    designationId: '',
    designationName: '',
    locationId: '',
    locationName: '',
    costCenterId: null,
    costCenterName: '',
    mrfCode: '',
    jobTitle: ''
  };

  // Existing Talent Pool (Bench & Previously Rejected Candidates) Allocation for Pipeline
  registerMode: 'NEW' | 'POOL' = 'NEW';
  poolCandidates: any[] = [];
  loadingPool: boolean = false;
  poolSearchQuery: string = '';
  poolFilterTab: 'ALL' | 'BENCH' | 'REJECTED' = 'ALL';
  selectedPoolVendor: string = 'ALL';
  selectedPoolAppIds: Set<number> = new Set();
  assigningPoolCandidates: boolean = false;

  // Vendor Mapping
  vendorMappingList: any[] = [];
  availableVendors: any[] = [];
  vendorForm = {
    reqId: 0,
    mrfCode: '',
    jobTitle: '',
    vendorId: '',
    vendorName: '',
    allocatedQuota: 10,
    commissionTerms: 'Standard (8.33%)',
    isActive: true
  };

  // Candidate Registration
  candidateRegAadhaarStatus: 'idle' | 'checking' | 'verified' | 'duplicate' | 'bench' = 'idle';
  candidateRegAadhaarMessage: string = '';
  candidateRegBenchRecord: any = null;
  private candidateRegDebounceTimer: any = null;
  candidateForm = {
    reqId: 0,
    mrfCode: '',
    candidateName: '',
    mobile: '',
    email: '',
    gender: 'Male',
    dateOfBirth: '',
    fatherName: '',
    currentLocation: '',
    sourceType: 'Vendor',
    vendorId: '',
    vendorName: '',
    aadhaarNo: '',
    skillClassification: 'Semi-Skilled'
  };

  // Interview Scheduling
  interviewForm = {
    appId: 0,
    candidateName: '',
    interviewerId: '',
    interviewerName: '',
    interviewDate: '',
    interviewRound: 'Technical & Operations',
    remarks: ''
  };

  // Staffing Vendor Assignment Modal State (Company-wise & Location-wise)
  showAssignVendorModal: boolean = false;
  assignVendorCandidate: any = null;
  assignVendorList: any[] = [];
  selectedVendorForAssignment: string = '';
  assignVendorRemarks: string = '';
  isAssigningVendor: boolean = false;
  isLoadingVendors: boolean = false;
  pendingTargetStage: string | null = null;

  // Evaluation & Skill Grading
  evaluationForm = {
    appId: 0,
    candidateName: '',
    skillClassification: 'Semi-Skilled',
    decision: 'Selected',
    score: 85,
    remarks: 'Candidate demonstrated proficient domain understanding and physical fitness.',
    interviewerName: '',
    interviewerPhone: ''
  };

  // Onboarding Docs (Legacy compatibility & extended 22-point document review state)
  docsForm = {
    appId: 0,
    candidateName: '',
    aadhaarNo: '',
    aadhaarDocPath: '',
    panNo: '',
    panDocPath: '',
    bankAccNo: '',
    bankIfsc: '',
    bankName: '',
    photoDocPath: '',
    resumeDocPath: '',
    verificationRemarks: ''
  };

  // 22-Point Candidate Document Review & Verification Suite State
  docsCandidateHeader: any = null;
  candidateDocList: any[] = [];
  docsActiveFilter: string = 'ALL'; // 'ALL' | 'MANDATORY' | 'PENDING' | 'APPROVED' | 'REJECTED'
  docsActiveTab: 'documents' | 'statutory' | 'audit' = 'documents';
  docsAuditTrail: any[] = [];
  docsAuditLoading: boolean = false;
  docsMetrics = {
    totalMandatory: 0,
    approvedMandatory: 0,
    rejectedCount: 0,
    missingMandatory: 0
  };

  viewedDocKeys: Set<string> = new Set();

  showDocRejectModal: boolean = false;
  selectedDocForReject: any = null;
  docRejectionRemark: string = '';

  dossierForm: any = {
    appId: 0,
    aadhaarNo: '',
    panNo: '',
    bankAccNo: '',
    bankIfsc: '',
    bankName: '',
    nomineeName: '',
    nomineeRelation: 'Spouse',
    nomineeDOB: '',
    nomineeContact: '',
    uanNo: '',
    esicNo: ''
  };

  isUploadingDoc: { [docTypeCode: string]: boolean } = {};
  isLoadingDocs: boolean = false;
  isSavingDossier: boolean = false;
  showDocPreviewModal: boolean = false;
  previewDocUrl: string = '';
  previewDocName: string = '';

  // Offer Letter — 3-Step Wizard
  offerWizardStep: 1 | 2 | 3 = 1;   // 1=Common Details, 2=CTC Template, 3=Per-Candidate Review
  isIssuingOffer: boolean = false;

  offerForm = {
    appId: 0,
    candidateName: '',
    offeredCTC: 0,        // legacy single field kept for backward compat
    expectedJoiningDate: ''
  };

  // Full offer wizard form (new)
  offerCommon = {
    reportingManager: '',
    joiningDate: '',
    probationPeriod: '90 Days',
    noticePeriod: '30 Days'
  };

  offerCtc = {
    grossCTC: 0,
    basicSalary: 0,
    hra: 0,
    da: 0,
    conveyance: 0,
    medicalAllowance: 0,
    otherAllowance: 0,
    pfDeduction: 0
  };

  // Candidates loaded into wizard (bulk or single)
  offerCandidates: Array<{
    appId: number;
    candidateName: string;
    companyId?: string;
    fk_companyId?: string;
    designation: string;
    department: string;
    location: string;
    fatherName: string;
    address: string;
    // per-candidate CTC overrides (null = use common)
    grossCTC: number | null;
    basicSalary: number | null;
    hra: number | null;
    da: number | null;
    conveyance: number | null;
    medicalAllowance: number | null;
    otherAllowance: number | null;
    pfDeduction: number | null;
    joiningDate: string | null;
    designation_override: string | null;
  }> = [];

  // Offer History tab
  showOfferHistoryTab: boolean = false;
  offerHistory: any[] = [];
  loadingOfferHistory: boolean = false;

  // QR Modal
  qrData = {
    mrfCode: '',
    jobTitle: '',
    directUrl: ''
  };

  // Tag Candidate Modal (Step 2, 7, 8)
  showTagModal: boolean = false;
  tagForm: any = {
    appId: 0,
    reqId: 0,
    candidateName: '',
    mrfCode: '',
    skillClassification: 'Semi-Skilled',
    isDiversityHiring: false,
    candidateTags: '',
    assignedReviewer: 'Site HR',
    remarks: ''
  };

  // Move Candidate Stage Modal (Steps 6-13)
  showStageMoveModal: boolean = false;
  stageMoveForm: any = {
    appId: 0,
    candidateName: '',
    currentStage: '',
    targetStage: '',
    remarks: ''
  };

  // Reject Candidate Modal (Step 9 & 15)
  showRejectModal: boolean = false;
  rejectForm: any = {
    appId: 0,
    candidateName: '',
    applicationNo: '',
    currentStage: '',
    rejectionReason: 'Skill Mismatch / Assessment Failed',
    remarks: '',
    cooloffPolicy: '90_Days',
    notifyCandidate: true
  };

  // Audit Trail
  auditTrail: any[] = [];

  // Candidate Full Details Modal
  showCandidateDetailsModal: boolean = false;
  selectedCandidateDetails: any = null;
  detailsCandidateDocs: any[] = [];
  isLoadingDetailsDocs: boolean = false;

  // Recruitment MIS Analytics
  misData: any = {
    funnel: {
      totalApplications: 0,
      appliedCount: 0,
      interviewCount: 0,
      selectedCount: 0,
      docVerifiedCount: 0,
      offerIssuedCount: 0,
      hiredCount: 0,
      rejectedCount: 0
    },
    locationDemand: [],
    skillDistribution: []
  };

  constructor(
    private atsService: AtsService,
    private jobMasterService: JobMasterService,
    private employeeMasterService: EmployeeMasterService,
    private generateLettersService: GenerateLettersService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private loaderService: NgxUiLoaderService
  ) {}

  updateSectionZIndex(elevate: boolean): void {
    try {
      const section = (this.el?.nativeElement as HTMLElement)?.closest('.section') as HTMLElement;
      if (section) {
        section.style.zIndex = elevate ? '10000' : '';
      }
    } catch (e) {}
  }

  ngOnDestroy(): void {
    this.updateSectionZIndex(false);
  }

  assignedLocationIds: string[] = [];

  ngOnInit(): void {
    this.jobViewMode = 'table';
    this.loadUserAccessRights();
    this.loadStageConfig();
    this.loadJobs(); // Load approved jobs for the job selector
    this.loadHireMasterDropdowns();
    // NOTE: loadPipelineRoster() is NOT called here.
    // Pipeline only loads AFTER the user selects an approved job.

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'] as any;
      }
      // If a jobId is passed via query params, auto-select it
      if (params['reqId']) {
        this.activeTab = 'pipeline';
        // Auto-select job if reqId matches one in our list
        this.route.queryParams.subscribe(() => {
          const match = this.jobList.find(j => String(j.reqId) === String(params['reqId']));
          if (match) this.selectJobForPipeline(match);
        });
      }
    });
  }

  get userId(): string {
    return sessionStorage.getItem('userId') || 
           localStorage.getItem('userId') || 
           sessionStorage.getItem('fk_userId') || 
           localStorage.getItem('fk_userId') || '';
  }

  get companyId(): string {
    return sessionStorage.getItem('companyId') || 
           localStorage.getItem('fk_companyId') || 
           localStorage.getItem('companyId') || 
           sessionStorage.getItem('fk_companyId') || 'GU-1';
  }

  get currentUserName(): string {
    return sessionStorage.getItem('userName') || 
           localStorage.getItem('userName') || 'Site HR Admin';
  }

  loadUserAccessRights(): void {
    if (this.userId) {
      this.atsService.getUserAccessRights(this.userId, 5).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data) {
            this.assignedLocationIds = res.data.assignedLocationIds || res.data.AssignedLocationIds || [];
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });
    }
  }

  isLocationAllowed(job: any): boolean {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return true;
    }
    const jobLocId = String(job.fk_locid || job.locId || job.locationId || (job.rawJob && (job.rawJob.fk_locid || job.rawJob.fk_locId)) || '').trim();
    if (!jobLocId) return true;

    const cleanJobLoc = jobLocId.replace(/^GU-/i, '');

    return this.assignedLocationIds.some(assignedLoc => {
      const assignedStr = String(assignedLoc || '').trim();
      const cleanAssigned = assignedStr.replace(/^GU-/i, '');
      return assignedStr.toLowerCase() === jobLocId.toLowerCase() || 
             (cleanJobLoc && cleanAssigned && cleanJobLoc === cleanAssigned);
    });
  }

  // =========================================================================
  // STAGE CONFIG LOADER (Company-wise enable/disable from DB)
  // =========================================================================

  loadStageConfig(): void {
    this.atsService.getPipelineStageConfig(this.companyId).subscribe({
      next: (configs) => {
        const all = configs || this.atsService.getDefaultStageConfig();
        this.allStageConfigs = all;
        // Only expose enabled stages to the kanban board
        this.stages = all
          .filter((s: any) => s.isEnabled || s.IsEnabled)
          .sort((a: any, b: any) => (a.stageOrder ?? a.StageOrder ?? 0) - (b.stageOrder ?? b.StageOrder ?? 0))
          .map((s: any) => ({
            code:       s.stageCode  ?? s.StageCode,
            label:      s.stageLabel ?? s.StageLabel,
            icon:       s.stageIcon  ?? s.StageIcon,
            color:      s.stageColor ?? s.StageColor,
            isEnabled:  !!(s.isEnabled ?? s.IsEnabled),
            stageOrder: s.stageOrder ?? s.StageOrder ?? 0
          }));
      },
      error: () => {
        // Graceful fallback — use service defaults
        const defaults = this.atsService.getDefaultStageConfig();
        this.allStageConfigs = defaults;
        this.stages = defaults.map(s => ({
          code: s.stageCode, label: s.stageLabel, icon: s.stageIcon,
          color: s.stageColor, isEnabled: true, stageOrder: s.stageOrder
        }));
      }
    });
  }

  /** Toggle a stage enabled/disabled and persist to DB */
  toggleStage(config: any): void {
    const newEnabled = !(config.isEnabled ?? config.IsEnabled);
    const payload = {
      companyId:  this.companyId,
      stageCode:  config.stageCode  ?? config.StageCode,
      stageLabel: config.stageLabel ?? config.StageLabel,
      stageIcon:  config.stageIcon  ?? config.StageIcon,
      stageColor: config.stageColor ?? config.StageColor,
      stageOrder: config.stageOrder ?? config.StageOrder ?? 0,
      isEnabled:  newEnabled,
      modifiedBy: this.currentUserName
    };

    this.atsService.upsertPipelineStageConfig(payload).subscribe({
      next: () => {
        // Update local allStageConfigs
        config.isEnabled = newEnabled;
        config.IsEnabled = newEnabled;
        // Recompute active stages
        this.stages = this.allStageConfigs
          .filter((s: any) => s.isEnabled || s.IsEnabled)
          .sort((a: any, b: any) => (a.stageOrder ?? a.StageOrder ?? 0) - (b.stageOrder ?? b.StageOrder ?? 0))
          .map((s: any) => ({
            code:       s.stageCode  ?? s.StageCode,
            label:      s.stageLabel ?? s.StageLabel,
            icon:       s.stageIcon  ?? s.StageIcon,
            color:      s.stageColor ?? s.StageColor,
            isEnabled:  !!(s.isEnabled ?? s.IsEnabled),
            stageOrder: s.stageOrder ?? s.StageOrder ?? 0
          }));
        const stageName = config.stageLabel ?? config.StageLabel;
        this.toastr.success(
          `Stage "${stageName}" ${newEnabled ? 'enabled' : 'disabled'} for this company.`,
          'Stage Config Saved'
        );
      },
      error: () => this.toastr.error('Failed to update stage configuration.')
    });
  }

  // =========================================================================
  // DATA LOADERS
  // =========================================================================

  loadJobs(): void {
    this.loaderService.start();
    forkJoin({
      jobMasterRes: this.jobMasterService.getAllJobMasters(0, 1000).pipe(
        catchError(() => of({ isSuccess: false, data: [] }))
      ),
      requisitionsRes: this.atsService.getJobRequisitions(this.companyId).pipe(
        catchError(() => of([]))
      )
    }).subscribe({
      next: ({ jobMasterRes, requisitionsRes }) => {
        this.loaderService.stop();
        const jobs: any[] = [];
        const seenIds = new Set<string>();

        // Requisitions
        const reqList = (requisitionsRes || []);
        for (const r of reqList) {
          const rId = (r.reqId ? `REQ-${r.reqId}` : r.jobId || '').toString();
          if (rId && !seenIds.has(rId)) {
            seenIds.add(rId);
            jobs.push({
              jobId: rId,
              reqId: r.reqId,
              fk_locid: r.fk_locid,
              mrfCode: r.mrfCode || `MRF/2026/${r.reqId}`,
              jobTitle: r.jobTitle || 'Requisition Position',
              department: r.department || 'Operations',
              location: r.location || 'Headquarters',
              employmentType: r.employmentType || 'Full-time',
              openingsCount: r.openingsCount || r.no_of_post || 1,
              hiredCount: r.hiredCount || 0,
              isFilled: !!r.isFilled,
              hiringManagerName: r.hiringManagerName || '',
              workflowStatus: r.workflowStatus || r.status || 'Active',
              source: 'Requisition',
              rawJob: r
            });
          }
        }

        // Job Master
        const jmList = (jobMasterRes && (jobMasterRes.data || jobMasterRes.Data)) || [];
        for (const j of jmList) {
          const jId = (j.pk_JobId || j.jobId || '').toString();
          if (jId && !seenIds.has(jId)) {
            seenIds.add(jId);
            jobs.push({
              jobId: jId,
              reqId: j.pk_JobId,
              mrfCode: `JM-${jId}`,
              jobTitle: j.job_title || j.jobTitle || 'Position',
              department: j.department || 'Operations',
              location: j.forlocation || j.location || 'Hub',
              employmentType: j.forRequirement || 'Full-time',
              openingsCount: j.no_of_post || 1,
              hiredCount: j.hiredCount || 0,
              isFilled: !!j.isFilled,
              hiringManagerName: j.remarks || '',
              workflowStatus: j.job_closed ? 'Closed' : 'Active',
              source: 'Job Master',
              rawJob: j
            });
          }
        }

        this.jobList = jobs;
        const reqIdParam = this.route.snapshot.queryParams['reqId'];
        if (reqIdParam && !this.selectedJob) {
          const match = jobs.find(j => String(j.reqId) === String(reqIdParam) || String(j.jobId) === String(reqIdParam));
          if (match) {
            this.selectJob(match);
          }
        }
      },
      error: () => {
        this.loaderService.stop();
      }
    });
  }

  loadPipelineRoster(): void {
    this.loaderService.start();
    const reqId = this.selectedJob ? this.selectedJob.reqId : undefined;
    this.atsService.getCandidatePipelineRoster(reqId, this.activeStageFilter, this.searchQuery, this.companyId).subscribe({
      next: (data) => {
        this.loaderService.stop();
        this.candidateRoster = data || [];
      },
      error: (err) => {
        this.loaderService.stop();
        console.warn('Error loading candidate roster:', err);
      }
    });
  }

  loadMisReport(): void {
    this.loaderService.start();
    this.atsService.getRecruitmentMIS(this.companyId).subscribe({
      next: (data) => {
        this.loaderService.stop();
        if (data) {
          this.misData = {
            funnel: data.funnel || this.misData.funnel,
            locationDemand: data.locationDemand || [],
            skillDistribution: data.skillDistribution || []
          };
        }
      },
      error: () => {
        this.loaderService.stop();
      }
    });
  }

  // Switch Tabs
  setTab(tab: 'positions' | 'pipeline' | 'mis'): void {
    this.activeTab = tab;
    if (tab === 'pipeline') {
      if (this.selectedJob) {
        this.loadPipelineRoster();
      }
    } else if (tab === 'mis') {
      this.loadMisReport();
    }
  }

  isCandidateRejected(c: any): boolean {
    if (!c) return false;
    // An actively allocated or applied candidate whose isRejected flag is explicitly 0/false is NEVER rejected
    if (c.isRejected === 0 || c.isRejected === false || c.isRejected === '0') return false;
    return c.isRejected === 1 || c.isRejected === true || c.isRejected === '1' || c.stage === 'Rejected' || c.status === 'Rejected' || c.interviewStatus === 'Rejected';
  }

  // Filter Pipeline Roster by Kanban Stage (Keeps rejected candidates and Hold candidates visible at their respective stage)
  getCandidatesForStage(stageCode: string): any[] {
    if (!this.candidateRoster) return [];
    if (stageCode === 'Docs_Submitted') {
      return this.candidateRoster.filter(c => 
        c.stage === 'Docs_Submitted' || c.stage === 'Docs_Verified' ||
        (this.isCandidateRejected(c) && (c.rejectionStage === 'Docs_Submitted' || c.rejectionStage === 'Docs_Verified'))
      );
    }
    if (stageCode === 'Interview_Scheduled') {
      return this.candidateRoster.filter(c => 
        c.stage === 'Interview_Scheduled' || c.stage === 'Hold' || c.stage === 'Interview_Completed' ||
        c.interviewStatus === 'Hold' ||
        (this.isCandidateRejected(c) && (c.rejectionStage === 'Interview_Scheduled' || c.rejectionStage === 'Interview_Completed' || c.rejectionStage === 'Hold'))
      );
    }
    if (stageCode === 'Offer_Issued' || stageCode === 'Offer_Letter') {
      return this.candidateRoster.filter(c => 
        c.stage === 'Offer_Issued' || c.stage === 'Offer_Letter' || (c.stage && c.stage.includes('Offer')) ||
        (this.isCandidateRejected(c) && (c.rejectionStage === 'Offer_Issued' || c.rejectionStage === 'Offer_Letter'))
      );
    }
    return this.candidateRoster.filter(c => 
      c.stage === stageCode || 
      (this.isCandidateRejected(c) && c.rejectionStage === stageCode)
    );
  }

  // Search filter
  getFilteredRoster(): any[] {
    if (!this.candidateRoster) return [];
    if (!this.searchQuery.trim()) return this.candidateRoster;
    const q = this.searchQuery.toLowerCase();
    return this.candidateRoster.filter(c =>
      (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
      (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.mrfCode && c.mrfCode.toLowerCase().includes(q)) ||
      (c.vendorName && c.vendorName.toLowerCase().includes(q))
    );
  }

  getFilteredJobList(): any[] {
    let list = this.jobList.filter(j => this.isLocationAllowed(j));
    if (this.departmentFilter !== 'ALL') {
      list = list.filter(j => j.department === this.departmentFilter);
    }
    if (this.jobSearchQuery.trim()) {
      const q = this.jobSearchQuery.toLowerCase();
      list = list.filter(j =>
        (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.mrfCode && j.mrfCode.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getUniqueDepartments(): string[] {
    const depts = new Set<string>();
    this.jobList.filter(j => this.isLocationAllowed(j)).forEach(j => { if (j.department) depts.add(j.department); });
    return Array.from(depts);
  }

  // =========================================================================
  // APPROVED JOB SELECTION FOR PIPELINE (OATS JOB LIST ARCHITECTURE)
  // =========================================================================

  approvedJobSearchQuery: string = '';
  approvedJobDeptFilter: string = 'ALL';
  jobViewMode: 'table' | 'grid' = 'table';
  jobTimelineFilter: string = 'all';
  jobPage: number = 1;
  jobPageSize: number = 12;
  selectedJobCodes: Set<string | number> = new Set();

  setJobViewMode(mode: 'table' | 'grid'): void {
    this.jobViewMode = mode;
    localStorage.setItem('oats_pipeline_job_view_mode', mode);
  }

  getJobInitials(title: string): string {
    if (!title) return 'JB';
    const words = title.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  getJobPriority(job: any): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (job.priority) return job.priority;
    if (job.urgency === 'Immediate' || job.isUrgent) return 'Critical';
    if ((job.openingsCount || job.openPositions || 1) >= 5) return 'High';
    return 'Medium';
  }

  getJobPriorityColor(job: any): string {
    const p = this.getJobPriority(job);
    switch (p) {
      case 'Critical': return '#ef4444';
      case 'High': return '#dd7c06';
      case 'Medium': return '#16a34a';
      case 'Low': return '#eab308';
      default: return '#16a34a';
    }
  }

  getJobSubmissionsCount(job: any): number {
    return job.submissionCount || job.applicantsCount || 0;
  }

  getJobPipelineCount(job: any): number {
    return job.pipelineCount || (job.applicantsCount ? Math.max(1, job.applicantsCount) : 0);
  }

  getJobHiredCount(job: any): number {
    if (!job) return 0;
    const directCount = Number(job.hiredCount) || 0;
    const rosterHired = this.candidateRoster ? this.candidateRoster.filter(c =>
      (c.reqId == job.reqId || c.mrfCode === job.mrfCode) && (c.stage === 'Hired' || c.status === 'Hired')
    ).length : 0;
    return Math.max(directCount, rosterHired);
  }

  isJobFilled(job: any): boolean {
    if (!job) return false;
    const required = Number(job.openingsCount || job.no_of_post || job.openPositions) || 1;
    const filled = this.getJobHiredCount(job);
    return filled >= required;
  }

  getSelectedRegistrationJob(): any {
    if (!this.candidateForm.reqId) return this.selectedJob;
    return this.jobList.find(j => j.reqId == this.candidateForm.reqId) || this.selectedJob;
  }

  isJobApproved(job: any): boolean {
    if (!job) return false;
    const status = (job.workflowStatus || job.status || '').toLowerCase().trim();
    if (status === 'closed' || status === 'draft' || status.includes('pending') || status.includes('submitted') || status.includes('reject')) {
      return false;
    }
    return status === 'active' || status === 'approved' || status === 'sanctioned' || status === 'open';
  }

  getApprovedJobList(): any[] {
    // STRICTLY ONLY APPROVED JOBS ON THIS PIPELINE PAGE MATCHING LOCATION PERMISSIONS
    let list = this.jobList.filter(j => this.isJobApproved(j) && this.isLocationAllowed(j));

    if (this.approvedJobDeptFilter !== 'ALL') {
      list = list.filter(j => j.department === this.approvedJobDeptFilter);
    }

    // Timeline filter
    if (this.jobTimelineFilter !== 'all') {
      const now = new Date();
      list = list.filter(j => {
        const rawDate = j.createdAt || j.createdDate || j.creationDate;
        if (!rawDate) return true;
        const cDate = new Date(rawDate);
        if (isNaN(cDate.getTime())) return true;
        const diffDays = (now.getTime() - cDate.getTime()) / (1000 * 3600 * 24);
        if (this.jobTimelineFilter === 'today') return diffDays <= 1;
        if (this.jobTimelineFilter === 'last_7_days') return diffDays <= 7;
        if (this.jobTimelineFilter === 'last_30_days') return diffDays <= 30;
        if (this.jobTimelineFilter === 'this_year') return cDate.getFullYear() === now.getFullYear();
        return true;
      });
    }

    if (this.approvedJobSearchQuery.trim()) {
      const q = this.approvedJobSearchQuery.toLowerCase();
      list = list.filter(j =>
        (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.mrfCode && j.mrfCode.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get paginatedApprovedJobs(): any[] {
    const list = this.getApprovedJobList();
    const start = (this.jobPage - 1) * this.jobPageSize;
    return list.slice(start, start + this.jobPageSize);
  }

  get totalApprovedJobPages(): number {
    return Math.ceil(this.getApprovedJobList().length / this.jobPageSize) || 1;
  }

  get approvedJobPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalApprovedJobPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToJobPage(page: number): void {
    if (page >= 1 && page <= this.totalApprovedJobPages) {
      this.jobPage = page;
    }
  }

  changeJobPageSize(size: number): void {
    this.jobPageSize = size;
    this.jobPage = 1;
  }

  toggleSelectAllJobs(event: any): void {
    const isChecked = event?.target?.checked ?? false;
    if (isChecked) {
      this.paginatedApprovedJobs.forEach(j => this.selectedJobCodes.add(j.reqId || j.jobId));
    } else {
      this.selectedJobCodes.clear();
    }
  }

  toggleSelectJob(job: any): void {
    const id = job.reqId || job.jobId;
    if (this.selectedJobCodes.has(id)) {
      this.selectedJobCodes.delete(id);
    } else {
      this.selectedJobCodes.add(id);
    }
  }

  isJobSelected(job: any): boolean {
    return this.selectedJobCodes.has(job.reqId || job.jobId);
  }

  isAllJobsSelected(): boolean {
    if (!this.paginatedApprovedJobs || this.paginatedApprovedJobs.length === 0) return false;
    return this.paginatedApprovedJobs.every(j => this.selectedJobCodes.has(j.reqId || j.jobId));
  }

  isIndeterminateSelected(): boolean {
    const count = this.paginatedApprovedJobs.filter(j => this.selectedJobCodes.has(j.reqId || j.jobId)).length;
    return count > 0 && count < this.paginatedApprovedJobs.length;
  }

  selectJob(job: any): void {
    this.selectedJob = job;
    this.activeTab = 'pipeline';
    this.selectedStageCode = this.stages.length > 0 ? this.stages[0].code : 'Applied';
    this.activeStageFilter = 'ALL';
    this.candidateRoster = [];
    this.loadPipelineRoster();
  }

  selectJobForPipeline(job: any): void {
    this.selectJob(job);
  }

  clearJobFilter(): void {
    this.selectedJob = null;
    this.selectedStageCode = null;
    this.candidateRoster = [];
    this.activeStageFilter = 'ALL';
  }

  // =========================================================================
  // OATS-STYLE STAGE TABS INTERACTION
  // =========================================================================

  selectedStageCode: string | null = null;

  onSelectStage(stageCode: string): void {
    this.selectedStageCode = stageCode;
    this.searchQuery = '';
  }

  getSelectedStage(): any {
    return this.stages.find(s => s.code === this.selectedStageCode);
  }

  getSelectedStageIndex(): number {
    return this.stages.findIndex(s => s.code === this.selectedStageCode);
  }

  getCandidatesForSelectedStage(): any[] {
    if (!this.selectedStageCode) return [];
    let list = this.getCandidatesForStage(this.selectedStageCode);
    if (this.selectedStageCode === 'Offer_Issued' || this.selectedStageCode === 'Offer_Letter' || this.selectedStageCode.includes('Offer')) {
      if (this.offerEmailFilter === 'PENDING') {
        list = list.filter(c => !c.isOfferEmailSent);
      } else if (this.offerEmailFilter === 'SENT') {
        list = list.filter(c => c.isOfferEmailSent);
      }
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
        (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.vendorName && c.vendorName.toLowerCase().includes(q)) ||
        (c.candidateCode && c.candidateCode.toLowerCase().includes(q))
      );
    }
    return list;
  }

  // =========================================================================
  // STEP 4 & 5: VENDOR TO REQUISITION ALLOCATION
  // =========================================================================

  openVendorModal(job: any): void {
    this.selectedJob = job;
    this.vendorForm.reqId = job.reqId || 1;
    this.vendorForm.mrfCode = job.mrfCode || '';
    this.vendorForm.jobTitle = job.jobTitle || '';
    const targetCompId = job?.fk_companyId || job?.companyId || this.companyId;

    this.atsService.getVendorsForMapping(this.vendorForm.reqId, targetCompId).subscribe({
      next: (vendors) => {
        this.vendorMappingList = vendors || [];
        this.showVendorModal = true;
      },
      error: () => {
        this.toastr.error('Failed to load vendors for mapping.');
      }
    });
  }

  saveVendorMapping(v: any): void {
    const targetCompId = this.selectedJob?.fk_companyId || this.selectedJob?.companyId || this.companyId;
    const payload = {
      reqId: this.vendorForm.reqId,
      vendorId: v.vendorId.toString(),
      vendorName: v.vendorName,
      allocatedQuota: v.allocatedQuota || 10,
      commissionTerms: v.commissionTerms || 'Standard (8.33%)',
      isActive: true,
      assignedBy: this.currentUserName,
      companyId: targetCompId
    };

    this.atsService.saveVendorMapping(payload).subscribe({
      next: () => {
        v.isMapped = 1;
        this.toastr.success(`Quota of ${v.allocatedQuota} heads allocated to ${v.vendorName}`, 'Vendor Quota Mapped');
      },
      error: () => this.toastr.error('Failed to update vendor quota.')
    });
  }

  closeVendorModal(): void {
    this.showVendorModal = false;
    this.updateSectionZIndex(false);
  }

  // =========================================================================
  // STEP 6: CANDIDATE REGISTRATION (Vendor App & QR Direct Mobile Site)
  // =========================================================================

  openRegisterModal(job?: any): void {
    this.updateSectionZIndex(true);
    if (job) this.selectedJob = job;
    const targetReqId = this.selectedJob ? this.selectedJob.reqId : (this.jobList[0]?.reqId || 1);
    const targetMrfCode = this.selectedJob ? this.selectedJob.mrfCode : (this.jobList[0]?.mrfCode || 'MRF/2026/01');
    const targetLoc = this.selectedJob ? this.selectedJob.location : 'Hub';
    const targetCompId = this.selectedJob?.fk_companyId || this.selectedJob?.companyId || this.companyId;

    this.candidateRegAadhaarStatus = 'idle';
    this.candidateRegAadhaarMessage = '';
    this.candidateRegBenchRecord = null;

    this.candidateForm = {
      reqId: targetReqId,
      mrfCode: targetMrfCode,
      candidateName: '',
      mobile: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '1995-01-01',
      fatherName: '',
      currentLocation: targetLoc,
      sourceType: 'Vendor',
      vendorId: '',
      vendorName: '',
      aadhaarNo: '',
      skillClassification: 'Semi-Skilled'
    };

    // Load staffing vendors from REC_Candidate_Details (IsVendor = 1)
    this.atsService.getVendorsForMapping(targetReqId, targetCompId).subscribe({
      next: (vendors) => {
        this.availableVendors = vendors || [];
        if (this.availableVendors.length > 0) {
          this.candidateForm.vendorId = this.availableVendors[0].vendorId;
          this.candidateForm.vendorName = this.availableVendors[0].vendorName;
        }
      }
    });

    this.registerMode = 'NEW';
    this.selectedPoolAppIds.clear();
    this.loadPoolCandidates();
    this.showRegisterModal = true;
  }

  onCandidateRegAadhaarInput(immediate: boolean = false): void {
    if (this.candidateRegDebounceTimer) {
      clearTimeout(this.candidateRegDebounceTimer);
    }
    const clean = (this.candidateForm.aadhaarNo || '').replace(/\D/g, '').slice(0, 12);
    this.candidateForm.aadhaarNo = clean;

    if (clean.length < 12) {
      this.candidateRegAadhaarStatus = 'idle';
      this.candidateRegAadhaarMessage = '';
      this.candidateRegBenchRecord = null;
      this.cdr.detectChanges();
      return;
    }

    const runValidation = () => {
      this.candidateRegAadhaarStatus = 'checking';
      this.candidateRegAadhaarMessage = 'Checking Aadhaar uniqueness...';
      this.cdr.detectChanges();

      this.atsService.verifyAadhaarUniqueness({ aadhaarNo: clean, companyId: this.companyId }).subscribe({
        next: (res: any) => {
          const dupType = res?.duplicateType || res?.DuplicateType;
          const isDup = res?.isDuplicate === true || 
                        res?.IsDuplicate === true || 
                        res?.ExistsStatus === 1 || 
                        res?.existsStatus === 1 ||
                        res?.canProceed === false || 
                        res?.CanProceed === 0;

          if (dupType === 'TALENT_BENCH') {
            this.candidateRegAadhaarStatus = 'bench';
            this.candidateRegAadhaarMessage = res.message || res.Message || 'Candidate exists in Talent Bench.';
            this.candidateRegBenchRecord = res.existingRecord || {
              candidateName: res.candidateName || res.CandidateName || res.existingName || res.ExistingName,
              mrfCode: res.jobTitle || res.JobTitle || res.existingMrf || res.ExistingMrf || 'Bench',
              appId: res.existingAppId || res.ExistingAppId
            };
          } else if (isDup) {
            this.candidateRegAadhaarStatus = 'duplicate';
            this.candidateRegAadhaarMessage = res.message || res.Message || 'Aadhaar already registered in records.';
            this.candidateRegBenchRecord = null;
          } else {
            this.candidateRegAadhaarStatus = 'verified';
            this.candidateRegAadhaarMessage = 'Aadhaar is unique & clear for registration.';
            this.candidateRegBenchRecord = null;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.candidateRegAadhaarStatus = 'idle';
          this.candidateRegAadhaarMessage = '';
          this.cdr.detectChanges();
        }
      });
    };

    if (immediate) {
      runValidation();
    } else {
      this.candidateRegDebounceTimer = setTimeout(runValidation, 300);
    }
  }

  allocateCandidateFromBench(benchRecord: any): void {
    const appId = benchRecord?.appId || benchRecord?.existingAppId;
    const targetJob = this.getSelectedRegistrationJob();
    if (!appId || !targetJob || !targetJob.reqId) {
      this.toastr.error('Unable to allocate: target requisition or candidate ID missing.');
      return;
    }

    this.assigningPoolCandidates = true;
    const payload = {
      reqId: targetJob.reqId,
      vendorId: '',
      appIds: [appId],
      companyId: this.companyId,
      assignedBy: this.currentUserName || 'HR Pipeline'
    };

    this.atsService.assignBenchCandidatesToJob(payload).subscribe({
      next: (res: any) => {
        this.assigningPoolCandidates = false;
        if (res.success || res.Success) {
          this.toastr.success(`Candidate ${benchRecord.candidateName || ''} successfully allocated to MRF ${targetJob.mrfCode}!`, 'Candidate Allocated');
          this.showRegisterModal = false;
          this.loadPipelineRoster();
        } else {
          this.toastr.error(res.message || 'Failed to allocate bench candidate.', 'Allocation Failed');
        }
      },
      error: (err: any) => {
        this.assigningPoolCandidates = false;
        this.toastr.error(err?.error?.message || 'Error allocating candidate from Talent Bench.');
      }
    });
  }

  onVendorSelected(): void {
    const found = this.availableVendors.find(v => v.vendorId === this.candidateForm.vendorId);
    if (found) {
      this.candidateForm.vendorName = found.vendorName;
    }
  }

  registerCandidate(): void {
    if (this.candidateRegAadhaarStatus === 'duplicate') {
      this.toastr.error(this.candidateRegAadhaarMessage || 'Duplicate Aadhaar detected.', 'Registration Blocked');
      return;
    }
    if (this.candidateRegAadhaarStatus === 'checking') {
      this.toastr.info('Verifying Aadhaar uniqueness, please wait...', 'Checking');
      return;
    }

    if (!this.candidateForm.candidateName.trim() || !this.candidateForm.mobile.trim()) {
      this.toastr.warning('Please enter candidate name and 10-digit mobile number.');
      return;
    }

    const targetJob = this.getSelectedRegistrationJob();
    if (this.isJobFilled(targetJob)) {
      this.toastr.warning(`This position (${targetJob?.jobTitle || 'Job'}) is 100% fulfilled (${this.getJobHiredCount(targetJob)}/${targetJob?.openingsCount} filled). Candidate intake is closed.`, 'Requisition Filled');
      return;
    }

    const payload = {
      reqId: this.candidateForm.reqId,
      candidateName: this.candidateForm.candidateName,
      mobile: this.candidateForm.mobile,
      email: this.candidateForm.email,
      gender: this.candidateForm.gender,
      dateOfBirth: this.candidateForm.dateOfBirth,
      fatherName: this.candidateForm.fatherName,
      currentLocation: this.candidateForm.currentLocation,
      sourceType: this.candidateForm.sourceType,
      vendorId: this.candidateForm.vendorId,
      vendorName: this.candidateForm.vendorName,
      aadhaarNo: this.candidateForm.aadhaarNo ? this.candidateForm.aadhaarNo.trim() : null,
      createdBy: this.currentUserName,
      companyId: this.companyId
    };

    this.isRegisteringCandidate = true;
    this.atsService.registerCandidate(payload).subscribe({
      next: (res) => {
        this.isRegisteringCandidate = false;
        if (res.success || res.Success) {
          this.toastr.success(`Application ${res.applicationNo || ''} created for ${this.candidateForm.candidateName}`, 'Candidate Registered');
          this.showRegisterModal = false;
          this.loadPipelineRoster();
        } else {
          // Both in case of duplicate Aadhaar, duplicate phone, or both:
          // STRICT RULE: Candidate is NOT registered and NOT created in DB. Keep modal open.
          const errMsg = res.message || res.Message || 'Duplicate profile detected. Candidate cannot be registered.';
          this.toastr.error(errMsg, 'Registration Blocked - Duplicate Details', { timeOut: 8000 });
        }
      },
      error: (err) => {
        this.isRegisteringCandidate = false;
        this.toastr.error(err?.error?.message || 'Error submitting candidate registration.');
      }
    });
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
    this.updateSectionZIndex(false);
  }

  // =========================================================================
  // EXISTING TALENT POOL (BENCH & REJECTED) ALLOCATION FOR PIPELINE
  // =========================================================================

  setRegisterMode(mode: 'NEW' | 'POOL'): void {
    this.registerMode = mode;
    if (mode === 'POOL') {
      this.loadPoolCandidates();
    }
  }

  openPoolModal(): void {
    if (!this.selectedJob || !this.selectedJob.reqId) {
      this.toastr.warning('Please select an active Job Requisition to allocate pool candidates.', 'Job Required');
      return;
    }
    this.updateSectionZIndex(true);
    this.openRegisterModal(this.selectedJob);
    this.registerMode = 'POOL';
  }

  closePoolModal(): void {
    this.showPoolModal = false;
    this.showRegisterModal = false;
    this.selectedPoolAppIds.clear();
    this.updateSectionZIndex(false);
  }

  loadPoolCandidates(): void {
    this.loadingPool = true;
    const currentReqId = this.selectedJob?.reqId || null;

    // Passing empty vendorId fetches ALL pool candidates across all vendors and direct sources
    this.atsService.getVendorPoolCandidates(
      '',
      currentReqId,
      this.poolSearchQuery,
      this.poolFilterTab,
      this.companyId
    ).subscribe({
      next: (candidates: any[]) => {
        this.poolCandidates = candidates || [];
        this.loadingPool = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingPool = false;
        console.error('Error loading pool candidates:', err);
      }
    });
  }

  get poolVendors(): string[] {
    const vSet = new Set<string>();
    this.poolCandidates.forEach(c => {
      if (c.vendorName && c.vendorName !== 'Direct / Internal') {
        vSet.add(c.vendorName);
      }
    });
    return Array.from(vSet).sort();
  }

  get filteredPoolCandidates(): any[] {
    // Only exclude ACTIVE in-process candidates on this job by unique ID/AppNo
    const activeCandidates = (this.candidateRoster || []).filter((c: any) => !c.isRejected && c.stage !== 'Rejected');
    const activeAppNos = new Set(activeCandidates.map((c: any) => c.applicationNo));
    const activeAppIds = new Set(activeCandidates.map((c: any) => c.appId || c.pk_appId));

    let list = this.poolCandidates.filter(c =>
      !activeAppNos.has(c.applicationNo) &&
      !activeAppIds.has(c.appId)
    );

    if (this.poolFilterTab === 'BENCH') {
      list = list.filter(c => c.poolType === 'BENCH');
    } else if (this.poolFilterTab === 'REJECTED') {
      list = list.filter(c => c.poolType === 'REJECTED');
    }

    if (this.selectedPoolVendor && this.selectedPoolVendor !== 'ALL') {
      list = list.filter(c => c.vendorName === this.selectedPoolVendor);
    }

    if (this.poolSearchQuery && this.poolSearchQuery.trim()) {
      const q = this.poolSearchQuery.toLowerCase().trim();
      list = list.filter(c =>
        (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.aadhaarNo && c.aadhaarNo.includes(q)) ||
        (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
        (c.vendorName && c.vendorName.toLowerCase().includes(q)) ||
        (c.skillClassification && c.skillClassification.toLowerCase().includes(q))
      );
    }

    return list;
  }

  get poolBenchCount(): number {
    return this.poolCandidates.filter(c => c.poolType === 'BENCH').length;
  }

  get poolRejectedCount(): number {
    return this.poolCandidates.filter(c => c.poolType === 'REJECTED').length;
  }

  toggleSelectAllPool(event: any): void {
    if (event.target.checked) {
      this.filteredPoolCandidates.forEach(c => this.selectedPoolAppIds.add(c.appId));
    } else {
      this.selectedPoolAppIds.clear();
    }
  }

  toggleSelectPoolCandidate(appId: number): void {
    if (this.selectedPoolAppIds.has(appId)) {
      this.selectedPoolAppIds.delete(appId);
    } else {
      this.selectedPoolAppIds.add(appId);
    }
  }

  isPoolCandidateSelected(appId: number): boolean {
    return this.selectedPoolAppIds.has(appId);
  }

  isAllPoolSelected(): boolean {
    const list = this.filteredPoolCandidates;
    if (list.length === 0) return false;
    return list.every(c => this.selectedPoolAppIds.has(c.appId));
  }

  assignSelectedPoolCandidates(): void {
    if (this.selectedPoolAppIds.size === 0) {
      this.toastr.warning('Please select at least one candidate from the pool.', 'No Candidate Selected');
      return;
    }
    if (!this.selectedJob || !this.selectedJob.reqId) {
      this.toastr.error('No target Job Requisition selected.', 'Job Required');
      return;
    }

    const currentReqId = this.selectedJob.reqId;
    const appIdsToAssign = Array.from(this.selectedPoolAppIds);

    this.assigningPoolCandidates = true;
    const payload = {
      reqId: currentReqId,
      vendorId: '', // Empty for HR Pipeline company-wide allocation
      appIds: appIdsToAssign,
      companyId: this.companyId,
      assignedBy: this.currentUserName || sessionStorage.getItem('userName') || 'HR Pipeline'
    };

    this.atsService.assignBenchCandidatesToJob(payload).subscribe({
      next: (res: any) => {
        this.assigningPoolCandidates = false;
        if (res.success || res.Success) {
          this.toastr.success(res.message || `Successfully allocated ${appIdsToAssign.length} candidate(s) to pipeline!`, 'Candidates Allocated');
          this.selectedPoolAppIds.clear();
          this.showPoolModal = false;
          this.loadPipelineRoster();
        } else {
          this.toastr.error(res.message || 'Failed to allocate candidates.', 'Allocation Failed');
        }
      },
      error: (err: any) => {
        this.assigningPoolCandidates = false;
        this.toastr.error(err?.error?.message || 'Error allocating candidates to job.', 'Server Error');
      }
    });
  }

  // QR Code direct link modal
  openQrModal(job: any): void {
    const reqId = job.reqId || 1;
    this.qrData = {
      mrfCode: job.mrfCode || `MRF/${reqId}`,
      jobTitle: job.jobTitle || 'Open Position',
      directUrl: `${window.location.origin}/candidate-apply?mrf=${encodeURIComponent(job.mrfCode || reqId)}&cid=${encodeURIComponent(this.companyId)}`
    };
    this.showQrModal = true;
  }

  copyQrLink(): void {
    navigator.clipboard.writeText(this.qrData.directUrl);
    this.toastr.info('Direct candidate application link copied to clipboard!', 'Link Copied');
  }

  closeQrModal(): void {
    this.showQrModal = false;
  }

  // =========================================================================
  // STEP 7: INTERVIEW SCHEDULING
  // =========================================================================

  openInterviewModal(candidate: any): void {
    if (candidate.stage === 'Applied' && (!candidate.vendorId || !candidate.vendorId.toString().trim())) {
      this.toastr.warning(`Cannot schedule interview for candidate [${candidate.candidateName}]: A staffing vendor must be assigned first.`, 'Staffing Vendor Required');
      this.openAssignVendorModal(candidate, 'Interview_Scheduled');
      return;
    }

    this.quickMoveStage(candidate, 'Interview_Scheduled');
  }

  scheduleInterview(): void {
    if (!this.interviewForm.interviewerName.trim() || !this.interviewForm.interviewDate) {
      this.toastr.warning('Please enter interviewer name and interview date/time.');
      return;
    }

    const payload = {
      appId: this.interviewForm.appId,
      interviewerId: this.interviewForm.interviewerId,
      interviewerName: this.interviewForm.interviewerName,
      interviewDate: this.interviewForm.interviewDate,
      interviewRound: this.interviewForm.interviewRound,
      remarks: this.interviewForm.remarks,
      scheduledBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.scheduleCandidateInterview(payload).subscribe({
      next: (res) => {
        this.toastr.success(`Interview scheduled for ${this.interviewForm.candidateName}`, 'Interview Allocated');
        this.showInterviewModal = false;
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to schedule interview.')
    });
  }

  closeInterviewModal(): void {
    this.showInterviewModal = false;
  }

  // =========================================================================
  // STEPS 8 & 9: INTERVIEW EVALUATION & SKILL CLASSIFICATION
  // =========================================================================

  openEvaluationModal(candidate: any): void {
    this.selectedCandidate = candidate;
    this.evaluationForm = {
      appId: candidate.appId,
      candidateName: candidate.candidateName,
      skillClassification: candidate.skillClassification || 'Semi-Skilled',
      decision: candidate.interviewStatus || 'Selected',
      score: candidate.interviewScore || 85,
      remarks: candidate.interviewRemarks || (candidate.interviewStatus === 'Hold' ? 'Candidate placed on hold pending second review.' : 'Candidate cleared technical and operational checks with flying colors.'),
      interviewerName: candidate.interviewerName || this.currentUserName || '',
      interviewerPhone: candidate.interviewerPhone || ''
    };
    this.showEvaluationModal = true;
  }

  submitEvaluation(): void {
    const payload = {
      appId: this.evaluationForm.appId,
      skillClassification: this.evaluationForm.skillClassification,
      decision: this.evaluationForm.decision,
      score: this.evaluationForm.score,
      remarks: this.evaluationForm.remarks,
      evaluatorName: this.evaluationForm.interviewerName || this.currentUserName,
      interviewerName: this.evaluationForm.interviewerName || this.currentUserName,
      interviewerPhone: this.evaluationForm.interviewerPhone || '',
      companyId: this.companyId
    };

    this.atsService.submitInterviewEvaluation(payload).subscribe({
      next: () => {
        this.toastr.success(`Evaluation recorded as ${this.evaluationForm.decision} (${this.evaluationForm.skillClassification})`, 'Assessment Completed');
        
        // Immediately synchronize candidate in local roster so any modal click displays the evaluation
        const cand = this.candidateRoster?.find(c => c.appId === this.evaluationForm.appId) || this.selectedCandidate;
        if (cand) {
          cand.skillClassification = this.evaluationForm.skillClassification;
          cand.interviewStatus = this.evaluationForm.decision;
          cand.interviewScore = this.evaluationForm.score;
          cand.interviewRemarks = this.evaluationForm.remarks;
          cand.interviewerName = this.evaluationForm.interviewerName || this.currentUserName;
          cand.interviewerPhone = this.evaluationForm.interviewerPhone || '';
          cand.evaluatedBy = this.currentUserName;
          cand.interviewDate = new Date().toISOString();
          if (this.evaluationForm.decision === 'Selected') cand.stage = 'Selected';
          if (this.evaluationForm.decision === 'Hold') {
            cand.stage = 'Interview_Scheduled';
            cand.interviewStatus = 'Hold';
          }
          if (this.evaluationForm.decision === 'Rejected') cand.stage = 'Rejected';
        }

        this.showEvaluationModal = false;
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to submit interview evaluation.')
    });
  }

  closeEvaluationModal(): void {
    this.showEvaluationModal = false;
  }

  // =========================================================================
  // STEPS 10 & 11: 22-POINT ONBOARDING DOCUMENT REVIEW & VERIFICATION SUITE
  // =========================================================================

  openDocsModal(candidate: any): void {
    this.selectedCandidate = candidate;
    this.showDocsModal = true;
    this.docsActiveTab = 'documents';
    this.docsActiveFilter = 'ALL';
    this.docsCandidateHeader = candidate;
    this.docsAuditTrail = [];
    this.viewedDocKeys.clear();
    this.loadCandidateDocs(candidate.appId);
    this.loadDocsAuditTrail();
  }

  loadDocsAuditTrail(): void {
    const appId = this.docsCandidateHeader?.appId || this.selectedCandidate?.appId;
    if (!appId) return;
    this.docsAuditLoading = true;
    this.atsService.getCandidateAuditTrail(appId, this.companyId).subscribe({
      next: (logs: any) => {
        this.docsAuditLoading = false;
        this.docsAuditTrail = logs || [];
      },
      error: () => {
        this.docsAuditLoading = false;
        this.docsAuditTrail = [];
        this.toastr.error('Failed to load candidate audit trail');
      }
    });
  }

  openDocsAuditFromHeader(): void {
    const candidate = this.docsCandidateHeader || this.selectedCandidate;
    if (candidate) {
      this.openAuditDrawer(candidate);
    } else {
      this.docsActiveTab = 'audit';
      this.loadDocsAuditTrail();
    }
  }

  loadCandidateDocs(appId: number | string): void {
    this.isLoadingDocs = true;
    this.atsService.getCandidateDocuments(appId, this.companyId).subscribe({
      next: (res: any) => {
        this.isLoadingDocs = false;
        if (res && res.success) {
          this.docsCandidateHeader = res.candidate || this.selectedCandidate;
          this.candidateDocList = res.documents || [];
          this.candidateDocList.forEach(d => {
            const key = this.getDocKey(d);
            if (key && this.viewedDocKeys.has(key)) {
              d.isViewed = true;
            }
          });
          this.docsMetrics = {
            totalMandatory: Number(this.docsCandidateHeader.totalMandatory || 0),
            approvedMandatory: Number(this.docsCandidateHeader.approvedMandatory || 0),
            rejectedCount: Number(this.docsCandidateHeader.rejectedCount || 0),
            missingMandatory: Number(this.docsCandidateHeader.missingMandatory || 0)
          };
          this.dossierForm = {
            appId: this.docsCandidateHeader.appId || appId,
            aadhaarNo: this.docsCandidateHeader.aadhaarNo || '',
            panNo: this.docsCandidateHeader.panNo || '',
            bankAccNo: this.docsCandidateHeader.bankAccNo || '',
            bankIfsc: this.docsCandidateHeader.bankIfsc || '',
            bankName: this.docsCandidateHeader.bankName || '',
            nomineeName: this.docsCandidateHeader.nomineeName || '',
            nomineeRelation: this.docsCandidateHeader.nomineeRelation || 'Spouse',
            nomineeDOB: this.docsCandidateHeader.nomineeDOB ? new Date(this.docsCandidateHeader.nomineeDOB).toISOString().slice(0, 10) : '',
            nomineeContact: this.docsCandidateHeader.nomineeContact || '',
            uanNo: this.docsCandidateHeader.uanNo || '',
            esicNo: this.docsCandidateHeader.esicNo || ''
          };
          this.docsForm = {
            appId: this.docsCandidateHeader.appId,
            candidateName: this.docsCandidateHeader.candidateName,
            aadhaarNo: this.docsCandidateHeader.aadhaarNo || '',
            aadhaarDocPath: '/uploads/docs/aadhaar.pdf',
            panNo: this.docsCandidateHeader.panNo || '',
            panDocPath: '/uploads/docs/pan.pdf',
            bankAccNo: this.docsCandidateHeader.bankAccNo || '',
            bankIfsc: this.docsCandidateHeader.bankIfsc || '',
            bankName: this.docsCandidateHeader.bankName || '',
            photoDocPath: '/uploads/docs/passport_photo.jpg',
            resumeDocPath: '/uploads/docs/resume.pdf',
            verificationRemarks: this.docsCandidateHeader.deficiencyRemarks || 'Verified against physical records'
          };
        }
      },
      error: () => {
        this.isLoadingDocs = false;
        this.toastr.error('Failed to load candidate document dossier.', 'Error');
      }
    });
  }

  onDocFileSelected(event: any, docTypeCode: string): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    // Point o: Validate format (PDF/JPG/JPEG/PNG) and size (<= 5MB)
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      this.toastr.error('Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.', 'Format Validation');
      event.target.value = '';
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      this.toastr.error('File size exceeds the 5 MB limit. Please select a smaller file.', 'Size Validation');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    const appId = String(this.docsCandidateHeader?.appId || this.selectedCandidate?.appId);
    formData.append('appId', appId);
    formData.append('docTypeCode', docTypeCode);
    formData.append('companyId', this.companyId);
    formData.append('file', file);

    this.isUploadingDoc[docTypeCode] = true;
    this.atsService.uploadCandidateDocument(formData).subscribe({
      next: () => {
        this.isUploadingDoc[docTypeCode] = false;
        event.target.value = '';
        this.toastr.success(`Document uploaded successfully for verification.`, 'Upload Complete');
        this.loadCandidateDocs(appId);
        this.loadPipelineRoster();
      },
      error: () => {
        this.isUploadingDoc[docTypeCode] = false;
        event.target.value = '';
        this.toastr.error('Failed to upload document. Please retry.', 'Upload Error');
      }
    });
  }

  verifyDocItem(doc: any, status: 'Approved' | 'Rejected'): void {
    if (status === 'Rejected') {
      this.selectedDocForReject = doc;
      this.docRejectionRemark = doc.rejectionRemarks || '';
      this.showDocRejectModal = true;
      return;
    }

    const payload = {
      appId: doc.appId || this.docsCandidateHeader?.appId,
      docTypeCode: doc.docTypeCode,
      status: 'Approved',
      rejectionRemarks: '',
      verifiedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.verifyCandidateDocumentItem(payload).subscribe({
      next: () => {
        this.toastr.success(`${doc.docTypeName} approved successfully.`, 'Verified');
        this.loadCandidateDocs(doc.appId || this.docsCandidateHeader?.appId);
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to approve document.')
    });
  }

  submitDocRejection(): void {
    if (!this.docRejectionRemark || !this.docRejectionRemark.trim()) {
      this.toastr.warning('Please state the deficiency or rejection reason.', 'Remarks Required');
      return;
    }

    const payload = {
      appId: this.selectedDocForReject.appId || this.docsCandidateHeader?.appId,
      docTypeCode: this.selectedDocForReject.docTypeCode,
      status: 'Rejected',
      rejectionRemarks: this.docRejectionRemark.trim(),
      verifiedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.verifyCandidateDocumentItem(payload).subscribe({
      next: () => {
        this.toastr.warning(`Document rejected. Vendor/Candidate notified to re-upload.`, 'Deficiency Alert');
        this.showDocRejectModal = false;
        this.selectedDocForReject = null;
        this.docRejectionRemark = '';
        this.loadCandidateDocs(this.docsCandidateHeader?.appId);
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to reject document.')
    });
  }

  closeDocRejectModal(): void {
    this.showDocRejectModal = false;
    this.selectedDocForReject = null;
    this.docRejectionRemark = '';
  }

  approveAllPendingDocs(): void {
    const eligibleDocs = this.candidateDocList.filter(d => d.fileName && d.verificationStatus !== 'Approved');
    if (eligibleDocs.length === 0) {
      this.toastr.info('No pending uploaded documents awaiting approval.', 'Up to Date');
      return;
    }

    let count = 0;
    eligibleDocs.forEach(doc => {
      const payload = {
        appId: doc.appId || this.docsCandidateHeader?.appId,
        docTypeCode: doc.docTypeCode,
        status: 'Approved',
        rejectionRemarks: '',
        verifiedBy: this.currentUserName,
        companyId: this.companyId
      };
      this.atsService.verifyCandidateDocumentItem(payload).subscribe({
        next: () => {
          count++;
          if (count === eligibleDocs.length) {
            this.toastr.success(`All ${count} pending documents have been verified and approved.`, 'Batch Approval');
            this.loadCandidateDocs(this.docsCandidateHeader?.appId);
            this.loadPipelineRoster();
          }
        }
      });
    });
  }

  saveCandidateDossier(): void {
    this.isSavingDossier = true;
    const payload = {
      ...this.dossierForm,
      companyId: this.companyId,
      submittedBy: this.currentUserName
    };

    this.atsService.saveCandidateOnboardingDossier(payload).subscribe({
      next: () => {
        this.isSavingDossier = false;
        this.toastr.success('Statutory, Bank, and Nominee details saved.', 'Dossier Saved');
        this.loadCandidateDocs(this.dossierForm.appId);
        this.loadPipelineRoster();
      },
      error: () => {
        this.isSavingDossier = false;
        this.toastr.error('Failed to save dossier details.');
      }
    });
  }

  // =========================================================================
  // SEND CANDIDATE FROM 'SELECTED' TO 'DOCS REVIEW' (STAGE TRANSITION WITH DOCS)
  // =========================================================================
  sendCandidateToDocsReview(): void {
    const appId = this.docsCandidateHeader?.appId || this.selectedCandidate?.appId;
    if (!appId) return;

    // Check how many documents have been attached
    const uploadedDocs = this.candidateDocList.filter(d => d.fileName && d.fileName.trim() !== '');
    if (uploadedDocs.length === 0) {
      this.toastr.warning('Please upload at least one mandatory document (e.g. Aadhaar, Photo, or Resume) before sending to Docs Review.', 'Upload Required');
      return;
    }

    this.isSavingDossier = true;
    const dossierPayload = {
      ...this.dossierForm,
      companyId: this.companyId,
      submittedBy: this.currentUserName
    };

    this.atsService.saveCandidateOnboardingDossier(dossierPayload).subscribe({
      next: () => {
        this.isSavingDossier = false;
        // Advance candidate stage from Selected -> Docs_Submitted (Docs Review)
        const stagePayload = {
          appId: appId,
          targetStage: 'Docs_Submitted',
          remarks: `Onboarding documents collected (${uploadedDocs.length} uploaded) and forwarded to Docs Review for HR verification.`,
          movedBy: this.currentUserName,
          companyId: this.companyId
        };

        this.atsService.moveCandidateStage(stagePayload).subscribe({
          next: () => {
            this.toastr.success('Candidate documents submitted successfully! Candidate forwarded to Docs Review for HR verification.', 'Sent to Docs Review');
            this.closeDocsModal();
            this.loadPipelineRoster();
          },
          error: () => this.toastr.error('Failed to forward candidate to Docs Review.')
        });
      },
      error: () => {
        this.isSavingDossier = false;
        this.toastr.error('Failed to save candidate dossier.');
      }
    });
  }

  getDocKey(doc: any): string {
    if (!doc) return '';
    return String(doc.docTypeCode || doc.docId || doc.pk_docId || doc.fileName || '');
  }

  markDocAsViewed(doc: any): void {
    if (!doc) return;
    const key = this.getDocKey(doc);
    if (key) {
      this.viewedDocKeys.add(key);
    }
    doc.isViewed = true;
    const appId = doc.appId || this.docsCandidateHeader?.appId || this.selectedCandidate?.appId;
    if (appId) {
      this.atsService.markCandidateDocumentViewed({
        docId: doc.docId || doc.pk_docId,
        appId: appId,
        docTypeCode: doc.docTypeCode,
        viewedBy: this.currentUserName
      }).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  }

  isDocViewed(doc: any): boolean {
    if (!doc) return false;
    const key = this.getDocKey(doc);
    return !!doc.isViewed || doc.isViewed === 1 || doc.isViewed === 'true' || (!!key && this.viewedDocKeys.has(key));
  }

  getUploadedDocs(): any[] {
    return (this.candidateDocList || []).filter(d => 
      (d.fileName && d.fileName.trim() !== '') || (d.filePath && d.filePath.trim() !== '')
    );
  }

  areAllDocsViewed(): boolean {
    const uploadedDocs = this.getUploadedDocs();
    if (uploadedDocs.length === 0) return false;
    return uploadedDocs.every(d => this.isDocViewed(d));
  }

  getViewedDocsCount(): { viewed: number; total: number } {
    const uploadedDocs = this.getUploadedDocs();
    const viewed = uploadedDocs.filter(d => this.isDocViewed(d)).length;
    return { viewed, total: uploadedDocs.length };
  }

  getUnviewedDocs(): any[] {
    const uploadedDocs = this.getUploadedDocs();
    return uploadedDocs.filter(d => !this.isDocViewed(d));
  }

  completeOnboarding(): void {
    if (!this.areAllDocsViewed()) {
      const stats = this.getViewedDocsCount();
      const unviewed = this.getUnviewedDocs();
      const names = unviewed.map(d => d.docTypeName || d.docTypeCode).join(', ');
      this.toastr.warning(
        `You must view each document before completing onboarding (${stats.viewed}/${stats.total} viewed). Please review: ${names}`,
        'Document Review Required'
      );
      return;
    }

    const unapprovedMandatory = this.candidateDocList.filter(d => d.isMandatory && d.verificationStatus !== 'Approved');
    if (unapprovedMandatory.length > 0) {
      const names = unapprovedMandatory.map(d => d.docTypeName).join(', ');
      this.toastr.error(`Cannot complete onboarding: ${unapprovedMandatory.length} mandatory document(s) still require approval (${names}).`, 'Documents Verification Incomplete');
      return;
    }

    const payload = {
      appId: this.docsCandidateHeader?.appId || this.selectedCandidate?.appId,
      targetStage: 'Docs_Verified',
      remarks: 'All mandatory onboarding documents approved by Site HR.',
      movedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.moveCandidateStage(payload).subscribe({
      next: (res: any) => {
        if (res && (res.success === false || res.Success === 0)) {
          this.toastr.error(res.message || res.Message || 'Failed to verify candidate documents.', 'Verification Alert');
          return;
        }
        this.toastr.success('Candidate documents successfully verified and approved! Moved to Docs Verified.', 'Onboarding Completed');
        this.closeDocsModal();
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to update candidate onboarding status.')
    });
  }

  completeAndMoveToOffer(): void {
    if (!this.areAllDocsViewed()) {
      const stats = this.getViewedDocsCount();
      const unviewed = this.getUnviewedDocs();
      const names = unviewed.map(d => d.docTypeName || d.docTypeCode).join(', ');
      this.toastr.warning(
        `You must view each document before advancing to Offer Letter (${stats.viewed}/${stats.total} viewed). Please review: ${names}`,
        'Document Review Required'
      );
      return;
    }

    const unapprovedMandatory = this.candidateDocList.filter(d => d.isMandatory && d.verificationStatus !== 'Approved');
    if (unapprovedMandatory.length > 0) {
      const names = unapprovedMandatory.map(d => d.docTypeName).join(', ');
      this.toastr.error(`Cannot advance to Offer Letter: ${unapprovedMandatory.length} mandatory document(s) still require approval (${names}).`, 'Documents Verification Incomplete');
      return;
    }

    const candidate = this.docsCandidateHeader || this.selectedCandidate;
    const payload = {
      appId: candidate.appId,
      targetStage: 'Docs_Verified',
      remarks: 'All mandatory onboarding documents approved by Site HR. Advancing to Offer Letter.',
      movedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.moveCandidateStage(payload).subscribe({
      next: () => {
        this.closeDocsModal();
        this.loadPipelineRoster();
        this.proceedOpenOfferModal(candidate);
      },
      error: () => this.toastr.error('Failed to update candidate onboarding status.')
    });
  }

  verifyCandidateDocsViewedBeforeOffer(candidate: any): Observable<{ allViewed: boolean; totalUploaded: number; viewedCount: number; unviewedNames: string[] }> {
    const stage = candidate?.stage || '';
    if (stage !== 'Docs_Submitted' && stage !== 'Docs_Verified' && stage !== 'DOCS') {
      return of({ allViewed: true, totalUploaded: 0, viewedCount: 0, unviewedNames: [] });
    }

    if (this.docsCandidateHeader?.appId === candidate.appId && this.candidateDocList && this.candidateDocList.length > 0) {
      const uploaded = this.getUploadedDocs();
      if (uploaded.length === 0) {
        return of({ allViewed: true, totalUploaded: 0, viewedCount: 0, unviewedNames: [] });
      }
      const unviewed = this.getUnviewedDocs();
      return of({
        allViewed: unviewed.length === 0,
        totalUploaded: uploaded.length,
        viewedCount: uploaded.length - unviewed.length,
        unviewedNames: unviewed.map(d => d.docTypeName || d.docTypeCode)
      });
    }

    return this.atsService.getCandidateDocuments(candidate.appId, this.companyId).pipe(
      map((res: any) => {
        const docs: any[] = res?.documents || [];
        const uploaded = docs.filter((d: any) => (d.fileName && d.fileName.trim() !== '') || (d.filePath && d.filePath.trim() !== ''));
        if (uploaded.length === 0) {
          return { allViewed: true, totalUploaded: 0, viewedCount: 0, unviewedNames: [] };
        }
        const unviewed = uploaded.filter((d: any) => {
          const key = this.getDocKey(d);
          const viewedInDb = !!d.isViewed || d.isViewed === 1 || d.isViewed === 'true' || d.isViewed === true;
          const viewedInMemory = !!key && this.viewedDocKeys.has(key);
          return !viewedInDb && !viewedInMemory;
        });
        return {
          allViewed: unviewed.length === 0,
          totalUploaded: uploaded.length,
          viewedCount: uploaded.length - unviewed.length,
          unviewedNames: unviewed.map((d: any) => d.docTypeName || d.docTypeCode)
        };
      }),
      catchError(() => of({ allViewed: true, totalUploaded: 0, viewedCount: 0, unviewedNames: [] }))
    );
  }

  getFilteredCandidateDocs(): any[] {
    if (!this.candidateDocList) return [];
    switch (this.docsActiveFilter) {
      case 'MANDATORY':
        return this.candidateDocList.filter(d => d.isMandatory);
      case 'PENDING':
        return this.candidateDocList.filter(d => d.verificationStatus === 'Pending' || (d.fileName && d.verificationStatus !== 'Approved'));
      case 'APPROVED':
        return this.candidateDocList.filter(d => d.verificationStatus === 'Approved');
      case 'REJECTED':
        return this.candidateDocList.filter(d => d.verificationStatus === 'Rejected' || d.verificationStatus === 'Missing');
      default:
        return this.candidateDocList;
    }
  }

  formatFileSize(bytes: number | null): string {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  }

  getOnboardingProgressPercent(): number {
    if (!this.docsMetrics.totalMandatory || this.docsMetrics.totalMandatory === 0) return 0;
    return Math.min(100, Math.round((this.docsMetrics.approvedMandatory / this.docsMetrics.totalMandatory) * 100));
  }

  openDocFile(doc: any): void {
    if (!doc.fileName && !doc.filePath) {
      this.toastr.info('No document file attached to view.', 'Empty');
      return;
    }
    this.markDocAsViewed(doc);
    const appId = doc.appId || this.docsCandidateHeader?.appId;
    const viewUrl = this.atsService.getDocumentViewUrl(doc.docId, appId, doc.docTypeCode);
    this.previewDocUrl = viewUrl;
    this.previewDocName = doc.docTypeName || doc.fileName || doc.docTypeCode;
    this.showDocPreviewModal = true;
  }

  openDocInNewWindow(doc?: any): void {
    if (doc) {
      this.markDocAsViewed(doc);
    }
    const appId = doc?.appId || this.docsCandidateHeader?.appId;
    const url = doc 
      ? this.atsService.getDocumentViewUrl(doc.docId, appId, doc.docTypeCode)
      : this.previewDocUrl;
    if (url) {
      window.open(url, '_blank');
    }
  }

  closeDocPreviewModal(): void {
    this.showDocPreviewModal = false;
    this.previewDocUrl = '';
    this.previewDocName = '';
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  saveDocs(): void {
    this.saveCandidateDossier();
  }

  verifyDocs(isApproved: boolean): void {
    if (isApproved) {
      this.approveAllPendingDocs();
    } else {
      this.toastr.info('Please reject individual deficient documents using the reject button on each row.', 'Doc Rejection');
    }
  }

  closeDocsModal(): void {
    this.showDocsModal = false;
    this.docsCandidateHeader = null;
    this.candidateDocList = [];
    this.showDocRejectModal = false;
    this.viewedDocKeys.clear();
  }

  // =========================================================================
  // STEP 12: OFFER LETTER — 3-Step Wizard
  // =========================================================================

  /** Open for a single candidate from pipeline card */
  openOfferModal(candidate: any): void {
    if (!candidate) return;

    // Check if candidate has unviewed documents in Docs Review before preparing offer
    this.verifyCandidateDocsViewedBeforeOffer(candidate).subscribe((result: any) => {
      if (!result.allViewed) {
        const names = result.unviewedNames.length > 0 ? `: ${result.unviewedNames.join(', ')}` : '';
        this.toastr.warning(
          `You must view and inspect all candidate documents in Docs Review before moving to Offer Letter (${result.viewedCount}/${result.totalUploaded} viewed)${names}. Opening Document Review...`,
          'Document Review Required'
        );
        this.openDocsModal(candidate);
        return;
      }

      this.proceedOpenOfferModal(candidate);
    });
  }

  proceedOpenOfferModal(candidate: any): void {
    this.selectedCandidate = candidate;
    // Legacy offerForm (backward compat for old SP)
    this.offerForm = {
      appId: candidate.appId,
      candidateName: candidate.candidateName,
      offeredCTC: candidate.offeredCTC || 0,
      expectedJoiningDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
    };
    // Load into wizard with single candidate
    this.offerCandidates = [{
      appId: candidate.appId,
      candidateName: candidate.candidateName,
      companyId: candidate.companyId || candidate.fk_companyId || '',
      fk_companyId: candidate.fk_companyId || candidate.companyId || '',
      designation: candidate.jobTitle || candidate.designation || '',
      department: candidate.department || '',
      location: candidate.location || '',
      fatherName: candidate.fatherName || '',
      address: candidate.currentLocation || '',
      grossCTC: null, basicSalary: null, hra: null, da: null,
      conveyance: null, medicalAllowance: null, otherAllowance: null,
      pfDeduction: null, joiningDate: null, designation_override: null
    }];
    this.resetOfferWizard();
    this.loadCompanySalaryHeads();
    if (candidate.offeredCTC) {
      this.offerCtc.grossCTC = candidate.offeredCTC;
      this.autoSplitCTC();
    }
    this.showOfferModal = true;
  }

  /** Open for all currently selected candidates (bulk) */
  openBulkOfferModal(): void {
    if (this.selectedCandidateIds.size === 0) {
      this.toastr.warning('Please select at least one candidate.');
      return;
    }
    const selected = this.candidateRoster.filter(c => this.selectedCandidateIds.has(Number(c.appId)));

    // Verify all candidates have inspected documents in Docs Review
    const checks = selected.map(c => this.verifyCandidateDocsViewedBeforeOffer(c));
    forkJoin(checks).subscribe((results: any[]) => {
      const candidatesWithUnviewed: string[] = [];
      results.forEach((res: any, idx: number) => {
        if (!res.allViewed) {
          candidatesWithUnviewed.push(`${selected[idx].candidateName} (${res.viewedCount}/${res.totalUploaded} viewed)`);
        }
      });

      if (candidatesWithUnviewed.length > 0) {
        this.toastr.warning(
          `Cannot proceed to Offer Letter: The following candidate(s) have unviewed documents in Docs Review:\n${candidatesWithUnviewed.join(', ')}. All documents must be inspected first.`,
          'Document Review Required'
        );
        return;
      }

      this.offerCandidates = selected.map(c => ({
        appId: c.appId,
        candidateName: c.candidateName,
        companyId: c.companyId || c.fk_companyId,
        fk_companyId: c.fk_companyId || c.companyId,
        designation: c.jobTitle || c.designation || '',
        department: c.department || '',
        location: c.location || '',
        fatherName: c.fatherName || '',
        address: c.currentLocation || '',
        grossCTC: null, basicSalary: null, hra: null, da: null,
        conveyance: null, medicalAllowance: null, otherAllowance: null,
        pfDeduction: null, joiningDate: null, designation_override: null
      }));
      this.resetOfferWizard();
      this.loadCompanySalaryHeads();
      this.showOfferModal = true;
    });
  }

  resetOfferWizard(): void {
    this.offerWizardStep = 1;
    this.isIssuingOffer = false;
    this.offerCommon = {
      reportingManager: '',
      joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      probationPeriod: '90 Days',
      noticePeriod: '30 Days'
    };
    this.offerCtc = {
      grossCTC: 0, basicSalary: 0, hra: 0, da: 0,
      conveyance: 0, medicalAllowance: 0, otherAllowance: 0, pfDeduction: 0
    };
  }

  /** Auto-split gross CTC into dynamic company salary heads (40% Basic, 20% HRA, 10% DA, Conv, Med, remainder to other) */
  autoSplitCTC(): void {
    const g = Number(this.offerCtc.grossCTC || 0);
    if (!g) {
      if (this.companySalaryHeads && this.companySalaryHeads.length > 0) {
        this.companySalaryHeads.forEach((h: any) => {
          h.annualamount = 0;
          h.amount = 0;
        });
      }
      this.offerCtc.basicSalary      = 0;
      this.offerCtc.hra              = 0;
      this.offerCtc.da               = 0;
      this.offerCtc.conveyance       = 0;
      this.offerCtc.medicalAllowance = 0;
      this.offerCtc.otherAllowance   = 0;
      this.offerCtc.pfDeduction      = 0;
      return;
    }

    if (this.companySalaryHeads && this.companySalaryHeads.length > 0) {
      // Reset all heads to 0
      this.companySalaryHeads.forEach((h: any) => {
        h.annualamount = 0;
        h.amount = 0;
      });

      const basicHead = this.companySalaryHeads.find((h: any) => (h.shortdesc || '').toLowerCase().includes('basic'));
      const hraHead   = this.companySalaryHeads.find((h: any) => (h.shortdesc || '').toLowerCase() === 'hra');
      const daHead    = this.companySalaryHeads.find((h: any) => (h.shortdesc || '').toLowerCase() === 'da');
      const convHead  = this.companySalaryHeads.find((h: any) => ['convall', 'conveyance', 'conv'].includes((h.shortdesc || '').toLowerCase()));
      const medHead   = this.companySalaryHeads.find((h: any) => ['mediclaim', 'medicalallowance', 'medical'].includes((h.shortdesc || '').toLowerCase()));
      const otherHead = this.companySalaryHeads.find((h: any) => ['other_spcl_wash_allow', 'otherallowance', 'other', 'specialallowance'].includes((h.shortdesc || '').toLowerCase()))
                     || this.companySalaryHeads.find((h: any) => h !== basicHead && h !== hraHead && h !== daHead && h !== convHead && h !== medHead);

      const basic = Math.round(g * 0.40);
      const hra   = Math.round(g * 0.20);
      const da    = Math.round(g * 0.10);
      const conv  = g >= 200000 ? 19200 : Math.round(g * 0.05);
      const med   = g >= 200000 ? 15000 : Math.round(g * 0.04);

      if (basicHead) basicHead.annualamount = basic;
      if (hraHead)   hraHead.annualamount   = hra;
      if (daHead)    daHead.annualamount    = da;
      if (convHead)  convHead.annualamount  = conv;
      if (medHead)   medHead.annualamount   = med;

      const allocated = (basicHead ? basic : 0) + (hraHead ? hra : 0) + (daHead ? da : 0) + (convHead ? conv : 0) + (medHead ? med : 0);
      const remainder = Math.max(0, g - allocated);

      if (otherHead) {
        otherHead.annualamount = remainder;
      }

      this.companySalaryHeads.forEach((h: any) => {
        h.amount = Math.round((Number(h.annualamount) || 0) / 12);
      });

      this.offerCtc.basicSalary      = basic;
      this.offerCtc.hra              = hra;
      this.offerCtc.da               = da;
      this.offerCtc.conveyance       = conv;
      this.offerCtc.medicalAllowance = med;
      this.offerCtc.otherAllowance   = remainder;
      this.offerCtc.pfDeduction      = 0;
    } else {
      this.offerCtc.basicSalary      = Math.round(g * 0.40);
      this.offerCtc.hra              = Math.round(g * 0.20);
      this.offerCtc.da               = Math.round(g * 0.10);
      this.offerCtc.conveyance       = 19200;
      this.offerCtc.medicalAllowance = 15000;
      const allocated = this.offerCtc.basicSalary + this.offerCtc.hra + this.offerCtc.da
                      + this.offerCtc.conveyance + this.offerCtc.medicalAllowance;
      this.offerCtc.otherAllowance   = Math.max(0, Math.round(g - allocated));
      this.offerCtc.pfDeduction      = 0;
    }
  }

  /** Dynamically calculate Gross CTC and deductions from whichever heads have values */
  onDynamicHeadChange(): void {
    if (this.companySalaryHeads && this.companySalaryHeads.length > 0) {
      let totalGross = 0;
      let basicVal = 0;
      let hraVal = 0;
      let daVal = 0;
      let convVal = 0;
      let medVal = 0;
      let otherVal = 0;

      for (const h of this.companySalaryHeads) {
        const val = Number(h.annualamount) || 0;
        h.annualamount = val;
        h.amount = Math.round(val / 12);
        totalGross += val;

        const code = (h.shortdesc || '').toLowerCase();
        if (code.includes('basic')) {
          basicVal += val;
        } else if (code === 'hra') {
          hraVal += val;
        } else if (code === 'da') {
          daVal += val;
        } else if (code === 'convall' || code.includes('conveyance') || code === 'conv') {
          convVal += val;
        } else if (code === 'mediclaim' || code.includes('medical')) {
          medVal += val;
        } else {
          otherVal += val;
        }
      }

      this.offerCtc.grossCTC = totalGross;
      this.offerCtc.basicSalary = basicVal;
      this.offerCtc.hra = hraVal;
      this.offerCtc.da = daVal;
      this.offerCtc.conveyance = convVal;
      this.offerCtc.medicalAllowance = medVal;
      this.offerCtc.otherAllowance = otherVal;

      // PF deduction is non-mandatory / optional
      this.offerCtc.pfDeduction = Number(this.offerCtc.pfDeduction) || 0;
    } else {
      const sum = (Number(this.offerCtc.basicSalary) || 0) +
                  (Number(this.offerCtc.hra) || 0) +
                  (Number(this.offerCtc.da) || 0) +
                  (Number(this.offerCtc.conveyance) || 0) +
                  (Number(this.offerCtc.medicalAllowance) || 0) +
                  (Number(this.offerCtc.otherAllowance) || 0);
      this.offerCtc.grossCTC = sum;
      this.offerCtc.pfDeduction = Number(this.offerCtc.pfDeduction) || 0;
    }
  }

  get offerNetSalary(): number {
    return Math.max(0, (Number(this.offerCtc.grossCTC) || 0) - (Number(this.offerCtc.pfDeduction) || 0));
  }

  offerWizardNext(): void {
    if (this.offerWizardStep === 1) {
      if (!this.offerCommon.joiningDate) {
        this.toastr.warning('Please enter Date of Joining.'); return;
      }
      this.offerWizardStep = 2;
    } else if (this.offerWizardStep === 2) {
      if (!this.offerCtc.grossCTC) {
        this.toastr.warning('Please enter Gross CTC or fill salary heads.'); return;
      }
      this.offerWizardStep = 3;
    }
  }

  offerWizardBack(): void {
    if (this.offerWizardStep > 1) this.offerWizardStep = (this.offerWizardStep - 1) as 1 | 2 | 3;
  }

  /** Final: issue offer letters for all candidates */
  issueOfferLetters(): void {
    if (this.isIssuingOffer) return;
    this.isIssuingOffer = true;

    const perCandidateOverrides = this.offerCandidates
      .filter(c => c.grossCTC !== null)
      .map(c => ({
        appId: c.appId,
        grossCTC: c.grossCTC ?? 0,
        basicSalary: c.basicSalary ?? 0,
        hra: c.hra ?? 0, da: c.da ?? 0,
        conveyance: c.conveyance ?? 0,
        medicalAllowance: c.medicalAllowance ?? 0,
        otherAllowance: c.otherAllowance ?? 0,
        pfDeduction: c.pfDeduction ?? 0,
        designation: c.designation_override ?? '',
        joiningDate: c.joiningDate ?? ''
      }));

    const payload = {
      appIds: this.offerCandidates.map(c => c.appId),
      companyId: this.companyId,
      issuedBy: this.currentUserName,
      designation: this.offerCandidates[0]?.designation || '',
      department: this.offerCandidates[0]?.department || '',
      location: this.offerCandidates[0]?.location || '',
      reportingManager: this.offerCommon.reportingManager,
      joiningDate: this.offerCommon.joiningDate,
      probationPeriod: this.offerCommon.probationPeriod,
      noticePeriod: this.offerCommon.noticePeriod,
      grossCTC: this.offerCtc.grossCTC,
      basicSalary: this.offerCtc.basicSalary,
      hra: this.offerCtc.hra,
      da: this.offerCtc.da,
      conveyance: this.offerCtc.conveyance,
      medicalAllowance: this.offerCtc.medicalAllowance,
      otherAllowance: this.offerCtc.otherAllowance,
      pfDeduction: this.offerCtc.pfDeduction,
      salaryHeads: (this.companySalaryHeads && this.companySalaryHeads.some((h: any) => (Number(h.annualamount) || 0) > 0))
        ? this.companySalaryHeads
            .filter((h: any) => (Number(h.annualamount) || 0) > 0)
            .map((h: any) => ({
              headId: h.pk_headid,
              headName: h.shortdesc || h.headname,
              annualAmount: Number(h.annualamount) || 0,
              monthlyAmount: Math.round((Number(h.annualamount) || 0) / 12)
            }))
        : [
            { headName: 'Basic Salary', annualAmount: Number(this.offerCtc.basicSalary) || 0, monthlyAmount: Math.round((Number(this.offerCtc.basicSalary) || 0) / 12) },
            { headName: 'House Rent Allowance (HRA)', annualAmount: Number(this.offerCtc.hra) || 0, monthlyAmount: Math.round((Number(this.offerCtc.hra) || 0) / 12) },
            { headName: 'Dearness Allowance (DA)', annualAmount: Number(this.offerCtc.da) || 0, monthlyAmount: Math.round((Number(this.offerCtc.da) || 0) / 12) },
            { headName: 'Conveyance Allowance', annualAmount: Number(this.offerCtc.conveyance) || 0, monthlyAmount: Math.round((Number(this.offerCtc.conveyance) || 0) / 12) },
            { headName: 'Medical Allowance', annualAmount: Number(this.offerCtc.medicalAllowance) || 0, monthlyAmount: Math.round((Number(this.offerCtc.medicalAllowance) || 0) / 12) },
            { headName: 'Special / Other Allowance', annualAmount: Number(this.offerCtc.otherAllowance) || 0, monthlyAmount: Math.round((Number(this.offerCtc.otherAllowance) || 0) / 12) }
          ].filter((h: any) => h.annualAmount > 0),
      perCandidateOverrides
    };

    this.atsService.issueOfferLetterPdf(payload).subscribe({
      next: (res: any) => {
        this.isIssuingOffer = false;
        if (res.sent > 0) {
          this.toastr.success(
            `${res.sent} offer letter(s) issued & emailed successfully!`,
            'Offer Letters Sent 📧'
          );
        }
        if (res.failed > 0) {
          this.toastr.warning(`${res.failed} offer(s) failed. Check details.`);
        }
        this.showOfferModal = false;
        this.selectedCandidateIds.clear();
        this.loadPipelineRoster();
      },
      error: () => {
        this.isIssuingOffer = false;
        this.toastr.error('Failed to issue offer letters. Please try again.');
      }
    });
  }

  closeOfferModal(): void {
    this.showOfferModal = false;
  }

  loadCompanySalaryHeads(): void {
    const firstCandidateCompId = (this.offerCandidates && this.offerCandidates.length > 0)
      ? (this.offerCandidates[0]?.companyId || this.offerCandidates[0]?.fk_companyId)
      : null;
    const compId = firstCandidateCompId || this.selectedJob?.fk_companyId || this.selectedJob?.companyId || this.companyId || 'GU-8';
    this.loadingSalaryHeads = true;
    this.generateLettersService.Getheads(compId).subscribe({
      next: (res: any) => {
        this.loadingSalaryHeads = false;
        let rawHeads: any[] = [];
        if (res && res.data && Array.isArray(res.data)) {
          rawHeads = res.data;
        } else if (Array.isArray(res)) {
          rawHeads = res;
        }

        // Initialize heads with numeric annualamount and monthly amount
        this.companySalaryHeads = rawHeads.map((h: any) => ({
          ...h,
          pk_headid: h.pk_headid,
          shortdesc: h.shortdesc || h.headname || h.fullname || '',
          annualamount: Number(h.annualamount || 0),
          amount: Number(h.amount || 0)
        }));

        if (this.offerCtc.grossCTC > 0) {
          this.autoSplitCTC();
        } else {
          this.onDynamicHeadChange();
        }
      },
      error: () => {
        this.loadingSalaryHeads = false;
        this.companySalaryHeads = [];
      }
    });
  }

  sendVendorOfferLettersBatch(specificAppIds?: number[]): void {
    let targetIds: number[] = [];
    if (specificAppIds && specificAppIds.length > 0) {
      targetIds = specificAppIds;
    } else if (this.selectedCandidateIds.size > 0) {
      targetIds = Array.from(this.selectedCandidateIds);
    } else {
      targetIds = this.getCandidatesForStage('Offer_Issued')
        .filter(c => !c.isOfferEmailSent)
        .map(c => Number(c.appId));
      if (targetIds.length === 0) {
        targetIds = this.getCandidatesForStage('Offer_Issued').map(c => Number(c.appId));
      }
    }

    if (!targetIds || targetIds.length === 0) {
      this.toastr.warning('No candidate offer letters found to send.', 'No Candidates');
      return;
    }

    this.isSendingVendorOfferBatch = true;
    this.loaderService.start();

    const payload = {
      appIds: targetIds,
      companyId: this.selectedJob?.fk_companyId || this.selectedJob?.companyId || this.companyId,
      sentBy: this.currentUserName || 'Corporate HR'
    };

    this.atsService.sendVendorOfferLettersBatch(payload).subscribe({
      next: (res: any) => {
        this.loaderService.stop();
        this.isSendingVendorOfferBatch = false;
        if (res && res.success) {
          this.toastr.success(
            res.message || `Dispatched offer letters to staffing vendors successfully!`,
            'Vendor Offer Emails Sent 📧'
          );
          this.clearSelection();
          this.loadPipelineRoster();
        } else {
          this.toastr.warning(res?.message || 'Email dispatch completed with warnings.', 'Dispatch Notice');
          this.loadPipelineRoster();
        }
      },
      error: (err: any) => {
        this.loaderService.stop();
        this.isSendingVendorOfferBatch = false;
        this.toastr.error(err?.error?.message || 'Failed to dispatch offer letters to vendors.', 'Dispatch Failed');
      }
    });
  }

  getPendingVendorOfferCount(): number {
    return this.getCandidatesForStage('Offer_Issued').filter(c => !c.isOfferEmailSent).length;
  }

  getSentVendorOfferCount(): number {
    return this.getCandidatesForStage('Offer_Issued').filter(c => c.isOfferEmailSent).length;
  }

  /** Load offer letter history for currently selected candidate */
  loadOfferHistory(appId: number): void {
    this.loadingOfferHistory = true;
    this.offerHistory = [];
    this.atsService.getOfferLetterHistory(appId, this.companyId).subscribe({
      next: (res: any) => {
        this.offerHistory = res?.data || [];
        this.loadingOfferHistory = false;
      },
      error: () => { this.loadingOfferHistory = false; }
    });
  }

  /** View sent offer letter PDF in a new tab/window */
  viewOfferLetter(candidate: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const appId = candidate?.appId || candidate?.pk_appId;
    if (!appId) {
      this.toastr.warning('Candidate ID not found.');
      return;
    }
    const viewUrl = this.atsService.getOfferLetterViewUrl(appId, candidate?.offerId);
    window.open(viewUrl, '_blank');
  }

  /** Download sent offer letter PDF directly */
  downloadOfferLetter(candidate: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const appId = candidate?.appId || candidate?.pk_appId;
    if (!appId) {
      this.toastr.warning('Candidate ID not found.');
      return;
    }
    const downloadUrl = this.atsService.getOfferLetterDownloadUrl(appId, candidate?.offerId);
    window.open(downloadUrl, '_blank');
  }

  /** Helper to check if candidate has an offer letter */
  hasOfferLetter(candidate: any): boolean {
    return !!(
      candidate?.offerLetterDocPath ||
      candidate?.offerLetterCode ||
      candidate?.stage === 'Offer_Issued' ||
      candidate?.stage === 'Hired'
    );
  }

  // Legacy method (kept for backward compat — old button still works)
  generateOfferLetter(): void {
    if (!this.offerForm.offeredCTC || !this.offerForm.expectedJoiningDate) {
      this.toastr.warning('Please specify CTC and Expected Joining Date.');
      return;
    }
    const payload = {
      appId: this.offerForm.appId,
      offeredCTC: this.offerForm.offeredCTC,
      expectedJoiningDate: this.offerForm.expectedJoiningDate,
      issuedBy: this.currentUserName,
      companyId: this.companyId
    };
    this.atsService.generateOfferLetter(payload).subscribe({
      next: (res) => {
        this.toastr.success(`Offer generated: ${res.offerCode || ''} with Candidate Code ${res.candidateCode || ''}`, 'Offer Letter Issued');
        this.showOfferModal = false;
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to generate offer letter.')
    });
  }



  // =========================================================================
  // STEP 13: 1-CLICK HIRE & TRANSFER TO EMPLOYEE MASTER (IN-PLACE MODAL)
  // =========================================================================

  loadHireMasterDropdowns(): void {
    this.employeeMasterService.get_DropdownList('Category').subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.categoryList = res.data
            .filter((item: any) => item.value && item.name && !item.name.trim().startsWith('--'))
            .map((item: any) => ({
              name: item.name.trim(),
              value: item.value
            }));
          if (this.showHireModal && this.hireForm && !this.hireForm.categoryId) {
            this.hireForm.categoryId = this.resolveDefaultCategoryId(this.selectedCandidate, this.selectedJob);
            this.cdr.detectChanges();
          }
        }
      },
      error: () => {}
    });

    this.employeeMasterService.get_DropdownList('Religion').subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.religionList = res.data
            .filter((item: any) => item.value && item.name && !item.name.trim().startsWith('--'))
            .map((item: any) => ({
              name: item.name.trim(),
              value: item.value
            }));
        }
      },
      error: () => {}
    });

    this.employeeMasterService.get_DropdownList('Nature').subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.natureList = res.data
            .filter((item: any) => item.value && item.name && !item.name.trim().startsWith('--'))
            .map((item: any) => ({
              name: item.name.trim(),
              value: item.value
            }));
          if (this.showHireModal && this.hireForm && !this.hireForm.natureId) {
            this.hireForm.natureId = this.resolveDefaultNatureId(this.selectedCandidate, this.selectedJob);
            this.cdr.detectChanges();
          }
        }
      },
      error: () => {}
    });

    this.employeeMasterService.get_DropdownList('Bank').subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.bankMasterList = res.data
            .filter((item: any) => item.value && item.name && !item.name.trim().startsWith('--'))
            .map((item: any) => ({
              name: item.name.trim(),
              value: item.value
            }));
        }
      },
      error: () => {}
    });
  }

  resolveDefaultCategoryId(candidate: any, job: any): string {
    if (candidate?.categoryId) return String(candidate.categoryId);
    if (candidate?.fk_catid) return String(candidate.fk_catid);
    if (job?.fk_catid) return String(job.fk_catid);
    if (job?.categoryId) return String(job.categoryId);

    const targetCategory = (job?.skillCategory || job?.categoryName || job?.diversityCategory || '').trim().toLowerCase();
    if (targetCategory && this.categoryList && this.categoryList.length > 0) {
      const match = this.categoryList.find(c =>
        c.name.toLowerCase() === targetCategory ||
        c.name.toLowerCase().includes(targetCategory) ||
        targetCategory.includes(c.name.toLowerCase())
      );
      if (match) return match.value;
    }

    if (this.categoryList && this.categoryList.length > 0) {
      const general = this.categoryList.find(c =>
        c.name.toLowerCase().includes('general') || c.name.toLowerCase().includes('skilled')
      );
      return general ? general.value : this.categoryList[0].value;
    }
    return '';
  }

  resolveDefaultNatureId(candidate: any, job: any): string {
    if (candidate?.natureId) return String(candidate.natureId);
    if (candidate?.fk_natureid) return String(candidate.fk_natureid);
    if (job?.fk_natureid) return String(job.fk_natureid);
    if (job?.natureId) return String(job.natureId);

    const empType = (job?.employmentType || '').trim().toLowerCase();
    if (this.natureList && this.natureList.length > 0) {
      if (empType) {
        if (empType.includes('contract') || empType.includes('third')) {
          const match = this.natureList.find(n => n.name.toLowerCase().includes('contract'));
          if (match) return match.value;
        } else if (empType.includes('part')) {
          const match = this.natureList.find(n => n.name.toLowerCase().includes('part') || n.name.toLowerCase().includes('regular'));
          if (match) return match.value;
        } else {
          const match = this.natureList.find(n => n.name.toLowerCase().includes('permanent') || n.name.toLowerCase().includes('regular'));
          if (match) return match.value;
        }
      }
      const permanent = this.natureList.find(n => n.name.toLowerCase().includes('permanent') || n.name.toLowerCase().includes('regular'));
      return permanent ? permanent.value : this.natureList[0].value;
    }
    return '';
  }

  resolveDefaultReligionId(candidate: any): string {
    if (!candidate) return '';
    // 1. Direct ID match against religionList
    if (candidate.religionId) {
      const match = this.religionList.find(r => 
        String(r.value).toLowerCase() === String(candidate.religionId).toLowerCase()
      );
      if (match) return match.value;
    }
    // 2. Name match (case-insensitive)
    const candRel = (candidate.religion || '').toLowerCase().trim();
    if (candRel && this.religionList.length > 0) {
      const match = this.religionList.find(r => {
        const item = (r.name || '').toLowerCase().trim();
        return item === candRel || item.includes(candRel) || candRel.includes(item);
      });
      if (match) return match.value;
    }
    // 3. Fallback: candidate.religionId if set, else Hindu if present, else first available
    if (candidate.religionId) return candidate.religionId;
    const hindu = this.religionList.find(r => (r.name || '').toLowerCase().includes('hindu'));
    if (hindu) return hindu.value;
    return this.religionList.length > 0 ? this.religionList[0].value : '';
  }

  hireCandidate(candidate: any): void {
    if (!candidate) return;
    this.selectedCandidate = candidate;
    this.showHireModal = true;
    this.updateSectionZIndex(true);
    this.hireAadhaarStatus = 'idle';
    this.hireAadhaarMessage = '';
    this.hireAadhaarDuplicateDetails = null;

    const job = this.selectedJob || {};

    let dob = '';
    if (candidate.dateOfBirth) {
      try {
        dob = new Date(candidate.dateOfBirth).toISOString().slice(0, 10);
      } catch (e) {
        dob = candidate.dateOfBirth;
      }
    }

    const defaultCategoryId = this.resolveDefaultCategoryId(candidate, job);
    const defaultNatureId = this.resolveDefaultNatureId(candidate, job);
    const defaultReligionId = this.resolveDefaultReligionId(candidate);

    this.hireForm = {
      appId: candidate.appId,
      candidateName: candidate.candidateName || '',
      fatherName: candidate.fatherName || '',
      motherName: candidate.motherName || '',
      gender: candidate.gender || 'Male',
      dateOfBirth: dob,
      mobile: candidate.mobile || '',
      email: candidate.email || '',
      aadhaarNo: candidate.aadhaarNo || '',
      panNo: candidate.panNo || '',
      bankAccNo: candidate.bankAccNo || '',
      bankIfsc: candidate.bankIfsc || '',
      bankName: candidate.bankName || '',
      uanNo: candidate.uanNo || '',
      esicNo: candidate.esicNo || '',
      nomineeName: candidate.nomineeName || '',
      nomineeRelation: candidate.nomineeRelation || 'Spouse',
      nomineeContact: candidate.nomineeContact || '',
      categoryId: defaultCategoryId,
      religionId: defaultReligionId,
      natureId: defaultNatureId,
      departmentId: job.departmentId || job.fk_deptid || '',
      departmentName: job.departmentName || '',
      designationId: job.designationId || job.fk_desgid || '',
      designationName: job.designationName || '',
      locationId: job.locationId || job.fk_locid || '',
      locationName: job.locationName || '',
      costCenterId: job.costCenterId || job.fk_costcentreid || null,
      costCenterName: job.costCenterName || '',
      mrfCode: job.mrfCode || candidate.mrfCode || '',
      jobTitle: job.jobTitle || candidate.jobTitle || 'Position'
    };

    if (this.hireForm.aadhaarNo && this.hireForm.aadhaarNo.replace(/\D/g, '').length === 12) {
      this.onHireAadhaarInput(true);
    }

    // Enrich from candidate documents & onboarding dossier if available
    this.atsService.getCandidateDocuments(candidate.appId, this.companyId).subscribe({
      next: (res: any) => {
        if (res && res.success && res.candidate) {
          const c = res.candidate;
          if (!this.hireForm.aadhaarNo && c.aadhaarNo) {
            this.hireForm.aadhaarNo = c.aadhaarNo;
            if (this.hireForm.aadhaarNo.replace(/\D/g, '').length === 12) {
              this.onHireAadhaarInput(true);
            }
          }
          if (!this.hireForm.panNo && c.panNo) this.hireForm.panNo = c.panNo;
          if (!this.hireForm.bankAccNo && c.bankAccNo) this.hireForm.bankAccNo = c.bankAccNo;
          if (!this.hireForm.bankIfsc && c.bankIfsc) this.hireForm.bankIfsc = c.bankIfsc;
          if (!this.hireForm.bankName && c.bankName) this.hireForm.bankName = c.bankName;
          if (!this.hireForm.uanNo && c.uanNo) this.hireForm.uanNo = c.uanNo;
          if (!this.hireForm.esicNo && c.esicNo) this.hireForm.esicNo = c.esicNo;
          if (!this.hireForm.nomineeName && c.nomineeName) this.hireForm.nomineeName = c.nomineeName;
          if (!this.hireForm.nomineeRelation && c.nomineeRelation) this.hireForm.nomineeRelation = c.nomineeRelation;
          if (!this.hireForm.nomineeContact && c.nomineeContact) this.hireForm.nomineeContact = c.nomineeContact;
          if (!this.hireForm.fatherName && c.fatherName) this.hireForm.fatherName = c.fatherName;
          if (!this.hireForm.motherName && c.motherName) this.hireForm.motherName = c.motherName;
          if (!this.hireForm.dateOfBirth && c.dateOfBirth) {
            try { this.hireForm.dateOfBirth = new Date(c.dateOfBirth).toISOString().slice(0, 10); } catch (e) {}
          }
          if (c.gender) this.hireForm.gender = c.gender;
          if (!this.hireForm.religionId && (c.religionId || c.religion)) {
            this.hireForm.religionId = this.resolveDefaultReligionId(c);
          }
          this.cdr.detectChanges();
        }
      }
    });

    this.cdr.detectChanges();
  }

  onHireAadhaarInput(immediate: boolean = false): void {
    if (this.hireAadhaarDebounceTimer) {
      clearTimeout(this.hireAadhaarDebounceTimer);
    }
    const clean = (this.hireForm.aadhaarNo || '').replace(/\D/g, '').slice(0, 12);
    this.hireForm.aadhaarNo = clean;

    if (clean.length < 12) {
      this.hireAadhaarStatus = 'idle';
      this.hireAadhaarMessage = clean.length > 0 ? `${clean.length}/12 digits entered` : '';
      this.hireAadhaarDuplicateDetails = null;
      this.cdr.detectChanges();
      return;
    }

    const runValidation = () => {
      this.hireAadhaarStatus = 'checking';
      this.hireAadhaarMessage = 'Verifying Aadhaar uniqueness...';
      this.cdr.detectChanges();

      this.atsService.verifyAadhaarUniqueness({ aadhaarNo: clean, companyId: this.companyId, currentAppId: this.hireForm.appId }).subscribe({
        next: (res: any) => {
          const isDup = res?.isDuplicate === true || 
                        res?.IsDuplicate === true || 
                        res?.ExistsStatus === 1 || 
                        res?.existsStatus === 1 ||
                        res?.canProceed === false || 
                        res?.CanProceed === 0;

          const existingAppId = res?.existingAppId || res?.ExistingAppId;
          const isSelf = !!(this.hireForm.appId && existingAppId && (Number(existingAppId) === Number(this.hireForm.appId)));

          if (isDup && !isSelf) {
            this.hireAadhaarStatus = 'duplicate';
            this.hireAadhaarMessage = res.message || res.Message || 'Duplicate Aadhaar found in records.';
            this.hireAadhaarDuplicateDetails = res.existingRecord || {
              candidateName: res.candidateName || res.CandidateName,
              mrfCode: res.jobTitle || res.JobTitle,
              currentStage: res.currentStatus || res.CurrentStatus,
              identifier: res.existingIdentifier || res.ExistingIdentifier
            };
          } else {
            this.hireAadhaarStatus = 'verified';
            this.hireAadhaarMessage = isSelf ? 'Candidate registered Aadhaar verified.' : 'Aadhaar is unique & verified.';
            this.hireAadhaarDuplicateDetails = null;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.hireAadhaarStatus = 'idle';
          this.hireAadhaarMessage = '';
          this.cdr.detectChanges();
        }
      });
    };

    if (immediate) {
      runValidation();
    } else {
      this.hireAadhaarDebounceTimer = setTimeout(runValidation, 300);
    }
  }

  closeHireModal(): void {
    if (this.hireAadhaarDebounceTimer) {
      clearTimeout(this.hireAadhaarDebounceTimer);
    }
    this.showHireModal = false;
    this.updateSectionZIndex(false);
  }

  getMissingHireFields(): string[] {
    const missing: string[] = [];
    if (!this.hireForm.candidateName?.trim()) missing.push('Candidate Name');
    if (!this.hireForm.mobile?.trim() || this.hireForm.mobile.trim().length < 10) missing.push('10-digit Mobile');
    if (!this.hireForm.dateOfBirth) missing.push('Date of Birth');
    if (!this.hireForm.gender) missing.push('Gender');
    if (!this.hireForm.categoryId) missing.push('Category');
    if (!this.hireForm.religionId) missing.push('Religion');
    if (!this.hireForm.natureId) missing.push('Nature of Employment');
    if (!this.hireForm.aadhaarNo || this.hireForm.aadhaarNo.replace(/\D/g, '').length !== 12) missing.push('12-digit Aadhaar');
    if (!this.hireForm.panNo || this.hireForm.panNo.trim().length !== 10) missing.push('10-char PAN');
    if (!this.hireForm.bankAccNo || !this.hireForm.bankIfsc) missing.push('Bank Account & IFSC');
    return missing;
  }

  confirmHireAndTransfer(): void {
    if (this.hireAadhaarStatus === 'duplicate') {
      this.toastr.error(this.hireAadhaarMessage || 'Duplicate Aadhaar detected. Cannot proceed with hiring.', 'Duplicate Aadhaar');
      return;
    }
    if (this.hireAadhaarStatus === 'checking') {
      this.toastr.info('Aadhaar verification is in progress. Please wait a moment...', 'Verifying');
      return;
    }

    const missing = this.getMissingHireFields();
    if (missing.length > 0) {
      this.toastr.warning(`Please complete mandatory fields before hiring: ${missing.join(', ')}`, 'Incomplete Profile');
      return;
    }

    this.isHiringCandidate = true;
    this.loaderService.start();

    const payload = {
      appId: this.hireForm.appId,
      hiredBy: this.currentUserName,
      companyId: this.companyId,
      candidateName: this.hireForm.candidateName.trim(),
      fatherName: this.hireForm.fatherName?.trim() || null,
      motherName: this.hireForm.motherName?.trim() || null,
      gender: this.hireForm.gender,
      dateOfBirth: this.hireForm.dateOfBirth,
      mobile: this.hireForm.mobile.trim(),
      email: this.hireForm.email?.trim() || null,
      aadhaarNo: this.hireForm.aadhaarNo.replace(/\D/g, ''),
      panNo: this.hireForm.panNo.trim().toUpperCase(),
      bankAccNo: this.hireForm.bankAccNo.trim(),
      bankIfsc: this.hireForm.bankIfsc.trim().toUpperCase(),
      bankName: this.hireForm.bankName?.trim() || null,
      uanNo: this.hireForm.uanNo?.trim() || null,
      esicNo: this.hireForm.esicNo?.trim() || null,
      nomineeName: this.hireForm.nomineeName?.trim() || null,
      nomineeRelation: this.hireForm.nomineeRelation || null,
      nomineeContact: this.hireForm.nomineeContact?.trim() || null,
      categoryId: this.hireForm.categoryId ? this.hireForm.categoryId.toString() : null,
      religionId: this.hireForm.religionId ? this.hireForm.religionId.toString() : null,
      natureId: this.hireForm.natureId ? this.hireForm.natureId.toString() : null,
      departmentId: this.hireForm.departmentId ? this.hireForm.departmentId.toString() : null,
      designationId: this.hireForm.designationId ? this.hireForm.designationId.toString() : null,
      locationId: this.hireForm.locationId ? this.hireForm.locationId.toString() : null,
      costCenterId: this.hireForm.costCenterId ? Number(this.hireForm.costCenterId) : null
    };

    this.atsService.hireAndTransferCandidate(payload).subscribe({
      next: (res: any) => {
        this.loaderService.stop();
        this.isHiringCandidate = false;
        if (res && (res.success === false || res.Success === 0)) {
          this.toastr.error(res.message || res.Message || 'Failed to complete employee creation.', 'Transfer Error');
          return;
        }

        const assignedCode = res?.employeeCode || res?.EmployeeCode || '';
        const empId = res?.empId || res?.pk_empid || '';
        if (this.selectedCandidate && this.selectedCandidate.appId === this.hireForm.appId) {
          this.selectedCandidate.employeeCode = assignedCode;
          this.selectedCandidate.stage = 'Hired';
        }
        if (this.candidateRoster && Array.isArray(this.candidateRoster)) {
          const cand = this.candidateRoster.find(c => c.appId === this.hireForm.appId);
          if (cand) {
            cand.employeeCode = assignedCode;
            cand.stage = 'Hired';
          }
        }
        this.toastr.success(
          `Candidate ${this.hireForm.candidateName} successfully hired! Generated Employee Code: ${assignedCode} (ID: ${empId})`,
          'Onboarding Complete'
        );
        this.closeHireModal();
        this.loadPipelineRoster();
      },
      error: (err: any) => {
        this.loaderService.stop();
        this.isHiringCandidate = false;
        const msg = err?.error?.message || 'Error occurred during employee creation and transfer.';
        this.toastr.error(msg, 'Transfer Failed');
      }
    });
  }

  // =========================================================================
  // STEPS 14 & 15: CANDIDATE LIFECYCLE AUDIT TRAIL TIMELINE
  // =========================================================================

  openAuditDrawer(candidate: any): void {
    if (!candidate) return;
    this.selectedCandidate = candidate;
    this.auditTrail = [];
    this.showAuditDrawer = true;
    this.cdr.detectChanges();

    const appId = candidate.appId || candidate.applicationId || candidate.id || this.selectedCandidate?.appId;
    if (!appId) {
      this.toastr.warning('Candidate application ID not found.');
      return;
    }

    this.atsService.getCandidateAuditTrail(appId, this.companyId).subscribe({
      next: (logs) => {
        this.auditTrail = logs || [];
        this.showAuditDrawer = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load audit history.');
        this.cdr.detectChanges();
      }
    });
  }

  closeAuditDrawer(): void {
    this.showAuditDrawer = false;
    this.cdr.detectChanges();
  }

  openCandidateDetails(candidate: any): void {
    if (!candidate) return;
    this.selectedCandidateDetails = { ...candidate };
    this.showCandidateDetailsModal = true;
    this.detailsCandidateDocs = [];
    this.isLoadingDetailsDocs = true;

    const appId = candidate.appId || candidate.pk_appId;
    if (appId) {
      this.atsService.getCandidateDocuments(appId, this.companyId).subscribe({
        next: (res: any) => {
          this.isLoadingDetailsDocs = false;
          if (res && res.success) {
            if (res.candidate) {
              // Merge vendor entered fields into selectedCandidateDetails
              this.selectedCandidateDetails = {
                ...this.selectedCandidateDetails,
                ...res.candidate
              };
            }
            this.detailsCandidateDocs = res.documents || [];
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingDetailsDocs = false;
          this.cdr.detectChanges();
        }
      });
    }
    this.cdr.detectChanges();
  }

  closeCandidateDetails(): void {
    this.showCandidateDetailsModal = false;
    this.selectedCandidateDetails = null;
    this.detailsCandidateDocs = [];
    this.isLoadingDetailsDocs = false;
    this.cdr.detectChanges();
  }

  openDetailsDoc(doc: any): void {
    if (!doc.fileName && !doc.filePath) {
      this.toastr.info('No document file attached to view.', 'Empty');
      return;
    }
    const appId = doc.appId || this.selectedCandidateDetails?.appId;
    const viewUrl = this.atsService.getDocumentViewUrl(doc.docId, appId, doc.docTypeCode);
    window.open(viewUrl, '_blank');
  }

  // =========================================================================
  // ASSIGN STAFFING VENDOR (Company-wise & Location-wise)
  // =========================================================================
  openAssignVendorModal(candidate: any, pendingStage?: string): void {
    if (!candidate) return;
    this.assignVendorCandidate = candidate;
    this.selectedVendorForAssignment = candidate.vendorId || '';
    this.assignVendorRemarks = '';
    this.pendingTargetStage = pendingStage || null;
    this.showAssignVendorModal = true;
    this.isLoadingVendors = true;
    this.assignVendorList = [];

    const targetLoc = candidate.operatingHub || candidate.currentLocation || candidate.locationId || (this.selectedJob ? (this.selectedJob.locationName || this.selectedJob.locName || this.selectedJob.locname) : '');
    const targetReqId = candidate.reqId || candidate.fk_reqid || (this.selectedJob ? (this.selectedJob.reqId || this.selectedJob.pk_reqid) : undefined);
    const targetCompanyId = candidate.companyId || candidate.fk_companyId || (this.selectedJob ? (this.selectedJob.companyId || this.selectedJob.fk_companyId) : '') || this.companyId;

    this.atsService.getVendorsByLocation(targetCompanyId, targetLoc, targetReqId).subscribe({
      next: (vendors) => {
        this.isLoadingVendors = false;
        this.assignVendorList = vendors || [];
        if (!this.selectedVendorForAssignment && this.assignVendorList.length > 0) {
          this.selectedVendorForAssignment = this.assignVendorList[0].vendorId;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingVendors = false;
        console.error('Error fetching vendors by location:', err);
        this.toastr.error('Failed to load empanelled staffing vendors.');
        this.cdr.detectChanges();
      }
    });
    this.cdr.detectChanges();
  }

  closeAssignVendorModal(): void {
    this.showAssignVendorModal = false;
    this.assignVendorCandidate = null;
    this.pendingTargetStage = null;
    this.cdr.detectChanges();
  }

  submitAssignVendor(): void {
    if (!this.assignVendorCandidate || !this.selectedVendorForAssignment) {
      this.toastr.warning('Please select a staffing vendor to assign.', 'Selection Required');
      return;
    }

    const selectedVendor = this.assignVendorList.find(v => v.vendorId === this.selectedVendorForAssignment);
    const vendorName = selectedVendor ? selectedVendor.vendorName : 'Staffing Partner';

    const payload = {
      appId: this.assignVendorCandidate.appId,
      vendorId: this.selectedVendorForAssignment,
      vendorName: vendorName,
      assignedBy: this.currentUserName,
      remarks: this.assignVendorRemarks,
      companyId: this.companyId
    };

    this.isAssigningVendor = true;
    this.atsService.assignVendorToCandidate(payload).subscribe({
      next: (res: any) => {
        this.isAssigningVendor = false;
        this.toastr.success(`Staffing vendor [${vendorName}] assigned to ${this.assignVendorCandidate.candidateName} successfully!`, 'Vendor Assigned');

        // Update in-memory candidate details
        if (this.assignVendorCandidate) {
          this.assignVendorCandidate.vendorId = this.selectedVendorForAssignment;
          this.assignVendorCandidate.vendorName = vendorName;
          this.assignVendorCandidate.sourceType = 'Vendor';
        }
        if (this.selectedCandidateDetails && this.selectedCandidateDetails.appId === this.assignVendorCandidate.appId) {
          this.selectedCandidateDetails.vendorId = this.selectedVendorForAssignment;
          this.selectedCandidateDetails.vendorName = vendorName;
          this.selectedCandidateDetails.sourceType = 'Vendor';
        }

        const nextStageToProceed = this.pendingTargetStage;
        const candidateToProceed = this.assignVendorCandidate;
        this.closeAssignVendorModal();
        this.loadPipelineRoster();

        // If there was a pending stage progression, proceed directly!
        if (nextStageToProceed && candidateToProceed) {
          this.quickMoveStage(candidateToProceed, nextStageToProceed);
        }
      },
      error: (err: any) => {
        this.isAssigningVendor = false;
        const errMsg = err?.error?.message || err?.message || 'Failed to assign staffing vendor.';
        this.toastr.error(errMsg, 'Assignment Error');
      }
    });
  }

  // =========================================================================
  // JOB REQUISITION DETAILS SLIDE-OVER DRAWER (Mirroring MRF List)
  // =========================================================================
  showJobDetailDrawer: boolean = false;
  selectedJobForDetail: any = null;

  openJobDetail(job: any): void {
    if (!job) return;
    this.selectedJobForDetail = job;
    this.showJobDetailDrawer = true;
    this.cdr.detectChanges();
  }

  closeJobDetail(): void {
    this.showJobDetailDrawer = false;
    this.selectedJobForDetail = null;
    this.cdr.detectChanges();
  }

  // =========================================================================
  // CANDIDATE TAGGING & CLASSIFICATION (Step 2, 7, 8)
  // =========================================================================

  openTagModal(candidate: any): void {
    this.selectedCandidate = candidate;
    this.tagForm = {
      appId: candidate.appId,
      reqId: candidate.reqId || (this.selectedJob ? this.selectedJob.reqId : 0),
      candidateName: candidate.candidateName,
      mrfCode: candidate.mrfCode || (this.selectedJob ? this.selectedJob.mrfCode : ''),
      skillClassification: candidate.skillClassification || 'Semi-Skilled',
      isDiversityHiring: !!candidate.isDiversityHiring,
      candidateTags: candidate.candidateTags || '',
      assignedReviewer: candidate.assignedReviewer || 'Site HR',
      remarks: ''
    };
    this.showTagModal = true;
  }

  submitTagCandidate(): void {
    if (!this.tagForm.appId) return;

    const payload = {
      appId: this.tagForm.appId,
      reqId: this.tagForm.reqId,
      skillClassification: this.tagForm.skillClassification,
      candidateTags: this.tagForm.candidateTags,
      isDiversityHiring: this.tagForm.isDiversityHiring,
      assignedReviewer: this.tagForm.assignedReviewer,
      remarks: this.tagForm.remarks,
      taggedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.tagCandidate(payload).subscribe({
      next: () => {
        this.toastr.success(`Candidate tagged successfully (${this.tagForm.skillClassification}).`, 'Tagging Updated');
        this.showTagModal = false;
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to update candidate tags.')
    });
  }

  closeTagModal(): void {
    this.showTagModal = false;
  }

  // =========================================================================
  // STAGE PROGRESSION - MOVE TO NEXT STAGES (Company-Configured DB Workflow)
  // =========================================================================

  /** Get the human-readable label for any stage code */
 getStageLabel(stageCode: string): string {
  if (!stageCode) return '';
  // Map Docs_Verified to Docs_Submitted label
  if (stageCode === 'Docs_Verified' || stageCode === 'DOCS') {
    const docsStage = this.stages.find(st => st.code === 'Docs_Submitted');
    if (docsStage) return docsStage.label;
  }
  const s = this.stages.find(st => st.code === stageCode) || 
            this.allStageConfigs.find((st: any) => (st.stageCode || st.StageCode) === stageCode);
  return s ? (s.label || s.stageLabel || s.StageLabel) : stageCode.replace(/_/g, ' ');
}

  /**
   * Find the exact next enabled stage configured in the database for this company.
   * Strictly enforces moving step-by-step according to company stage configurations.
   */
  // getNextStageForCandidate(candidate: any): { code: string; label: string; icon: string; color: string } | null {
  //   if (!candidate || !this.stages || this.stages.length === 0) return null;
  //   const currentCode = (candidate.stage === 'Hold' || candidate.stage === 'Interview_Completed') ? 'Interview_Scheduled' : candidate.stage;
  //   if (currentCode === 'Hired' || currentCode === 'Rejected') return null;

  //   const currentIndex = this.stages.findIndex(s => s.code === currentCode);
  //   if (currentIndex >= 0 && currentIndex < this.stages.length - 1) {
  //     return this.stages[currentIndex + 1];
  //   }
  //   // If candidate's current stage is not found in active stages, fallback to the first active stage
  //   if (currentIndex === -1 && this.stages.length > 0) {
  //     return this.stages[0];
  //   }
  //   return null;
  // }
  getNextStageForCandidate(candidate: any): { code: string; label: string; icon: string; color: string } | null {
  if (!candidate || !this.stages || this.stages.length === 0) return null;
  
  // 1. Normalize interview sub-stages
  let currentCode = (candidate.stage === 'Hold' || candidate.stage === 'Interview_Completed') ? 'Interview_Scheduled' : candidate.stage;
  
  // 2. Map verified documents to the base Docs stage ('Docs_Submitted')
  if (currentCode === 'Docs_Verified' || currentCode === 'DOCS') {
    currentCode = 'Docs_Submitted';
  }

  if (currentCode === 'Hired' || currentCode === 'Rejected') return null;

  // 3. Find current stage index (now correctly finds index 3 for Docs)
  const currentIndex = this.stages.findIndex(s => s.code === currentCode);
  if (currentIndex >= 0 && currentIndex < this.stages.length - 1) {
    // Returns index 4 -> 'Offer_Issued' ('5. Offer Sent')
    return this.stages[currentIndex + 1];
  }

  // 4. Removed the dangerous stages[0] fallback
  return null;
}

  openStageMoveModal(candidate: any): void {
    if (!candidate) return;
    this.selectedCandidate = candidate;
    const nextStage = this.getNextStageForCandidate(candidate);
    if (!nextStage) {
      this.toastr.info(`Candidate is already at the final stage (${this.getStageLabel(candidate.stage)}) or no further stage is configured in DB.`, 'Final Stage');
      return;
    }

    // MANDATORY INTERCEPT: If moving from 'Selected' to 'Docs Review' (Docs_Submitted),
    // we must collect candidate documents first!
    if (candidate.stage === 'Selected' && (nextStage.code === 'Docs_Submitted' || nextStage.code === 'DOCS')) {
      this.openDocsModal(candidate);
      return;
    }

    // MANDATORY INTERCEPT: If candidate is currently in 'Docs_Submitted' or 'Docs_Verified' (Docs Review),
    // ALL mandatory documents must be verified and approved, and ALL uploaded documents must be viewed before moving to Offer Letter!
    if (candidate.stage === 'Docs_Submitted' || candidate.stage === 'Docs_Verified' || candidate.stage === 'DOCS') {
      const isAdvancingToOffer = nextStage.code === 'Offer_Issued' || nextStage.code === 'Offer_Letter';
      this.atsService.getCandidateDocuments(candidate.appId, this.companyId).subscribe({
        next: (res: any) => {
          if (res && res.success) {
            const docs: any[] = res.documents || [];
            const unapproved = docs.filter((d: any) => d.isMandatory && d.verificationStatus !== 'Approved');
            if (unapproved.length > 0) {
              const names = unapproved.map((d: any) => d.docTypeName).join(', ');
              this.toastr.warning(`Cannot advance past Docs Review: ${unapproved.length} mandatory document(s) still require approval (${names}). Opening Document Verification Suite...`, 'Verification Required');
              this.openDocsModal(candidate);
              return;
            }

            if (isAdvancingToOffer) {
              const uploaded = docs.filter((d: any) => (d.fileName && d.fileName.trim() !== '') || (d.filePath && d.filePath.trim() !== ''));
              const unviewed = uploaded.filter((d: any) => !d.isViewed && d.isViewed !== 1 && d.isViewed !== 'true' && (!this.getDocKey(d) || !this.viewedDocKeys.has(this.getDocKey(d))));
              if (unviewed.length > 0) {
                const names = unviewed.map((d: any) => d.docTypeName || d.docTypeCode).join(', ');
                this.toastr.warning(`Cannot advance to Offer Letter: All uploaded documents must be viewed/inspected in Docs Review (${uploaded.length - unviewed.length}/${uploaded.length} viewed). Please review: ${names}. Opening Document Review...`, 'Document Review Required');
                this.openDocsModal(candidate);
                return;
              }
            }
          }
          this.proceedOpenStageMoveModal(candidate, nextStage);
        },
        error: () => this.proceedOpenStageMoveModal(candidate, nextStage)
      });
      return;
    }

    // MANDATORY INTERCEPT: If candidate is currently in 'Applied',
    // a staffing vendor MUST be assigned before advancing!
    if (candidate.stage === 'Applied' && (!candidate.vendorId || !candidate.vendorId.toString().trim())) {
      this.toastr.warning(`Cannot advance candidate [${candidate.candidateName}] from Applied stage: A staffing vendor must be assigned first.`, 'Staffing Vendor Required');
      this.openAssignVendorModal(candidate, nextStage.code);
      return;
    }

    this.proceedOpenStageMoveModal(candidate, nextStage);
  }

  proceedOpenStageMoveModal(candidate: any, nextStage: any): void {
    this.stageMoveForm = {
      appId: candidate.appId,
      candidateName: candidate.candidateName,
      applicationNo: candidate.applicationNo || ('APP-' + candidate.appId),
      jobTitle: candidate.jobTitle || this.selectedJob?.designationName || 'Position Candidate',
      currentStage: candidate.stage,
      currentStageLabel: this.getStageLabel(candidate.stage),
      recommendedStage: nextStage.code,
      targetStage: nextStage.code,
      targetStageLabel: nextStage.label,
      remarks: ''
    };
    this.showStageMoveModal = true;
    this.cdr.detectChanges();
  }

  onTargetStageChange(newStageCode: string): void {
    this.stageMoveForm.targetStage = newStageCode;
    this.stageMoveForm.targetStageLabel = this.getStageLabel(newStageCode);
  }

  setStageMoveRemark(preset: string): void {
    if (this.stageMoveForm.remarks) {
      this.stageMoveForm.remarks += ', ' + preset;
    } else {
      this.stageMoveForm.remarks = preset;
    }
  }

  quickMoveCandidateToNextStage(candidate: any): void {
    const nextStage = this.getNextStageForCandidate(candidate);
    if (!nextStage) {
      this.toastr.info('No subsequent step configured in DB for this candidate.');
      return;
    }
    // Intercept quick move from Applied if vendor is not assigned
    if (candidate.stage === 'Applied' && (!candidate.vendorId || !candidate.vendorId.toString().trim())) {
      this.toastr.warning(`Cannot advance candidate [${candidate.candidateName}] from Applied stage: A staffing vendor must be assigned first.`, 'Staffing Vendor Required');
      this.openAssignVendorModal(candidate, nextStage.code);
      return;
    }
    // Intercept quick move from Selected to Docs Review as well
    if (candidate.stage === 'Selected' && (nextStage.code === 'Docs_Submitted' || nextStage.code === 'DOCS')) {
      this.openDocsModal(candidate);
      return;
    }
    // Intercept quick move from Docs Review to ensure all documents are approved and viewed
    if (candidate.stage === 'Docs_Submitted' || candidate.stage === 'Docs_Verified' || candidate.stage === 'DOCS') {
      this.openStageMoveModal(candidate);
      return;
    }
    this.quickMoveStage(candidate, nextStage.code);
  }

  quickMoveStage(candidate: any, targetStage: string): void {
    // Intercept quick move from Applied if vendor is not assigned
    if (candidate.stage === 'Applied' && targetStage !== 'Applied' && targetStage !== 'Rejected') {
      if (!candidate.vendorId || !candidate.vendorId.toString().trim()) {
        this.toastr.warning(`Cannot advance candidate [${candidate.candidateName}] from Applied stage: A staffing vendor must be assigned first.`, 'Staffing Vendor Required');
        this.openAssignVendorModal(candidate, targetStage);
        return;
      }
    }

    const targetLabel = this.getStageLabel(targetStage);
    const payload = {
      appId: candidate.appId,
      targetStage: targetStage,
      remarks: `Quick transition to ${targetLabel} stage confirmed by recruiter`,
      movedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.moveCandidateStage(payload).subscribe({
      next: (res: any) => {
        if (res && (res.success === false || res.Success === 0)) {
          this.toastr.error(res.message || res.Message || 'Failed to move candidate stage.', 'Validation Alert');
          return;
        }
        this.toastr.success(`Candidate advanced to ${targetLabel} stage!`, 'Stage Updated');
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to transition candidate stage.')
    });
  }

  submitStageMove(): void {
    if (!this.stageMoveForm.targetStage) {
      this.toastr.warning('Target stage is missing.');
      return;
    }

    // Intercept moving from Applied without vendor
    if (this.stageMoveForm.currentStage === 'Applied' && this.stageMoveForm.targetStage !== 'Applied' && this.stageMoveForm.targetStage !== 'Rejected') {
      const cand = this.candidateRoster.find(c => c.appId === this.stageMoveForm.appId) || this.selectedCandidate;
      if (!cand?.vendorId || !cand.vendorId.toString().trim()) {
        this.toastr.warning(`Cannot advance candidate [${this.stageMoveForm.candidateName}] from Applied stage: A staffing vendor must be assigned first.`, 'Staffing Vendor Required');
        this.showStageMoveModal = false;
        this.openAssignVendorModal(cand, this.stageMoveForm.targetStage);
        return;
      }
    }

    // If moving to Hired stage, trigger official onboarding transfer to Employee Master
    if (this.stageMoveForm.targetStage === 'Hired' || this.stageMoveForm.targetStage === 'HIRED') {
      const candidate = this.selectedCandidate;
      this.showStageMoveModal = false;
      this.hireCandidate(candidate);
      return;
    }

    // Intercept moving to Offer Letter from Docs Review without viewing all documents
    if (this.stageMoveForm.targetStage === 'Offer_Issued' || this.stageMoveForm.targetStage === 'Offer_Letter') {
      const cand = this.candidateRoster.find(c => c.appId === this.stageMoveForm.appId) || this.selectedCandidate;
      if (cand && (cand.stage === 'Docs_Submitted' || cand.stage === 'Docs_Verified' || cand.stage === 'DOCS')) {
        this.verifyCandidateDocsViewedBeforeOffer(cand).subscribe((result: any) => {
          if (!result.allViewed) {
            const names = result.unviewedNames.length > 0 ? `: ${result.unviewedNames.join(', ')}` : '';
            this.toastr.warning(
              `Cannot advance candidate to Offer Letter: All uploaded candidate documents must be viewed/inspected in Docs Review (${result.viewedCount}/${result.totalUploaded} viewed)${names}. Opening Document Review...`,
              'Document Review Required'
            );
            this.showStageMoveModal = false;
            this.openDocsModal(cand);
            return;
          }
          this.executeSubmitStageMove();
        });
        return;
      }
    }

    this.executeSubmitStageMove();
  }

  executeSubmitStageMove(): void {
    const payload = {
      appId: this.stageMoveForm.appId,
      targetStage: this.stageMoveForm.targetStage,
      remarks: this.stageMoveForm.remarks || `Moved to ${this.stageMoveForm.targetStageLabel || this.stageMoveForm.targetStage}`,
      movedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.loaderService.start();
    this.atsService.moveCandidateStage(payload).subscribe({
      next: (res: any) => {
        this.loaderService.stop();
        if (res && (res.success === false || res.Success === 0)) {
          this.toastr.error(res.message || res.Message || 'Failed to move candidate stage.', 'Validation Alert');
          return;
        }
        const label = this.stageMoveForm.targetStageLabel || this.getStageLabel(this.stageMoveForm.targetStage);
        this.toastr.success(`Candidate moved to ${label} stage.`, 'Stage Progression');
        this.showStageMoveModal = false;
        this.cdr.detectChanges();
        this.loadPipelineRoster();
      },
      error: () => {
        this.loaderService.stop();
        this.toastr.error('Failed to move candidate stage.');
      }
    });
  }

  closeStageMoveModal(): void {
    this.showStageMoveModal = false;
    this.cdr.detectChanges();
  }

  // =========================================================================
  // MULTI-CANDIDATE SELECTION & BATCH STAGE PROGRESSION
  // =========================================================================

  isCandidateSelected(candidate: any): boolean {
    if (!candidate || !candidate.appId) return false;
    return this.selectedCandidateIds.has(Number(candidate.appId));
  }

  toggleCandidateSelection(candidate: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!candidate || !candidate.appId) return;

    if (this.isCandidateRejected(candidate)) {
      this.toastr.warning('Rejected candidate is locked and cannot be selected for stage progression.', 'Locked Candidate');
      return;
    }
    if (candidate.stage === 'Hired') {
      this.toastr.info('Candidate is already hired and completed the lifecycle.', 'Joined');
      return;
    }

    const appId = Number(candidate.appId);
    const newSet = new Set(this.selectedCandidateIds);
    if (newSet.has(appId)) {
      newSet.delete(appId);
    } else {
      newSet.add(appId);
    }
    this.selectedCandidateIds = newSet;
  }

  getActiveCandidatesInCurrentStage(): any[] {
    return this.getCandidatesForSelectedStage().filter(
      c => !this.isCandidateRejected(c) && c.stage !== 'Hired'
    );
  }

  areAllInSelectedStageSelected(): boolean {
    const active = this.getActiveCandidatesInCurrentStage();
    if (active.length === 0) return false;
    return active.every(c => this.selectedCandidateIds.has(Number(c.appId)));
  }

  isSomeInSelectedStageSelected(): boolean {
    if (this.areAllInSelectedStageSelected()) return false;
    const active = this.getActiveCandidatesInCurrentStage();
    return active.some(c => this.selectedCandidateIds.has(Number(c.appId)));
  }

  toggleSelectAllInStage(event?: any): void {
    if (event) {
      event.stopPropagation();
    }
    const active = this.getActiveCandidatesInCurrentStage();
    if (active.length === 0) return;

    const newSet = new Set(this.selectedCandidateIds);
    if (this.areAllInSelectedStageSelected()) {
      active.forEach(c => newSet.delete(Number(c.appId)));
    } else {
      active.forEach(c => newSet.add(Number(c.appId)));
    }
    this.selectedCandidateIds = newSet;
  }

  clearSelection(): void {
    this.selectedCandidateIds = new Set<number>();
  }

  getSelectedCandidatesCount(): number {
    return this.selectedCandidateIds.size;
  }

  getSelectedCandidates(): any[] {
    return this.candidateRoster.filter(c => this.selectedCandidateIds.has(Number(c.appId)));
  }

  batchMoveSelectedToNextStage(): void {
    const candidates = this.getSelectedCandidates().filter(c => !this.isCandidateRejected(c) && c.stage !== 'Hired');
    if (candidates.length === 0) {
      this.toastr.warning('Please select at least one active candidate to advance.', 'No Selection');
      return;
    }

    const eligibleCandidates = candidates.filter(c => this.getNextStageForCandidate(c) !== null);
    if (eligibleCandidates.length === 0) {
      this.toastr.info('Selected candidates are already at their final configured stage.', 'Final Stage');
      return;
    }

    // If candidates are advancing to Offer Letter (e.g. from Docs Review), route to Offer Letter Wizard
    const isAdvancingToOffer = eligibleCandidates.some(c => {
      const nextStage = this.getNextStageForCandidate(c);
      return (
        (nextStage && (nextStage.code === 'Offer_Issued' || nextStage.code === 'Offer_Letter')) ||
        c.stage === 'Docs_Submitted' || c.stage === 'Docs_Verified' || c.stage === 'DOCS' ||
        this.activeStageFilter === 'DOCS' || this.activeStageFilter === 'Docs_Submitted' || this.activeStageFilter === 'Docs_Verified'
      );
    });

    if (isAdvancingToOffer) {
      this.openBulkOfferModal();
      return;
    }

    this.executeBatchMoveObservables(eligibleCandidates);
  }

  executeBatchMoveObservables(eligibleCandidates: any[]): void {
    this.isBatchMoving = true;
    this.loaderService.start();
    const moveObservables = eligibleCandidates.map(c => {
      const nextStage = this.getNextStageForCandidate(c)!;
      const payload = {
        appId: c.appId,
        targetStage: nextStage.code,
        remarks: `Bulk stage transition to ${nextStage.label} confirmed by recruiter`,
        movedBy: this.currentUserName,
        companyId: this.companyId
      };
      return this.atsService.moveCandidateStage(payload).pipe(
        catchError(err => of({ error: true, candidate: c, err }))
      );
    });

    forkJoin(moveObservables).subscribe({
      next: (results: any[]) => {
        this.loaderService.stop();
        this.isBatchMoving = false;
        const failed = results.filter(r => r && r.error).length;
        const successful = results.length - failed;

        if (successful > 0) {
          this.toastr.success(`Advanced ${successful} candidate(s) to their next stage successfully!`, 'Batch Movement Complete');
        }
        if (failed > 0) {
          this.toastr.error(`Failed to transition ${failed} candidate(s).`, 'Partial Failure');
        }

        this.clearSelection();
        this.loadPipelineRoster();
      },
      error: () => {
        this.loaderService.stop();
        this.isBatchMoving = false;
        this.toastr.error('Encountered an error during batch movement.');
      }
    });
  }

  // =========================================================================
  // REJECT CANDIDATE WITH MANDATORY REMARKS & REASON (Step 9 & 15)
  // =========================================================================

  openRejectModal(candidate: any): void {
    this.selectedCandidate = candidate;
    this.rejectForm = {
      appId: candidate.appId,
      candidateName: candidate.candidateName,
      applicationNo: candidate.applicationNo || `APP-${candidate.appId}`,
      currentStage: candidate.stage,
      rejectionReason: 'Skill Mismatch / Assessment Failed',
      remarks: '',
      cooloffPolicy: '90_Days',
      notifyCandidate: true
    };
    this.showRejectModal = true;
  }

  submitRejectCandidate(): void {
    if (!this.rejectForm.remarks || !this.rejectForm.remarks.trim()) {
      this.toastr.warning('Please enter rejection remarks.', 'Remarks Required');
      return;
    }

    const payload = {
      appId: this.rejectForm.appId,
      rejectionReason: this.rejectForm.remarks.trim(),
      remarks: this.rejectForm.remarks.trim(),
      cooloffPolicy: '90_Days',
      notifyCandidate: true,
      rejectedBy: this.currentUserName,
      companyId: this.companyId
    };

    this.atsService.rejectCandidate(payload).subscribe({
      next: () => {
        this.toastr.warning(`Candidate ${this.rejectForm.candidateName} marked as Rejected.`, 'Candidate Rejected');
        this.showRejectModal = false;
        this.loadPipelineRoster();
      },
      error: () => this.toastr.error('Failed to record candidate rejection.')
    });
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
  }
}
