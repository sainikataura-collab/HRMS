

import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'travel_expense'
    },
    children: [

      {
        path: 'travel_expensedashboard',
        loadComponent: () => import('./travel-expense-dashboard/travel-expense-dashboard.component').then( (m) => m.TravelExpenseDashboardComponent),
        title: 'HRMS -Travel Expence dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./travel-expence-dash/travel-expence-dash.component').then( (m) => m.TravelExpenceDashComponent),
            title: 'HRMS - Employee-Salary'
          },
         {
            path: 'lodging_Boarding',
             canActivate: [AuthGuard],
            loadComponent: () => import('./lodging-boarding/lodging-boarding.component').then( (m) => m.LodgingBoardingComponent),
            title: 'lodging_Boarding'
          },
            
          {
            path: 'lodging_Boarding/:pk_lodgingboardingId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./lodging-boarding/lodging-boarding.component').then( (m) => m.LodgingBoardingComponent),
            title: 'lodging_Boarding'
          },
          {
            path: 'lodging_Boarding_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./lodging-boarding-list/lodging-boarding-list.component').then( (m) => m.LodgingBoardingListComponent),
            title: 'lodging_Boarding'
          },
          {
            path: 'Travel_rate',
            canActivate: [AuthGuard],
            loadComponent: () => import('./travel-rate/travel-rate.component').then( (m) => m.TravelRateComponent),
            title: 'Travel_rate'
          },
           {
            path: 'Travel_rate/:pk_RateID',
            canActivate: [AuthGuard],
            loadComponent: () => import('./travel-rate/travel-rate.component').then( (m) => m.TravelRateComponent),
            title: 'Travel_rate'
          },
           {
            path: 'Travel_rate_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./travel-rate-list/travel-rate-list.component').then( (m) => m.TravelRateListComponent),
            title: 'Travel_rate'
          },
              
          {
            path: 'travelClassMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./travel-class-master/travel-class-master.component').then( (m) => m.TravelClassMasterComponent),
            title: 'travelClassMaster'
          },
          {
            path: 'travelClassMaster_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./travel-class-master-list/travel-class-master-list.component').then( (m) => m.TravelClassMasterListComponent),
            title: 'travelClassMaster'
          },
            {
            path: 'travelClassMaster/:pk_classTvlId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./travel-class-master/travel-class-master.component').then( (m) => m.TravelClassMasterComponent),
            title: 'travelClassMaster'
          },
          //raj
           {
            path: 'travel_mode_master',
            canActivate: [AuthGuard],
            loadComponent: () => import('./travel-mode-master/travel-mode-master.component').then( (m) => m.TravelModeMasterComponent),
            title: 'Taravel_mode_Master'
          },
           {
            path: 'travel_mode_master/:pk_travelmodeID',
            canActivate: [AuthGuard],
            loadComponent: () => import('./travel-mode-master/travel-mode-master.component').then( (m) => m.TravelModeMasterComponent),
            title: 'Taravel_mode_Master'
          },
          {
            path: 'travel_mode_master_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./travel-mode-master-list/travel-mode-master-list.component').then( (m) => m.TravelModeMasterListComponent),
            title: 'Taravel_mode_Master_List'
          },



 
  ]
     
     
    
    

        





          
          
        
      }
    
    ]

  }]

