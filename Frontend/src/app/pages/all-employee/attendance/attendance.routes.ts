


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'attendance'
    },
    children: [


      {
        path: 'attendancedashboard',
        loadComponent: () => import('./attendance-dashboard/attendance-dashboard.component').then( (m) => m.AttendanceDashboardComponent),
        title: 'HRMS -Attendance dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./attendance-dash/attendance-dash.component').then( (m) => m.AttendanceDashComponent),
            title: 'HRMS - attendancedash'
          },
           
          {
            path: 'emporganization',
            loadComponent: () => import('../emp-help/emp-organization/emp-organization.component').then( (m) => m.EmpOrganizationComponent),
            title: 'HRMS - emp oragnization'
          },
           
                 {
            path: 'OD-request',
            loadComponent: () => import('../attendance/emp-od-request/emp-od-request.component').then( (m) => m.EmpODRequestComponent),
            title: 'HRMS - emp oragnization'
          },

           {
            path: 'OD-request-list',
            loadComponent: () => import('../attendance/emp-od-request-list/emp-od-request-list.component').then( (m) => m.EmpODRequestListComponent),
            title: 'HRMS - emp oragnization'
          },
         
            {
            path: 'Approve-Regularization-list',
            loadComponent: () => import('../attendance/emp-approve-regularization/emp-approve-regularization.component').then( (m) => m.EmpApproveRegularizationComponent),
            title: 'HRMS - emp oragnization'
          },
         
            
            {
            path: 'Approve-Regularization/:pk_inoutid',
            loadComponent: () => import('../attendance/emp-approve-regularization-update/emp-approve-regularization-update.component').then( (m) => m.EmpApproveRegularizationUpdateComponent),
            title: 'HRMS - emp oragnization'
          },

          //sunny
              {
            path: 'RegulariseAttendance',
            loadComponent: () => import('./regularise-attendance/regularise-attendance.component').then( (m) => m.RegulariseAttendanceComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'RegulariseAttendanceList',
            loadComponent: () => import('./regularise-attendancelist/regularise-attendancelist.component').then( (m) => m.RegulariseAttendancelistComponent),
            title: 'HRMS - Leaves dash'
          },

          //Shiv

             {
            path: 'ViewAttendance',
            loadComponent: () => import('../attendance/view-attendance/view-attendance.component').then( (m) => m.ViewAttendanceComponent),  
            title: 'HRMS - view attendance'
          },
             {
            path: 'viewteamattendance',
            loadComponent: () => import('../attendance/view-team-attendance/view-team-attendance.component').then( (m) => m.ViewTeamAttendanceComponent),
            title: 'HRMS - Leaves dash'
          },

          {
            path: 'attendanceMark-globe',
            loadComponent: () => import('../attendance/attendance-mark-globe/attendance-mark-globe.component').then( (m) => m.AttendanceMarkGlobeComponent),
            title: 'HRMS - attendanceMark-globe'
},

 {
            path: 'cdoRequest',
            loadComponent: () => import('../attendance/cdo-request/cdo-request.component').then( (m) => m.CdoRequestComponent),
            title: 'HRMS - attendanceMark-globe'
},

{
            path: 'cdoRequest-list',
            loadComponent: () => import('../attendance/cdo-request-list/cdo-request-list.component').then( (m) => m.CdoRequestListComponent),
            title: 'HRMS - attendanceMark-globe'

},

{
            path: 'chatboat',
            loadComponent: () => import('../attendance/chatboat/chatboat.component').then( (m) => m.ChatboatComponent),
            title: 'HRMS - chatboat'

},

        ]
      }
    
    ]
  }
];
