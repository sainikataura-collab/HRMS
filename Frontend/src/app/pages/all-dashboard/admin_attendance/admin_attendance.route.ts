

import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'adminAttendance'
    },
    children: [

      {
        path: 'adminAttendancedashboard',
        loadComponent: () => import('./admin-attendance-dashboard/admin-attendance-dashboard.component').then((m) => m.AdminAttendanceDashboardComponent),
        title: 'HRMS -adminAttendance dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./admin-attendance-dash/admin-attendance-dash.component').then((m) => m.AdminAttendanceDashComponent),
            title: 'HRMS - adminAttendance Dash'
          },
          {
            path: 'shiftmaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./ShiftMaster/shift-master/shift-master.component').then((m) => m.ShiftMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'shiftmaster/:pk_shiftId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./ShiftMaster/shift-master/shift-master.component').then((m) => m.ShiftMasterComponent),
            title: 'HRMS '
          },

          {
            path: 'shiftmaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./ShiftMaster/shift-master-list/shift-master-list.component').then((m) => m.ShiftMasterListComponent),
            title: 'HRMS '
          },
                  {
            path: 'customer_shift_rate_bonus',
            canActivate: [AuthGuard],
            loadComponent: () => import('./customer-shift-rate-bonus-form/customer-shift-rate-bonus-form.component').then((m) => m.CustomerShiftRateBonusFormComponent),
            title: 'HRMS - Customer Shift Rate & Bonus'
          },
          {
            path: 'customer_shift_rate_bonus/:id',
            canActivate: [AuthGuard],
            loadComponent: () => import('./customer-shift-rate-bonus-form/customer-shift-rate-bonus-form.component').then((m) => m.CustomerShiftRateBonusFormComponent),
            title: 'HRMS - Customer Shift Rate & Bonus'
          },
          {
            path: 'customer_shift_rate_bonus_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./customer-shift-rate-bonus-list/customer-shift-rate-bonus-list.component').then((m) => m.CustomerShiftRateBonusListComponent),
            title: 'HRMS - Customer Shift Rate & Bonus List'
          }, 
          {
            path: 'WorkingDayMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./working-day-master/working-day-master.component').then((m) => m.WorkingDayMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'WorkingDayMaster/:pk_holidayid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./working-day-master/working-day-master.component').then((m) => m.WorkingDayMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'WorkingDayMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./working-day-master-list/working-day-master-list.component').then((m) => m.WorkingDayMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'EmployeeWeeklyOffMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./EmployeeWeeklyOffMaster/employee-weekly-off-master/employee-weekly-off-master.component').then((m) => m.EmployeeWeeklyOffMasterComponent)
          },
          {
            path: 'EmployeeWeeklyOffMaster/:fk_empid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./EmployeeWeeklyOffMaster/employee-weekly-off-master/employee-weekly-off-master.component').then((m) => m.EmployeeWeeklyOffMasterComponent)
          },
          {
            path: 'EmployeeWeeklyOffMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./EmployeeWeeklyOffMaster/empweekoffmasterlist/empweekoffmasterlist.component').then((m) => m.EmpweekoffmasterlistComponent)
          },
          {
            path: 'WeeklyOff-Master-data_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./WeeklyOff-Master/weekly-off-list/weekly-off-list.component').then((m) => m.WeeklyOffListComponent),
          },
          {
            path: 'WeeklyOff-Master-data',
            canActivate: [AuthGuard],
            loadComponent: () => import('./WeeklyOff-Master/week-off/week-off.component').then((m) => m.WeekOffComponent),
          },
          {
            path: 'WeeklyOff-Master-data/:pk_woffid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./WeeklyOff-Master/week-off/week-off.component').then((m) => m.WeekOffComponent),
          },

          {
            path: 'Attendance-InOut_shift',
            canActivate: [AuthGuard],
            loadComponent: () => import('./attendance-in-out-shift/attendance-in-out-shift.component').then((m) => m.AttendanceInOutShiftComponent),
            title: 'HRMS Import Tax Report'
          },
          {
            path: 'monthlyAttendance',
            canActivate: [AuthGuard],
            loadComponent: () => import('./monthly-attendance/monthly-attendance.component').then((m) => m.MonthlyAttendanceComponent),
            title: 'HRMS '
          },

          {
            path: 'attendanceAdjustment',
            canActivate: [AuthGuard],
            loadComponent: () => import('./attendance-adjustment/attendance-adjustment.component').then((m) => m.AttendanceAdjustmentComponent),
            title: 'HRMS '
          },

          {
            path: 'Approvedleave',
            canActivate: [AuthGuard],
            loadComponent: () => import('./approvedleave/approvedleave.component').then((m) => m.ApprovedleaveComponent),
            title: 'HRMS - Under development'
          },
          {
            path: 'exportAttendance',
            canActivate: [AuthGuard],
            loadComponent: () => import('./export-attendance/export-attendance.component').then((m) => m.ExportAttendanceComponent),
            title: 'HRMS '
          },
          {
            path: 'attendance-configuration',
            loadComponent: () => import('./attendance-config/attendance-config.component').then((m) => m.AttendanceConfigComponent),
            title: 'HRMS - Under development'
          },
           {
            path: 'location-tracker',
            canActivate: [AuthGuard],
            loadComponent: () => import('./location-tracker/location-tracker.component').then((m) => m.LocationTrackerComponent),
            title: 'HRMS - Location Tracker'
          },

           {
            path: 'UpdateAttendance',
            canActivate: [AuthGuard],
            loadComponent: () => import('./update-attendance/update-attendance.component').then((m) => m.UpdateAttendanceComponent),
            title: 'HRMS '
          },
         {
            path: 'customer_shift_rate_bonus_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./customer-shift-rate-bonus-upload/customer-shift-rate-bonus-upload.component').then((m) => m.CustomerShiftRateBonusUploadComponent),
            title: 'HRMS - Customer Shift Rate & Bonus Bulk Upload'
          },

          {
            path: 'shift_roster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./shift-roster-form/shift-roster-form.component').then((m) => m.ShiftRosterFormComponent),
            title: 'Shift Roster'
          },
          {
            path: 'shift_roster/:id',
            canActivate: [AuthGuard],
            loadComponent: () => import('./shift-roster-form/shift-roster-form.component').then((m) => m.ShiftRosterFormComponent),
            title: 'Shift Roster'
          },
          {
            path: 'shift_roster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./shift-roster-list/shift-roster-list.component').then((m) => m.ShiftRosterListComponent),
            title: 'Shift Roster List'
          },
          {
            path: 'shift_roster_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./shift-roster-upload/shift-roster-upload.component').then((m) => m.ShiftRosterUploadComponent),
            title: 'Import/Export Shift Roster'
          },

        ]
      }


    ]

  }]

