


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'report'
    },
    children: [


      {
        path: 'reportdashboard',
        loadComponent: () => import('./report-dashboard/report-dashboard.component').then( (m) => m.ReportDashboardComponent),
        title: 'HRMS - Report dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./report-dash/report-dash.component').then( (m) => m.ReportDashComponent),
            title: 'HRMS - Report Dash'
          },
           
          {
            path: 'reports',
            loadComponent: () => import('./user-reports/user-reports').then( (m) => m.UserReportsComponent),
            title: 'Under - Employee Master'
          },
        
            {
            path: 'fields',
            loadComponent: () => import('./field-manager/field-manager').then( (m) => m.FieldManagerComponent),
            title: 'Under - Employee Master'
          },
            {
            path: 'admin',
            loadComponent: () => import('./admin-builder/admin-builder').then( (m) => m.AdminBuilderComponent),
            title: 'Under - Employee Master'
          },
        
        
        ]
      }
    
    ]
  }
];
