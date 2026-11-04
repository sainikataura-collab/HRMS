


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'taskbox'
    },
    children: [


      {
        path: 'taskboxdashboard',
        loadComponent: () => import('./task-box-dashboard/task-box-dashboard.component').then( (m) => m.TaskBoxDashboardComponent),
        title: 'HRMS -Task box dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./task-box-dash/task-box-dash.component').then( (m) => m.TaskBoxDashComponent),
            title: 'HRMS - Task box dash'
          },
           
        
         
          
        ]
      }
    
    ]
  }
];
