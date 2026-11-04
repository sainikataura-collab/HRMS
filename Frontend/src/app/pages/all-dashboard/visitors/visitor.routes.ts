


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'visitor'
    },
    children: [


      {
        path: 'visitordashboard',
        loadComponent: () => import('./visitor-dashboard/visitor-dashboard.component').then( (m) => m.VisitorDashboardComponent),
        title: 'HRMS -visitor Dashboard',
        children: [
          // {
          //   path: '',
          //   loadComponent: () => import('./visitor-dash/visitor-dash.component').then( (m) => m.VisitorDashComponent),
          //   title: 'HRMS - visitor dash'
          // },
          {
            path: '',
            loadComponent: () => import('./Visitor/visitor-list/visitor-list.component').then( (m) => m.VisitorListComponent),
            title: 'HRMS - Leaves dash'
          },

   
   
        
         
  
           
        
         
          
        ]
      }
    
    ]
  }
];
