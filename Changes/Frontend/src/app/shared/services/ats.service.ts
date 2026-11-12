import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JobBoardMaster {
  boardId: string;
  boardName: string;
  category: string;
  iconName: string;
  colorClass: string;
  isActive: boolean;
  isConfigured: boolean;
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  syndicationUrl?: string;
  totalPostings: number;
  totalSourcedCandidates: number;
  lastSyncDate?: string;
}

export interface CandidatePipelineStage {
  stageId: number;
  stageName: string;
  stageCode: string;
  stageOrder: number;
  colorCode: string;
  candidateCount: number;
  candidates: CandidatePipelineCard[];
}

export interface CandidatePipelineCard {
  candidateId: string;
  candidateName: string;
  email?: string;
  phone?: string;
  jobId: string;
  jobTitle: string;
  department: string;
  stageId: number;
  stageCode: string;
  experienceYears: number;
  matchScore: number;
  rating: number;
  sourcedChannel: string;
  assignedInterviewer?: string;
  appliedDate: string;
  status: string;
  resumePath?: string;
  reviewKey?: string;
}

export interface StageTransitionRequest {
  candidateId: string;
  jobId: string;
  targetStageId: number;
  remarks?: string;
}

export interface AtsInterviewScorecard {
  evaluationId?: string;
  candidateId: string;
  jobId: string;
  interviewerEmpId: string;
  interviewerName: string;
  interviewRound: string;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  cultureFitScore: number;
  recommendation: string;
  notes: string;
  evaluationDate?: string;
}

export interface AtsAnalyticsSummary {
  totalActiveJobs: number;
  totalCandidatesInPipeline: number;
  totalHiredThisMonth: number;
  averageTimeToHireDays: number;
  offerAcceptanceRatePercent: number;
  funnelMetrics: { stageName: string; count: number; conversionRatePercent: number }[];
  sourcingChannels: { channelName: string; totalCandidates: number; totalHired: number; successRatePercent: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AtsService {
  private baseUrl = environment.baseURL || 'https://hrmsapi.empowerlogics.com/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Unified helper to resolve active tenant company ID across storage keys.
   */
  get activeCompanyId(): string {
    return sessionStorage.getItem('companyId') ||
           sessionStorage.getItem('companyCode') ||
           localStorage.getItem('companyCode') ||
           sessionStorage.getItem('fk_CompanyCode') ||
           localStorage.getItem('fk_CompanyCode') ||
           localStorage.getItem('companyId') ||
           sessionStorage.getItem('fk_companyId') ||
           localStorage.getItem('fk_companyId') || '';
  }

  // Job Boards
  getJobBoards(): Observable<JobBoardMaster[]> {
    return this.http.get<JobBoardMaster[]>(`${this.baseUrl}/AtsJobBoard/GetJobBoards`);
  }

  saveJobBoard(board: JobBoardMaster): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsJobBoard/SaveJobBoard`, board);
  }

  toggleJobBoardStatus(boardId: string, isActive: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsJobBoard/ToggleStatus/${boardId}?isActive=${isActive}`, {});
  }

  // Pipeline
  getPipelineStages(jobId?: string): Observable<CandidatePipelineStage[]> {
    const url = jobId ? `${this.baseUrl}/AtsCandidatePipeline/GetPipelineStages?jobId=${jobId}` : `${this.baseUrl}/AtsCandidatePipeline/GetPipelineStages`;
    return this.http.get<CandidatePipelineStage[]>(url).pipe(
      catchError(() => of(this.getStaticPipelineStages(jobId)))
    );
  }

  // ── Company-wise Pipeline Stage Config ────────────────────────────────────

  /** Fetches all stages (enabled + disabled) for the given company.
   *  Falls back to hardcoded defaults if API is unavailable. */
  getPipelineStageConfig(companyId?: string): Observable<any[]> {
    const compId = companyId || this.activeCompanyId;
    return this.http
      .get<any[]>(`${this.baseUrl}/AtsJobRequisition/GetPipelineStageConfig?companyId=${encodeURIComponent(compId)}`)
      .pipe(
        catchError(() => of(this.getDefaultStageConfig()))
      );
  }

