import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';
import { MenuService } from '../../services/menu.service';

export interface WorkflowNavItem {
  label: string;
  route?: string;
  type?: 'attendance' | 'leave' | 'salary';
  icon: string;
  isPrimary?: boolean;
  colorClass?: string;
}

export interface WorkflowStepConfig {
  stepNumber: number;
  badge: string;
  title: string;
  previousSteps: WorkflowNavItem[];
  nextSteps: WorkflowNavItem[];
  reports: WorkflowNavItem[];
}

@Component({
  selector: 'app-workflow-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-sidebar.component.html',
  styleUrl: './workflow-sidebar.component.scss'
})
export class WorkflowSidebarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() currentStep: string = '';
  @Input() hasFactBox: boolean = false;
  @Input() factBoxTitle: string = 'Fact Box';
  @Input() totalSteps: number = 7;
  @Input() returnUrl?: string;
  @Input() returnLabel?: string;
  @Input() isOpen: boolean = true;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  /**
   * Optional callback: parent page should supply a function that reads
   * Month, Year & CostCentre from its form and returns { month, year, costCentre }.
   * The sidebar will call this before navigating so context is auto-saved.
   */
  @Input() getContextFn?: () => { month: number | null; year: number | null; costCentre: any };

  toggleOpen(): void {
    this.workflowNav.toggleSidebar();
    this.isOpen = this.workflowNav.isSidebarOpen;
    this.isOpenChange.emit(this.isOpen);
    this.onClose.emit();
  }

  private router = inject(Router);
  public workflowNav = inject(WorkflowNavigationService);
  public menuService = inject(MenuService);

  private rawConfig: WorkflowStepConfig | null = null;
  private menuSub?: Subscription;

  stepConfig: WorkflowStepConfig = {
    stepNumber: 1,
    badge: 'Step 1',
    title: 'Payroll Actions',
    previousSteps: [],
    nextSteps: [],
    reports: []
  };

  ngOnInit(): void {
    this.initConfig();
    // Re-apply whenever user menu changes or is loaded from API
    this.menuSub = this.menuService.menu$.subscribe(() => {
      this.applyPermissions();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentStep'] && !changes['currentStep'].firstChange) {
      this.initConfig();
    }
  }

  ngOnDestroy(): void {
    this.menuSub?.unsubscribe();
  }

  canShowReturnBack(): boolean {
    if (!this.returnUrl) return false;
    return this.workflowNav.hasAccess(this.returnUrl, this.returnLabel);
  }

  get isReportMode(): boolean {
    return this.currentStep === 'report' || !!this.returnUrl;
  }

  get headerTitle(): string {
    if (this.isReportMode) return 'Quick Navigation';
    if (this.hasFactBox) return this.factBoxTitle || 'Overview & Actions';
    return this.stepConfig.title || 'Payroll Actions';
  }

  get headerIcon(): string {
    if (this.isReportMode) return 'bi bi-file-earmark-bar-graph';
    if (this.hasFactBox) return 'bi bi-pie-chart-fill';
    return 'bi bi-lightning-charge-fill';
  }

  get stepBadge(): string {
    if (this.isReportMode) return 'Reports';
    return this.stepConfig.badge || `Step ${this.stepConfig.stepNumber}`;
  }

  public applyPermissions(): void {
    if (!this.rawConfig) return;

    this.stepConfig = {
      ...this.rawConfig,
      previousSteps: (this.rawConfig.previousSteps || []).filter(item =>
        this.workflowNav.hasAccess(item.route, item.label, item.type)
      ),
      nextSteps: (this.rawConfig.nextSteps || []).filter(item =>
        this.workflowNav.hasAccess(item.route, item.label, item.type)
      ),
      reports: (this.rawConfig.reports || []).filter(item =>
        this.workflowNav.hasAccess(item.route, item.label, item.type)
      )
    };
  }

  private initConfig(): void {
    const ROUTES = this.workflowNav.ROUTES;

    switch (this.currentStep) {
      case 'import-daywise':
      case 'import-daywise-attendance':
        this.rawConfig = {
          stepNumber: 1,
          badge: 'Step 1',
          title: 'Payroll Actions',
          previousSteps: [],
          nextSteps: [
            { label: 'Monthly Attendance', route: ROUTES.MONTHLY_ATTENDANCE, icon: 'bi bi-calendar-check', isPrimary: true },
            { label: 'Attendance Adjustment', route: ROUTES.ATTENDANCE_ADJUSTMENT, icon: 'bi bi-sliders' }
          ],
          reports: [
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'monthly-attendance':
        this.rawConfig = {
          stepNumber: 2,
          badge: 'Step 2',
          title: 'Payroll Actions',
          previousSteps: [
            { label: 'Import Day-Wise Attendance', route: ROUTES.IMPORT_DAYWISE_ATTENDANCE, icon: 'bi bi-cloud-arrow-up' }
          ],
          nextSteps: [
            { label: 'Attendance Adjustment', route: ROUTES.ATTENDANCE_ADJUSTMENT, icon: 'bi bi-sliders' },
            { label: 'Arrear Process', route: ROUTES.ARREAR_PROCESS, icon: 'bi bi-clock-history' },
            { label: 'Auto Salary Process', route: ROUTES.AUTO_SALARY_PROCESS, icon: 'bi bi-calculator', isPrimary: true }
          ],
          reports: [
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'attendance-adjustment':
        this.rawConfig = {
          stepNumber: 3,
          badge: 'Step 3',
          title: 'Payroll Actions',
          previousSteps: [
            { label: 'Monthly Attendance', route: ROUTES.MONTHLY_ATTENDANCE, icon: 'bi bi-calendar-check' },
            { label: 'Import Day-Wise Attendance', route: ROUTES.IMPORT_DAYWISE_ATTENDANCE, icon: 'bi bi-cloud-arrow-up' }
          ],
          nextSteps: [
            { label: 'Arrear Process', route: ROUTES.ARREAR_PROCESS, icon: 'bi bi-clock-history' },
            { label: 'Auto Salary Process', route: ROUTES.AUTO_SALARY_PROCESS, icon: 'bi bi-calculator', isPrimary: true }
          ],
          reports: [
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'arrear-process':
        this.rawConfig = {
          stepNumber: 4,
          badge: 'Step 4',
          title: 'Payroll Actions',
          previousSteps: [
            { label: 'Monthly Attendance', route: ROUTES.MONTHLY_ATTENDANCE, icon: 'bi bi-calendar-check' },
            { label: 'Attendance Adjustment', route: ROUTES.ATTENDANCE_ADJUSTMENT, icon: 'bi bi-sliders' }
          ],
          nextSteps: [
            { label: 'Auto Salary Process', route: ROUTES.AUTO_SALARY_PROCESS, icon: 'bi bi-calculator', isPrimary: true }
          ],
          reports: [
            { label: 'Salary Report', type: 'salary', icon: 'bi bi-file-earmark-excel' },
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'auto-salary-process':
        this.rawConfig = {
          stepNumber: 5,
          badge: 'Step 5',
          title: 'Payroll Actions',
          previousSteps: [
            { label: 'Monthly Attendance', route: ROUTES.MONTHLY_ATTENDANCE, icon: 'bi bi-calendar-check' },
            { label: 'Arrear Process', route: ROUTES.ARREAR_PROCESS, icon: 'bi bi-clock-history' }
          ],
          nextSteps: [
            { label: 'Manual Income Tax', route: ROUTES.MANUAL_INCOME_TAX, icon: 'bi bi-percent' },
            { label: 'Salary Lock', route: ROUTES.SALARY_LOCK, icon: 'bi bi-lock-fill', isPrimary: true }
          ],
          reports: [
            { label: 'Salary Report', type: 'salary', icon: 'bi bi-file-earmark-excel' },
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'manual-income-tax':
        this.rawConfig = {
          stepNumber: 6,
          badge: 'Step 6',
          title: 'Payroll Actions',
          previousSteps: [
            { label: 'Auto Salary Process', route: ROUTES.AUTO_SALARY_PROCESS, icon: 'bi bi-calculator' },
            { label: 'Arrear Process', route: ROUTES.ARREAR_PROCESS, icon: 'bi bi-clock-history' }
          ],
          nextSteps: [
            { label: 'Salary Lock', route: ROUTES.SALARY_LOCK, icon: 'bi bi-lock-fill', isPrimary: true }
          ],
          reports: [
            { label: 'Salary Report', type: 'salary', icon: 'bi bi-file-earmark-excel' },
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'salary-lock':
        this.rawConfig = {
          stepNumber: 7,
          badge: 'Step 7',
          title: 'Payroll Actions',
          previousSteps: [
            { label: 'Auto Salary Process', route: ROUTES.AUTO_SALARY_PROCESS, icon: 'bi bi-calculator' },
            { label: 'Manual Income Tax', route: ROUTES.MANUAL_INCOME_TAX, icon: 'bi bi-percent' }
          ],
          nextSteps: [],
          reports: [
            { label: 'Salary Report', type: 'salary', icon: 'bi bi-file-earmark-excel', isPrimary: true },
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;

      case 'report':
        this.rawConfig = {
          stepNumber: 0,
          badge: 'Report',
          title: 'Quick Navigation',
          previousSteps: [
            { label: 'Monthly Attendance', route: ROUTES.MONTHLY_ATTENDANCE, icon: 'bi bi-calendar-check' },
            { label: 'Auto Salary Process', route: ROUTES.AUTO_SALARY_PROCESS, icon: 'bi bi-calculator' },
            { label: 'Salary Lock', route: ROUTES.SALARY_LOCK, icon: 'bi bi-lock-fill' }
          ],
          nextSteps: [],
          reports: [
            { label: 'Salary Report', type: 'salary', icon: 'bi bi-file-earmark-excel' },
            { label: 'Attendance Report', type: 'attendance', icon: 'bi bi-file-earmark-text' },
            { label: 'Leave Report', type: 'leave', icon: 'bi bi-airplane' }
          ]
        };
        break;
    }

    this.applyPermissions();
  }

  getItemColorClass(item: WorkflowNavItem): string {
    if (item.colorClass) return item.colorClass;
    const label = (item.label || '').toLowerCase();
    const type = (item.type || '').toLowerCase();

    // 1. Green Theme: Monthly Attendance, Auto Salary Process, Salary Report
    if (label.includes('monthly attendance') || label.includes('auto salary') || type === 'salary') {
      return 'action-btn-green';
    }
    // 2. Blue Theme: Attendance Adjustment, Day-Wise Attendance, Return back
    if (label.includes('attendance adjust') || label.includes('day-wise') || label.includes('back to')) {
      return 'action-btn-blue';
    }
    // 3. Amber Theme: Arrear Process, Attendance Report
    if (label.includes('arrear') || label.includes('attendance report') || type === 'attendance') {
      return 'action-btn-amber';
    }
    // 4. Purple Theme: Leave Report, Salary Lock
    if (label.includes('leave') || label.includes('salary lock') || type === 'leave') {
      return 'action-btn-purple';
    }
    // 5. Cyan Theme: Manual Income Tax
    if (label.includes('income tax')) {
      return 'action-btn-cyan';
    }

    return item.isPrimary ? 'action-btn-green' : 'action-btn-blue';
  }

  navigate(route?: string): void {
    if (route) {
      // Save context before navigating so the next page can auto-patch its form
      if (this.getContextFn) {
        try {
          const ctx = this.getContextFn();
          this.workflowNav.savePayrollContext(ctx.month, ctx.year, ctx.costCentre);
        } catch (_) { /* getContextFn is optional */ }
      }
      this.router.navigateByUrl(route);
    }
  }

  openReport(reportType?: 'attendance' | 'leave' | 'salary'): void {
    if (reportType) {
      if (this.getContextFn) {
        try {
          const ctx = this.getContextFn();
          if (ctx) {
            this.workflowNav.savePayrollContext(ctx.month, ctx.year, ctx.costCentre);
          }
        } catch (_) {}
      }
      const currentLabel = this.stepConfig.title || this.currentStep;
      this.workflowNav.navigateToReport(reportType, this.router.url, currentLabel);
    }
  }

  returnBack(): void {
    if (this.getContextFn) {
      try {
        const ctx = this.getContextFn();
        if (ctx) {
          this.workflowNav.prepareWorkflowNavigation(ctx.month, ctx.year, ctx.costCentre);
        }
      } catch (_) {}
    }
    this.workflowNav.returnToOrigin(this.returnUrl);
  }
}
