import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { AtsService } from '../../../../shared/services/ats.service';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

export interface HubLocationCapacity {
  id: string;
  name: string;
  code: string;
  zone: string;
  state?: string;
  displayName?: string;
  baseDemand: number;
  bufferPercent: number;
  bufferHeads: number;
  targetCapacity: number;
  currentOccupied: number;
}

@Component({
  selector: 'app-edit-job-requisition',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgSelectModule],
  templateUrl: './edit-job-requisition.component.html',
  styleUrl: './edit-job-requisition.component.scss'
})
export class EditJobRequisitionComponent implements OnInit {
  reqId: number | null = null;
  mrfCode: string = '';
  createdDate: string = '';
  originalStatus: string = '';
  originalWorkflowStatus: string = '';
  originalSubmittedBy: string = '';

  // Rejection & Resume Workflow Info
  isRejected: boolean = false;
  rejectedByLevel: string = '';
  rejectedByName: string = '';
  rejectedByDate: string = '';
  rejectionRemarks: string = '';

  // Master Data Lists (Company-Specific via Universal DDL & AtsService)
  departmentList: { id: string; name: string }[] = [];
  locationList: HubLocationCapacity[] = [];
  designationList: { id: string; name: string }[] = [];

  // Dropdown Lists for Typable & Filtered Inputs
  workplaceTypeList: string[] = ['On-Site', 'Field', 'Hybrid', 'Remote'];
  employmentTypeList: string[] = ['Full-Time', 'Contract', 'Third-Party', 'Part-Time'];
  priorityList: string[] = ['Low', 'Medium', 'High', 'Critical'];
  educationLevelList: string[] = ['Graduate', 'Post Graduate', 'Diploma', 'Intermediate / 10+2', 'Doctorate / PhD', 'Professional Certification'];