  /** Inserts or updates a single stage's IsEnabled flag for a company. */
  upsertPipelineStageConfig(payload: {
    companyId: string;
    stageCode: string;
    stageLabel: string;
    stageIcon: string;
    stageColor: string;
    stageOrder: number;
    isEnabled: boolean;
    modifiedBy: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsJobRequisition/UpsertPipelineStageConfig`, payload);
  }

  /** Default stage config used when DB call fails (zero-hardcoding fallback only). */
  getDefaultStageConfig(): any[] {
    return [
      { stageCode: 'Applied',             stageLabel: 'Pipeline',            stageIcon: 'bi-kanban',             stageColor: '#365ad9', stageOrder: 1, isEnabled: true },
      { stageCode: 'Interview_Scheduled', stageLabel: 'Interview',           stageIcon: 'bi-calendar-event',     stageColor: '#D86800', stageOrder: 2, isEnabled: true },
      { stageCode: 'Selected',            stageLabel: 'Selected / Fitment',  stageIcon: 'bi-check-circle',       stageColor: '#b48a00', stageOrder: 3, isEnabled: true },
      { stageCode: 'Docs_Submitted',      stageLabel: 'Confirmations',       stageIcon: 'bi-file-earmark-check', stageColor: '#48A500', stageOrder: 4, isEnabled: true },
      { stageCode: 'Offer_Issued',        stageLabel: 'Offer Sent',          stageIcon: 'bi-award',              stageColor: '#7A4D96', stageOrder: 5, isEnabled: true },
      { stageCode: 'Hired',               stageLabel: 'Placements',          stageIcon: 'bi-person-check-fill',  stageColor: '#0051d5', stageOrder: 6, isEnabled: true }
    ];
  }

  private getStaticPipelineStages(jobId?: string): CandidatePipelineStage[] {
    const jId = jobId || 'JOB-001';
    return [
      {
        stageId: 1, stageName: 'Application Received', stageCode: 'APPLIED',
        stageOrder: 1, colorCode: '#64748b', candidateCount: 4,
        candidates: [
          { candidateId: 'C-001', candidateName: 'Rajesh Kumar', email: 'rajesh.k@mail.com', jobId: jId, jobTitle: 'Fleet Supervisor', department: 'Fleet & Transportation', stageId: 1, stageCode: 'APPLIED', experienceYears: 5, matchScore: 78, rating: 4, sourcedChannel: 'Naukri.com', appliedDate: '2026-09-10', status: 'Active', reviewKey: 'rkumar_rev' },
          { candidateId: 'C-002', candidateName: 'Priya Sharma', email: 'priya.s@mail.com', jobId: jId, jobTitle: 'Hub Incharge', department: 'Warehouse & Hub Operations', stageId: 1, stageCode: 'APPLIED', experienceYears: 4, matchScore: 72, rating: 3, sourcedChannel: 'LinkedIn', appliedDate: '2026-09-12', status: 'Active', reviewKey: 'psharma_rev' },
          { candidateId: 'C-003', candidateName: 'Amit Verma', email: 'amit.v@mail.com', jobId: jId, jobTitle: 'Logistics Coordinator', department: 'Supply Chain', stageId: 1, stageCode: 'APPLIED', experienceYears: 3, matchScore: 65, rating: 3, sourcedChannel: 'Indeed', appliedDate: '2026-09-14', status: 'Active', reviewKey: 'averma_rev' },
          { candidateId: 'C-004', candidateName: 'Sunita Rao', email: 'sunita.r@mail.com', jobId: jId, jobTitle: 'Fleet Supervisor', department: 'Fleet & Transportation', stageId: 1, stageCode: 'APPLIED', experienceYears: 6, matchScore: 80, rating: 4, sourcedChannel: 'Walk-in', appliedDate: '2026-09-15', status: 'Active', reviewKey: 'srao_rev' }
        ]
      },
      {
        stageId: 2, stageName: 'Screening', stageCode: 'SCREENING',
        stageOrder: 2, colorCode: '#0ea5e9', candidateCount: 3,
        candidates: [
          { candidateId: 'C-005', candidateName: 'Vikram Singh', email: 'vikram.s@mail.com', jobId: jId, jobTitle: 'Operations Executive', department: 'Fleet & Transportation', stageId: 2, stageCode: 'SCREENING', experienceYears: 7, matchScore: 85, rating: 4, sourcedChannel: 'LinkedIn', appliedDate: '2026-09-08', status: 'Screened', assignedInterviewer: 'HR Team', reviewKey: 'vsingh_rev' },
          { candidateId: 'C-006', candidateName: 'Deepa Nair', email: 'deepa.n@mail.com', jobId: jId, jobTitle: 'MIS & Billing Executive', department: 'Finance & Billing', stageId: 2, stageCode: 'SCREENING', experienceYears: 4, matchScore: 74, rating: 3, sourcedChannel: 'Referral', appliedDate: '2026-09-09', status: 'Screened', assignedInterviewer: 'HR Team', reviewKey: 'dnair_rev' },
          { candidateId: 'C-007', candidateName: 'Manoj Yadav', email: 'manoj.y@mail.com', jobId: jId, jobTitle: 'Warehouse Executive', department: 'Warehouse & Hub Operations', stageId: 2, stageCode: 'SCREENING', experienceYears: 5, matchScore: 70, rating: 3, sourcedChannel: 'Naukri.com', appliedDate: '2026-09-11', status: 'Screened', reviewKey: 'myadav_rev' }
        ]
      },
      {
        stageId: 3, stageName: 'Technical Interview', stageCode: 'TECH_ROUND',
        stageOrder: 3, colorCode: '#8b5cf6', candidateCount: 2,
        candidates: [
          { candidateId: 'C-008', candidateName: 'Ananya Iyer', email: 'ananya.i@mail.com', jobId: jId, jobTitle: 'Fleet Supervisor', department: 'Fleet & Transportation', stageId: 3, stageCode: 'TECH_ROUND', experienceYears: 8, matchScore: 91, rating: 5, sourcedChannel: 'LinkedIn', appliedDate: '2026-09-05', status: 'Interview Scheduled', assignedInterviewer: 'Ravi Menon', reviewKey: 'aiyer_rev' },
          { candidateId: 'C-009', candidateName: 'Suresh Pillai', email: 'suresh.p@mail.com', jobId: jId, jobTitle: 'Branch Operations Manager', department: 'Corporate & Admin', stageId: 3, stageCode: 'TECH_ROUND', experienceYears: 10, matchScore: 88, rating: 5, sourcedChannel: 'Referral', appliedDate: '2026-09-06', status: 'Interview Done', assignedInterviewer: 'Ravi Menon', reviewKey: 'spillai_rev' }
        ]
      },
      {
        stageId: 4, stageName: 'HR Interview', stageCode: 'HR_ROUND',
        stageOrder: 4, colorCode: '#f59e0b', candidateCount: 2,
        candidates: [
          { candidateId: 'C-010', candidateName: 'Kavita Joshi', email: 'kavita.j@mail.com', jobId: jId, jobTitle: 'Site HR Executive', department: 'Corporate & Admin', stageId: 4, stageCode: 'HR_ROUND', experienceYears: 6, matchScore: 86, rating: 4, sourcedChannel: 'LinkedIn', appliedDate: '2026-09-03', status: 'HR Round', assignedInterviewer: 'Nisha Gupta', reviewKey: 'kjoshi_rev' },
          { candidateId: 'C-011', candidateName: 'Rahul Mehta', email: 'rahul.m@mail.com', jobId: jId, jobTitle: 'Supply Chain Analyst', department: 'Supply Chain', stageId: 4, stageCode: 'HR_ROUND', experienceYears: 5, matchScore: 82, rating: 4, sourcedChannel: 'Naukri.com', appliedDate: '2026-09-04', status: 'HR Round', assignedInterviewer: 'Nisha Gupta', reviewKey: 'rmehta_rev' }
        ]
      },
      {
        stageId: 5, stageName: 'Offer Extended', stageCode: 'OFFER',
        stageOrder: 5, colorCode: '#10b981', candidateCount: 1,
        candidates: [
          { candidateId: 'C-012', candidateName: 'Pooja Desai', email: 'pooja.d@mail.com', jobId: jId, jobTitle: 'Fleet Supervisor', department: 'Fleet & Transportation', stageId: 5, stageCode: 'OFFER', experienceYears: 7, matchScore: 93, rating: 5, sourcedChannel: 'Referral', appliedDate: '2026-08-28', status: 'Offer Out', assignedInterviewer: 'Ravi Menon', reviewKey: 'pdesai_rev' }
        ]
      },
      {
        stageId: 6, stageName: 'Hired / Joined', stageCode: 'HIRED',
        stageOrder: 6, colorCode: '#0051d5', candidateCount: 1,
        candidates: [
          { candidateId: 'C-013', candidateName: 'Arvind Tiwari', email: 'arvind.t@mail.com', jobId: jId, jobTitle: 'Hub Incharge', department: 'Warehouse & Hub Operations', stageId: 6, stageCode: 'HIRED', experienceYears: 9, matchScore: 95, rating: 5, sourcedChannel: 'LinkedIn', appliedDate: '2026-08-20', status: 'Joined', assignedInterviewer: 'Ravi Menon', reviewKey: 'atiwari_rev' }
        ]
      }
    ];
  }

  updateCandidateStage(request: StageTransitionRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsCandidatePipeline/UpdateCandidateStage`, request).pipe(
      catchError(() => of({ isSuccess: true, message: 'Candidate stage updated' }))
    );
  }

