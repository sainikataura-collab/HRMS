import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EmployeeMasterService } from '../../../payroll/services/employee-master.service';
import { HrLetterService } from '../../../../all-employee/hr-documents/hrdocumentService/hr-letter.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmployeeProfileComponent } from '../../employee-profile/employee-profile.component';
import { CTCService } from '../../../../all-employee/performance/Service/ctc.service';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { forkJoin } from 'rxjs';

export interface AuditLogItem {
  logId: number;
  documentId: string;
  documentCode: string;
  documentName: string;
  fieldName: string;
  previousValue: string;
  currentValue: string;
  entryBy: string;
  entryDate: string;
  rowNum: number;
  totalCount: number;
}

export interface AuditFieldChange {
  fieldName: string;
  previousValue: string;
  currentValue: string;
  logId: number;
}

export interface AuditGroupItem {
  entryBy: string;
  entryDate: string;
  fields: AuditFieldChange[];
}

export interface StandardLetterTemplate {
  code: string;
  name: string;
  desc: string;
  icon: string;
  badgeClass: string;
  templateFile: string;
  category: string;
  summary: string;
  keyFields: string[];
}

export interface CtcComponentItem {
  shortdesc: string;
  amount: number;
  amount_yearly: number;
}

export interface CtcEmployeeGroup {
  emp_name: string;
  emp_code: string;
  total_Month: number | null;
  total_Year: number | null;
  components: CtcComponentItem[];
}

@Component({
  selector: 'app-employee-fact-box',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, NgClass, DatePipe, NgxPaginationModule, EmployeeProfileComponent],
  templateUrl: './employee-fact-box.component.html',
  styleUrls: ['./employee-fact-box.component.scss']
})
export class EmployeeFactBoxComponent implements OnInit, OnChanges {
  @Input() documentId: string = '';
  @Input() documentName: string = '';
  @Input() title: string = 'Audit Log';
  @Input() isOpen: boolean = true;
  @Input() pageSize: number = 5;

  @Output() onToggle = new EventEmitter<void>();

  // Active View Switch: 'general' (default) or 'audit'
  @Input() defaultView: 'general' | 'audit' = 'general';
  activeView: 'general' | 'audit' = 'general';
  isViewDropdownOpen: boolean = false;

  // Employee Profile Modal State
  isProfileModalOpen: boolean = false;

  // General Tab State
  isGeneralLoading: boolean = false;
  generalLetters: any[] = [];
  filteredGeneralLetters: any[] = [];
  generalSearchText: string = '';
  downloadingLetterId: number | null = null;
  viewingLetterId: number | null = null;

  // Issued Letter Preview Modal State
  isLetterPdfModalOpen: boolean = false;
  selectedLetterPdfUrl: SafeResourceUrl | null = null;
  selectedLetterRawUrl: string | null = null;
  selectedLetterTitle: string = '';
  selectedLetterCurrentItem: any = null;

  // Template View Modal State
  isTemplateModalOpen: boolean = false;
  selectedTemplateForView: StandardLetterTemplate | null = null;

