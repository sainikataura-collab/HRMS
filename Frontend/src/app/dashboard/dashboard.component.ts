import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, inject} from '@angular/core';
import { MenuService } from '../shared/services/menu.service';
import { CommonModule } from '@angular/common';

interface ModuleAssignment {
  pk_moduleId: number;
  moduleName: string;
  moduleActiveStatus: boolean;
  pk_webpageId: number;
  menucaption: string;
  webpagename: string;
  pagepath: string;
  tooltip: string;
  parentId: number;
  displayorder: number;
  webPageActiveStatus: boolean;
  isAssigned: number;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
   showAlert = false;
  ngxUILoaderService = inject(NgxUiLoaderService);
  menuservcie = inject(MenuService);
  router = inject(Router);

  assignedModules: string[] = [];
  menuList: any[] = [];

  constructor(private route: ActivatedRoute) {}


  ngOnInit() {
    const isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
    if (isVendor) {
      const menu = this.menuservcie.getCurrentMenu() || [];
      const hasVendorPortal = menu.some((item: any) => 
        (item.pk_webpageId === 9025 || item.pagepath?.toLowerCase().includes('vendor-portal')) && item.isAssigned === 1
      );
      const hasTalentPool = menu.some((item: any) => 
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

    this.ngxUILoaderService.start();
    this.menuservcie.menu$.subscribe(menu => {
      this.menuList = menu;
   
      if (menu?.length > 0) {
        const uniqueModules = new Set<string>();

        menu.forEach((item: ModuleAssignment) => {
          if (item.isAssigned === 1) {
            let normalizedModuleName = item.moduleName.toLowerCase().replace(/ /g, '_');

            if (normalizedModuleName.includes('payroll')) {
              normalizedModuleName = 'payroll';
            }else if (normalizedModuleName.includes('setting_management')) {
              normalizedModuleName = 'setting_management';
            } else if (normalizedModuleName.includes('hr')) {
              normalizedModuleName = 'hr';
            } else if (normalizedModuleName.includes('recruitment')) {
              normalizedModuleName = 'recruitment';
            } else if (normalizedModuleName.includes('appraisal')) {
              normalizedModuleName = 'appraisal';
            } else if (normalizedModuleName.includes('training')) {
              normalizedModuleName = 'training';
            } else if (normalizedModuleName.includes('travel_expense')) {
              normalizedModuleName = 'travel_expense';
            } else if (normalizedModuleName.includes('exit')) {
              normalizedModuleName = 'exit';
            } else if (normalizedModuleName.includes('on_boarding')) {
              normalizedModuleName = 'on_boarding';
            } else if (normalizedModuleName.includes('report')) {
              normalizedModuleName = 'report';
            } else if (normalizedModuleName.includes('visitor')) {
              normalizedModuleName = 'visitor';
            } else if (normalizedModuleName.includes('task_box')) {
              normalizedModuleName = 'task_box';
            }
             else if (normalizedModuleName.includes('employee_management')) {
              normalizedModuleName = 'employee_management';
            }
             else if (normalizedModuleName.includes('attendance')) {
              normalizedModuleName = 'attendance';
            }
             else if (normalizedModuleName.includes('leave')) {
              normalizedModuleName = 'leave';
            }
            else if (normalizedModuleName.includes('org_view')) {
              normalizedModuleName = 'org_view';
            }
             else if (normalizedModuleName.includes('client_billing')) {
              normalizedModuleName = 'client_billing';
            }
            else if (normalizedModuleName.includes('vendor')) {
              normalizedModuleName = 'vendor';
            }


            uniqueModules.add(normalizedModuleName);
          }
        });

        this.assignedModules = Array.from(uniqueModules);
        console.log('Assigned Modules:', this.assignedModules);
      }

      this.ngxUILoaderService.stop();
    });

   this.route.queryParams.subscribe(params => {
      if (params['alert'] === 'no-access') {
        this.showAlert = true;

        // Hide alert after 10 seconds
        setTimeout(() => {
          this.showAlert = false;
        }, 5000);
      }
    });

  }
}