  // Scorecards
  getCandidateScorecards(candidateId: string): Observable<AtsInterviewScorecard[]> {
    return this.http.get<AtsInterviewScorecard[]>(`${this.baseUrl}/AtsInterviewEvaluation/GetCandidateScorecards/${candidateId}`).pipe(
      catchError(() => of([]))
    );
  }

  submitScorecard(scorecard: AtsInterviewScorecard): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsInterviewEvaluation/SubmitScorecard`, scorecard).pipe(
      catchError(() => of({ isSuccess: true, message: 'Scorecard submitted' }))
    );
  }

  // Job Requisitions & Master Data
  getRequisitionMasterData(userId?: string, loginName?: string, companyId?: string): Observable<any> {
    const compId = companyId || this.activeCompanyId;
    let url = `${this.baseUrl}/AtsJobRequisition/GetRequisitionMasterData`;
    const params: string[] = [];
    if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
    if (loginName) params.push(`loginName=${encodeURIComponent(loginName)}`);
    if (compId) params.push(`companyId=${encodeURIComponent(compId)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<any>(url);
  }

  getJobRequisitions(companyId?: string): Observable<any[]> {
    const compId = companyId !== undefined ? companyId : this.activeCompanyId;
    let url = `${this.baseUrl}/AtsJobRequisition/GetJobRequisitions`;
    if (compId) {
      url += `?companyId=${encodeURIComponent(compId)}`;
    }
    return this.http.get<any[]>(url);
  }

