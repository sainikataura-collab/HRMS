import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'adminEmployeeManagement',
    },
    children: [
      {
        path: 'adminEmployeeManagementdashboard',
        loadComponent: () =>
          import(
            './employee-management-dashboard/employee-management-dashboard.component'
          ).then((m) => m.EmployeeManagementDashboardComponent),
        title: 'HRMS -adminEmployeeManagement dashboard',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './employee-management-dash/employee-management-dash.component'
              ).then((m) => m.EmployeeManagementDashComponent),
            title: 'HRMS - adminEmployeeManagement Dash',
          },

          //employee master
          {
            path: 'Employee_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-list/employee-list.component').then(
                (m) => m.EmployeeListComponent
              ),
            title: 'Employee Master',
          },
          {
            path: 'EmployeeMst',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-mst/employee-mst.component').then(
                (m) => m.EmployeeMstComponent
              ),
            title: 'Under - Employee Master',
          },
          {
            path: 'EmployeeMst/:pk_empid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-mst/employee-mst.component').then(
                (m) => m.EmployeeMstComponent
              ),
            title: 'Under - Employee Master',
          },

          {
            path: 'EmployeeAttendance',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-attendance/employee-attendance.component'
              ).then((m) => m.EmployeeAttendanceComponent),
            title: 'Under - Employee Master',
          },
          {
            path: 'EmployeeAttendance/:pk_empid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-attendance/employee-attendance.component'
              ).then((m) => m.EmployeeAttendanceComponent),
            title: 'Under - Employee Master',
          },

          {
            path: 'EmployeeOtherDetails',

            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-other-details/employee-other-details.component'
              ).then((m) => m.EmployeeOtherDetailsComponent),
            title: 'Under - Employee Master',
          },
          {
            path: 'EmployeeOtherDetails/:pk_empid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-other-details/employee-other-details.component'
              ).then((m) => m.EmployeeOtherDetailsComponent),
            title: 'Under - Employee Master',
          },

          {
            path: 'EmployeeHead',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-head/employee-head.component').then(
                (m) => m.EmployeeHeadComponent
              ),
            title: 'Under - Employee Master',
          },
          {
            path: 'EmployeeHead/:pk_empid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-head/employee-head.component').then(
                (m) => m.EmployeeHeadComponent
              ),
            title: 'Under - Employee Master',
          },
          {
            path: 'DemographicDetails',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './Demographic_Details/demographi-details/demographi-details.component'
              ).then((m) => m.DemographicDetailsComponent),
            title: 'HRMS - Hr-Dashboard',
          },
          {
            path: 'DemographicDetails/:fk_empid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './Demographic_Details/demographi-details/demographi-details.component'
              ).then((m) => m.DemographicDetailsComponent),
            title: 'HRMS - Hr-Dashboard',
          },
          {
            path: 'DemographicDetails_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './Demographic_Details/demographi-details-list/demographi-details-list.component'
              ).then((m) => m.DemographiDetailsListComponent),
            title: 'HRMS - Hr-Dashboard',
          },
          {
            path: 'HR_EmployeeQualification_Mst',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './hr-employee-qualification-mst/hr-employee-qualification-mst.component'
              ).then((m) => m.HREmployeeQualificationMstComponent),
            title: 'HRMS - Hr-Dashboard',
          },

          {
            path: 'HR_EmployeeQualification_Mst/:pk_empqualid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './hr-employee-qualification-mst/hr-employee-qualification-mst.component'
              ).then((m) => m.HREmployeeQualificationMstComponent),
            title: 'HRMS - Hr-Dashboard',
          },
          {
            path: 'HR_EmployeeQualification_Mst_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './hr-qualification-list/hr-qualification-list.component'
              ).then((m) => m.HrQualificationListComponent),
            title: 'HRMS - Hr-Dashboard',
          },

          {
            path: 'changeEmployeePassword',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './change-employee-password/change-employee-password.component'
              ).then((m) => m.ChangeEmployeePasswordComponent),
            title: 'Under - Employee Master',
          },
          {
            path: 'SAL_EmployeePreviousJob_Details',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './ExperienceDetails/experience-details/experience-details.component'
              ).then((m) => m.ExperienceDetailsComponent),
            title: 'HRMS ',
          },

          {
            path: 'SAL_EmployeePreviousJob_Details/:pk_pjobid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './ExperienceDetails/experience-details/experience-details.component'
              ).then((m) => m.ExperienceDetailsComponent),
            title: 'HRMS ',
          },
          {
            path: 'SAL_EmployeePreviousJob_Details_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './ExperienceDetails/experience-detail-list/experience-detail-list.component'
              ).then((m) => m.ExperienceDetailListComponent),
            title: 'HRMS ',
          },

          {
            path: 'importEmployee',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./import-employee/import-employee.component').then(
                (m) => m.ImportEmployeeComponent
              ),
            title: 'HRMS ',
          },
          {
            path: 'ExportImportEmpOtherDetails',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './export-import-emp-other-details/export-import-emp-other-details.component'
              ).then((m) => m.ExportImportEmpOtherDetailsComponent),
            title: 'HRMS Import Tax Report',
          },
          {
            path: 'EmployeeProfile',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-profile/employee-profile.component').then(
                (m) => m.EmployeeProfileComponent
              ),
            title: 'HRMS - Employee Profile',
          },

          {
            path: 'EmployeeReport',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./employee-report/employee-report.component').then(
                (m) => m.EmployeeReportComponent
              ),
            title: 'HRMS -Employee_Report',
          },

          {
            path: 'ctcdetails',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./ctc-details/ctc-details.component').then(
                (m) => m.CtcDetailsComponent
              ),
            title: 'HRMS -Ctc Details',
          },
{
            path: 'servicetype_mapping_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-servicetype-mapping-list/employee-servicetype-mapping-list.component'
              ).then((m) => m.EmployeeServiceTypeMappingListComponent),
            title: 'Employee Service Type Mapping List',
          },
          {
            path: 'servicetype_mapping_form',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-servicetype-mapping-form/employee-servicetype-mapping-form.component'
              ).then((m) => m.EmployeeServiceTypeMappingFormComponent),
            title: 'Employee Service Type Mapping Form',
          },
          {
            path: 'servicetype_mapping_form/:id',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './employee-servicetype-mapping-form/employee-servicetype-mapping-form.component'
              ).then((m) => m.EmployeeServiceTypeMappingFormComponent),
            title: 'Modify Employee Service Type Mapping',
          },
          //    {
          //   path: 'RegionalEmployee_list',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './regional-employee-list/regional-employee-list.component'
          //     ).then((m) => m.RegionalEmployeeListComponent),
          //   title: 'Regional Employee List',
          // },
          // {
          //   path: 'RegionalEmployee',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './regional-employee/regional-employee.component'
          //     ).then((m) => m.RegionalEmployeeComponent),
          //   title: 'Add Regional Employee',
          // },
          // {
          //   path: 'RegionalEmployee/:pk_empid',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './regional-employee/regional-employee.component'
          //     ).then((m) => m.RegionalEmployeeComponent),
          //   title: 'Update Regional Employee',
          // },

            // Regional Employee Master
          {
            path: 'RegionalEmployee_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './regional-employee-list/regional-employee-list.component'
              ).then((m) => m.RegionalEmployeeListComponent),
            title: 'Regional Employee List',
          },
          {
            path: 'RegionalEmployee',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './regional-employee/regional-employee.component'
              ).then((m) => m.RegionalEmployeeComponent),
            title: 'Add Regional Employee',
          },
          {
            path: 'RegionalEmployee/:pk_empid',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import(
                './regional-employee/regional-employee.component'
              ).then((m) => m.RegionalEmployeeComponent),
            title: 'Update Regional Employee',
          },


        ],
      },
    ],
  },
];
