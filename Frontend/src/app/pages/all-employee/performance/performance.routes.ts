


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'performance'
    },
    children: [


      {
        path: 'performancedashboard',
        loadComponent: () => import('./performance-dashboard/performance-dashboard.component').then((m) => m.PerformanceDashboardComponent),
        title: 'HRMS -Performance dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./performance-dash/performance-dash.component').then((m) => m.PerformanceDashComponent),
            title: 'HRMS - Performance dash'
          },

          {
            path: 'Rolewise-KRA-list',
            loadComponent: () => import('./rolewise-list/rolewise-list.component').then((m) => m.RolewiseListComponent),
            title: 'HRMS - emp-kpr'
          },

          {
            path: 'Rolewise-KRA',
            loadComponent: () => import('./rolewise-kra/rolewise-kra.component').then((m) => m.RolewiseKraComponent),
            title: 'HRMS - emp-kpr'
          },

          {
            path: 'Rolewise-KRA/:roleid/:srno',
            loadComponent: () => import('./rolewise-kra/rolewise-kra.component').then((m) => m.RolewiseKraComponent),
            title: 'HRMS - emp-kpa'
          },

          {
            path: 'Empwise-KRA',
            loadComponent: () => import('./emp-kra/emp-kra.component').then((m) => m.EmpKraComponent),
            title: 'HRMS - emp-kra'
          },
          {
            path: 'Empwise-KRA/:fk_empid/:srno',
            loadComponent: () => import('./emp-kra/emp-kra.component').then((m) => m.EmpKraComponent),
            title: 'HRMS - emp-kra'
          },
          {
            path: 'Empwise-KRA-List',
            loadComponent: () => import('./emp-kra-list/emp-kra-list.component').then((m) => m.EmpKraListComponent),
            title: 'HRMS - emp-kra'
          },

          //Employee Assessment 
 //Employee Assessment 

            {
            path: 'Empwise-self-Assessment',
            loadComponent: () => import('./emp-assessment/emp-assessment.component').then( (m) => m.EmpAssessmentComponent ),
            title: 'HRMS - emp-kra'
           },
            {
            path: 'Empwise-self-Assessment/:pk_kraassId',
            loadComponent: () => import('./emp-assessment/emp-assessment.component').then( (m) => m.EmpAssessmentComponent ),
            title: 'HRMS - emp-kra'
           },
             {
            path: 'Empwise-self-Assessment-List',
            loadComponent: () => import('./emp-assessment-list/emp-assessment-list.component').then( (m) => m.EmpAssessmentListComponent ),
            title: 'HRMS - emp-kra'
           },

             {
            path: 'Empwise-assessment-view/:pk_kraassId',
            loadComponent: () => import('./emp-assessment-view/emp-assessment-view.component').then( (m) => m.EmpAssessmentViewComponent ),
            title: 'HRMS - emp-kra'
           },
            {
            path: 'Report-manager-assessment-List',
            loadComponent: () => import('./emp-rm-assessment-list/emp-rm-assessment-list.component').then( (m) => m.EmpRmAssessmentListComponent),
            title: 'HRMS - appraisal dash'
           },
            {
            path: 'Report-manager-assessment',
            loadComponent: () => import('./emp-rm-assessment/emp-rm-assessment.component').then( (m) => m.EmpRmAssessmentComponent),
            title: 'HRMS - appraisal dash'
           },
           {
            path: 'Report-manager-assessment/:fk_empid/:kraperiodid',
            loadComponent: () => import('./emp-rm-assessment/emp-rm-assessment.component').then( (m) => m.EmpRmAssessmentComponent),
            title: 'HRMS - appraisal dash'
           },
  

           {
            path: 'Report-manager-assessment-view/:fk_empid/:kraperiodid',
            loadComponent: () => import('./emp-rm-view/emp-rm-view.component').then( (m) => m.EmpRmViewComponent),
            title: 'HRMS - appraisal dash'
           },
            {
            path: 'HOD-assessment-List',
            loadComponent: () => import('./emp-hod-assessment-list/emp-hod-assessment-list.component').then( (m) => m.EmpHodAssessmentListComponent),
            title: 'HRMS - appraisal dash'
           },
            {
            path: 'HOD-assessment',
            loadComponent: () => import('./emp-hod-assessment/emp-hod-assessment.component').then( (m) => m.EmpHodAssessmentComponent),
            title: 'HRMS - appraisal dash'
           },
           {
             path: 'HOD-assessment/:fk_empid/:kraperiodid',
            loadComponent: () => import('./emp-hod-assessment/emp-hod-assessment.component').then( (m) => m.EmpHodAssessmentComponent),
            title: 'HRMS - appraisal dash'
           },

            {
             path: 'HOD-assessment-View/:fk_empid/:kraperiodid',
            loadComponent: () => import('./emp-hod-view/emp-hod-view.component').then( (m) => m.EmpHodViewComponent),
            title: 'HRMS - performance dash'
           },
           



          {
            path: 'Emp-Draft-KRA',
            loadComponent: () => import('./EmpDraftKRA/emp-draft-kra/emp-draft-kra.component').then((m) => m.EmpDraftKRAComponent),
            title: 'HRMS - Leaves dash'
          },



          {
            path: 'Appraisal',
            loadComponent: () => import('./appraisal-form/appraisal-form.component').then((m) => m.AppraisalFormComponent),
            title: 'HRMS - Performance dash'
          },

          {
            path: 'AppraisalList',
            loadComponent: () => import('./appraisal-list/appraisal-list.component').then((m) => m.AppraisalListComponent),
            title: 'HRMS - Performance dash'
          },
          {
            path: 'AppraisalDetails/:empId/:yearId',
            loadComponent: () => import('./appraisal-details-by-id/appraisal-details-by-id.component')
              .then(m => m.AppraisalDetailsByIdComponent),
            title: 'HRMS - Performance dash'
          },
          {
            path: 'Appraisalupdate/:empId/:yearId',
            loadComponent: () => import('./appraisal-form/appraisal-form.component')
              .then(m => m.AppraisalFormComponent),
            title: 'HRMS - Performance dash'
          },
          {
            path: 'AppraisalApprovalList',
            loadComponent: () => import('./appraisal-approval-list/appraisal-approval-list.component')
              .then(m => m.AppraisalApprovalListComponent),
            title: 'HRMS - Performance dash'
          },

          {
            path: 'AppraisalApproval/:empId/:yearId',
            loadComponent: () => import('./appraisal-approval/appraisal-approval.component')
              .then(m => m.AppraisalApprovalComponent),
            title: 'HRMS - Performance dash'
          },
          {
            path: 'AppraisalApprovalDetails/:empId/:yearId',
            loadComponent: () => import('./appraisal-approval-details/appraisal-approval-details.component')
              .then(m => m.AppraisalApprovalDetailsComponent),
            title: 'HRMS - Performance dash'
          }
        ]
      }

    ]
  }
];
