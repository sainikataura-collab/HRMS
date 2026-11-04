import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: '',
})
export class RedirectComponent implements OnInit {
  router = inject(Router);

  ngOnInit(): void {
    const isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
    if (isVendor) {
      let userMenu: any[] = [];
      try {
        const storedMenu = sessionStorage.getItem('userMenu');
        userMenu = storedMenu ? JSON.parse(storedMenu) : [];
      } catch (e) {
        userMenu = [];
      }

      const hasVendorPortal = userMenu.some((item: any) => 
        (item.pk_webpageId === 9025 || item.pagepath?.toLowerCase().includes('vendor-portal')) && item.isAssigned === 1
      );
      const hasTalentPool = userMenu.some((item: any) => 
        (item.pk_webpageId === 9026 || item.pagepath?.toLowerCase().includes('vendor-candidates')) && item.isAssigned === 1
      );

      if (hasVendorPortal) {
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-portal']);
      } else if (hasTalentPool) {
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-candidates']);
      } else {
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-portal']);
      }
      return;
    }

    const isAdmin = !!sessionStorage.getItem('fk_CompanyCode');

    if (isAdmin) {
      this.router.navigate(['/dash/dashboard']);
    } else {
      this.router.navigate(['/dash/employee-dashboard']);
    }
  }
}
