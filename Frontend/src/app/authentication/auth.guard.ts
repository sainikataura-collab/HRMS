import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  CanMatch,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from './service/auth.service';
import { MenuService } from '../shared/services/menu.service';
import { Observable, of } from 'rxjs';
import { filter, take, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(
    private auth: AuthService,
    private router: Router,
    private menuService: MenuService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.checkAccess(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.checkAccess(state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> {
    const fullPath = segments.map(s => s.path).join('/');
    return this.checkAccess(`/${fullPath}`);
  }

  private checkAccess(url: string): Observable<boolean | UrlTree> {
    const token = sessionStorage.getItem('accessToken');
    if (!token || !this.auth.loggedIn()) {
      console.warn('🔐 No token or not logged in, redirecting to login.');
      return of(this.router.createUrlTree(['/auth/login']));
    }

        const normalizedUrl = url.replace(/^\/dash\//, '').toLowerCase();

    // 🔒 Vendor Strict Access Check
    const isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
    if (isVendor) {
      return this.menuService.menu$.pipe(
        filter(menu => Array.isArray(menu) && menu.length > 0),
        take(1),
        map(menu => {
          const hasVendorPortal = menu.some((item: any) => 
            (item.pk_webpageId === 9025 || item.pagepath?.toLowerCase().includes('vendor-portal')) && item.isAssigned === 1
          );
          const hasTalentPool = menu.some((item: any) => 
            (item.pk_webpageId === 9026 || item.pagepath?.toLowerCase().includes('vendor-candidates')) && item.isAssigned === 1
          );

          const isAccessingVendorPortal = normalizedUrl.includes('vendor-portal') ||
                                         normalizedUrl.includes('vendor-add-candidate') ||
                                         normalizedUrl.includes('vendor-passed-interview');

          const isAccessingTalentPool = normalizedUrl.includes('vendor-candidates') ||
                                        normalizedUrl.includes('vendor-candidate-list');

          if (isAccessingVendorPortal && hasVendorPortal) {
            return true;
          }
          if (isAccessingTalentPool && hasTalentPool) {
            return true;
          }

          const fallback = hasVendorPortal 
            ? '/dash/recruitment/recruitmentdashboard/vendor-portal'
            : (hasTalentPool ? '/dash/recruitment/recruitmentdashboard/vendor-candidates' : '/auth/login');

          console.warn(`⛔ Vendor unauthorized access to ${url}, redirecting to ${fallback}`);
          return this.router.createUrlTree([fallback]);
        })
      );
    }

    // ✅ Whitelist core ATS feature routes immediately
    const atsWhitelist = [
      'recruitment/recruitmentdashboard/location-manpower-headcount',
      'recruitment/recruitmentdashboard/mrf-list',
      'recruitment/recruitmentdashboard/job-requisition-list',
      'recruitment/recruitmentdashboard/edit-job',
      'recruitment/recruitmentdashboard/edit-job-requisition',
      'recruitment/recruitmentdashboard/create-job-wizard',
      'recruitment/recruitmentdashboard/pipeline',
      'recruitment/recruitmentdashboard/job-boards',
      'recruitment/recruitmentdashboard/jobs',
      'recruitment/recruitmentdashboard/job-management',
      'recruitment/recruitmentdashboard/analytics',
      'recruitment/recruitmentdashboard/vendor-portal',
      'recruitment/recruitmentdashboard/vendor-add-candidate',
      'recruitment/recruitmentdashboard/vendor-passed-interview',
      'recruitment/recruitmentdashboard/vendor-candidates',
      'recruitment/recruitmentdashboard/vendor-candidate-list',
      'recruitment/recruitmentdashboard/recruitment-dash',
      'recruitment/recruitmentdashboard/candidate-report',
      'recruitment/recruitmentdashboard/job-report',
      'recruitment/recruitmentdashboard/mrf-report',
      'recruitment/recruitmentdashboard/location-report',
      'recruitment/recruitmentdashboard/location-wise-jobs-report',
      'recruitment/recruitmentdashboard/vendor-report',
      'recruitment/recruitmentdashboard/vendor-wise-report',
      'recruitment/recruitmentdashboard'
    ];
    if (atsWhitelist.some(w => normalizedUrl.startsWith(w) || url.toLowerCase().includes(w))) {
      return of(true);
    }


    return this.menuService.menu$.pipe(
      filter(menu => Array.isArray(menu) && menu.length > 0), // ✅ Wait for non-empty menu
      take(1),
      map(menu => {


        const normalizedUrl = url.replace(/^\/dash\//, '').toLowerCase();

        const hasAccess = menu.some(item => {
          const menuPath = (item.pagepath || '').toLowerCase();



          // return normalizedUrl.startsWith(menuPath);
             // ✅ Direct match
        if (normalizedUrl.startsWith(menuPath)) return true;

        // ✅ Auto-map: if user has *_list, allow base route and edit
        if (menuPath.endsWith('_list')) {
          const basePath = menuPath.replace('_list', '');
          if (normalizedUrl.startsWith(basePath)) {
            return true;
          }

            // ✅ Special case: if user has employee_list, allow stepper routes
            if (basePath === 'Employee') {
              const employeeSubPaths = [
                'EmployeeMst',
                'EmployeeAttendance',
                'EmployeeOtherDetails',
                'EmployeeHead'
              ];
              return employeeSubPaths.some(p => normalizedUrl.startsWith(p));
            }
        //end here    // ✅ Special case: if user has employee_list, allow stepper routes
        }
        return false;
    });
        


       


        if (!hasAccess) {
          console.warn('🚫 Access denied for URL:', url);
          return this.router.createUrlTree(['/dash/dashboard'], {
            queryParams: { alert: 'no-access' }
          });
        }

        return true;
      }),
      catchError(err => {
        console.error('AuthGuard error:', err);
        return of(this.router.createUrlTree(['/auth/login']));
      })
    );
  }
}