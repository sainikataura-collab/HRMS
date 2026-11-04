


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'hrdocument'
    },
    children: [


      {
        path: 'hrdocumentdashboard',
        loadComponent: () => import('./hrdocument-dashboard/hrdocument-dashboard.component').then( (m) => m.HrdocumentDashboardComponent),
        title: 'HRMS - Hr Document dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./hrdocument-dash/hrdocument-dash.component').then( (m) => m.HrdocumentDashComponent),
            title: 'HRMS - Hr Document dash'
          },
                
         {
            path: 'HR_Policy',
            loadComponent: () => import('./hr-policy/hr-policy.component').then( (m) => m.HrPolicyComponent),
            title: 'HRMS - HR document dash'
          },
          {
            path: 'HR_Letter',
            loadComponent: () => import('./hr-letter/hr-letter.component').then( (m) => m.HrLetterComponent),
            title: 'HRMS - HR document dash'
          },
          
          
        ]
      }
    
    ]
  }
];
