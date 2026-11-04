import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'client_billing'
    },
    children: [

      {
        path: 'client_billing_dashboard',
        loadComponent: () => import('./client-billing-dashboard/client-billing-dashboard.component').then( (m) => m.ClientBillingDashboardComponent),
        title: 'HRMS - client billing dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./client-billing-dash/client-billing-dash.component').then( (m) => m.ClientBillingDashComponent),
            title: 'HRMS - client-billing-dash'
          },
         
        {
          path: 'billgeneration',
           canActivate: [AuthGuard],
          loadComponent: () => import('./billgeneration/billgeneration.component').then((m)=> m.BillgenerationComponent),
          title: 'Bill generation'
        },
        {
          path: 'billgeneration_list',
          canActivate: [AuthGuard],
          loadComponent: () => import('./billgenerationlist/billgenerationlist.component').then((m)=> m.BillgenerationlistComponent),
          title: 'Bill'
        }
                   
        ]
      }


      
    
    ]
  }
];