  // Hub Directory with Baseline Demand, Buffer & Active Headcount
  hubCapacityDirectory: HubLocationCapacity[] = [
    { id: 'GU-1', name: 'Noida Hub & Warehouse', code: 'NDA', zone: 'North Zone', state: 'Uttar Pradesh', displayName: 'Noida Hub & Warehouse (NDA) — North Zone', baseDemand: 140, bufferPercent: 10, bufferHeads: 14, targetCapacity: 154, currentOccupied: 128 },
    { id: 'GU-10', name: 'Ahmedabad Logistics Hub', code: 'AMD', zone: 'West Zone', state: 'Gujarat', displayName: 'Ahmedabad Logistics Hub (AMD) — West Zone', baseDemand: 95, bufferPercent: 10, bufferHeads: 10, targetCapacity: 105, currentOccupied: 88 },
    { id: 'GU-100', name: 'Faridabad Head Office 53/10', code: 'FBD', zone: 'North Zone', state: 'Haryana', displayName: 'Faridabad Head Office 53/10 (FBD) — North Zone', baseDemand: 220, bufferPercent: 8, bufferHeads: 18, targetCapacity: 238, currentOccupied: 210 },
    { id: 'GU-101', name: 'Faridabad M&M Hub', code: 'FBD-MM', zone: 'North Zone', state: 'Haryana', displayName: 'Faridabad M&M Hub (FBD-MM) — North Zone', baseDemand: 75, bufferPercent: 12, bufferHeads: 9, targetCapacity: 84, currentOccupied: 70 },
    { id: 'GU-102', name: 'Faridabad Fleet Unit', code: 'FBD-DRV', zone: 'North Zone', state: 'Haryana', displayName: 'Faridabad Fleet Unit (FBD-DRV) — North Zone', baseDemand: 50, bufferPercent: 5, bufferHeads: 3, targetCapacity: 53, currentOccupied: 48 },
    { id: 'GU-146', name: 'Bhiwandi Central Fulfillment', code: 'BHW', zone: 'West Zone', state: 'Maharashtra', displayName: 'Bhiwandi Central Fulfillment (BHW) — West Zone', baseDemand: 310, bufferPercent: 15, bufferHeads: 47, targetCapacity: 357, currentOccupied: 295 },
    { id: 'GU-149', name: 'Pune Chakan Auto Cluster', code: 'PUN', zone: 'West Zone', state: 'Maharashtra', displayName: 'Pune Chakan Auto Cluster (PUN) — West Zone', baseDemand: 180, bufferPercent: 10, bufferHeads: 18, targetCapacity: 198, currentOccupied: 172 },
    { id: 'GU-152', name: 'Nagpur Central Hub', code: 'NGP', zone: 'Central Zone', state: 'Maharashtra', displayName: 'Nagpur Central Hub (NGP) — Central Zone', baseDemand: 110, bufferPercent: 10, bufferHeads: 11, targetCapacity: 121, currentOccupied: 102 },
    { id: 'GU-181', name: 'Whitefield Tech Supply Center', code: 'BLR-WF', zone: 'South Zone', state: 'Karnataka', displayName: 'Whitefield Tech Supply Center (BLR-WF) — South Zone', baseDemand: 160, bufferPercent: 10, bufferHeads: 16, targetCapacity: 176, currentOccupied: 150 },
    { id: 'GU-182', name: 'Peenya Industrial Logistics', code: 'BLR-PNY', zone: 'South Zone', state: 'Karnataka', displayName: 'Peenya Industrial Logistics (BLR-PNY) — South Zone', baseDemand: 85, bufferPercent: 10, bufferHeads: 9, targetCapacity: 94, currentOccupied: 78 },
    { id: 'GU-201', name: 'Chennai Guindy Depot', code: 'MAA-GND', zone: 'South Zone', state: 'Tamil Nadu', displayName: 'Chennai Guindy Depot (MAA-GND) — South Zone', baseDemand: 130, bufferPercent: 10, bufferHeads: 13, targetCapacity: 143, currentOccupied: 122 },
    { id: 'GU-205', name: 'Sriperumbudur Auto Terminal', code: 'MAA-SRP', zone: 'South Zone', state: 'Tamil Nadu', displayName: 'Sriperumbudur Auto Terminal (MAA-SRP) — South Zone', baseDemand: 90, bufferPercent: 12, bufferHeads: 11, targetCapacity: 101, currentOccupied: 82 },
    { id: 'GU-240', name: 'Hyderabad Shamshabad Airport Cargo', code: 'HYD-AIR', zone: 'South Zone', state: 'Telangana', displayName: 'Hyderabad Shamshabad Airport Cargo (HYD-AIR) — South Zone', baseDemand: 140, bufferPercent: 10, bufferHeads: 14, targetCapacity: 154, currentOccupied: 132 },
    { id: 'GU-280', name: 'Kolkata Dankuni Freight Yard', code: 'CCU-DNK', zone: 'East Zone', state: 'West Bengal', displayName: 'Kolkata Dankuni Freight Yard (CCU-DNK) — East Zone', baseDemand: 200, bufferPercent: 10, bufferHeads: 20, targetCapacity: 220, currentOccupied: 188 },
    { id: 'GU-310', name: 'Jaipur Sitapura Hub', code: 'JPR', zone: 'North Zone', state: 'Rajasthan', displayName: 'Jaipur Sitapura Hub (JPR) — North Zone', baseDemand: 80, bufferPercent: 10, bufferHeads: 8, targetCapacity: 88, currentOccupied: 74 },
    { id: 'GU-340', name: 'Indore Pithampur Corridor', code: 'IDR', zone: 'Central Zone', state: 'Madhya Pradesh', displayName: 'Indore Pithampur Corridor (IDR) — Central Zone', baseDemand: 115, bufferPercent: 10, bufferHeads: 12, targetCapacity: 127, currentOccupied: 106 },
    { id: 'GU-410', name: 'Ludhiana Focal Point', code: 'LDH', zone: 'North Zone', state: 'Punjab', displayName: 'Ludhiana Focal Point (LDH) — North Zone', baseDemand: 95, bufferPercent: 10, bufferHeads: 10, targetCapacity: 105, currentOccupied: 89 },
    { id: 'GU-490', name: 'Kochi Kalamassery Hub', code: 'COK', zone: 'South Zone', state: 'Kerala', displayName: 'Kochi Kalamassery Hub (COK) — South Zone', baseDemand: 70, bufferPercent: 8, bufferHeads: 6, targetCapacity: 76, currentOccupied: 65 }
  ];

  // Dropdown Master Options (CJ DARCL Specific)
  serviceTypeList: string[] = [
    'Fleet & Transportation',
    'Warehouse & Hub Operations',
    'Supply Chain & Logistics',
    'Distribution & Last Mile',
    'Technical & Fleet Maintenance',
    'Corporate & Administration',
    'Finance, Accounts & Billing',
    'Customer Operations & MIS'
  ];

