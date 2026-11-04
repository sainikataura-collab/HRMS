import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'emp-exit',
    },
    children: [
      {
        path: 'emp-exitdashboard',
        loadComponent: () => import('./emp-exit-dashboard/emp-exit-dashboard.component').then((m) => m.EmpExitDashboardComponent),
        title: 'HRMS -Emp-exit Dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./emp-exit-dash/emp-exit-dash.component').then((m) => m.EmpExitDashComponent),
            title: 'HRMS - Emp-exit  dash',
          },
          {
            path: 'resignation_list',
            loadComponent: () => import('./resignation-list/resignation-list.component').then((m) => m.ResignationListComponent),
            title: 'HRMS - Resignation List'
          },
          {
            path: 'resignation_form',
            loadComponent: () => import('./resignation-form/resignation-form.component').then((m) => m.ResignationFormComponent),
            title: 'HRMS - Resignation Form'
          },
          {
            path: 'resignation_form/:id',
            loadComponent: () => import('./resignation-form/resignation-form.component').then((m) => m.ResignationFormComponent),
            title: 'HRMS - Resignation Form'
          },
          {
            path: 'resignation_approval_list',
            loadComponent: () =>
              import('./approval-list/resignation-approval-list.component')
                .then((m) => m.ResignationApprovalListComponent),
            title: 'HRMS - Resignation Approval List'
          },

          {
            path: 'resignation_approval/:id',
            loadComponent: () =>
              import('./approval-form/resignation-approval.component')
                .then((m) => m.ResignationApprovalComponent),
            title: 'HRMS - Resignation Approval'
          },
          // {
          //   path: 'exit_interview_form',
          //   loadComponent: () => import('./exit-interview-form/exit-interview-form.component').then((m) => m.ExitInterviewFormComponent),
          //   title: 'HRMS - Exit Interview Form'exit_interview_form
          // },
          {
            path: 'my_clearance_status',
            loadComponent: () => import('./my-clearance-status/my-clearance-status.component').then((m) => m.MyClearanceStatusComponent),
            title: 'HRMS - My Clearance Status'
          },
          {
            path: 'asset_return_form',
            loadComponent: () => import('./asset-return-form/asset-return-form.component').then((m) => m.AssetReturnFormComponent),
            title: 'HRMS - Asset Return Form'
          },
          // {
          //   path: 'no_due_declaration',
          //   loadComponent: () => import('./no-due-declaration/no-due-declaration.component').then((m) => m.NoDueDeclarationComponent),
          //   title: 'HRMS - No Due Declaration'
          // },
          {
            path: 'bank_settlement_details',
            loadComponent: () => import('./bank-settlement-details/bank-settlement-details.component').then((m) => m.BankSettlementDetailsComponent),
            title: 'HRMS - Bank & Settlement Details'
          },
          {
            path: 'withdrawal/:id',
            loadComponent: () => import('./withdrawal-form/withdrawal.component').then((m) => m.WithdrawalComponent),
            title: 'HRMS - Withdrawal-Form'
          },
          {
            path: 'exit_interview_form',
            loadComponent: () =>
              import('./exit-interview-list/exit-interview-list.component')
                .then((m) => m.ExitInterviewListComponent),
            title: 'HRMS - Exit Interview List',
          },
          {
            path: 'exit_interview_apply',
            loadComponent: () =>
              import('./exit-interview-form/exit-interview-form.component')
                .then((m) => m.ExitInterviewFormComponent),
            title: 'HRMS - Exit Interview Form',
          },
          {
            path: 'exit_interview_apply/:id',
            loadComponent: () =>
              import('./exit-interview-form/exit-interview-form.component')
                .then((m) => m.ExitInterviewFormComponent),
            title: 'HRMS - Exit Interview Form',
          },
          {
            path: 'exit_interview_review',
            loadComponent: () =>
              import('./exit-interview-review/exit-interview-review.component')
                .then((m) => m.ExitInterviewReviewComponent),
            title: 'HRMS - Exit Interview Review',
          },
          {
            path: 'no_due_declaration',
            loadComponent: () =>
              import('./no-due-declaration-list/no-due-declaration-list.component')
                .then((m) => m.NoDueDeclarationListComponent),
            title: 'HRMS - No Due Declaration List',
          },
          {
            path: 'no_due_declaration_form',
            loadComponent: () =>
              import('./no-due-declaration/no-due-declaration.component')
                .then((m) => m.NoDueDeclarationComponent),
            title: 'HRMS - No Due Declaration',
          },
          {
            path: 'no_due_declaration_form/:id',
            loadComponent: () =>
              import('./no-due-declaration/no-due-declaration.component')
                .then((m) => m.NoDueDeclarationComponent),
            title: 'HRMS - No Due Declaration',
          },
          {
            path: 'no_due_declaration_review',
            loadComponent: () =>
              import('./no-due-declaration-review/no-due-declaration-review.component')
                .then((m) => m.NoDueDeclarationReviewComponent),
            title: 'HRMS - No Due Declaration Review',
          },
          {
            path: 'due_clearance_list',
            loadComponent: () =>
              import('./due-clearance-list/due-clearance-list.component')
                .then((m) => m.DueClearanceListComponent),
            title: 'HRMS - Due Clearance List',
          },
          {
            path: 'due_clearance_form',
            loadComponent: () =>
              import('./due-clearance-form/due-clearance-form.component')
                .then((m) => m.DueClearanceFormComponent),
            title: 'HRMS - Due Clearance Form',
          },
          {
            path: 'due_clearance_review_list',
            loadComponent: () =>
              import('./due-clearance-review-list/due-clearance-review-list.component')
                .then((m) => m.DueClearanceReviewListComponent),
            title: 'HRMS - Due Clearance Review List',
          },
          {
            path: 'due_clearance_review_form/:empId',
            loadComponent: () =>
              import('./due-clearance-review-form/due-clearance-review-form.component')
                .then((m) => m.DueClearanceReviewFormComponent),
            title: 'HRMS - Due Clearance Review Form',
          },
          

        ],

      },
    ],
  },
];
