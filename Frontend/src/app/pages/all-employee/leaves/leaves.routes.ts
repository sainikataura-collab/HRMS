
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'leaves'
    },
    children: [


      {
        path: 'leavesdashboard',
        loadComponent: () => import('./leaves-dashbard/leaves-dashbard.component').then( (m) => m.LeavesDashbardComponent),
        title: 'HRMS -Leaves dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./leaves-dash/leaves-dash.component').then( (m) => m.LeavesDashComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'leaverequest',
            loadComponent: () => import('./emp-leave-request/emp-leave-request.component').then( (m) => m.EmpLeaveRequestComponent),
            title: 'HRMS - Leaves dash'
          },
              {
            path: 'leavetaken',
            loadComponent: () => import('./emp-leave-taken-details/emp-leave-taken-details.component').then( (m) => m.EmpLeaveTakenDetailsComponent),
            title: 'HRMS - Leaves dash'
          },
           {
            path: 'leavereqlist',
            loadComponent: () => import('./emp-leave-request-list/emp-leave-request-list.component').then( (m) => m.EmpLeaveRequestListComponent),
            title: 'HRMS - Leaves dash'
          },

             {
            path: 'leaveviewbalance',
            loadComponent: () => import('./emp-view-leave-balance/emp-view-leave-balance.component').then( (m) => m.EmpViewLeaveBalanceComponent),
            title: 'HRMS - Leaves dash'
          },
         
          
         {
            path: 'restrictedHolidays',
            loadComponent: () => import('./restricted-holidays/restricted-holidays.component').then( (m) => m.RestrictedHolidaysComponent),
            title: 'HRMS -  Leaves dash'
          },
               {
            path: 'GazettedHolidays',
            loadComponent: () => import('./emp-gazetted-holiday/emp-gazetted-holiday.component').then( (m) => m.EmpGazettedHolidayComponent),
            title: 'HRMS -  Leaves dash'
          },

//sunny
          
  {
            path: 'CompOffrequest',
            loadComponent: () => import('./comp-off-request/comp-off-request.component').then( (m) => m.CompOffRequestComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'CompOffrequestList',
            loadComponent: () => import('./comp-off-request-list/comp-off-request-list.component').then( (m) => m.CompOffRequestListComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'CompOffRequestApproval',
            loadComponent: () => import('./comp-off-request-approval/comp-off-request-approval.component').then( (m) => m.CompOffRequestApprovalComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'CompOffRequestApproval/:pk_applycompoffId',
            loadComponent: () => import('./comp-off-request-approval/comp-off-request-approval.component').then( (m) => m.CompOffRequestApprovalComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'CompOffRequestApprovallist',
            loadComponent: () => import('./comp-off-request-approvallist/comp-off-request-approvallist.component').then( (m) => m.CompOffRequestApprovallistComponent),
            title: 'HRMS - Leaves dash'
          },

          //shiv
       {
            path: 'shortleaverequest',
            loadComponent: () => import('./short-leave-request/short-leave-request.component').then( (m) => m.ShortLeaveRequestComponent),
            title: 'HRMS - Leaves dash'
          },
              {
            path: 'shortLeaveList',
            loadComponent: () => import('./short-leave-request-list/short-leave-request-list.component').then( (m) => m.ShortLeaveRequestListComponent),
            title: 'HRMS - Leaves dash'
          },
           
          {
            path: 'shortLeaveView/:pk_shortLeaveId',
            loadComponent: () => import('./short-leave-request-view/short-leave-request-view.component').then( (m) => m.ShortLeaveRequestViewComponent),
            title: 'HRMS - Leaves dash'
          },
            {
            path: 'ApprovalShortLeaveList',
            loadComponent: () => import('./approval-short-leave-list/approval-short-leave-list.component').then( (m) => m.ApprovalShortLeaveListComponent), 
            title: 'HRMS - Leaves dash'
          },

           {
            path: 'ApprovalshortLeave/:pk_shortLeaveId',
            loadComponent: () => import('./approval-short-leave/approval-short-leave.component').then( (m) => m.ApprovalShortLeaveComponent),
            title: 'HRMS - Leaves dash'
          },
         

            {
            path: 'ApproveLeaveList',
            loadComponent: () => import('./approval-leave-od/approval-leave-od.component').then( (m) => m.ApprovalLeaveODComponent),
            title: 'HRMS - Leaves dash'
          },
          
            {
            path: 'ApprovedLeaveList',
            loadComponent: () => import('./approved-leave-list/approved-leave-list.component').then( (m) => m.ApprovedLeaveListComponent),
            title: 'HRMS - Leaves dash'
          },




           
        ]
      }
    
    ]
  }
];