  openProfileModal(): void {
    if (!this.documentId) {
      this.toastr.warning('Employee ID is not available.', 'Profile');
      return;
    }
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  // Standard Letter Formats with Template Metadata
  standardTemplates: StandardLetterTemplate[] = [
    {
      code: 'OFFER',
      name: 'Offer Letter',
      desc: 'Candidate Job Offer & Terms',
      icon: 'fa-envelope-open-text',
      badgeClass: 'bg-primary text-white',
      templateFile: 'Candidate_Offer_Template.docx',
      category: 'Pre-Employment / Onboarding',
      summary: 'Formal job offer outlining proposed CTC, designation, joining date, reporting authority, and acceptance terms.',
      keyFields: ['Candidate Name', 'Designation', 'Annual CTC', 'Joining Date', 'Department', 'Location', 'Acceptance Deadline']
    },
    {
      code: 'A',
      name: 'Appointment Letter',
      desc: 'Employment Terms & Conditions',
      icon: 'fa-file-signature',
      badgeClass: 'bg-info text-dark',
      templateFile: 'appointment_letter_template.docx',
      category: 'Employment Contract',
      summary: 'Comprehensive employment agreement executed upon joining, detailing job responsibilities, salary breakdown, probation rules, and company policies.',
      keyFields: ['Employee Code', 'Full Name', 'Designation', 'Department', 'Base Salary & Allowances', 'Probation Duration', 'Notice Period', 'Reporting Manager']
    },
    {
      code: 'B',
      name: 'Confirmation Letter',
      desc: 'Confirmation With/Without Increment',
      icon: 'fa-award',
      badgeClass: 'bg-success text-white',
      templateFile: 'Confirmation_Letter_With_Increment.docx',
      category: 'Employment Status',
      summary: 'Official notification confirming permanent employment status following successful appraisal of probation period, with revised terms if applicable.',
      keyFields: ['Effective Confirmation Date', 'Designation Confirmation', 'Revised Salary Structure', 'Performance Appraisal Rating', 'Appreciation Note']
    },
    {
      code: 'D',
      name: 'Increment Letter',
      desc: 'Salary & Grade Revision',
      icon: 'fa-arrow-trend-up',
      badgeClass: 'bg-warning text-dark',
      templateFile: 'increment_letter_template.docx',
      category: 'Compensation & Appraisal',
      summary: 'Official annual or mid-term compensation appraisal document communicating salary increment, grade enhancement, and updated compensation schedule.',
      keyFields: ['Effective Revision Date', 'Current vs Revised CTC', 'Increment Percentage', 'Revised Monthly Breakdown', 'Performance Acknowledgement']
    },
    {
      code: 'F',
      name: 'Transfer Letter',
      desc: 'Branch / Location Reassignment',
      icon: 'fa-shuffle',
      badgeClass: 'bg-secondary text-white',
      templateFile: 'Transfer_Letter_Template.docx',
      category: 'Internal Movement',
      summary: 'Official relocation order communicating transfer to another branch, office, or department with reporting timelines and handover directives.',
      keyFields: ['Current Location / Branch', 'New Transfer Location', 'Effective Transfer Date', 'New Reporting Authority', 'Relocation Allowance Details']
    },
    {
      code: 'R',
      name: 'Promotion Letter',
      desc: 'Designation & Level Elevation',
      icon: 'fa-medal',
      badgeClass: 'bg-danger text-white',
      templateFile: 'promotion_letter_template.docx',
      category: 'Career Advancement',
      summary: 'Elevation to higher organizational band or title acknowledging exemplary performance, along with modified role expectations and revised compensation.',
      keyFields: ['New Designation / Role', 'Elevated Band / Grade', 'Effective Promotion Date', 'Enhanced Responsibilities', 'Revised CTC Structure']
    },
    {
      code: 'E',
      name: 'Experience / Relieving',
      desc: 'Service & Relieving Certificate',
      icon: 'fa-certificate',
      badgeClass: 'bg-dark text-white',
      templateFile: 'Experience_Letter_Template.docx',
      category: 'Separation & Service',
      summary: 'Official certification verifying total duration of service, designations held, conduct record, and formal release from all organizational obligations.',
      keyFields: ['Date of Joining', 'Last Working Date', 'Designation at Departure', 'Department', 'Conduct & Character Verification', 'Clearance Status']
    },
    {
      code: 'X',
      name: 'Confirmation Extension',
      desc: 'Probation Period Extension Notice',
      icon: 'fa-clock-rotate-left',
      badgeClass: 'bg-info text-dark',
      templateFile: 'CONFIRMATIONOFEXTENSION.docx',
      category: 'Probation Assessment',
      summary: 'Official notice advising extension of the employee probation period for further performance assessment and milestones review.',
      keyFields: ['Original Probation End Date', 'Extended Period Duration', 'Key Performance Improvement Areas', 'Next Review Date']
    }
  ];

  logs: AuditLogItem[] = [];
  allGroups: AuditGroupItem[] = [];
  filteredGroups: AuditGroupItem[] = [];
  displayedGroups: AuditGroupItem[] = [];
  isLoading: boolean = false;
  totalItems: number = 0;
  currentPage: number = 1;

  // Filters
  selectedField: string = '';
  selectedUser: string = '';
  availableFields: string[] = [];
  availableUsers: string[] = [];
  isFilterOpen: boolean = false;

  // Cached pagination items
  cachedPaginationItems: Array<{ type: 'page' | 'ellipsis', value: number | string, key: string }> = [];
  totalPagesCount: number = 1;

  // General Tab pagination and display
  generalSubTab: 'issued' | 'formats' = 'formats';
  filteredTemplates: StandardLetterTemplate[] = [];
  displayedTemplates: StandardLetterTemplate[] = [];
  displayedGeneralLetters: any[] = [];
  generalCurrentPage: number = 1;
  generalPageSize: number = 5;
  generalTotalPagesCount: number = 1;
  cachedGeneralPaginationItems: Array<{ type: 'page' | 'ellipsis', value: number | string, key: string }> = [];

  // CTC Breakdown State (Active on Tab 4 - Salary Details, matching Screenshot 1 ctcdetails)
  isCtcLoading: boolean = false;
  ctcEmployee: CtcEmployeeGroup | null = null;
  ctcComponentSearch: string = '';
  generalViewMode: 'ctc' | 'letters' = 'ctc';

  get isSalaryTab(): boolean {
    const docName = (this.documentName || '').toLowerCase();
    return docName.includes('salary') || docName.includes('head');
  }

  setGeneralViewMode(mode: 'ctc' | 'letters'): void {
    this.generalViewMode = mode;
  }

  toggleCtcView(): void {
    this.generalViewMode = this.generalViewMode === 'ctc' ? 'letters' : 'ctc';
    if (this.generalViewMode === 'ctc' && !this.ctcEmployee && this.documentId) {
      this.fetchCtcDetails();
    }
  }

  constructor(
    private employeeService: EmployeeMasterService,
    private hrLetterService: HrLetterService,
    private ctcService: CTCService,
    private dropdownService: DropdownService,
    private toastr: ToastrService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.view-dropdown-container')) {
      this.isViewDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    if (this.defaultView) {
      this.activeView = this.defaultView;
    }
    this.filteredTemplates = [...this.standardTemplates];
    this.updateGeneralPagination();

    if (this.documentId && this.documentName) {
      this.fetchLogs();
    }
    if (this.documentId) {
      this.fetchGeneralLetters();
      if (this.isSalaryTab) {
        this.fetchCtcDetails();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentId'] || changes['documentName']) {
      this.currentPage = 1;
      this.selectedField = '';
      this.selectedUser = '';
      if (this.documentId && this.documentName) {
        this.fetchLogs();
      } else {
        this.logs = [];
        this.allGroups = [];
        this.filteredGroups = [];
        this.displayedGroups = [];
        this.availableFields = [];
        this.availableUsers = [];
        this.totalItems = 0;
        this.updatePagination();
      }

      if (this.documentId) {
        this.fetchGeneralLetters();
        if (this.isSalaryTab) {
          this.fetchCtcDetails();
        }
      } else {
        this.generalLetters = [];
        this.filteredGeneralLetters = [];
        this.resetCtcState();
      }
    }
  }

  // --- View Switching (Dropdown) ---
  toggleViewDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }

  selectView(view: 'audit' | 'general'): void {
    this.activeView = view;
    this.isViewDropdownOpen = false;
    if (view === 'general' && this.generalLetters.length === 0 && this.documentId) {
      this.fetchGeneralLetters();
    }
    if (view === 'audit' && this.documentId && this.documentName && this.logs.length === 0) {
      this.fetchLogs();
    }
  }

  // --- General Tab Letter Methods ---
  fetchGeneralLetters(): void {
    if (!this.documentId) {
      this.generalLetters = [];
      this.filteredGeneralLetters = [];
      return;
    }

    this.isGeneralLoading = true;
    this.hrLetterService.getEmployeeLetters(this.documentId).subscribe({
      next: (res: any) => {
        this.isGeneralLoading = false;
        if (res && res.isSuccess && res.data) {
          this.generalLetters = Array.isArray(res.data) ? res.data : [res.data];
        } else {
          this.generalLetters = [];
        }
        this.generalSubTab = 'issued';
        this.applyGeneralFilter();
      },
      error: (err: any) => {
        this.isGeneralLoading = false;
        console.error('Failed to fetch employee letters:', err);
        this.generalLetters = [];
        this.generalSubTab = 'issued';
        this.applyGeneralFilter();
      }
    });
  }

  setGeneralSubTab(tab: 'issued' | 'formats'): void {
    this.generalSubTab = 'issued';
    this.generalCurrentPage = 1;
    this.applyGeneralFilter();
  }

  getIssuedLetterForTemplate(tmpl: StandardLetterTemplate): any {
    if (!this.generalLetters || this.generalLetters.length === 0 || !tmpl) return null;
    const code = (tmpl.code || '').toLowerCase().trim();
    const name = (tmpl.name || '').toLowerCase().trim();
    return this.generalLetters.find(l => {
      const lType = (l.formattype || '').toLowerCase().trim();
      const lName = (l.formatTypeName || l.name || '').toLowerCase().trim();
      return (code && (lType === code || lName.includes(code))) ||
        (name && (lName.includes(name) || name.includes(lName)));
    }) || null;
  }

  hasLetterGenerated(tmpl: StandardLetterTemplate): boolean {
    return !!this.getIssuedLetterForTemplate(tmpl);
  }

  applyGeneralFilter(): void {
    const search = (this.generalSearchText || '').toLowerCase().trim();

    if (!search) {
      this.filteredGeneralLetters = [...this.generalLetters];
    } else {
      this.filteredGeneralLetters = this.generalLetters.filter(l => {
        const name = (l.name || '').toLowerCase();
        const type = (l.formatTypeName || l.formattype || '').toLowerCase();
        const ref = (l.refno || '').toLowerCase();
        const desc = (l.description || '').toLowerCase();
        const dept = (l.department || '').toLowerCase();
        return name.includes(search) || type.includes(search) || ref.includes(search) || desc.includes(search) || dept.includes(search);
      });
    }

    this.generalCurrentPage = 1;
    this.updateGeneralPagination();
  }

  clearGeneralSearch(): void {
    this.generalSearchText = '';
    this.applyGeneralFilter();
  }

  goToGeneralPage(page: number | string): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.generalTotalPagesCount || page === this.generalCurrentPage) return;
    this.generalCurrentPage = page;
    this.updateGeneralPagination();
  }

  updateDisplayedGeneralItems(): void {
    const start = (this.generalCurrentPage - 1) * this.generalPageSize;
    const end = start + this.generalPageSize;
    this.displayedGeneralLetters = this.filteredGeneralLetters.slice(start, end);
  }

  updateGeneralPagination(): void {
    const total = this.filteredGeneralLetters.length;
    const perPage = this.generalPageSize || 5;
    this.generalTotalPagesCount = Math.max(1, Math.ceil(total / perPage));

    const totalPages = this.generalTotalPagesCount;
    const current = this.generalCurrentPage;
    const items: Array<{ type: 'page' | 'ellipsis', value: number | string, key: string }> = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push({ type: 'page', value: i, key: `gp-${i}` });
      }
    } else {
      items.push({ type: 'page', value: 1, key: 'gp-1' });

      if (current <= 3) {
        items.push({ type: 'page', value: 2, key: 'gp-2' });
        items.push({ type: 'page', value: 3, key: 'gp-3' });
        items.push({ type: 'ellipsis', value: '...', key: 'ge-end' });
        items.push({ type: 'page', value: totalPages, key: `gp-${totalPages}` });
      } else if (current >= totalPages - 2) {
        items.push({ type: 'ellipsis', value: '...', key: 'ge-start' });
        items.push({ type: 'page', value: totalPages - 2, key: `gp-${totalPages - 2}` });
        items.push({ type: 'page', value: totalPages - 1, key: `gp-${totalPages - 1}` });
        items.push({ type: 'page', value: totalPages, key: `gp-${totalPages}` });
      } else {
        items.push({ type: 'ellipsis', value: '...', key: 'ge-start' });
        items.push({ type: 'page', value: current, key: `gp-${current}` });
        items.push({ type: 'ellipsis', value: '...', key: 'ge-end' });
        items.push({ type: 'page', value: totalPages, key: `gp-${totalPages}` });
      }
    }

    this.cachedGeneralPaginationItems = items;
    this.updateDisplayedGeneralItems();
  }

  downloadLetter(letter: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!letter || !letter.pk_trnid) {
      this.toastr.warning('Letter identifier missing.', 'Warning');
      return;
    }

    this.downloadingLetterId = letter.pk_trnid;
    this.hrLetterService.downloadFormat(letter.pk_trnid).subscribe({
      next: (response: Blob) => {
        this.downloadingLetterId = null;
        if (!response) {
          this.toastr.error('File not received from server', 'Error');
          return;
        }

        const fileType = response.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const extension = fileType.includes('pdf') ? 'pdf' : 'docx';
        const blob = new Blob([response], { type: fileType });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const rawName = letter.formatTypeName || letter.name || 'Employee_Letter';
        const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `${safeName}_${letter.pk_trnid}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.toastr.success('Letter downloaded successfully', 'Success');
      },
      error: (err: any) => {
        this.downloadingLetterId = null;
        console.error('Failed to download letter:', err);
        this.toastr.error('Failed to download letter', 'Error');
      }
    });
  }

  // Open Template View Modal
  openTemplateViewModal(tmpl: StandardLetterTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedTemplateForView = tmpl;
    this.isTemplateModalOpen = true;
  }

  // Close Template View Modal
  closeTemplateViewModal(): void {
    this.isTemplateModalOpen = false;
    this.selectedTemplateForView = null;
  }

  // View Issued Letter (Opens PDF directly in pop-up modal on the same tab)
  viewIssuedLetter(letter: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!letter || !letter.pk_trnid) {
      this.toastr.warning('Letter identifier missing.', 'Warning');
      return;
    }

    this.viewingLetterId = letter.pk_trnid;
    this.hrLetterService.downloadFormat(letter.pk_trnid).subscribe({
      next: (response: Blob) => {
        this.viewingLetterId = null;
        if (!response) {
          this.toastr.error('File not received from server', 'Error');
          return;
        }

        // Revoke previous object URL if any to prevent memory leaks
        if (this.selectedLetterRawUrl) {
          window.URL.revokeObjectURL(this.selectedLetterRawUrl);
          this.selectedLetterRawUrl = null;
        }

        // Backend always generates PDF via Syncfusion ConvertToPDF
        const blob = new Blob([response], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        this.selectedLetterRawUrl = blobUrl;
        const letterName = letter.formatTypeName || letter.name || 'Official Letter';
        this.selectedLetterTitle = letterName.toLowerCase().includes('preview')
          ? letterName
          : `${letterName} Preview`;
        this.selectedLetterCurrentItem = letter;

        // Bypass security for iframe display in pop-up view on the same tab
        // Use #toolbar=0&navpanes=0&scrollbar=0 to hide dark viewer toolbar, matching Exit module preview
        this.selectedLetterPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          blobUrl + '#toolbar=0&navpanes=0&scrollbar=0'
        );
        this.isLetterPdfModalOpen = true;
      },
      error: (err: any) => {
        this.viewingLetterId = null;
        console.error('Failed to view letter:', err);
        this.toastr.error('Failed to retrieve document for viewing', 'Error');
      }
    });
  }

  closeLetterPdfModal(): void {
    this.isLetterPdfModalOpen = false;
    this.selectedLetterPdfUrl = null;
    this.selectedLetterCurrentItem = null;
    if (this.selectedLetterRawUrl) {
      window.URL.revokeObjectURL(this.selectedLetterRawUrl);
      this.selectedLetterRawUrl = null;
    }
  }

  downloadCurrentModalLetter(): void {
    if (this.selectedLetterCurrentItem) {
      this.downloadLetter(this.selectedLetterCurrentItem);
    }
  }

  navigateToGenerate(tmpl?: StandardLetterTemplate | null, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.closeTemplateViewModal();
    if (tmpl && tmpl.code === 'OFFER') {
      this.router.navigate(['/dash/hr/hrdashboard/Candidate_list']);
    } else if (tmpl) {
      this.router.navigate(['/dash/hr/hrdashboard/Generate_letters'], {
        queryParams: { formType: tmpl.code, empId: this.documentId }
      });
    } else {
      this.router.navigate(['/dash/hr/hrdashboard/Generate_letters'], {
        queryParams: { empId: this.documentId }
      });
    }
  }

  public refresh(event?: Event): void {
    if (event?.currentTarget) {
      (event.currentTarget as HTMLElement).blur();
    }
    if (this.documentId && this.documentName) {
      this.fetchLogs();
    }
    if (this.documentId) {
      this.fetchGeneralLetters();
      if (this.isSalaryTab) {
        this.fetchCtcDetails();
      }
    }
  }

  resetCtcState(): void {
    this.ctcEmployee = null;
    this.ctcComponentSearch = '';
  }

  getInitials(name: string): string {
    return (name || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  filteredCtcComponents(): CtcComponentItem[] {
    if (!this.ctcEmployee?.components) return [];
    if (!this.ctcComponentSearch) return this.ctcEmployee.components;
    const q = this.ctcComponentSearch.toLowerCase().trim();
    return this.ctcEmployee.components.filter(c => (c.shortdesc || '').toLowerCase().includes(q));
  }

  fetchCtcDetails(): void {
    if (!this.documentId) return;
    this.isCtcLoading = true;

    // 1. Fetch employee head details to get employee code
    this.employeeService.getById_employeeHeadDetails(this.documentId).subscribe({
      next: (res: any) => {
        const mst = res?.data?.EmployeeHeadMst || res?.data?.employeeHeadMst;
        const empCode = (mst?.empcode || mst?.empCode || '').toString().trim();

        // 2. Fetch locations and departments to query getAllCTCforAdmin
        forkJoin({
          locations: this.dropdownService.getLocations(),
          departments: this.dropdownService.getDepartments()
        }).subscribe({
          next: ({ locations, departments }) => {
            const locIds = (locations || []).map((l: any) => l.value).filter((v: any) => !!v);
            const deptIds = (departments || []).map((d: any) => d.value).filter((v: any) => !!v);

            this.ctcService.getAllCTCforAdmin({
              empCode: empCode,
              selectedLocations: locIds,
              selectedDepartments: deptIds
            }, 0, 0).subscribe({
              next: (ctcRes: any) => {
                this.isCtcLoading = false;
                if (ctcRes?.isSuccess && ctcRes?.data) {
                  const ctcList: any[] = ctcRes.data.ctcList || [];
                  const ctcGross: any[] = ctcRes.data.ctcGross || [];

                  const matchedItems = ctcList.filter((item: any) =>
                    item.fk_empid === this.documentId ||
                    (empCode && item.emp_code && item.emp_code.toString().trim().toLowerCase() === empCode.toLowerCase())
                  );

                  const matchedGross = ctcGross.find((g: any) =>
                    g.fk_empid === this.documentId ||
                    (empCode && g.emp_code && g.emp_code.toString().trim().toLowerCase() === empCode.toLowerCase())
                  );

                  if (matchedItems.length > 0) {
                    const first = matchedItems[0];
                    this.ctcEmployee = {
                      emp_name: first.emp_name,
                      emp_code: first.emp_code,
                      total_Month: matchedGross ? matchedGross.Total_Month : null,
                      total_Year: matchedGross ? matchedGross.Total_Year : null,
                      components: matchedItems.map((c: any) => ({
                        shortdesc: c.shortdesc,
                        amount: Number(c.amount) || 0,
                        amount_yearly: Number(c.amount_yearly) || 0
                      }))
                    };
                    return;
                  }
                }
                this.ctcEmployee = null;
              },
              error: () => {
                this.isCtcLoading = false;
                this.ctcEmployee = null;
              }
            });
          },
          error: () => {
            this.isCtcLoading = false;
            this.ctcEmployee = null;
          }
        });
      },
      error: () => {
        this.isCtcLoading = false;
        this.ctcEmployee = null;
      }
    });
  }

  navigateToRoute(path: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate([path]);
  }

  getLetterBadge(letter: any): { icon: string, bg: string, color: string, border: string } {
    const type = (letter?.formatTypeName || letter?.name || letter?.formattype || '').toLowerCase();
    if (type.includes('promotion') || type === 'r') {
      return { icon: 'fa-arrow-trend-up', bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
    } else if (type.includes('increment') || type === 'd') {
      return { icon: 'fa-calculator', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    } else if (type.includes('confirmation') || type === 'b' || type === 'c' || type === 'x') {
      return { icon: 'fa-file-lines', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
    } else if (type.includes('appointment') || type === 'a') {
      return { icon: 'fa-briefcase', bg: '#cffafe', color: '#0e7490', border: '#a5f3fc' };
    } else if (type.includes('offer') || type === 'o') {
      return { icon: 'fa-envelope-open-text', bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
    } else if (type.includes('transfer') || type === 'f') {
      return { icon: 'fa-plane', bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4' };
    }
    return { icon: 'fa-file-text', bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
  }

  fetchLogs(): void {
    if (!this.documentId || !this.documentName) return;
    this.isLoading = true;
    this.employeeService.getTabAuditLogs(
      this.documentId,
      this.documentName,
      this.currentPage,
      this.pageSize,
      this.selectedUser || undefined,
      this.selectedField || undefined
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.isSuccess && res.data) {
          this.logs = res.data.logs || res.data.Logs || [];
          this.totalItems = res.data.totalCount ?? res.data.TotalCount ?? 0;
          this.displayedGroups = this.groupLogs(this.logs);
          this.allGroups = [...this.displayedGroups];
          this.filteredGroups = [...this.displayedGroups];
          this.extractFilterOptions();
          this.updatePagination();
        } else {
          this.logs = [];
          this.allGroups = [];
          this.filteredGroups = [];
          this.displayedGroups = [];
          this.totalItems = 0;
          this.updatePagination();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to fetch audit logs:', err);
        this.logs = [];
        this.allGroups = [];
        this.filteredGroups = [];
        this.displayedGroups = [];
        this.totalItems = 0;
        this.updatePagination();
      }
    });
  }

  extractFilterOptions(): void {
    const fieldSet = new Set<string>(this.availableFields);
    const userSet = new Set<string>(this.availableUsers);

    for (const log of this.logs) {
      const fieldName = this.formatFieldName(log.fieldName);
      if (fieldName) {
        fieldSet.add(fieldName);
      }
      const userName = this.getUserDisplayName(log.entryBy);
      if (userName) {
        userSet.add(userName);
      }
    }

    this.availableFields = Array.from(fieldSet).sort((a, b) => a.localeCompare(b));
    this.availableUsers = Array.from(userSet).sort((a, b) => a.localeCompare(b));
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.fetchLogs();
  }

  resetFilters(): void {
    this.selectedField = '';
    this.selectedUser = '';
    this.currentPage = 1;
    this.fetchLogs();
  }

  toggleFilter(event?: Event): void {
    if (event?.currentTarget) {
      (event.currentTarget as HTMLElement).blur();
    }
    this.isFilterOpen = !this.isFilterOpen;
  }

  groupLogs(rawLogs: AuditLogItem[]): AuditGroupItem[] {
    const groups: AuditGroupItem[] = [];

    for (const item of rawLogs) {
      const itemTime = item.entryDate ? new Date(item.entryDate).getTime() : 0;

      // Cluster by same user and within 5 seconds (single form submit)
      const existingGroup = groups.find(g => {
        if (g.entryBy !== item.entryBy) return false;
        const groupTime = g.entryDate ? new Date(g.entryDate).getTime() : 0;
        return Math.abs(groupTime - itemTime) <= 5000;
      });

      const fieldChange: AuditFieldChange = {
        fieldName: this.formatFieldName(item.fieldName),
        previousValue: item.previousValue,
        currentValue: item.currentValue,
        logId: item.logId
      };

      if (existingGroup) {
        if (!existingGroup.fields.some(f => f.fieldName === fieldChange.fieldName)) {
          existingGroup.fields.push(fieldChange);
        }
      } else {
        groups.push({
          entryBy: item.entryBy,
          entryDate: item.entryDate,
          fields: [fieldChange]
        });
      }
    }

    return groups;
  }

  updateDisplayedGroups(): void {
    this.displayedGroups = [...this.filteredGroups];
  }

  toggleFactBox(): void {
    this.onToggle.emit();
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPagesCount || page === this.currentPage) return;
    this.currentPage = page;
    this.fetchLogs();
  }

  updatePagination(): void {
    const total = this.totalItems || 0;
    const perPage = this.pageSize || 5;
    this.totalPagesCount = Math.max(1, Math.ceil(total / perPage));

    const totalPages = this.totalPagesCount;
    const current = this.currentPage;
    const items: Array<{ type: 'page' | 'ellipsis', value: number | string, key: string }> = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push({ type: 'page', value: i, key: `p-${i}` });
      }
    } else {
      items.push({ type: 'page', value: 1, key: 'p-1' });

      if (current <= 3) {
        items.push({ type: 'page', value: 2, key: 'p-2' });
        items.push({ type: 'page', value: 3, key: 'p-3' });
        items.push({ type: 'ellipsis', value: '...', key: 'e-end' });
        items.push({ type: 'page', value: totalPages, key: `p-${totalPages}` });
      } else if (current >= totalPages - 2) {
        items.push({ type: 'ellipsis', value: '...', key: 'e-start' });
        items.push({ type: 'page', value: totalPages - 2, key: `p-${totalPages - 2}` });
        items.push({ type: 'page', value: totalPages - 1, key: `p-${totalPages - 1}` });
        items.push({ type: 'page', value: totalPages, key: `p-${totalPages}` });
      } else {
        items.push({ type: 'ellipsis', value: '...', key: 'e-start' });
        items.push({ type: 'page', value: current, key: `p-${current}` });
        items.push({ type: 'ellipsis', value: '...', key: 'e-end' });
        items.push({ type: 'page', value: totalPages, key: `p-${totalPages}` });
      }
    }

    this.cachedPaginationItems = items;
  }

  get displayTitle(): string {
    if (this.title && this.title !== 'Tab Audit Log' && this.title !== 'Audit Log') {
      return this.title;
    }
    return 'Audit Log';
  }

  formatFieldName(fieldName: string): string {
    return fieldName || '';
  }

  formatValue(val: string | null | undefined): string {
    if (val === null || val === undefined) return '(blank)';
    const str = String(val).trim();
    if (!str || str === 'null' || str === 'undefined' || str === '(blank)') {
      return '(blank)';
    }

    // Handle standard SQL null date sentinels (1900-01-01 / 01-Jan-1900 / Jan 1 1900)
    if (
      str.startsWith('1900-01-01') ||
      str.startsWith('01-01-1900') ||
      str.includes('1900 12:00AM') ||
      str.includes('Jan  1 1900') ||
      str.includes('Jan 1 1900') ||
      str.startsWith('01-Jan-1900')
    ) {
      return '(blank)';
    }

    // Format boolean text
    if (str.toLowerCase() === 'true') return 'Yes';
    if (str.toLowerCase() === 'false') return 'No';

    // Format ISO date strings if present
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str) || /^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const d = parsed.getDate().toString().padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = months[parsed.getMonth()];
        const y = parsed.getFullYear();
        if (y === 1900) return '(blank)';
        return `${d}-${m}-${y}`;
      }
    }

    return str;
  }

  getUserDisplayName(entryBy: string): string {
    if (!entryBy || entryBy === 'Unknown' || entryBy === 'null') return 'System';
    return entryBy;
  }

  trackByKey(index: number, item: any): string {
    return item?.key || `${index}`;
  }

  trackByGroup(index: number, item: AuditGroupItem): string {
    return `${item?.entryDate}_${item?.entryBy}_${index}`;
  }
}
