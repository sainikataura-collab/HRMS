


import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'appraisal'
    },
    children: [


      {
        path: 'appraisaldashboard',
        loadComponent: () => import('./appraisal-dashboard/appraisal-dashboard.component').then( (m) => m.AppraisalDashboardComponent),
        title: 'HRMS -appraisal dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./appraisal-dash/appraisal-dash.component').then( (m) => m.AppraisalDashComponent),
            title: 'HRMS - appraisal dash'
          },

            //Appraisal Master
          
           {
            path: 'Reminder_Setup',
              canActivate: [AuthGuard],
            loadComponent: () => import('./reminder-setup/reminder-setup.component').then( (m) => m.ReminderSetupComponent),
            title: 'HRMS - appraisal dash'
          },
           {
            path: 'AppraisalMaster',
              canActivate: [AuthGuard],
            loadComponent: () => import('./appraisal-master/appraisal-master.component').then( (m) => m.AppraisalMasterComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'AppraisalMaster/:pk_appId',
              canActivate: [AuthGuard],
            loadComponent: () => import('./appraisal-master/appraisal-master.component').then( (m) => m.AppraisalMasterComponent),
            title: 'HRMS - Leaves dash'
          },
          {
            path: 'AppraisalMaster_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./appraisal-master-list/appraisal-master-list.component').then( (m) => m.AppraisalMasterListComponent),
            title: 'HRMS - Leaves dash'
          },
             {
            path: 'behavioral-area-master',
             canActivate: [AuthGuard],
            loadComponent: () => import('./behavioral-area-master/behavioral-area-master.component').then( (m) => m.BehavioralAreaMasterComponent),
            title: 'HRMS - behavioral-area-master'
          },
          {
            path: 'behavioral-area-master/:pk_behaveid',
             canActivate: [AuthGuard],
            loadComponent: () => import('./behavioral-area-master/behavioral-area-master.component').then( (m) => m.BehavioralAreaMasterComponent),
            title: 'HRMS - behavioral-area-master'
          },
           {
            path: 'behavioral-area-master_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./all-behavioral-area-master/all-behavioral-area-master.component').then( (m) => m.AllBehavioralAreaMasterComponent),
            title: 'HRMS - behavioral-area-master-list'
          },
           
        
          //Appraisal Transaction
           

           {
            path: 'Empwise-KRA',
             canActivate: [AuthGuard],
            loadComponent: () => import('./emp-kra/emp-kra.component').then( (m) => m.EmpKraComponent ),
            title: 'HRMS - emp-kra'
           },
           {
            path: 'Empwise-KRA/:fk_empid/:srno',
             canActivate: [AuthGuard],
            loadComponent: () => import('./emp-kra/emp-kra.component').then( (m) => m.EmpKraComponent ),
            title: 'HRMS - emp-kra'
           },
           {
            path: 'Empwise-KRA_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./emp-kra-list/emp-kra-list.component').then( (m) => m.EmpKraListComponent ),
            title: 'HRMS - emp-kra'
           },

           
           {
            path: 'Rolewise-KRA_list',
             canActivate: [AuthGuard],
            loadComponent: () => import('./rolewise-list/rolewise-list.component').then( (m) => m.RolewiseListComponent ),
            title: 'HRMS - emp-kpr'
           },

           {
            path: 'Rolewise-KRA',
             canActivate: [AuthGuard],
            loadComponent: () => import('./rolewise-kra/rolewise-kra.component').then( (m) => m.RolewiseKraComponent ),
            title: 'HRMS - emp-kpr'
           },

          {
            path: 'Rolewise-KRA/:roleid/:srno',
             canActivate: [AuthGuard],
            loadComponent: () => import('./rolewise-kra/rolewise-kra.component').then( (m) => m.RolewiseKraComponent ),
            title: 'HRMS - emp-kpa'
           },

     

          //Appraisal report
             {
            path: 'KRA-Assessment-Status',
            canActivate: [AuthGuard],
            loadComponent: () => import('./self-assessment-report/self-assessment-report.component').then( (m) => m.SelfAssessmentReportComponent),
            title: 'HRMS - Self-Assessment-Report'
           },

              {
            path: 'Rolewise-KRA-Report',
              canActivate: [AuthGuard],
            loadComponent: () => import('./rolewise-kra-report/rolewise-kra-report.component').then( (m) => m.RolewiseKraReportComponent),
            title: 'HRMS - Leaves dash'
          },

           {
            path: 'AppraisalStatus',
              canActivate: [AuthGuard],
            loadComponent: () => import('./appraisal-status/appraisal-status.component').then( (m) => m.AppraisalStatusComponent),
            title: 'HRMS - Leaves dash'
          },
            {
            path: 'EmpwiseRpt',
              canActivate: [AuthGuard],
            loadComponent: () => import('./empwise-rpt/empwise-rpt.component').then( (m) => m.EmpwiseRptComponent),
            title: 'HRMS - Leaves dash'
          },



           // Role Wise KRA Assessment

          //   {
          //   path: 'RoleWise-Self-Assessment',
          //   loadComponent: () => import('./RoleWise-KRA/role-self-assessment/role-self-assessment.component').then( (m) => m.RoleSelfAssessmentComponent),
          //   title: 'HRMS - appraisal dash'
          //  },
          //   {
          //   path: 'RoleWise-Self-Assessment/:kraid',
          //   loadComponent: () => import('./RoleWise-KRA/role-self-assessment/role-self-assessment.component').then( (m) => m.RoleSelfAssessmentComponent),
          //   title: 'HRMS - appraisal dash'
          //  },
          //   {
          //   path: 'RoleWise-Self-Assessment-List',
          //   loadComponent: () => import('./RoleWise-KRA/role-self-assessment-list/role-self-assessment-list.component').then( (m) => m.RoleSelfAssessmentListComponent),
          //   title: 'HRMS - appraisal dash'
          //  },

        ]

      }
    
    ]
  }
];
