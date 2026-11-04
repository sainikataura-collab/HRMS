import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import $ from 'jquery';
import { MenuService } from '../../services/menu.service';
import { SearchService } from '../search.service';
// ye line add karo
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
    ngxUILoaderService = inject(NgxUiLoaderService);
  activeSection: string = '';
  showHrReports = true;   // control visibility of HR Reports


   manageUserList: any[] = [];
  createMasterList: any[] = [];
    ImportMasterList: any[] = [];
  TravelMasterList: any[] = [];
  CommonList: any[] = [];
  EmployeeList: any[] = [];
  TransactionList: any[] = [];
  TaxList: any[] = [];
  PayrollreportsList: any[] = [];
  ExportImportList: any[] = [];
  SettingsList: any[] = [];
  helpList: any[] = [];
  //
    AtsSuiteList: any[] = [];
  RecruitmentReportsList: any[] = [];

  HRManagementList: any[] = [];
  EmpManagementList: any[] = [];
  GenerateLetterList: any[] = [];
  HRReportsList: any[] = [];
  RecruitmentMasterList: any[] = [];
  RecruitmentTransactionList: any[] = [];
  TrainingMasterList: any[] = [];
  TrainingTransactionList: any[] = [];
  AppraisalMasterList: any[] = [];
  AppraisalTransactionList: any[] = [];
  AppraisalReportsList: any[] = [];
  PendingApprovals:any[]=[];
EmployeeManagement:any[]=[];
Attendancelist:any[]=[];
leavelist:any[]=[];
clientbillinglist: any[] = [];
Vendor:any[]=[];
Onboard:any[]=[];

  //added new  Exit
    ExitMasterList: any[] = [];



usertype:string='';
 
