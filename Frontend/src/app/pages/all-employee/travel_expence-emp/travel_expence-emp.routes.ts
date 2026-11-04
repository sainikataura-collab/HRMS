


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'travelexpence_emp'
    },
    children: [


      {
        path: 'travelexpence_empdashboard',
        loadComponent: () => import('./travel-expence-emp-dashboard/travel-expence-emp-dashboard.component').then( (m) => m.TravelExpenceEmpDashboardComponent),
        title: 'HRMS - Travel Expence Emp dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./travel-expence-emp-dash/travel-expence-emp-dash.component').then( (m) => m.TravelExpenceEmpDashComponent),
            title: 'HRMS - Travel Expence Emp dash'
          },
         
          {
            path: 'localtravel',
            loadComponent: () => import('./local-travel/local-travel.component').then((m)=>m.LocalTravelComponent),
            title: 'HRMS - Local Travel'
          },
           {
            path: 'localtravel/:pk_localTravelId',
            loadComponent: () => import('./local-travel/local-travel.component').then((m)=>m.LocalTravelComponent),
            title: 'HRMS - Local Travel'
          },
           {
            path: 'localtravelList',
            loadComponent: () => import('./local-travellist/local-travellist.component').then((m)=>m.LocalTravellistComponent),
            title: 'HRMS - Local Travel List'
          },
         
          
        ]
      }
    
    ]
  }
];
