

import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
    {
        path: '',
        data: {
            title: 'adminLeave'
        },
        children: [

            {
                path: 'adminLeavedashboard',
                loadComponent: () => import('./admin-leave-dashboard/admin-leave-dashboard.component').then((m) => m.AdminLeaveDashboardComponent),
                title: 'HRMS -adminLeave dashboard',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./admin-leave-dash/admin-leave-dash.component').then((m) => m.AdminLeaveDashComponent),
                        title: 'HRMS - adminLeave Dash'
                    },
                    {
                        path: 'ImportLeaveTaken',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./import-leave-taken/import-leave-taken.component').then((m) => m.ImportLeaveTakenComponent),
                        title: 'HRMS Import Tax Report'
                    },
                    {
                        path: 'export-import-leave',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./export-import-leave/export-import-leave.component').then((m) => m.ExportImportLeaveComponent),
                        title: 'HRMS '
                    },


                    {
                        path: 'leave-assessment-Master',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./leave-assignment/leave-assessment.component').then((m) => m.LeaveAssessmentComponent)
                    },
                    {
                        path: 'leave-assessment-Master/:pk_assignid',
                        loadComponent: () => import('./leave-assignment/leave-assessment.component').then((m) => m.LeaveAssessmentComponent)
                    },
                    {
                        path: 'leaveTransaction',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./leave-transaction/leave-transaction.component').then((m) => m.LeaveTransactionComponent),
                        title: 'HRMS '
                    },

                    {
                        path: 'leaveEncashment',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./leave-encashment/leave-encashment.component').then((m) => m.LeaveEncashmentComponent),
                        title: 'HRMS '
                    },
                    {
                        path: 'leaveEncashment/:pk_encashid',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./leave-encashment/leave-encashment.component').then((m) => m.LeaveEncashmentComponent),
                        title: 'HRMS '
                    },
                    {
                        path: 'leaveEncashment_list',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./leave-encashment-list/leave-encashment-list.component').then((m) => m.LeaveEncashmentListComponent),
                        title: 'HRMS '
                    },
                    {
                        path: 'leaveAccrual',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./leave-accrual/leave-accrual.component').then((m) => m.LeaveAccrualComponent),
                        title: 'HRMS '
                    },
                     {
                                path: 'exportLeave',
                                canActivate: [AuthGuard],
                                loadComponent: () => import('./export-leave/export-leave.component').then((m) => m.ExportLeaveComponent),
                                title: 'HRMS '
                              },
                              {
                        path: 'exportLeaveNew',
                        canActivate: [AuthGuard],
                        loadComponent: () => import('./export-leave-new/export-leave-new.component').then((m) => m.ExportLeaveNewComponent),
                        title: 'HRMS '
                    },
                              {
                                          path: 'holidaysMaster',
                                          canActivate: [AuthGuard],
                                          loadComponent: () => import('./holidays-master/holidays-master.component').then((m) => m.HolidaysMasterComponent),
                                          title: 'HRMS '
                                        },
                                        {
                                          path: 'holidaysMaster/:pk_holidayid',
                                          canActivate: [AuthGuard],
                                          loadComponent: () => import('./holidays-master/holidays-master.component').then((m) => m.HolidaysMasterComponent),
                                          title: 'HRMS '
                                        },
                                        {
                                          path: 'holidaysMaster_list',
                                          canActivate: [AuthGuard],
                                          loadComponent: () => import('./holidays-details/holidays-details.component').then((m) => m.HolidaysDetailsComponent),
                                          title: 'HRMS '
                                        },
                                          {
                                                    path: 'RestrictedMaster_list',
                                                    canActivate: [AuthGuard],
                                                    loadComponent: () => import('./all-restricted-holiday/all-restricted-holiday.component').then((m) => m.AllRestrictedHolidayComponent)
                                                  },
                                                  {
                                                    path: 'RestrictedMaster',
                                                    canActivate: [AuthGuard],
                                                    loadComponent: () => import('./restricted-holiday/restricted-holiday.component').then((m) => m.RestrictedHolidayComponent)
                                                  },
                                        
                                        
                                                  {
                                                    path: 'RestrictedMaster/:pk_holidayid',
                                                    canActivate: [AuthGuard],
                                                    loadComponent: () => import('./restricted-holiday/restricted-holiday.component').then((m) => m.RestrictedHolidayComponent)
                                                  },
                                        
                ]
            }

        ]

    }]