Isuser:boolean=false;
isVendor: boolean = false;
hasVendorPortalRight: boolean = false;
hasTalentPoolRight: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router,private menuService: MenuService, private searchService: SearchService) {}

  ngOnInit(): void {
    
    this.ngxUILoaderService.start();
       this.usertype = sessionStorage.getItem('usertype') 
             || localStorage.getItem('usertype') 
             || '';
       this.isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
       
        this.updateActiveSection(this.route.snapshot.queryParams['type'], this.router.url.split('/')[3]);

    // Listen to router events
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
          this.usertype = sessionStorage.getItem('usertype') 
             || localStorage.getItem('usertype') 
             || '';
          this.isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
          this.updateActiveSection(this.route.snapshot.queryParams['type'], this.router.url.split('/')[3]);

      }
    });

    this.menuService.menu$.subscribe(menu => {
  if (menu && menu.length > 0) {
    this.hasVendorPortalRight = menu.some(item => 
      (item.pk_webpageId === 9025 || item.pagepath?.toLowerCase().includes('vendor-portal')) && item.isAssigned === 1
    );
    this.hasTalentPoolRight = menu.some(item => 
      (item.pk_webpageId === 9026 || item.pagepath?.toLowerCase().includes('vendor-candidates')) && item.isAssigned === 1
    );

    // added new 1 sep 2025
     this.updateSearchMenus(); 
    
    // ✅ Define parent menus and their target lists in a config object
    const menuMappings = [
      { key: 'createMasterList', parent: 'Create Masters' },
      { key: 'ImportMasterList', parent: 'Imports' },
      { key: 'manageUserList', parent: 'Manage Users' },

      { key: 'TravelMasterList', parent: 'Travel Expense Masters' },

      { key: 'EmployeeList', parent: 'Employee' },
      { key: 'CommonList', parent: 'Common' },
      { key: 'TransactionList', parent: 'Transactions' },
      { key: 'TaxList', parent: 'Tax' },
      { key: 'PayrollreportsList', parent: 'Payroll Reports' },
      { key: 'ExportImportList', parent: 'Export & Import' },
      { key: 'SettingsList', parent: 'Settings' },
      { key: 'helpList', parent: 'Payroll Help' },
            { key: 'AtsSuiteList', parent: 'ATS Talent Suite' },
      { key: 'RecruitmentReportsList', parent: 'Recruitment Reports' },


      { key: 'HRManagementList', parent: 'HR Management' },
      { key: 'EmpManagementList', parent: 'Emp Management' },
      { key: 'GenerateLetterList', parent: 'Generate Letter' },
      { key: 'HRReportsList', parent: 'HR Reports' },

      { key: 'RecruitmentMasterList', parent: 'Recruitment Masters' },
      { key: 'RecruitmentTransactionList', parent: 'Recruitment Transactions' },

      { key: 'TrainingMasterList', parent: 'Training Master' },
      { key: 'TrainingTransactionList', parent: 'Training Transaction' },

      { key: 'AppraisalMasterList', parent: 'Appraisal Masters' },
      { key: 'AppraisalTransactionList', parent: 'Appraisal Transaction' },
      { key: 'AppraisalReportsList', parent: 'Appraisal Reports' },
      { key:'ExitMasterList',parent:'Exit Management'},
      { key:'PendingApprovals',parent:'Pending Approvals'},

        { key:'EmployeeManagement',parent:'Employee Management'},

         { key:'Attendancelist',parent:'Attendance'},

         { key:'leavelist',parent:'Leave'},
          { key: 'clientbillinglist', parent: 'Client Billing' },
          { key: 'Vendor', parent: 'Vendor Management' },
              { key: 'Onboard', parent: 'On Boarding' },

    ];

    //  Dynamically generate lists based on config
    menuMappings.forEach(mapping => {
      // const parentId = menu.find(item => item.menucaption === mapping.parent)?.pk_webpageId;
        let parent = menu.find(item => item.menucaption === mapping.parent);
      if (!parent && mapping.key === 'RecruitmentReportsList') {
        parent = menu.find(item => (item.menucaption === 'Recruitment Reports' || item.menucaption === 'Reports') && item.fk_moduleId === 5);
      }
      const parentId = parent?.pk_webpageId;
      (this as any)[mapping.key] = parentId
        ? menu.filter(item => item.parentId === parentId && item.isAssigned === 1)
        : [];
    });

    console.log('this is EmpManagementList', this.EmpManagementList);
  }
});
    
    this.ngxUILoaderService.stop();
    
  }








  // updateActiveSection(queryParams: string | null, path: string): void {
  //   if (this.usertype === 'User') {
  //     this.setActiveSection(queryParams, path);
  //   } else if (this.usertype === 'Employee') {
  //     this.setActiveSectionemp(queryParams, path);
  //   } else {
  //     this.activeSection = '';
  //   }
  // }



  // added new 1 sep 2025
   updateActiveSection(queryParams: string | null, path: string): void {
  // Always refresh usertype from sessionStorage
  // this.usertype = sessionStorage.getItem('usertype') || '';
  this.usertype = sessionStorage.getItem('usertype') 
             || localStorage.getItem('usertype') 
             || '';
    if (this.usertype === 'User') {
    this.setActiveSection(queryParams, path);
  } else if (this.usertype === 'Employee') {
    this.setActiveSectionemp(queryParams, path);
  } else {
    this.activeSection = '';
  }
  this.updateSearchMenus(); 
}

