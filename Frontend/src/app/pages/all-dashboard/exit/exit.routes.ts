import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'exit',
    },
    children: [
      {
        path: 'exitdashboard',
        loadComponent: () =>
          import('./exit-dashboard/exit-dashboard.component').then(
            (m) => m.ExitDashboardComponent
          ),
        title: 'HRMS -Exit Dashboard',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./exit-dash/exit-dash.component').then(
                (m) => m.ExitDashComponent
              ),
            title: 'HRMS - Exit dash',
          },
          {
            path: 'Due_Clearence',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./dueclearencemaster/dueclearencemaster.component').then(
                (m) => m.DueclearencemasterComponent
              ),
            title: 'HRMS - Due_Clearence',
          },
          {
            path: 'due_clearance_review',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './due-clearance-review/due-clearance-review.component'
              ).then((m) => m.DueClearanceReviewComponent),
            title: 'HRMS - Due Clearance Review',
          },

          {
            path: 'Due_Clearence/:pk_clsdeptId',

            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./dueclearencemaster/dueclearencemaster.component').then(
                (m) => m.DueclearencemasterComponent
              ),
            title: 'HRMS - Due_Clearence',
          },
          {
            path: 'Due_Clearence_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './dueclearencemaster-list/dueclearencemaster-list.component'
              ).then((m) => m.DueclearencemasterListComponent),
            title: 'HRMS - Due_Clearence',
          },
         
          {
            path: 'Due_Clearence_User_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './due-claranc-user-list/due-claranc-user-list.component'
              ).then((m) => m.DueClarancUserListComponent),
            title: 'HRMS - DueClearanceUser',
          },

          {
            path: 'Due_Clearence_User_Master',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./due-clarance-user/due-clarance-user.component').then(
                (m) => m.DueClaranceUserComponent
              ),
            title: 'HRMS - DueClearanceUser-List',
          },

          {
            path: 'Due_Clearence_User_Master/:pk_DeptUserId',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./due-clarance-user/due-clarance-user.component').then(
                (m) => m.DueClaranceUserComponent
              ),
            title: 'HRMS - DueClearanceUser',
          },

          {
            path: 'exitformauthority',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './exit-form-authority-master/exit-form-authority-master.component'
              ).then((m) => m.ExitFormAuthorityMasterComponent),
            title: 'HRMS - Exit dash',
          },
          {
            path: 'admin_resignation_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './admin-resignation-list/admin-resignation-list.component'
              ).then((m) => m.AdminResignationListComponent),
            title: 'HRMS - Admin Resignation List',
          },
          {
            path: 'admin_resignation_action/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './admin-resignation-action/admin-resignation-action.component'
              ).then((m) => m.AdminResignationActionComponent),
            title: 'HRMS - Admin Resignation Action',
          },
          // {
          //   path: 'exit_interview_list',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './exit-interview-list/exit-interview-list.component'
          //     ).then((m) => m.ExitInterviewListComponent),
          //   title: 'HRMS - Exit Interview List',
          // },
          {
            path: 'exit_interviewReview_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './exit-interview-review/exit-interview-review.component'
              ).then((m) => m.ExitInterviewReviewComponent),
            title: 'HRMS - Exit Interview Review',
          },
          {
            path: 'exit_interviewReview/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './exit-interview-form/exit-interview-form.component'
              ).then((m) => m.ExitInterviewFormComponent),
            title: 'HRMS - Exit Interview View',
          },
          {
            path: 'report',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./Report/report.component').then(
                (m) => m.ReportComponent
              ),
            title: 'HRMS - Exit Report',
          },
          {
            path: 'fnf_settlement_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './fnf-settlement-list/fnf-settlement-list.component'
              ).then((m) => m.FnfSettlementListComponent),
            title: 'HRMS - F&F Settlement List',
          },
          {
            path: 'fnf_settlement_form/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './fnf-settlement-form/fnf-settlement-form.component'
              ).then((m) => m.FnfSettlementFormComponent),
            title: 'HRMS - F&F Settlement Form',
          },
          {
            path: 'no_due_declaration_review_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './no-due-declaration-review/no-due-declaration-review.component'
              ).then((m) => m.NoDueDeclarationReviewComponent),
            title: 'HRMS - No Due Declaration Review',
          },

          {
            path: 'no_due_declaration_review/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                '../../all-employee/emp-exit/no-due-declaration/no-due-declaration.component'
              ).then((m) => m.NoDueDeclarationComponent),
            title: 'HRMS - No Due Declaration View',
          },

          {
            path: 'notice_period_tracking',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './notice-period-tracking/notice-period-tracking.component'
              ).then((m) => m.NoticePeriodTrackingComponent),
            title: 'HRMS - Notice Period Tracking',
          },
          {
            path: 'notice_period_tracking/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './notice-period-tracking/notice-period-tracking.component'
              ).then((m) => m.NoticePeriodTrackingComponent),
            title: 'HRMS - Notice Period Tracking',
          },
          {
            path: 'knowledge_transfer_form/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './knowledge-transfer-form/knowledge-transfer-form.component'
              ).then((m) => m.KnowledgeTransferFormComponent),
            title: 'HRMS - Knowledge Transfer',
          },
          {
            path: 'admin_clearance_form/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './admin-clearance-form/admin-clearance-form.component'
              ).then((m) => m.AdminClearanceFormComponent),
            title: 'HRMS - Department Clearance',
          },
          {
            path: 'relieving_letter/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./relieving-letter/relieving-letter.component').then(
                (m) => m.RelievingLetterComponent
              ),
            title: 'HRMS - Relieving Letter',
          },
          {
            path: 'experience_letter/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./experience-letter/experience-letter.component').then(
                (m) => m.ExperienceLetterComponent
              ),
            title: 'HRMS - Experience Letter',
          },
          {
            path: 'exit_checklist/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./exit-checklist/exit-checklist.component').then(
                (m) => m.ExitChecklistComponent
              ),
            title: 'HRMS - Exit Checklist',
          },
          // due mapping

           {
            path: 'due_clearance_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './dueclearencemaster-list/dueclearencemaster-list.component'
              ).then((m) => m.DueclearencemasterListComponent),
            title: 'HRMS - Due Clearance Master',
          },

          {
            path: 'due_clearance',
            loadComponent: () =>
              import('./dueclearencemaster/dueclearencemaster.component')
                .then((m) => m.DueclearencemasterComponent),
            title: 'HRMS - Due_Clearence'
          },
          {
            path: 'due_clearance/:pk_clsdeptId',
            loadComponent: () =>
              import('./dueclearencemaster/dueclearencemaster.component')
                .then((m) => m.DueclearencemasterComponent),
            title: 'HRMS - Due_Clearence'
          },
        ],
      },
    ],
  },
];
