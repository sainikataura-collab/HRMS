import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { dashboardRoutingModule } from '../../dashboard/dashboard.routes';
import { Error404Component } from '../components/error404/error404.component';
//import { AuthMainRoutingModule } from '../../auth_main/auth_main.routes';

export const dash: Routes = [
  {
    path: '',
    children: [
      ...dashboardRoutingModule.routes,

      //...AuthMainRoutingModule.routes,

      {
        path: 'setting',
        loadChildren: () =>
          import('../../pages/setting/setting.routes').then((m) => m.routes),
      },

      // use for company Login route module wise
      {
        path: 'user',
        loadChildren: () =>
          import('../../pages/all-dashboard/user/user.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'payroll',
        loadChildren: () =>
          import('../../pages/all-dashboard/payroll/payroll.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'hr',
        loadChildren: () =>
          import('../../pages/all-dashboard/hr/hr.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'recruitment',
        loadChildren: () =>
          import('../../pages/all-dashboard/recruitment/recruitment.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'appraisal',
        loadChildren: () =>
          import('../../pages/all-dashboard/appraisal/appraisal.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'training',
        loadChildren: () =>
          import('../../pages/all-dashboard/training/training.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'travel_expense',
        loadChildren: () =>
          import('../../pages/all-dashboard/travel _expense/travel_expense.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'exit',
        loadChildren: () =>
          import('../../pages/all-dashboard/exit/exit.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'on_boarding',
        loadChildren: () =>
          import('../../pages/all-dashboard/on_boarding/on_boarding.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'report',
        loadChildren: () =>
          import('../../pages/all-dashboard/report/report.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'visitor',
        loadChildren: () =>
          import('../../pages/all-dashboard/visitors/visitor.routes').then(
            (m) => m.routes,
          ),
      },
        {

        path: 'adminTaskbox',

        loadChildren: () => import('../../pages/all-dashboard/taskbox/adminTaskbox.routes').then((m) => m.routes)

      },



      {

        path: 'adminEmployeeManagement',

        loadChildren: () => import('../../pages/all-dashboard/employee_management/employeeManagement.routes').then((m) => m.routes)

      },

       {

        path: 'vendor_management',

        loadChildren: () => import('../../pages/all-dashboard/vendor/vendor.route').then((m) => m.routes)

      },


      {

        path: 'adminAttendance',

        loadChildren: () => import('../../pages/all-dashboard/admin_attendance/admin_attendance.route').then((m) => m.routes)

      },



      {

        path: 'adminLeave',

        loadChildren: () => import('../../pages/all-dashboard/admin_leave/admin_leave.route').then((m) => m.routes)

      },



       {

        path: 'orgView',

        loadChildren: () => import('../../pages/all-dashboard/org_view/org_view.route').then((m) => m.routes)

      },

      {
        path: 'client_billing',
        loadChildren: () => import('../../pages/all-dashboard/client_billing/client_billing.route').then((m) => m.routes)

      },

      // use for employee Login route module wise

      {
        path: 'taskbox',
        loadChildren: () =>
          import('../../pages/all-employee/task-box/task-box.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'attendance',
        loadChildren: () =>
          import('../../pages/all-employee/attendance/attendance.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'leaves',
        loadChildren: () =>
          import('../../pages/all-employee/leaves/leaves.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'reimbursement',
        loadChildren: () =>
          import('../../pages/all-employee/Compensation/reimbursement.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'performance',
        loadChildren: () =>
          import('../../pages/all-employee/performance/performance.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'feedback',
        loadChildren: () =>
          import('../../pages/all-employee/feedback/feedback.routes').then(
            (m) => m.routes,
          ),
      },
      {
        path: 'hrdocument',
        loadChildren: () =>
          import('../../pages/all-employee/hr-documents/hrdocument.routes').then(
            (m) => m.routes,
          ),
      },
      {
        path: 'hrpolicies',
        loadChildren: () =>
          import('../../pages/all-employee/hr-policies/hrpolicies.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'emp-recruitment',
        loadChildren: () =>
          import('../../pages/all-employee/emp-recruitment/emp-recruitment.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'emp-exit',
        loadChildren: () =>
          import('../../pages/all-employee/emp-exit/emp_exit.routes').then(
            (m) => m.routes,
          ),
      },

      {
        path: 'emp-training',
        loadChildren: () =>
          import('../../pages/all-employee/emp-training/emp-training.routes').then(
            (m) => m.routes,
          ),
      },
      {
        path: 'event',
        loadChildren: () =>
          import('../../pages/all-employee/event/event.routes').then(
            (m) => m.routes,
          ),
      },

      {
  path: 'travelexpence_emp',
  loadChildren:()=> import('../../pages/all-employee/travel_expence-emp/travel_expence-emp.routes').then((m)=> m.routes)
},


      {
        path: '**',
        component: Error404Component,
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forRoot(dash)],
  exports: [RouterModule],
})
export class SaredRoutingModule {}