// added new 1 sep 2025
private updateSearchMenus(): void {
  // Get all assigned menus (user ke liye jo bhi assign huye hain)
  const allMenus = this.menuService.getCurrentMenu()
    .filter(item => item.isAssigned === 1);

  // 🔥 Ab ye saare menus search service ko bhejenge
  this.searchService.setAvailableMenus(allMenus);

}




  setActiveSection(queryParams: string | null, path: string|null): void {
      if (!path) {
    this.activeSection = '';
    return;
  }

    // First, check for query params
    if (queryParams === 'payroll' || path.includes('payroll')) {
      this.activeSection = 'payroll';
    } else if (path.includes('user')) {
      this.activeSection = 'user';
    } else if (path.includes('hr')) {
      this.activeSection = 'hr';
    }else if (path.includes('recruitment')) {
      this.activeSection = 'recruitment';
    }else if (path.includes('appraisal')) {
      this.activeSection = 'appraisal';
    }else if (path.includes('training')) {
      this.activeSection = 'training';
    }else if (path.includes('travel_expense')) {
      this.activeSection = 'travel_expense';
    }else if (path.includes('exit')) {
      this.activeSection = 'exit';
    }else if (path.includes('on_boarding')) {
      this.activeSection = 'on_boarding';
    }else if (path.includes('report')) {
      this.activeSection = 'report';
    }else if (path.includes('visitor')){
      this.activeSection = 'visitor';
    }else if (path.includes('adminTaskbox')){
      this.activeSection = 'adminTaskbox';
    }
    else if (path.includes('adminEmployeeManagement')){
      this.activeSection = 'adminEmployeeManagement';
    }
    else if (path.includes('adminAttendance')){
      this.activeSection = 'adminAttendance';
    }
     else if (path.includes('adminLeave')){
      this.activeSection = 'adminLeave';
    }
     else if (path.includes('orgView')){
      this.activeSection = 'orgView';
     } 
      else if (path.includes('client_billing') || path.includes('clientbilling')) {
      this.activeSection = 'clientbilling';
    }
    else if (path.includes('vendor')) {
      this.activeSection = 'vendor';
    }

    else {
      this.activeSection = '';  // Default to no section
    }
  }


  setActiveSectionemp(queryParams: string | null, path: string|null): void {
         if (!path) {
    this.activeSection = '';
    return;
  }

    // First, check for query params
    if (queryParams === 'attendance' || path.includes('attendance')) {
      this.activeSection = 'attendance';
    } else if (path.includes('taskbox')) {
      this.activeSection = 'taskbox';
    } else if (path.includes('leaves')) {
      this.activeSection = 'leaves';
    }else if (path.includes('reimbursement')) {
      this.activeSection = 'reimbursement';
    } else if (path.includes('performance')) {
      this.activeSection = 'performance';
    } else if (path.includes('feedback')) {
      this.activeSection = 'feedback';
    } else if (path.includes('hrdocument')) {
      this.activeSection = 'hrdocument';
    }else if (path.includes('hrpolicies')) {
      this.activeSection = 'hrpolicies';
    }else if (path.includes('emp-recruitment')) {
      this.activeSection = 'emp-recruitment';
    }else if (path.includes('emp-exit')) {
      this.activeSection = 'emp-exit';
    }else if (path.includes('emp-training')) {
      this.activeSection = 'emp-training';
    }else if (path.includes('emp-event')) {
      this.activeSection = 'emp-event';
    }else if (path.includes('travelexpence_emp')) {
      this.activeSection = 'travelexpence_emp';
    }

    else {
      this.activeSection = '';  // Default to no section
    }
  }

// added by pp 28

//  detectSectionFromUrl(fullUrl: string): void {
//   const urlPath = fullUrl.split('?')[0].toLowerCase();
//   if (this.usertype === 'User') {
//     this.detectUserSection(urlPath);
//   } else if (this.usertype === 'Employee') {
//     this.detectEmployeeSection(urlPath);
//   } else {
//     this.activeSection = '';
//   }
//   this.updateSearchMenus();
//   sessionStorage.setItem('activeSection', this.activeSection);
// }

