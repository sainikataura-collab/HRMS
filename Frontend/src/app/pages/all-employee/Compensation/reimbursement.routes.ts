import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'reimbursement'
    },
    children: [


      {
        path: 'reimbursementdashboard',
        loadComponent: () => import('./reimbursement-dashboard/reimbursement-dashboard.component').then( (m) => m.ReimbursementDashboardComponent),
        title: 'HRMS -reimbursementdashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./reimbursement-dash/reimbursement-dash.component').then( (m) => m.ReimbursementDashComponent),
            title: 'HRMS - Task box dash'
          },
       
          {
            path: 'PrograssionDetail',
            loadComponent: () => import('./PrograssionDetail/prograssion-detail-list/prograssion-detail-list.component').then( (m) => m.PrograssionDetailListComponent),
            title: 'HRMS - Leaves dash'
          },

          {
            path: 'CTC',
            loadComponent: () => import('./CTC/ctc/ctc.component').then( (m) => m.CTCComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'RentDetailsList',
            loadComponent: () => import('./rent-details-list/rent-details-list.component').then( (m) => m.RentDetailsListComponent),
            title: 'HRMS - Task box dash'
          },
            {
            path: 'RentDetails',
            loadComponent: () => import('./rent-details/rent-details.component').then( (m) => m.RentDetailsComponent),
            title: 'HRMS - Task box dash'
          },
           {
            path: 'RentDetails/:pk_rentId',
            loadComponent: () => import('./rent-details/rent-details.component').then( (m) => m.RentDetailsComponent),
            title: 'HRMS - Task box dash'
          },
         {
            path: 'RebateDocumentList',
            loadComponent: () => import('./emp-tax-rebate-doc-list/emp-tax-rebate-doc-list.component').then( (m) => m.EmpTaxRebateDocListComponent),
            title: 'HRMS - Task box dash'
          },
           
               {
            path: 'RebateDocument',
            loadComponent: () => import('./emp-tax-rebate-doc/emp-tax-rebate-doc.component').then( (m) => m.EmpTaxRebateDocComponent),
            title: 'HRMS - Task box dash'
          },
             {
            path: 'RebateDocument/:pk_docid',
            loadComponent: () => import('./emp-tax-rebate-doc/emp-tax-rebate-doc.component').then( (m) => m.EmpTaxRebateDocComponent),
            title: 'HRMS - Task box dash'
          },
          
          
            {
            path: 'TaxComputaion',
            loadComponent: () => import('./emp-tax-computation/emp-tax-computation.component').then( (m) => m.EmpTaxComputationComponent),
            title: 'HRMS - Task box dash'
          },
             {
            path: 'SalaryPayOut',
            loadComponent: () => import('./emp-salary-payout/emp-salary-payout.component').then( (m) => m.EmpSalaryPayoutComponent),
            title: 'HRMS - Task box dash'
          },
            {
            path: 'FlexiHeadBills',
            loadComponent: () => import('./flexi-head-bills/flexi-head-bills.component').then( (m) => m.FlexiHeadBillsComponent),
            title: 'HRMS - Task box dash'
          },
          {
            path: 'FlexiHeadBillsList',
            loadComponent: () => import('./flexi-head-bills-list/flexi-head-bills-list.component').then( (m) => m.FlexiHeadBillsListComponent),
            title: 'HRMS - Task box dash'
          },

            {
            path: 'TaxRegime',
            loadComponent: () => import('./tax-regime/tax-regime.component').then( (m) => m.TaxRegimeComponent),
            title: 'HRMS - Task box dash'
          },

         
          
        ]
      }
    
    ]
  }
];
