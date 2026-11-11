

import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'adminTaskbox'
    },
    children: [

      {
        path: 'adminTaskboxdashboard',
        loadComponent: () => import('./taskbox-dashboard/taskbox-dashboard.component').then( (m) => m.TaskboxDashboardComponent),
        title: 'HRMS -adminTaskbox dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('../../task-manager/task-manager.component').then( (m) => m.TaskManagerComponent),
            title: 'HRMS - Task Manager'
          },
          {
            path: 'task-manager',
            loadComponent: () => import('../../task-manager/task-manager.component').then( (m) => m.TaskManagerComponent),
            title: 'HRMS - Task Manager'
          },
         {
                    path: 'PendingRegulazation',
                    canActivate: [AuthGuard],
                    loadComponent: () => import('./pending-regulazation/pending-regulazation.component').then((m) => m.PendingRegulazationComponent),
                    title: 'HRMS '
                  },
                   {
                    path: 'PendingCampOff_list',
                    canActivate: [AuthGuard],
                    loadComponent: () => import('./pendding-campoff/pendding-campoff.component').then((m) => m.PenddingCampoffComponent),
                    title: 'HRMS '
                  },
                  {
                    path: 'PendingsShortLeave_list',
                      canActivate: [AuthGuard],
                    loadComponent: () => import('./pendding-shortleave/pendding-shortleave.component').then((m) => m.PenddingShortleaveComponent),
                    title: 'HRMS '
                  },

                {
                      path: 'PendingLeave/OD',
                      canActivate: [AuthGuard],
                      loadComponent: () => import('./pending-leave/pending-leave-od.component').then((m) => m.PendingLeaveODComponent),
                      title: 'HRMS '
                },
 
  ]
     
     
    
    

        





          
          
        
      }
    
    ]

  }]