// detectUserSection(urlPath: string): void {
//   if (urlPath.includes('/payroll')) {
//     this.activeSection = 'payroll';
//   } else if (urlPath.includes('/user')) {
//     this.activeSection = 'user';
//   } else if (urlPath.includes('/hr')) {
//     this.activeSection = 'hr';
//   } else if (urlPath.includes('/recruitment')) {
//     this.activeSection = 'recruitment';
//   } else if (urlPath.includes('/appraisal')) {
//     this.activeSection = 'appraisal';
//   } else if (urlPath.includes('/training')) {
//     this.activeSection = 'training';
//   } else if (urlPath.includes('/travel_expense')) {
//     this.activeSection = 'travel_expense';
//   } else if (urlPath.includes('/exit')) {
//     this.activeSection = 'exit';
//   } else if (urlPath.includes('/on_boarding')) {
//     this.activeSection = 'on_boarding';
//   } else if (urlPath.includes('/report')) {
//     this.activeSection = 'report';
//   } else if (urlPath.includes('/visitor')) {
//     this.activeSection = 'visitor';
//   } else if (urlPath.includes('/admintaskbox')) {
//     this.activeSection = 'adminTaskbox';
//   } else if (urlPath.includes('/adminemployeemanagement')) {
//     this.activeSection = 'adminEmployeeManagement';
//   } else if (urlPath.includes('/adminattendance')) {
//     this.activeSection = 'adminAttendance';
//   } else if (urlPath.includes('/adminleave')) {
//     this.activeSection = 'adminLeave';
//   } else if (urlPath.includes('/orgview')) {
//     this.activeSection = 'orgView';
//   } else {
//     this.activeSection = '';
//   }
// }

// detectEmployeeSection(urlPath: string): void {
//   if (urlPath.includes('/emp-recruitment')) {
//     this.activeSection = 'emp-recruitment';
//   } else if (urlPath.includes('/emp-exit')) {
//     this.activeSection = 'emp-exit';
//   } else if (urlPath.includes('/emp-training')) {
//     this.activeSection = 'emp-training';
//   } else if (urlPath.includes('/emp-event')) {
//     this.activeSection = 'emp-event';
//   } else if (urlPath.includes('/travelexpence_emp')) {
//     this.activeSection = 'travelexpence_emp';
//   } else if (urlPath.includes('/attendance')) {
//     this.activeSection = 'attendance';
//   } else if (urlPath.includes('/taskbox')) {
//     this.activeSection = 'taskbox';
//   } else if (urlPath.includes('/leaves')) {
//     this.activeSection = 'leaves';
//   } else if (urlPath.includes('/reimbursement')) {
//     this.activeSection = 'reimbursement';
//   } else if (urlPath.includes('/performance')) {
//     this.activeSection = 'performance';
//   } else if (urlPath.includes('/feedback')) {
//     this.activeSection = 'feedback';
//   } else if (urlPath.includes('/hrdocument')) {
//     this.activeSection = 'hrdocument';
//   } else if (urlPath.includes('/hrpolicies')) {
//     this.activeSection = 'hrpolicies';
//   } else {
//     this.activeSection = '';
//   }
// }

//end

  toggle(el: any) {
    $(`#${el}`).toggle();
  }
  navigateToDashboard(): void {
    this.activeSection = '';
   
  }

  
  // Track if it was in mini mode before hovering
  private wasMini: boolean = false;

  // Handles sidebar expansion on hover in sidebar-mini mode
  onSidebarHover(isHovered: boolean): void {
    if (window.innerWidth > 768) {
      const body = document.body;
      
      if (isHovered) {
        // If we hover and it's currently mini, expand it by removing the class
        if (body.classList.contains('sidebar-mini')) {
          this.wasMini = true;
          body.classList.remove('sidebar-mini');
          // Optionally add a class so your custom CSS knows it's expanded via hover
          body.classList.add('sidebar-hover-expanded');
        }
      } else {
        // When mouse leaves, if it was temporarily expanded, shrink it back
        if (this.wasMini) {
          body.classList.add('sidebar-mini');
          body.classList.remove('sidebar-hover-expanded');
          this.wasMini = false;
        }
      }
    }
  }

}