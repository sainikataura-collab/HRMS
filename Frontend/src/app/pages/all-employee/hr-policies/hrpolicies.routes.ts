


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'hrpolicies'
    },
    children: [


      {
        path: 'hrpoliciesdashboard',
        loadComponent: () => import('./hrpolicies-dashboard/hrpolicies-dashboard.component').then( (m) => m.HrpoliciesDashboardComponent),
        title: 'HRMS - Hr policies dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./hrpolicies-dash/hrpolicies-dash.component').then( (m) => m.HrpoliciesDashComponent),
            title: 'HRMS - Hr Policies dash'
          },
           
        
         
          
        ]
      }
    
    ]
  }
];