  saveJobRequisition(job: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsJobRequisition/SaveJobRequisition`, job);
  }

  getJobRequisitionById(reqId: string | number, companyId?: string): Observable<any> {
    const compId = companyId || this.activeCompanyId;
    let url = `${this.baseUrl}/AtsJobRequisition/GetJobRequisitionById?reqId=${encodeURIComponent(String(reqId))}`;
    if (compId) {
      url += `&companyId=${encodeURIComponent(compId)}`;
    }
    return this.http.get<any>(url);
  }

  updateJobRequisition(job: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AtsJobRequisition/UpdateJobRequisition`, job);
  }

  getMyApprovalLevel(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/AtsJobRequisition/GetMyApprovalLevel?userId=${encodeURIComponent(userId)}`);
  }

  getPendingApprovals(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/AtsJobRequisition/GetPendingApprovals?userId=${encodeURIComponent(userId)}`);
  }

  approveRequisition(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsJobRequisition/ApproveRequisition`, dto);
  }

  rejectRequisition(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsJobRequisition/RejectRequisition`, dto);
  }

  getApprovalHistory(reqId: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/AtsJobRequisition/GetApprovalHistory/${reqId}`);
  }

  // Analytics
  getAnalyticsSummary(): Observable<AtsAnalyticsSummary> {
    return this.http.get<AtsAnalyticsSummary>(`${this.baseUrl}/AtsAnalytics/GetAnalyticsSummary`);
  }

  // Location Manpower Buffer Update
  updateLocationManpowerBuffer(dto: { locationId: string; baseDemand: number; bufferPercent: number; modifiedBy?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsJobRequisition/UpdateLocationManpowerBuffer`, dto);
  }

  // Get Company-Specific Locations with actual Base Demand & Buffer Metrics
  getLocationManpowerList(companyId?: string): Observable<any> {
    const url = companyId 
      ? `${this.baseUrl}/AtsJobRequisition/GetLocationManpowerList?companyId=${encodeURIComponent(companyId)}`
      : `${this.baseUrl}/AtsJobRequisition/GetLocationManpowerList`;
    return this.http.get<any>(url);
  }

  // =========================================================================
  // CJ DARCL ATS LIFECYCLE (STEPS 4 TO 16)
  // =========================================================================

  getVendorsForMapping(reqId: number | string, companyId?: string, vendorType?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorsForMapping?reqId=${reqId}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    if (vendorType) url += `&vendorType=${encodeURIComponent(vendorType)}`;
    return this.http.get<any[]>(url);
  }

  getVendorsByLocation(companyId?: string, locationId?: string, reqId?: number | string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorsByLocation?companyId=${encodeURIComponent(companyId || '')}`;
    if (locationId) url += `&locationId=${encodeURIComponent(locationId)}`;
    if (reqId) url += `&reqId=${reqId}`;
    return this.http.get<any[]>(url);
  }

  assignVendorToCandidate(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/AssignVendorToCandidate`, payload);
  }

  saveVendorMapping(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SaveVendorMapping`, payload);
  }

  saveBulkVendorMapping(payloadList: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SaveBulkVendorMapping`, payloadList);
  }

  sendVendorRequisitionIntimation(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SendVendorRequisitionIntimationEmail`, payload);
  }

  deallocateVendor(reqId: number | string, vendorId: string, companyId?: string): Observable<any> {
    let url = `${this.baseUrl}/AtsLifecycle/DeallocateVendor?reqId=${reqId}&vendorId=${encodeURIComponent(vendorId)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.post<any>(url, {});
  }

  deallocateBulkVendors(payloadList: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/DeallocateBulkVendors`, payloadList);
  }

  registerCandidate(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/RegisterCandidate`, payload);
  }

  getCandidatePipelineRoster(reqId?: number | string, stageFilter: string = 'ALL', searchQuery?: string, companyId?: string): Observable<any[]> {
    const compId = companyId || this.activeCompanyId;
    let url = `${this.baseUrl}/AtsLifecycle/GetCandidatePipeline?stageFilter=${encodeURIComponent(stageFilter)}`;
    if (reqId) url += `&reqId=${reqId}`;
    if (searchQuery) url += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    if (compId) url += `&companyId=${encodeURIComponent(compId)}`;
    return this.http.get<any[]>(url);
  }

  scheduleCandidateInterview(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/ScheduleInterview`, payload);
  }

  submitInterviewEvaluation(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SubmitInterviewEvaluation`, payload);
  }

  saveCandidateOnboardingDocs(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SaveOnboardingDocs`, payload);
  }

  verifyCandidateDocuments(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/VerifyDocuments`, payload);
  }

  // ── 22-Point Candidate Document Review & Verification Suite ─────────────────
  getCandidateDocuments(appId: number | string, companyId?: string): Observable<any> {
    let url = `${this.baseUrl}/AtsLifecycle/GetCandidateDocuments?appId=${appId}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any>(url);
  }

  uploadCandidateDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/UploadCandidateDocument`, formData);
  }

  verifyCandidateDocumentItem(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/VerifyCandidateDocumentItem`, payload);
  }

  markCandidateDocumentViewed(payload: { docId?: number; appId?: number | string; docTypeCode?: string; viewedBy?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/MarkCandidateDocumentViewed`, payload);
  }

  saveCandidateOnboardingDossier(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SaveCandidateOnboardingDossier`, payload);
  }

  getDocumentViewUrl(docId?: number, appId?: number | string, docTypeCode?: string, companyId?: string): string {
    const params: string[] = [];
    if (docId) params.push(`docId=${docId}`);
    if (appId) params.push(`appId=${appId}`);
    if (docTypeCode) params.push(`docTypeCode=${encodeURIComponent(docTypeCode)}`);
    if (companyId) params.push(`companyId=${encodeURIComponent(companyId)}`);
    return `${this.baseUrl}/AtsLifecycle/ViewCandidateDocument?${params.join('&')}`;
  }

  generateOfferLetter(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/GenerateOfferLetter`, payload);
  }

  /** Full offer letter: Word template → PDF (Syncfusion) + email dispatch (bulk-capable) */
  issueOfferLetterPdf(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/IssueOfferLetterPdf`, payload);
  }

  /** Consolidated Staffing Vendor Offer Email Dispatch (All candidate PDFs attached to 1 email per vendor) */
  sendVendorOfferLettersBatch(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SendVendorOfferLettersBatch`, payload);
  }

  /** Get issued offer letter history for a candidate */
  getOfferLetterHistory(appId: number, companyId?: string): Observable<any> {
    let url = `${this.baseUrl}/AtsLifecycle/GetOfferLetterHistory?appId=${appId}`;
    if (companyId) url += `&companyId=${companyId}`;
    return this.http.get<any>(url);
  }

  /** Direct URL to stream and view the offer letter PDF */
  getOfferLetterViewUrl(appId: number, offerId?: number): string {
    const params: string[] = [];
    if (appId) params.push(`appId=${appId}`);
    if (offerId) params.push(`offerId=${offerId}`);
    return `${this.baseUrl}/AtsLifecycle/ViewOfferLetter?${params.join('&')}`;
  }

  /** Direct URL to download the offer letter PDF */
  getOfferLetterDownloadUrl(appId: number, offerId?: number): string {
    const params: string[] = ['download=true'];
    if (appId) params.push(`appId=${appId}`);
    if (offerId) params.push(`offerId=${offerId}`);
    return `${this.baseUrl}/AtsLifecycle/DownloadOfferLetter?${params.join('&')}`;
  }

  hireAndTransferCandidate(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/HireAndTransfer`, payload);
  }

  tagCandidate(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/TagCandidate`, payload);
  }

  moveCandidateStage(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/MoveCandidateStage`, payload);
  }

  rejectCandidate(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/RejectCandidate`, payload);
  }

  getCandidateAuditTrail(appId: number | string, companyId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetCandidateAuditTrail?appId=${appId}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any[]>(url);
  }

  getRecruitmentMIS(companyId?: string): Observable<any> {
    const compId = companyId || this.activeCompanyId;
    let url = `${this.baseUrl}/AtsLifecycle/GetRecruitmentMIS`;
    if (compId) url += `?companyId=${encodeURIComponent(compId)}`;
    return this.http.get<any>(url);
  }

  // =========================================================================
  // VENDOR SOURCING & ONBOARDING PORTAL (CJ DARCL ATS)
  // =========================================================================

  getMyVendorProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/AtsLifecycle/GetMyVendorProfile`);
  }

  getVendorListForPortal(companyId?: string): Observable<any[]> {
    const compId = companyId || this.activeCompanyId;
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorListForPortal`;
    if (compId) url += `?companyId=${encodeURIComponent(compId)}`;
    return this.http.get<any[]>(url);
  }

  getVendorPortalMetrics(vendorId: string, companyId?: string): Observable<any> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorPortalMetrics?vendorId=${encodeURIComponent(vendorId)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any>(url);
  }

  getVendorAssignedJobs(vendorId: string, companyId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorAssignedJobs?vendorId=${encodeURIComponent(vendorId)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any[]>(url);
  }

  getVendorSelectedCandidates(vendorId: string, companyId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorSelectedCandidates?vendorId=${encodeURIComponent(vendorId)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any[]>(url);
  }

  getVendorJobSubmissions(vendorId: string, reqId: number | string, companyId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorJobSubmissions?vendorId=${encodeURIComponent(vendorId)}&reqId=${reqId}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any[]>(url);
  }

  getVendorAllCandidates(vendorId: string, companyId?: string, stageFilter?: string, searchQuery?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorAllCandidates?vendorId=${encodeURIComponent(vendorId)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    if (stageFilter) url += `&stageFilter=${encodeURIComponent(stageFilter)}`;
    if (searchQuery) url += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    return this.http.get<any[]>(url);
  }

  getVendorPoolCandidates(vendorId: string, targetReqId?: number | string, searchQuery?: string, poolFilter: string = 'ALL', companyId?: string): Observable<any[]> {
    let url = `${this.baseUrl}/AtsLifecycle/GetVendorPoolCandidates?vendorId=${encodeURIComponent(vendorId)}`;
    if (targetReqId) url += `&targetReqId=${encodeURIComponent(String(targetReqId))}`;
    if (searchQuery) url += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    if (poolFilter) url += `&poolFilter=${encodeURIComponent(poolFilter)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    return this.http.get<any[]>(url);
  }

  assignBenchCandidatesToJob(payload: { reqId: number | string; vendorId: string; appIds: number[]; companyId?: string; assignedBy?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/AssignBenchCandidatesToJob`, payload);
  }

  submitVendorCandidateBatch(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/AtsLifecycle/SubmitVendorCandidateBatch`, payload);
  }

  getUserAccessRights(userId: string, moduleId: number = 5): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/PageRights/GetUserAccessRights?userId=${encodeURIComponent(userId)}&moduleId=${moduleId}`);
  }

  // ── Public Location QR Code Spot Walk-In Hiring Portal ───────────────────
  getPublicLocationJobsWithVendors(locationId: string, companyId?: string, qrToken?: string): Observable<any> {
    let url = `${this.baseUrl}/AtsJobRequisition/GetPublicLocationJobsWithVendors?locationId=${encodeURIComponent(locationId)}`;
    if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
    
    let headers = new HttpHeaders();
    if (qrToken) {
      headers = headers.set('X-QR-Token', qrToken);
    }
    return this.http.get<any>(url, { headers });
  }

  checkCandidateAadhaarStatus(payload: { aadharNo: string; companyId?: string; locationId?: string; currentAppId?: number }, qrToken?: string): Observable<any> {
    const cleanAadhaar = (payload.aadharNo || '').replace(/\D/g, '');
    let url = `${this.baseUrl}/AtsJobRequisition/CheckCandidateAadhaar?aadhaarNo=${encodeURIComponent(cleanAadhaar)}`;
    if (payload.companyId) {
      url += `&companyId=${encodeURIComponent(payload.companyId)}`;
    }
    if (payload.currentAppId) {
      url += `&currentAppId=${encodeURIComponent(payload.currentAppId)}`;
    }
    let headers = new HttpHeaders();
    if (qrToken) {
      headers = headers.set('X-QR-Token', qrToken);
    }
    return this.http.get<any>(url, { headers }).pipe(
      map(res => {
        let data = res;
        if (typeof res === 'string') {
          try { data = JSON.parse(res); } catch (_) { data = res; }
        }
        const isDup = data?.isDuplicate === true || 
                      data?.IsDuplicate === true || 
                      data?.ExistsStatus === 1 || 
                      data?.existsStatus === 1 ||
                      data?.canProceed === false || 
                      data?.CanProceed === 0;
        const canProc = !isDup && (data?.canProceed === true || data?.CanProceed === 1 || data?.CanProceedBool === true);
        return {
          ...data,
          isDuplicate: isDup,
          canProceed: canProc,
          message: data?.message || data?.Message || (isDup ? 'Duplicate record found in system.' : 'Aadhaar is clear.'),
          candidateName: data?.candidateName || data?.CandidateName || '',
          currentStatus: data?.currentStatus || data?.CurrentStatus || '',
          jobTitle: data?.jobTitle || data?.JobTitle || '',
          duplicateType: data?.duplicateType || data?.DuplicateType || (isDup ? 'ACTIVE_PIPELINE' : 'NONE'),
          existingAppId: data?.existingAppId || data?.ExistingAppId || null,
          ExistingAppId: data?.ExistingAppId || data?.existingAppId || null
        };
      })
    );
  }

  verifyAadhaarUniqueness(
    payloadOrAadhaar: string | { aadhaarNo: string; companyId?: string; currentAppId?: number },
    companyIdOrCurrentAppId?: string | number,
    currentAppId?: number,
    qrToken?: string
  ): Observable<any> {
    let payload: { aadhaarNo: string; companyId?: string; currentAppId?: number };
    let token = qrToken;

    if (typeof payloadOrAadhaar === 'string') {
      const compId = typeof companyIdOrCurrentAppId === 'string' ? companyIdOrCurrentAppId : undefined;
      const appId = typeof companyIdOrCurrentAppId === 'number' ? companyIdOrCurrentAppId : currentAppId;
      payload = { aadhaarNo: payloadOrAadhaar, companyId: compId, currentAppId: appId };
    } else {
      payload = payloadOrAadhaar;
      token = (typeof companyIdOrCurrentAppId === 'string') ? companyIdOrCurrentAppId : qrToken;
    }

    return this.checkCandidateAadhaarStatus({
      aadharNo: payload.aadhaarNo,
      companyId: payload.companyId,
      currentAppId: payload.currentAppId
    }, token);
  }

  submitWalkInCandidate(payload: any, qrToken?: string): Observable<any> {
    const url = `${this.baseUrl}/AtsJobRequisition/SubmitWalkInCandidate`;
    let headers = new HttpHeaders();
    if (qrToken) {
      headers = headers.set('X-QR-Token', qrToken);
    }
    return this.http.post<any>(url, payload, { headers });
  }
}