  skillCategoryList: string[] = [
    'Skilled',
    'Semi-Skilled',
    'Unskilled',
    'Highly Skilled / Specialist',
    'Supervisory & Frontline',
    'Management & Executive'
  ];

  diversityCategoryList: string[] = [
    'Women in Logistics (Female Preference)',
    'Persons with Disabilities (PwD)',
    'Affirmative Action / Equal Opportunity',
    'Ex-Servicemen & Veterans'
  ];

  replacementReasonList: string[] = [
    'Employee Resignation',
    'Internal Transfer / Deputation',
    'Promotion / Role Transition',
    'Superannuation / Retirement',
    'Separation / Termination',
    'Medical Ground'
  ];

  // State Flags
  isLoading: boolean = true;
  isLoadingMaster: boolean = true;
  isAiGenerating: boolean = false;
  isSubmitting: boolean = false;

  // Editable Requisition Model (Pre-filled from DB)
  jobData: any = {
    serviceType: '',
    designation: '',
    fk_desgid: null as number | null,
    skillCategory: '',
    openPositions: 1,
    location: '',
    fk_locid: null as number | null,
    department: '',
    fk_deptid: null as number | null,
    fk_subdeptid: null as string | null,
    fk_classid: null as string | null,
    fk_catid: null as string | null,
    fk_costcentreid: null as number | null,
    fk_zoneId: null as string | null,
    fk_cityid: null as string | null,
    businessVertical: '',
    hiringType: 'New' as 'New' | 'Replacement',
    replacedEmpName: '',
    replacementReason: '',
    isDiversityHiring: false,
    diversityCategory: '',
    jobTitle: '',
    workplaceType: 'On-Site',
    employmentType: 'Full-Time',
    experienceMin: null as number | null,
    experienceMax: null as number | null,
    ctcMin: null as number | null,
    ctcMax: null as number | null,
    currency: 'INR',
    priority: 'Medium',
    targetStartDate: '',
    educationLevel: '',
    primarySkills: '',
    secondarySkills: '',
    noticePeriodMaxDays: null as number | null,
    industry: 'Logistics & Supply Chain',
    jobDescription: '',
    responsibilities: '',
    qualifications: '',
    benefits: ''
  };

  assignedLocationIds: string[] = [];
  authorizedLocationList: HubLocationCapacity[] = [];

  constructor(
    private route: ActivatedRoute,
    private atsService: AtsService,
    private empMstService: EmployeeMasterService,
    private router: Router,
    private toastr: ToastrService,
    private encryptionService: EncryptionService,
    private cdr: ChangeDetectorRef,
    private loaderService: NgxUiLoaderService
  ) {}

  isLocationAllowed(locId: string, locName?: string): boolean {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return true;
    }
    const cleanTargetId = String(locId || '').trim().replace(/^GU-/i, '');
    const cleanTargetName = (locName || '').trim().toLowerCase();

