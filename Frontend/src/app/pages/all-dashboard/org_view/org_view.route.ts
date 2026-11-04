


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'orgView'
    },
    children: [


      {
        path: 'orgViewdashboard',
        loadComponent: () => import('./org-view-dashboard/org-view-dashboard.component').then( (m) => m.OrgViewDashboardComponent),
        title: 'HRMS -Org view Dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('../payroll/payroll-help/payroll-organization/payroll-organization.component').then( (m) => m.PayrollOrganizationComponent),
            title: 'HRMS - Org view'
          },


      
   
   
        
         
  
           
        
         
          
        ]
      }
    
    ]
  }
];
