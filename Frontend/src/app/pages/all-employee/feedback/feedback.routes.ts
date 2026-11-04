


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'feedback'
    },
    children: [


      {
        path: 'feedbackdashboard',
        loadComponent: () => import('./feedback-dashboard/feedback-dashboard.component').then( (m) => m.FeedbackDashboardComponent),
        title: 'HRMS - Feedback dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./feedback-dash/feedback-dash.component').then( (m) => m.FeedbackDashComponent),
            title: 'HRMS - Feedback dash'
          },
           
        
         
          
        ]
      }
    
    ]
  }
];
