


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'event'
    },
    children: [


      {
        path: 'eventdashboard',
        loadComponent: () => import('./event-dashboard/event-dashboard.component').then( (m) => m.EventDashboardComponent),
        title: 'HRMS - Event dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./event-dash/event-dash.component').then( (m) => m.EventDashComponent),
            title: 'HRMS - Event dash'
          },
           
        
         {
            path: 'emp-chatboat',
            loadComponent: () => import('./emp-chatboat/emp-chatboat.component').then( (m) => m.EmpChatboatComponent),
            title: 'HRMS - Event dash'
          },
          
        ]
      }
    
    ]
  }
];
