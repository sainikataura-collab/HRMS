


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'emp-recruitment'
    },
    children: [


      {
        path: 'emp-recruitmentdashboard',
        loadComponent: () => import('./emp-recruitment-dashboard/emp-recruitment-dashboard.component').then( (m) => m.EmpRecruitmentDashboardComponent),
        title: 'HRMS - Emp Recruitment dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./emp-recruitment-dash/emp-recruitment-dash.component').then( (m) => m.EmpRecruitmentDashComponent),
            title: 'HRMS - emp recruitment dash'
          },
           
        {
            path: 'ManpowerRequisition',
            loadComponent: () => import('./manpower-requisition/manpower-requisition.component').then( (m) => m.ManpowerRequisitionComponent),
            title: 'HRMS - emp ManpowerRequisition'
          },
          {
            path: 'ManpowerRequisition/:pk_ReqId',
            loadComponent: () => import('./manpower-requisition/manpower-requisition.component').then( (m) => m.ManpowerRequisitionComponent),
            title: 'HRMS - emp ManpowerRequisition'
          },
          {
            path: 'ManpowerRequisitionList',
            loadComponent: () => import('./manpower-requisition-list/manpower-requisition-list.component').then( (m) => m.ManpowerRequisitionListComponent),
            title: 'HRMS - emp ManpowerRequisitionList'
          },
          {
            path: 'ApproveManpowerRequisition',
            loadComponent: () => import('./approve-manpower-requisition/approve-manpower-requisition.component').then( (m) => m.ApproveManpowerRequisitionComponent),
            title: 'HRMS - emp ManpowerRequisitionList'
          },
          {
            path: 'ApproveManpowerRequisition/:pk_ReqId',
            loadComponent: () => import('./approve-manpower-requisition/approve-manpower-requisition.component').then( (m) => m.ApproveManpowerRequisitionComponent),
            title: 'HRMS - emp ManpowerRequisitionList'
          },
          {
            path: 'ApproveManpowerRequisitionList',
            loadComponent: () => import('./approve-manpower-requisition-list/approve-manpower-requisition-list.component').then( (m) => m.ApproveManpowerRequisitionListComponent),
            title: 'HRMS - emp ManpowerRequisitionList'
          },
         
          
        ]
      }
    
    ]
  }
];
