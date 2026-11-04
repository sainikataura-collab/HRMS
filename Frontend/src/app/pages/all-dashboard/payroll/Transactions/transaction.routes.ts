import { Routes } from '@angular/router';


export const routes: Routes = [
  {
  path: '',
  data: {
    title: 'transaction'
  },
  children: [
    {
      path: 'bulkLeaveEncashment',
      loadComponent: () =>import('./bulk-leave-encashment/bulk-leave-encashment.component').then( (m) => m.BulkLeaveEncashmentComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'monthlyAttendance',
      loadComponent: () =>import('./monthly-attendance/monthly-attendance.component').then( (m) => m.MonthlyAttendanceComponent),
      title: 'HRMS - Under development'
    },
   
    {
      path: 'attendanceAdjustment',
      loadComponent: () =>import('./attendance-adjustment/attendance-adjustment.component').then( (m) => m.AttendanceAdjustmentComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'autoSalaryProcess',
      loadComponent: () =>import('./auto-salary-process/auto-salary-process.component').then( (m) => m.AutoSalaryProcessComponent),
      title: 'HRMS - Under development'
    },
   

    
 
    {
            path: 'leaveAccrual',
            loadComponent: () =>import('./leave-accrual/leave-accrual.component').then( (m) => m.LeaveAccrualComponent),
            title: 'HRMS - Under development'
          },
    {
      path: 'stopSalary',
      loadComponent: () =>import('./stop-salary/stop-salary.component').then( (m) => m.StopSalaryComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'payStoppedSalary',
      loadComponent: () =>import('./pay-stopped-salary/pay-stopped-salary.component').then( (m) => m.PayStoppedSalaryComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'manualIncomeTax',
      loadComponent: () =>import('./manual-income-tax/manual-income-tax.component').then( (m) => m.ManualIncomeTaxComponent),
      title: 'HRMS - Under development'
    },

   
    {
      path: 'lockIncomeTax',
      loadComponent: () =>import('./lock-income-tax/lock-income-tax.component').then( (m) => m.LockIncomeTaxComponent),
      title: 'HRMS- Under development'
    },
    {
      path: 'ITProcess',
      loadComponent: () =>import('./itprocess/itprocess.component').then( (m) => m.ITProcessComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'arrearProcess',
      loadComponent: () =>import('./arrear-process/arrear-process.component').then( (m) => m.ArrearProcessComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'newHeadAssign',
      loadComponent: () =>import('./new-head-assign/new-head-assign.component').then( (m) => m.NewHeadAssignComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'salaryLock',
      loadComponent: () =>import('./salary-lock/salary-lock.component').then( (m) => m.SalaryLockComponent),
      title: 'HRMS - Under development'
    },
     

    
    {
      path: 'manualPunchBio',
      loadComponent: () =>import('./manual-punch-bio/manual-punch-bio.component').then( (m) => m.ManualPunchBioComponent),
      title: 'HRMS - Under development'
    },



    {
      path: 'leaveTransaction',
      loadComponent: () =>import('./leave-transaction/leave-transaction.component').then( (m) => m.LeaveTransactionComponent),
      title: 'HRMS - Under development'
    },
    
    {
      path: 'leaveEncashment',
      loadComponent: () =>import('./leave-encashment/leave-encashment.component').then( (m) => m.LeaveEncashmentComponent),
      title: 'HRMS - Under development'
    },
    {
      path: 'leaveEncashmentList',
      loadComponent: () =>import('./leave-encashment-list/leave-encashment-list.component').then( (m) => m.LeaveEncashmentListComponent),
      title: 'HRMS - Under development'
    },
   
]

  }
];