import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';

export interface WorkflowStep {
  id: string;
  title: string;
  stageNumber: number;
  totalStages: number;
  route: string;
  nextSteps: { label: string; route: string; icon: string }[];
  previousSteps: { label: string; route: string; icon: string }[];
  reports: { label: string; type: 'attendance' | 'leave' | 'salary'; icon: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowNavigationService {
  private router = inject(Router);
  private menuService = inject(MenuService);

  // Global Sidebar Toggle State
  public isSidebarOpen: boolean = true;

  toggleSidebar(isOpen?: boolean): void {
    this.isSidebarOpen = isOpen !== undefined ? isOpen : !this.isSidebarOpen;
  }

  // ─── Payroll Context: Workflow Navigation State ─────────────────────────────
  /**
   * Flag indicating whether navigation was triggered specifically from the Workflow Sidebar / Fact Box.
   * Only when true will the next page auto-patch Month, Year & CostCentre.
   * If the user arrives via menu or search, this flag is false and the page loads clean.
   */
  public isFromWorkflowNavigation: boolean = false;

  public pendingWorkflowPatch: {
    fkMonthId: any;
    fkYearId: any;
    fkCostCentreId: any;
  } | null = null;

  /**
   * Called strictly when the user clicks a navigation link in the Workflow Sidebar / Fact Box.
   * Preserves previous selections if the current page lacks a field (e.g. Contractor).
   */
  prepareWorkflowNavigation(month: any = null, year: any = null, costCentre: any = null): void {
    this.isFromWorkflowNavigation = true;

    const prev = this.pendingWorkflowPatch;
    const finalMonth = (month !== null && month !== undefined && month !== '') ? month : (prev?.fkMonthId ?? null);
    const finalYear = (year !== null && year !== undefined && year !== '') ? year : (prev?.fkYearId ?? null);

    let finalCostCentre = costCentre;
    if (costCentre === null || costCentre === undefined || (Array.isArray(costCentre) && costCentre.length === 0)) {
      if (prev?.fkCostCentreId && (!Array.isArray(prev.fkCostCentreId) || prev.fkCostCentreId.length > 0)) {
        finalCostCentre = prev.fkCostCentreId;
      }
    }

    this.pendingWorkflowPatch = {
      fkMonthId: finalMonth,
      fkYearId: finalYear,
      fkCostCentreId: finalCostCentre
    };
  }

  // Alias for backward compatibility
  savePayrollContext(month: any = null, year: any = null, costCentre: any = null): void {
    this.prepareWorkflowNavigation(month, year, costCentre);
  }

  get hasPayrollContext(): boolean {
    return this.isFromWorkflowNavigation && this.pendingWorkflowPatch !== null &&
      (this.pendingWorkflowPatch.fkMonthId != null || this.pendingWorkflowPatch.fkYearId != null);
  }

  get payrollContext(): { fkMonthId: any; fkYearId: any; fkCostCentreId: any } {
    return this.pendingWorkflowPatch || { fkMonthId: null, fkYearId: null, fkCostCentreId: [] };
  }

  /**
   * Resolves target value against a dropdown items list.
   * Handles string vs number (e.g. "1" vs 1), full month names, and abbreviations.
   */
  findMatchingValue(items: any[], target: any): any {
    if (!items || !items.length || target === null || target === undefined || target === '') {
      return target;
    }

    // 1. Strict equality on item.value
    const strictVal = items.find(i => i && i.value === target);
    if (strictVal) return strictVal.value;

    // 2. Loose equality on item.value ("1" == 1, 2026 == "2026")
    const looseVal = items.find(i => i && i.value == target);
    if (looseVal) return looseVal.value;

    // 3. String comparison (case-insensitive) on item.value
    const strTarget = String(target).trim().toLowerCase();
    const strVal = items.find(i => i && i.value != null && String(i.value).trim().toLowerCase() === strTarget);
    if (strVal) return strVal.value;

    // 4. Match target against item.name
    const nameMatch = items.find(i => i && i.name != null && String(i.name).trim().toLowerCase() === strTarget);
    if (nameMatch) return nameMatch.value;

    // 5. If target is number 1..12 or string representation, match Month name/abbreviation
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const numTarget = Number(target);
    if (!isNaN(numTarget) && numTarget >= 1 && numTarget <= 12) {
      const expectedFull = monthNames[numTarget - 1];
      const expectedShort = shortMonthNames[numTarget - 1];
      const byName = items.find(i => {
        const n = String(i?.name || '').trim().toLowerCase();
        return n === expectedFull || n === expectedShort;
      });
      if (byName) return byName.value;

      const byVal = items.find(i => {
        const v = String(i?.value || '').trim().toLowerCase();
        return v === expectedFull || v === expectedShort || Number(v) === numTarget;
      });
      if (byVal) return byVal.value;
    }

    // 6. If target is Month name/abbreviation (e.g. "October", "oct") and items has 1..12 or month name
    const fullIdx = monthNames.indexOf(strTarget);
    const shortIdx = shortMonthNames.indexOf(strTarget);
    const resolvedMonthNum = fullIdx !== -1 ? fullIdx + 1 : (shortIdx !== -1 ? shortIdx + 1 : null);
    if (resolvedMonthNum !== null) {
      const byNum = items.find(i => Number(i?.value) === resolvedMonthNum || Number(i?.name) === resolvedMonthNum);
      if (byNum) return byNum.value;
      const byExpectedName = items.find(i => {
        const n = String(i?.name || '').trim().toLowerCase();
        return n === monthNames[resolvedMonthNum - 1] || n === shortMonthNames[resolvedMonthNum - 1];
      });
      if (byExpectedName) return byExpectedName.value;
    }

    return target;
  }

  /**
   * Resolves CostCenter values against a dropdown items list
   */
  findMatchingCostCenter(items: any[], target: any): any {
    if (!items || !items.length || target === null || target === undefined) return target;

    const matchSingle = (t: any) => {
      // 1. Strict equality
      const strict = items.find(i => i && i.value === t);
      if (strict) return strict.value;
      // 2. Loose equality
      const loose = items.find(i => i && i.value == t);
      if (loose) return loose.value;
      // 3. String comparison
      const str = String(t).trim().toLowerCase();
      const byStr = items.find(i => i && i.value != null && String(i.value).trim().toLowerCase() === str);
      if (byStr) return byStr.value;
      const byName = items.find(i => i && i.name != null && String(i.name).trim().toLowerCase() === str);
      if (byName) return byName.value;
      return t;
    };

    if (Array.isArray(target)) {
      return target.map(t => matchSingle(t));
    } else {
      return matchSingle(target);
    }
  }

  /**
   * Applies workflow context ONLY if this navigation was initiated from Workflow Sidebar / Fact Box.
   * If user navigated from menu or search, returns false and does nothing.
   * Consumes the flag once applied.
   */
  applyContextIfFromWorkflow(
    form: any,
    monthsList?: any[],
    yearsList?: any[],
    costCenterList?: any[]
  ): boolean {
    if (!this.isFromWorkflowNavigation || !this.pendingWorkflowPatch || !form) {
      return false;
    }

    const ctx = this.pendingWorkflowPatch;
    // Consume the flag so refreshing or normal navigation won't patch
    this.isFromWorkflowNavigation = false;

    const patchObj: any = {};
    const controls = form.controls ? Object.keys(form.controls) : [];
    const findControlKey = (keys: string[]): string | null => {
      return controls.find(c => keys.some(target => target.toLowerCase() === c.toLowerCase())) || null;
    };

    // 1. Month
    const monthKey = findControlKey(['FkMonthId', 'fk_monthId', 'month', 'fkMonthId', 'monthId']);
    if (monthKey && ctx.fkMonthId !== null && ctx.fkMonthId !== undefined && ctx.fkMonthId !== '') {
      patchObj[monthKey] = this.findMatchingValue(monthsList || [], ctx.fkMonthId);
    }

    // 2. Year
    const yearKey = findControlKey(['FkYearId', 'fk_yearId', 'year', 'fkYearId', 'yearId']);
    if (yearKey && ctx.fkYearId !== null && ctx.fkYearId !== undefined && ctx.fkYearId !== '') {
      patchObj[yearKey] = this.findMatchingValue(yearsList || [], ctx.fkYearId);
    }

    // 3. CostCenter / Contractor
    const ccKey = findControlKey(['fk_costcentreid', 'fkCostCentreId', 'costCenter', 'contractor', 'costcentre']);
    if (ccKey && ctx.fkCostCentreId !== null && ctx.fkCostCentreId !== undefined) {
      const currentVal = form.get(ccKey)?.value;
      const resolvedCostCenter = this.findMatchingCostCenter(costCenterList || [], ctx.fkCostCentreId);
      if (Array.isArray(currentVal)) {
        patchObj[ccKey] = Array.isArray(resolvedCostCenter) ? resolvedCostCenter : [resolvedCostCenter];
      } else {
        patchObj[ccKey] = Array.isArray(resolvedCostCenter) ? (resolvedCostCenter[0] ?? null) : resolvedCostCenter;
      }
    }

    // Apply patch immediately
    form.patchValue(patchObj);

    // Also apply on next ticks to ensure ng-select renders the selected option after DOM options are bound
    setTimeout(() => {
      form.patchValue(patchObj);
    }, 0);
    setTimeout(() => {
      form.patchValue(patchObj);
    }, 150);

    return true;
  }

  // Alias for backward compatibility
  patchPayrollContextToForm(form: any, monthsList?: any[], yearsList?: any[], costCenterList?: any[]): void {
    this.applyContextIfFromWorkflow(form, monthsList, yearsList, costCenterList);
  }


  public readonly ROUTES = {
    DAILY_ATTENDANCE: '/dash/payroll/payrolldashboard/ImportDaywiseAttendance',
    IMPORT_DAYWISE_ATTENDANCE: '/dash/payroll/payrolldashboard/ImportDaywiseAttendance',
    MONTHLY_ATTENDANCE: '/dash/adminAttendance/adminAttendancedashboard/monthlyAttendance',
    ATTENDANCE_ADJUSTMENT: '/dash/adminAttendance/adminAttendancedashboard/attendanceAdjustment',
    ARREAR_PROCESS: '/dash/payroll/payrolldashboard/arrearProcess',
    AUTO_SALARY_PROCESS: '/dash/payroll/payrolldashboard/autoSalaryProcess',
    MANUAL_INCOME_TAX: '/dash/payroll/payrolldashboard/manualIncomeTax',
    SALARY_LOCK: '/dash/payroll/payrolldashboard/salaryLock',

    // Reports
    ATTENDANCE_REPORT: '/dash/adminAttendance/adminAttendancedashboard/exportAttendance',
    LEAVE_REPORT: '/dash/adminLeave/adminLeavedashboard/exportLeave',
    SALARY_REPORT: '/dash/payroll/payrolldashboard/exportexcel'
  };

  /**
   * Navigate to a report while passing return state so the report can return back
   */
  navigateToReport(reportType: 'attendance' | 'leave' | 'salary', currentUrl: string, currentLabel: string) {
    let targetRoute = '';
    switch (reportType) {
      case 'attendance':
        targetRoute = this.ROUTES.ATTENDANCE_REPORT;
        break;
      case 'leave':
        targetRoute = this.ROUTES.LEAVE_REPORT;
        break;
      case 'salary':
        targetRoute = this.ROUTES.SALARY_REPORT;
        break;
    }

    if (targetRoute) {
      this.router.navigate([targetRoute], {
        queryParams: {
          returnUrl: currentUrl,
          returnLabel: currentLabel
        }
      });
    }
  }

  /**
   * Return from a report or process to the originating URL
   */
  returnToOrigin(returnUrl?: string, fallbackRoute: string = this.ROUTES.MONTHLY_ATTENDANCE) {
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigateByUrl(fallbackRoute);
    }
  }

  /**
   * Navigate directly to a specific step
   */
  navigateToStep(route: string) {
    this.router.navigateByUrl(route);
  }

  /**
   * Checks whether the current user has access to a given route, label, or report type
   * based on assigned menus from MenuService (isAssigned === 1).
   */
  hasAccess(
    route?: string,
    label?: string,
    reportType?: 'attendance' | 'leave' | 'salary'
  ): boolean {
    const menu = this.menuService.getCurrentMenu();
    // If no menu loaded in session yet, allow access gracefully so nothing breaks before login
    if (!menu || !Array.isArray(menu) || menu.length === 0) {
      return true;
    }

    // Filter only assigned menus (isAssigned must be 1 or true)
    const assigned = menu.filter((item: any) => Number(item?.isAssigned) === 1 || item?.isAssigned === true);

    let targetRoute = route || '';
    if (!targetRoute && reportType) {
      switch (reportType) {
        case 'attendance': targetRoute = this.ROUTES.ATTENDANCE_REPORT; break;
        case 'leave': targetRoute = this.ROUTES.LEAVE_REPORT; break;
        case 'salary': targetRoute = this.ROUTES.SALARY_REPORT; break;
      }
    }

    const cleanRoute = (p: string): string => {
      if (!p) return '';
      return p
        .split('?')[0]
        .split('#')[0]
        .toLowerCase()
        .replace(/^[/#]+/, '')
        .replace(/^dash\//, '')
        .replace(/\/+$/, '')
        .trim();
    };

    const normalizeText = (t: string): string => {
      if (!t) return '';
      return t.toLowerCase().replace(/[\s\-_]/g, '').trim();
    };

    const targetClean = cleanRoute(targetRoute);
    const targetLeaf = targetClean.split('/').pop() || '';
    const normTargetLeaf = normalizeText(targetLeaf);
    const normLabel = normalizeText(label || '');

    return assigned.some((m: any) => {
      const mPath = cleanRoute(m?.pagepath || '');
      const mLeaf = mPath.split('/').pop() || '';
      const normMLeaf = normalizeText(mLeaf);
      const normCaption = normalizeText(m?.menucaption || '');
      const normWebpage = normalizeText(m?.webpagename || '');

      // Guard against false positive: Reimbursement vs standard Auto Salary Process
      const isReimTarget = normTargetLeaf.includes('reim') || normLabel.includes('reim');
      const isReimMenu = normMLeaf.includes('reim') || normCaption.includes('reim') || normWebpage.includes('reim');
      if (isReimTarget !== isReimMenu) {
        return false;
      }

      // 1. Direct path equality
      if (mPath && targetClean && mPath === targetClean) {
        return true;
      }

      // 2. Leaf action match (e.g. 'monthlyattendance' === 'monthlyattendance')
      if (normTargetLeaf && normMLeaf && normTargetLeaf === normMLeaf) {
        return true;
      }

      // 3. Caption / webpage name exact match with label
      if (normLabel && (normCaption === normLabel || normWebpage === normLabel)) {
        return true;
      }

      // 4. Leaf to caption / webpage exact match
      if (normTargetLeaf && (normCaption === normTargetLeaf || normWebpage === normTargetLeaf)) {
        return true;
      }

      // 5. Reports special matching
      if (reportType === 'salary' || normLabel.includes('salaryreport')) {
        if (normMLeaf === 'exportexcel' || normCaption.includes('exportexcel') || normCaption.includes('salaryreport') || normCaption === 'salarystatement') {
          return true;
        }
      }
      if (reportType === 'attendance' || normLabel.includes('attendancereport')) {
        if (normMLeaf === 'exportattendance' || normCaption.includes('exportattendance') || normCaption.includes('attendancereport')) {
          return true;
        }
      }
      if (reportType === 'leave' || normLabel.includes('leavereport')) {
        if (normMLeaf === 'exportleave' || normCaption.includes('exportleave') || normCaption.includes('leavereport')) {
          return true;
        }
      }

      // 6. Daywise attendance keyword match
      if (normLabel.includes('daywise') || normTargetLeaf.includes('daywise')) {
        if (normMLeaf.includes('daywise') || normCaption.includes('daywise') || normWebpage.includes('daywise')) {
          return true;
        }
      }

      return false;
    });
  }
}