    return this.assignedLocationIds.some(assigned => {
      const cleanAssigned = String(assigned || '').trim().replace(/^GU-/i, '');
      if (cleanAssigned === '0' || cleanAssigned.toLowerCase() === 'all' || cleanAssigned === '*') {
        return true;
      }
      return cleanAssigned.toLowerCase() === cleanTargetId.toLowerCase() ||
             String(assigned || '').toLowerCase() === String(locId || '').toLowerCase() ||
             (cleanTargetName && String(assigned || '').trim().toLowerCase() === cleanTargetName);
    });
  }

  updateAuthorizedLocations(): void {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      this.authorizedLocationList = [...this.locationList];
    } else {
      const filtered = this.locationList.filter(l => this.isLocationAllowed(l.id, l.name));
      this.authorizedLocationList = filtered.length > 0 ? filtered : [...this.locationList];
    }
    this.ensureCurrentLocationInList();
    this.cdr.markForCheck();
  }

  ensureCurrentLocationInList(): void {
    if (this.jobData.location) {
      const exists = this.authorizedLocationList.some(l =>
        l.name.toLowerCase() === (this.jobData.location || '').toLowerCase() ||
        (this.jobData.fk_locid && String(l.id).replace(/^GU-/i, '') === String(this.jobData.fk_locid).replace(/^GU-/i, ''))
      );
      if (!exists) {
        const fromMain = this.locationList.find(l =>
          l.name.toLowerCase() === (this.jobData.location || '').toLowerCase() ||
          (this.jobData.fk_locid && String(l.id).replace(/^GU-/i, '') === String(this.jobData.fk_locid).replace(/^GU-/i, ''))
        );
        if (fromMain) {
          this.authorizedLocationList.unshift(fromMain);
        } else {
          this.authorizedLocationList.unshift({
            id: String(this.jobData.fk_locid || 'LOC'),
            name: this.jobData.location,
            code: 'HUB',
            zone: 'North Zone',
            displayName: this.jobData.location,
            baseDemand: 100,
            bufferPercent: 10,
            bufferHeads: 10,
            targetCapacity: 110,
            currentOccupied: 80
          });
        }
      }
    }
  }

  ngOnInit(): void {
    const userId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || '';
    if (userId) {
      this.atsService.getUserAccessRights(userId, 5).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data) {
            this.assignedLocationIds = res.data.assignedLocationIds || res.data.AssignedLocationIds || [];
            this.updateAuthorizedLocations();
          }
        },
        error: () => {}
      });
    }
    this.locationList = [...this.hubCapacityDirectory];
    this.updateAuthorizedLocations();
    this.loadRequisitionMasterData();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const decryptedId = this.encryptionService.decryptText(idParam);
        this.reqId = Number(decryptedId) || Number(idParam);
        this.loadJobDetails(this.reqId);
      } else {
        this.toastr.error('No Job Requisition ID specified.', 'Invalid Request');
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/job-management']);
      }
    });
  }

  loadRequisitionMasterData(): void {
    this.isLoadingMaster = true;
    this.loaderService.start();
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';
    const userId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || '';

    this.atsService.getRequisitionMasterData(userId, '', companyId).subscribe({
      next: (res: any) => {
        this.isLoadingMaster = false;
        this.loaderService.stop();
        if (res) {
          if (res.departments && Array.isArray(res.departments) && res.departments.length > 0) {
            this.departmentList = res.departments.map((d: any) => ({
              id: String(d.id || d.value || d.departmentId || d.DepartmentId || d.deptid || d.pk_deptid || ''),
              name: (d.name || d.text || d.departmentName || d.DepartmentName || d.deptname || '').trim()
            }));
          } else {
            this.fetchFallbackDepartments();
          }

          if (res.designations && Array.isArray(res.designations) && res.designations.length > 0) {
            this.designationList = res.designations.map((d: any) => ({
              id: String(d.id || d.value || d.designationId || d.DesignationId || d.desgid || d.pk_desgid || ''),
              name: (d.name || d.text || d.designationName || d.DesignationName || d.desgname || '').trim()
            }));
          } else {
            this.fetchFallbackDesignations();
          }

          if (res.locations && Array.isArray(res.locations) && res.locations.length > 0) {
            this.locationList = res.locations.map((l: any) => {
              const locName = (l.locationName || l.LocationName || l.locname || l.Locname || l.name || l.Name || l.text || l.location || l.Location || '').trim();
              const locId = String(l.locationId || l.LocationId || l.pk_locid || l.id || l.value || l.Id || '');
              const locCode = l.code || l.locationCode || l.LocationCode || 'HUB';
              const locZone = l.zone || l.zoneDescription || l.Zone || 'North Zone';
              const bDemand = l.baseDemand != null ? Number(l.baseDemand) : (l.BaseDemand != null ? Number(l.BaseDemand) : 0);
              const bPercent = l.bufferPercent != null ? Number(l.bufferPercent) : (l.BufferPercent != null ? Number(l.BufferPercent) : 0);
              const bHeads = l.bufferHeads != null ? Number(l.bufferHeads) : Math.ceil(bDemand * (bPercent / 100));
              const tCap = l.targetCapacity != null && Number(l.targetCapacity) > 0 ? Number(l.targetCapacity) : (bDemand + bHeads);
              const cOcc = l.currentOccupied != null ? Number(l.currentOccupied) : (l.CurrentOccupied != null ? Number(l.CurrentOccupied) : 0);
              return {
                id: locId,
                name: locName,
                code: locCode,
                zone: locZone,
                state: l.state || l.State || '',
                displayName: locName ? (locCode && locCode !== 'HUB' ? `${locName} (${locCode}) — ${locZone}` : locName) : 'Location',
                baseDemand: bDemand,
                bufferPercent: bPercent,
                bufferHeads: bHeads,
                targetCapacity: tCap,
                currentOccupied: cOcc
              };
            });
            this.updateAuthorizedLocations();
          } else {
            this.fetchFallbackLocations();
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingMaster = false;
        this.loaderService.stop();
        this.fetchFallbackDepartments();
        this.fetchFallbackDesignations();
        this.fetchFallbackLocations();
      }
    });
  }

  fetchFallbackDepartments(): void {
    this.empMstService.get_DropdownList('Department').subscribe({
      next: (res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          this.departmentList = res.data
            .filter((d: any) => (d.name || d.text) && !(d.name || d.text).startsWith('--'))
            .map((d: any) => ({
              id: String(d.value || d.id || ''),
              name: (d.name || d.text || '').trim()
            }));
          this.cdr.markForCheck();
        }
      }
    });
  }

  fetchFallbackDesignations(): void {
    this.empMstService.get_DropdownList('Designation').subscribe({
      next: (res: any) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          this.designationList = res.data
            .filter((d: any) => (d.name || d.text) && !(d.name || d.text).startsWith('--'))
            .map((d: any) => ({
              id: String(d.value || d.id || ''),
              name: (d.name || d.text || '').trim()
            }));
          this.cdr.markForCheck();
        }
      }
    });
  }

  fetchFallbackLocations(): void {
    this.empMstService.get_DropdownList('Location').subscribe({
      next: (res: any) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const validLocs = res.data.filter((l: any) => {
            const label = l.locationName || l.LocationName || l.name || l.locname || l.text || '';
            return label && !label.startsWith('--');
          });
          if (validLocs.length > 0) {
            const apiLocs: HubLocationCapacity[] = validLocs.map((l: any) => {
              const locName = (l.locationName || l.LocationName || l.name || l.locname || l.text || l.location || '').trim();
              const locId = String(l.locationId || l.LocationId || l.pk_locid || l.value || l.id || '');
              const existing = this.hubCapacityDirectory.find(h =>
                h.name.toLowerCase() === locName.toLowerCase() ||
                h.id.toLowerCase() === locId.toLowerCase()
              );
              return {
                id: locId || (existing ? existing.id : 'LOC'),
                name: locName,
                code: existing ? existing.code : 'HUB',
                zone: existing ? existing.zone : 'North Zone',
                state: existing ? existing.state : '',
                displayName: locName ? (existing?.code ? `${locName} (${existing.code}) — ${existing.zone}` : locName) : 'Location',
                baseDemand: existing ? existing.baseDemand : 100,
                bufferPercent: existing ? existing.bufferPercent : 10,
                bufferHeads: existing ? existing.bufferHeads : 10,
                targetCapacity: existing ? existing.targetCapacity : 110,
                currentOccupied: existing ? existing.currentOccupied : 80
              };
            });
            this.locationList = apiLocs;
            this.updateAuthorizedLocations();
          }
        }
      }
    });
  }

  loadJobDetails(reqId: number): void {
    this.isLoading = true;
    this.loaderService.start();
    const companyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

    this.atsService.getJobRequisitionById(reqId, companyId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.loaderService.stop();
        if (!res) {
          this.toastr.error('Requisition details could not be found.', 'Not Found');
          this.router.navigate(['/dash/recruitment/recruitmentdashboard/job-management']);
          return;
        }

        // Set Immutable / Record Identifiers
        this.mrfCode = res.mrfCode || `MRF/${new Date().getFullYear()}/${res.reqId || res.jobId}`;
        this.createdDate = res.createdDate || res.postedDate || '';
        this.originalStatus = res.status || 'Pending Approval';
        this.originalWorkflowStatus = res.workflowStatus || 'Submitted';
        this.originalSubmittedBy = res.submittedBy || 'Site HR';

        // Populate Rejection Information
        this.isRejected = res.isDisapproved == 1 || res.isDisapproved === true || !!res.rejectedByLevel || res.workflowStatus === 'Rejected' || res.status === 'Rejected';
        this.rejectedByLevel = res.rejectedByLevel || '';
        this.rejectedByName = res.rejectedByName || '';
        this.rejectedByDate = res.rejectedByDate || '';
        this.rejectionRemarks = res.rejectionRemarks || '';

        // Rule: AFTER L1, IT SHOULD NOT BE EDITED unless rejected from an approval level
        const wf = (res.workflowStatus || '').trim();
        const st = (res.status || '').trim();
        const isPastL1 = wf === 'L2_Pending' || wf === 'L3_Pending' || wf === 'Approved' || wf === 'Active' || st === 'Active';
        if (isPastL1 && !this.isRejected && st !== 'Draft') {
          this.toastr.warning('This requisition has already passed Level 1 approval and cannot be edited unless rejected by an approver.', 'Editing Locked');
          this.router.navigate(['/dash/recruitment/recruitmentdashboard/mrf-list']);
          return;
        }

        // Pre-fill Editable Model
        this.jobData = {
          serviceType: res.serviceType || '',
          designation: res.designation || res.jobTitle || '',
          fk_desgid: res.fk_desgid ? Number(res.fk_desgid) : null,
          skillCategory: res.skillCategory || '',
          openPositions: res.openPositions ? Number(res.openPositions) : null,
          location: res.location || '',
          fk_locid: res.fk_locid ? Number(res.fk_locid) : null,
          department: res.department || '',
          fk_deptid: res.fk_deptid ? Number(res.fk_deptid) : null,
          fk_subdeptid: res.fk_subdeptid || null,
          fk_classid: res.fk_classid || null,
          fk_catid: res.fk_catid || null,
          fk_costcentreid: res.fk_costcentreid ? Number(res.fk_costcentreid) : null,
          fk_zoneId: res.fk_zoneId || null,
          fk_cityid: res.fk_cityid || null,
          businessVertical: res.businessVertical || '',
          hiringType: (res.hiringType === 'Replacement' ? 'Replacement' : 'New') as 'New' | 'Replacement',
          replacedEmpName: res.replacedEmpName || '',
          replacementReason: res.replacementReason || '',
          isDiversityHiring: !!res.isDiversityHiring,
          diversityCategory: res.diversityCategory || '',
          jobTitle: res.jobTitle || res.title || '',
          workplaceType: res.workplaceType || 'On-Site',
          employmentType: res.employmentType || 'Full-Time',
          experienceMin: res.experienceMin != null ? Number(res.experienceMin) : null,
          experienceMax: res.experienceMax != null ? Number(res.experienceMax) : null,
          ctcMin: res.ctcMin != null ? Number(res.ctcMin) : null,
          ctcMax: res.ctcMax != null ? Number(res.ctcMax) : null,
          currency: res.currency || 'INR',
          priority: res.priority || 'Medium',
          targetStartDate: res.targetStartDate ? res.targetStartDate.split('T')[0] : '',
          educationLevel: res.educationLevel || '',
          primarySkills: res.primarySkills || '',
          secondarySkills: res.secondarySkills || '',
          noticePeriodMaxDays: res.noticePeriodMaxDays != null ? Number(res.noticePeriodMaxDays) : null,
          industry: res.industry || 'Logistics & Supply Chain',
          jobDescription: res.jobDescription || '',
          responsibilities: res.responsibilities || '',
          qualifications: res.qualifications || '',
          benefits: res.benefits || ''
        };

        this.ensureCurrentLocationInList();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.loaderService.stop();
        this.toastr.error('Error loading job requisition record: ' + (err?.error?.message || err?.message || 'Server error'), 'Load Failed');
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/job-management']);
      }
    });
  }

  // ── REAL-TIME LOCATION CAPACITY & BUFFER GETTERS ───────────────────────────
  get selectedLocationObj(): HubLocationCapacity | null {
    if (!this.jobData.location && !this.jobData.fk_locid) return null;
    const targetLocName = (this.jobData.location || '').trim().toLowerCase();
    const targetLocId = String(this.jobData.fk_locid || '').trim();
    const cleanTargetId = targetLocId.replace(/^GU-/i, '');

    return this.locationList.find(l => {
      const lName = (l.name || '').trim().toLowerCase();
      const lId = String(l.id || '').trim();
      const cleanLId = lId.replace(/^GU-/i, '');

      return (targetLocName && (lName === targetLocName || (l.displayName && l.displayName.toLowerCase().includes(targetLocName)))) ||
             (cleanTargetId && (cleanLId === cleanTargetId || lId === targetLocId)) ||
             (targetLocName && lId.toLowerCase() === targetLocName);
    }) || null;
  }

  get locBaseDemand(): number {
    return this.selectedLocationObj ? Number(this.selectedLocationObj.baseDemand ?? 0) : 0;
  }

  get locBufferHeads(): number {
    return this.selectedLocationObj ? Number(this.selectedLocationObj.bufferHeads ?? 0) : 0;
  }

  get locTargetCapacity(): number {
    return this.selectedLocationObj ? Number(this.selectedLocationObj.targetCapacity ?? 0) : 0;
  }

  get locCurrentOccupied(): number {
    return this.selectedLocationObj ? Number(this.selectedLocationObj.currentOccupied ?? 0) : 0;
  }

  get locAvailableBase(): number {
    return Math.max(0, this.locBaseDemand - this.locCurrentOccupied);
  }

  get locAvailableTotal(): number {
    return Math.max(0, this.locTargetCapacity - this.locCurrentOccupied);
  }

  get requestedCount(): number {
    return Number(this.jobData.openPositions || 0);
  }

  get isHeadcountZeroOrNegative(): boolean {
    return !this.jobData.openPositions || Number(this.jobData.openPositions) <= 0;
  }

  get isCapacityExhausted(): boolean {
    if (!this.selectedLocationObj) return false;
    return this.locAvailableTotal <= 0;
  }

  get isHeadcountExceeded(): boolean {
    if (!this.selectedLocationObj || this.isHeadcountZeroOrNegative) return false;
    return this.requestedCount > this.locAvailableTotal;
  }

  get isBufferUtilized(): boolean {
    if (!this.selectedLocationObj || this.isHeadcountZeroOrNegative) return false;
    return this.requestedCount > this.locAvailableBase && this.requestedCount <= this.locAvailableTotal;
  }

  get bufferHeadsUtilized(): number {
    if (!this.isBufferUtilized) return 0;
    return this.requestedCount - this.locAvailableBase;
  }

  get isWithinBase(): boolean {
    if (!this.selectedLocationObj || this.isHeadcountZeroOrNegative) return false;
    return this.locAvailableBase > 0 && this.requestedCount <= this.locAvailableBase;
  }

  // ── DROPDOWN SELECTION HANDLERS ───────────────────────────────────────────
  onDesignationSelected(item: any): void {
    if (item) {
      const desigObj = typeof item === 'object' ? item : this.designationList.find(d => d.name === item || d.id === item);
      if (desigObj) {
        this.jobData.designation = desigObj.name || '';
        this.jobData.fk_desgid = desigObj.id && !isNaN(Number(desigObj.id)) ? Number(desigObj.id) : null;
        if (!this.jobData.jobTitle && desigObj.name) {
          this.jobData.jobTitle = desigObj.name;
        }
      } else {
        this.jobData.designation = String(item);
      }
    } else {
      this.jobData.designation = '';
      this.jobData.fk_desgid = null;
    }
    this.cdr.markForCheck();
  }

  onDepartmentSelected(item: any): void {
    if (item) {
      const deptObj = typeof item === 'object' ? item : this.departmentList.find(d => d.name === item || d.id === item);
      if (deptObj) {
        this.jobData.department = deptObj.name || '';
        this.jobData.fk_deptid = deptObj.id && !isNaN(Number(deptObj.id)) ? Number(deptObj.id) : null;
      } else {
        this.jobData.department = String(item);
      }
    } else {
      this.jobData.department = '';
      this.jobData.fk_deptid = null;
    }
    this.cdr.markForCheck();
  }

  onLocationSelected(item: any): void {
    if (item) {
      const locObj = typeof item === 'object' ? item : this.locationList.find(l => l.name === item || l.id === item);
      if (locObj) {
        this.jobData.location = locObj.name || '';
        const cleanId = String(locObj.id || '').replace(/^GU-/i, '');
        this.jobData.fk_locid = cleanId && !isNaN(Number(cleanId)) ? Number(cleanId) : null;
      } else {
        this.jobData.location = String(item);
      }
    } else {
      this.jobData.location = '';
      this.jobData.fk_locid = null;
    }
    this.cdr.markForCheck();
  }

  setHiringType(type: 'New' | 'Replacement'): void {
    this.jobData.hiringType = type;
    if (type === 'New') {
      this.jobData.replacedEmpName = '';
      this.jobData.replacementReason = '';
    }
    this.cdr.markForCheck();
  }

  generateAiDescription(): void {
    const title = this.jobData.jobTitle || this.jobData.designation || 'Position';
    const service = this.jobData.serviceType ? `in our ${this.jobData.serviceType} division` : '';
    const loc = this.jobData.location ? `based at ${this.jobData.location}` : '';

    this.isAiGenerating = true;
    setTimeout(() => {
      this.isAiGenerating = false;
      this.jobData.jobDescription = `We are seeking a seasoned ${title} ${service} ${loc}. Key mandates include managing operations smoothly, enforcing turnaround milestones, maintaining inventory integrity, and ensuring compliance with CJ DARCL logistics standards.`;
      this.toastr.success('AI description updated successfully.');
      this.cdr.markForCheck();
    }, 600);
  }

  // Submit Updates (All fields editable except MRF code)
  updateRequisition(isDraft: boolean = false): void {
    if (!this.jobData.jobTitle?.trim()) {
      this.toastr.warning('Please enter a Job Title / Role name.', 'Validation Error');
      return;
    }

    if (!isDraft) {
      if (!this.jobData.serviceType) {
        this.toastr.warning('Please select a Service Type.', 'Required Field');
        return;
      }
      if (!this.jobData.designation) {
        this.toastr.warning('Please select or specify a Designation.', 'Required Field');
        return;
      }
      if (!this.jobData.skillCategory) {
        this.toastr.warning('Please select a Skill Category.', 'Required Field');
        return;
      }
      if (!this.jobData.openPositions || this.jobData.openPositions < 1) {
        this.toastr.warning('Please enter valid Numbers / Headcount required.', 'Required Field');
        return;
      }
      if (!this.jobData.location) {
        this.toastr.warning('Please select an Operating Location / Hub.', 'Required Field');
        return;
      }
    }

    if (this.isHeadcountExceeded) {
      this.toastr.error(
        `Headcount (${this.requestedCount}) exceeds location maximum capacity limit (${this.locAvailableTotal} heads). Changes cannot be saved.`,
        'Capacity Limit Exceeded'
      );
      return;
    }

    if (this.isBufferUtilized) {
      this.toastr.info(
        `Notice: Requisition utilizes ${this.bufferHeadsUtilized} heads from the location Standby Buffer pool. Buffer approval will be required.`,
        'Buffer Pool Activated'
      );
    }

    this.isSubmitting = true;

    // Resolve current user for audit tracking
    const rawUserId = sessionStorage.getItem('UserId') || 
                      sessionStorage.getItem('userId') || 
                      sessionStorage.getItem('fk_UserID') || 
                      sessionStorage.getItem('loginId') || '';
    const cleanUserId = rawUserId.replace(/^GU-/i, '').trim();

    const userName = sessionStorage.getItem('userName') || 
                     sessionStorage.getItem('username') || 
                     sessionStorage.getItem('name') || 
                     sessionStorage.getItem('empName') || 'HR User';

    const companyId = sessionStorage.getItem('companyId') || 
                      localStorage.getItem('companyId') || 
                      sessionStorage.getItem('fk_companyId') || 
                      sessionStorage.getItem('companyCode') || '';

    const payload = {
      ...this.jobData,
      reqId: this.reqId,
      isDraft: isDraft,
      isBufferUtilized: this.isBufferUtilized,
      bufferHeadsUtilized: this.bufferHeadsUtilized,
      updatedBy: userName,
      updatedById: cleanUserId,
      companyId: companyId,
      fk_companyId: companyId
    };

    this.loaderService.start();
    this.atsService.updateJobRequisition(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.loaderService.stop();
        if (res?.success) {
          if (this.isRejected && !isDraft) {
            const level = this.rejectedByLevel || 'the rejected';
            this.toastr.success(`MRF ${this.mrfCode} resubmitted! Workflow resumed directly at ${level} stage.`, '✅ Workflow Resumed');
          } else {
            this.toastr.success(`Job Requisition ${this.mrfCode} updated successfully!`, '✅ Changes Saved');
          }
          setTimeout(() => {
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/mrf-list']);
          }, 1000);
        } else {
          this.toastr.error(res?.message || 'Failed to update requisition.', 'Update Error');
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.loaderService.stop();
        this.toastr.error('Error updating job requisition: ' + (err?.error?.message || err?.message || 'Server error'), 'Update Failed');
      }
    });
  }
}
