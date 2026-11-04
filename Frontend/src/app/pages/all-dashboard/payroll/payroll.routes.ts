import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'payroll'
    },
    children: [
      {
        path: 'payrolldashboard',
        loadComponent: () => import('./payroll-dashboard/payroll-dashboard.component').then((m) => m.PayrollDashboardComponent),
        title: 'HRMS -Payroll Dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./payroll-dash/payroll-dash.component').then((m) => m.PayrollDashComponent),
            title: 'HRMS - Payroll dash'
          },

          //not in working routes starts-----------------------------------------------------------------------------------------------------

          // {
          //   path: 'Employee-prograssion',
          //   loadComponent: () => import('./Transactions/employee-prograssion/employee-prograssion.component').then((m) => m.EmployeePrograssionComponent),
          //   title: 'Under - Employee Master'
          // },

          // {
          //   path: 'Formula-Master',
          //   loadComponent: () => import('./Common/FormulaMaster/formula-master/formula-master.component').then((m) => m.FormulaMasterComponent),
          // },

          //  {
          //   path: 'Approval-Flexibill',
          //  
          //   loadComponent: () => import('./Tax/Approval-Flexi-Bill/tax-flexibill-aproval/tax-flexibill-aproval.component').then((m) => m.TaxFlexibillAprovalComponent)
          // },

          //  {
          //   path: 'GenerateEReturn',
          //   
          //   loadComponent: () => import('./Tax/GenerateEReturn/generate-ereturn/generate-ereturn.component').then((m) => m.GenerateEreturnComponent)
          // },
          // {
          //   path: 'GenerateForm16[Cons]',
          //  
          //   loadComponent: () => import('./Tax/GenerateForm16[Cons]/generateform16cons/generateform16cons.component').then((m) => m.Generateform16consComponent)
          // },

          // {
          //   path: 'MonthlyTaxChallan',
          //   
          //   loadComponent: () => import('./Tax/MonthlyTaxChallan/monthly-tax-challan/monthly-tax-challan.component').then((m) => m.MonthlyTaxChallanComponent)
          // },
          //   {
          //   path: 'IncomeTaxCalculator',
          //  
          //   loadComponent: () => import('./Tax/Income-Tax-Calculator/tax-income-tax-calculator/tax-income-tax-calculator.component').then((m) => m.TaxIncomeTaxCalculatorComponent)
          // },

          //  {
          //   path: 'Approval-Rent-Detail',
          //  
          //   loadComponent: () => import('./Tax/Approval-Rent-Details/approval-rent-detail/approval-rent-detail.component').then((m) => m.ApprovalRentDetailComponent)
          // },


          //  Export & Import (Payroll)

          // {
          //   path: 'importAttendancePunch',

          //   loadComponent: () => import('./Export-Import/import-attendance-punch/import-attendance-punch.component').then((m) => m.ImportAttendancePunchComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'exportAttendance',

          //   loadComponent: () => import('./Export-Import/export-attendance/export-attendance.component').then((m) => m.ExportAttendanceComponent),
          //   title: 'HRMS '
          // },

          // {
          //   path: 'importAttendanceOT',

          //   loadComponent: () => import('./Export-Import/import-attendance-ot/import-attendance-ot.component').then((m) => m.ImportAttendanceOTComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'exportEmport',

          //   loadComponent: () => import('./Export-Import/export-import/export-import.component').then((m) => m.ExportImportComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'exportImportEmployee',

          //   loadComponent: () => import('./Export-Import/export-import-employee/export-import-employee.component').then((m) => m.ExportImportEmployeeComponent),
          //   title: 'HRMS - Export_Import_Employee'
          // },


          // {
          //   path: 'importtaxreport',

          //   loadComponent: () => import('./Export-Import/import-tax-report/import-tax-report.component').then((m) => m.ImportTaxReportComponent),
          //   title: 'HRMS Import Tax Report'
          // },
          // Settings

          // {
          //   path: 'manualIncomeTax',
          //  
          //   loadComponent: () => import('./Transactions/manual-income-tax/manual-income-tax.component').then((m) => m.ManualIncomeTaxComponent),
          //   title: 'HRMS '
          // },

          // {
          //   path: 'leave-configuration',

          //   loadComponent: () => import('./Settings/leaveconfiguration/leaveconfiguration.component').then((m) => m.LeaveconfigurationComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'tax-configuration',

          //   loadComponent: () => import('./Settings/taxconfiguration/taxconfiguration.component').then((m) => m.TaxconfigurationComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'lockunlockflexihead',
          //   loadComponent: () => import('./Settings/lockunlockflexihead/lockunlockflexihead.component').then((m) => m.LockunlockflexiheadComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'Editlockunlockflexihead/:id',
          //   loadComponent: () => import('./Settings/lockunlockflexihead/lockunlockflexihead.component').then((m) => m.LockunlockflexiheadComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'lockunlockflexihead-list',

          //   loadComponent: () => import('./Settings/lockunlockflexihead-list/lockunlockflexihead-list.component').then((m) => m.LockunlockflexiheadListComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'Quarter',
          //   loadComponent: () => import('./Settings/quarter/quarter.component').then((m) => m.QuarterComponent)
          // },
          // {
          //   path: 'Quarter-List',

          //   loadComponent: () => import('./Settings/all-quarter/all-quarter.component').then((m) => m.AllQuarterComponent)
          // },

          //   {
          //   path: 'AccountMaster',
          //   loadComponent: () => import('./Common/AccountMaster/account-master/account-master.component').then((m) => m.AccountMasterComponent)
          // },

          // {
          //   path: 'AccountMasterList',

          //   loadComponent: () => import('./Common/AccountMaster/all-account-master/all-account-master.component').then((m) => m.AllAccountMasterComponent)
          // },
          // {
          //   path: 'AccountMaster/:pk_account_id',
          //   loadComponent: () => import('./Common/AccountMaster/account-master/account-master.component').then((m) => m.AccountMasterComponent)
          // },


          // {
          //   path: 'Master',
          //   loadComponent: () => import('./Common/Master/master/master.component').then((m) => m.MasterComponent)
          // },
          // {
          //   path: 'MasterList',

          //   loadComponent: () => import('./Common/Master/masterlist/masterlist.component').then((m) => m.MasterlistComponent)
          // },

          //  {
          //  path: 'ExportImportEmpOtherDetails',

          //   loadComponent: () => import('./Export-Import/export-import-emp-other-details/export-import-emp-other-details.component').then((m) => m.ExportImportEmpOtherDetailsComponent),
          //   title: 'HRMS Import Tax Report'
          // },


          //  {
          //   path: 'ListOfMaster',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/ListOfMaster/list-of-master/list-of-master.component').then((m) => m.ListOfMasterComponent)
          // },
          // {
          //   path: 'AttendanceReport',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/AttendanceReport/attendance-report/attendance-report.component').then((m) => m.AttendanceReportComponent)
          // },
          // {
          //   path: 'AnnualStatements',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/AnnualStatements/annual-statements/annual-statements.component').then((m) => m.AnnualStatementsComponent)
          // },
          // {
          //   path: 'JournalVoucher',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/JournalVoucher/journal-voucher/journal-voucher.component').then((m) => m.JournalVoucherComponent)
          // },

          // {
          //     path: 'seniority-level-master',
          //     canActivate: [AuthGuard],
          //     loadComponent: () => import('./Employee/SeniorityLevel/seniority-level/seniority-level.component').then((m) => m.SeniorityLevelComponent)
          //   },
          //     {
          //     path: 'deductionSlab',
          //     loadComponent: () => import('./Tax/deduction-slab/deduction-slab.component').then((m) => m.DeductionSlabComponent),
          //     title: 'HRMS '
          //   },
          //   {
          //     path: 'editdeductionSlab/:id',
          //     loadComponent: () => import('./Tax/deduction-slab/deduction-slab.component').then((m) => m.DeductionSlabComponent),
          //     title: 'HRMS '
          //   },


          //   {
          //     path: 'deductionList',
          //     canActivate: [AuthGuard],
          //     loadComponent: () => import('./Tax/deduction-list/deduction-list.component').then((m) => m.DeductionListComponent),
          //     title: 'HRMS '
          //   },


          //   {
          //     path: 'previousTaxDetails',
          //     canActivate: [AuthGuard],
          //     loadComponent: () => import('./Tax/previous-tax-details/previous-tax-details.component').then((m) => m.PreviousTaxDetailsComponent),
          //     title: 'HRMS '
          //   },

          // {
          //   path: 'DebitCardMapping',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Employee/debit-card-mapping/debit-card-mapping.component').then((m) => m.DebitCardMappingComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'updateEmployeeMobileNo',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Employee/update-employee-mobile-no/update-employee-mobile-no.component').then((m) => m.UpdateEmployeeMobileNoComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'No',
          //   loadComponent: () => import('./Employee/no/no.component').then((m) => m.NoComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'updateEmployeeEmail',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Employee/update-employee-email/update-employee-email.component').then((m) => m.UpdateEmployeeEmailComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'updateMobileDeviceId',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Employee/update-mobile-device-id/update-mobile-device-id.component').then((m) => m.UpdateMobileDeviceIdComponent),
          //   title: 'HRMS '
          // },

          // {
          //   path: 'bulkLeaveEncashment',
          //   loadComponent: () => import('./Transactions/bulk-leave-encashment/bulk-leave-encashment.component').then((m) => m.BulkLeaveEncashmentComponent),
          //   title: 'HRMS '
          // },

          // {
          //   path: 'bankSatement',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/bank-statement/bank-statement.component').then((m) => m.BankStatementComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'bioAttendanceRepots',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/bio-attendance-repots/bio-attendance-repots.component').then((m) => m.BioAttendanceRepotsComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'mailSalarySlipEmp',
          //   loadComponent: () => import('./payrollReports/mail-salary-slip-emp/mail-salary-slip-emp.component').then((m) => m.MailSalarySlipEmpComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'mailSalarySlipLoc',
          //   loadComponent: () => import('./payrollReports/mail-salary-slip-loc/mail-salary-slip-loc.component').then((m) => m.MailSalarySlipLocComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'AdvStatus',
          //   loadComponent: () => import('./payrollReports/loan-or-adv-status/loan-or-adv-status.component').then((m) => m.LoanOrAdvStatusComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'auditTrailReport',
          //   loadComponent: () => import('./payrollReports/audit-trail-report/audit-trail-report.component').then((m) => m.AuditTrailReportComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'leaveDetailsStatus',
          //   loadComponent: () => import('./payrollReports/leave-details-status/leave-details-status.component').then((m) => m.LeaveDetailsStatusComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'monthlyReports',
          //   loadComponent: () => import('./payrollReports/monthly-reports/monthly-reports.component').then(m => m.MonthlyReportsComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'monthlyStatements',
          //   loadComponent: () => import('./payrollReports/monthly-statements/monthly-statements.component').then((m) => m.MonthlyStatementsComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'analysisReport',
          //   loadComponent: () => import('./payrollReports/analysis-report/analysis-report.component').then((m) => m.AnalysisReportComponent),
          //   title: 'HRMS '
          // }, {
          //   path: 'queryBuilder',
          //   loadComponent: () => import('./payrollReports/query-builder/query-builder.component').then((m) => m.QueryBuilderComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'empFullandFinal',
          //   loadComponent: () => import('./payrollReports/emp-fulland-final/emp-fulland-final.component').then((m) => m.EmpFullandFinalComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'auditTrial',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/audit-trial/audit-trial.component').then((m) => m.AuditTrialComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'yearlyReturns',
          //   canActivate: [AuthGuard],

          //   loadComponent: () => import('./payrollReports/yearly-returns/yearly-returns.component').then((m) => m.YearlyReturnsComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'halfYearlyReturns',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./payrollReports/half-yearly-returns/half-yearly-returns.component').then((m) => m.HalfYearlyReturnsComponent),
          //   title: 'HRMS '
          // },


          // {
          //   path: 'Approval-Section-Doc-list',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Tax/Approval-Section-Doc/approval-sec-doc-edit/approval-sec-doc-edit.component').then((m) => m.ApprovalSecDocEditComponent)
          // },



          // {
          //   path: 'Section-DocStatus',
          //   loadComponent: () => import('./Tax/Section-doc/section-doc-status/section-doc-status.component').then((m) => m.SectionDocStatusComponent)
          // },
          // {
          //   path: 'Section-DocStatus-List',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Tax/Section-doc/section-doc-list/section-doc-list.component').then((m) => m.SectionDocListComponent)
          // },




          //not in working routes end-----------------------------------------------------------------------------------------------------

          // Repeated  start----------------------------------------------------------------------------------------------------------------
          //{
          //   path: 'editprofessionalTax/:id',
          //   loadComponent: () => import('./Tax/professional-tax/professional-tax.component').then((m) => m.ProfessionalTaxComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'professionalTaxList',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Tax/professional-tax-list/professional-tax-list.component').then((m) => m.ProfessionalTaxListComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path:'Compony-Parameter',
          //   loadComponent:()=> import('./Settings/company-parameter/company-parameter.component').then((m)=>m.CompanyParameterComponent)
          // },
          // {
          //   path:'Compony-Parameter-List',
          //     canActivate: [AuthGuard],
          //   loadComponent:()=> import('./Settings/all-company/all-company.component').then((m)=>m.AllCompanyComponent)
          // },
          // {
          //   path: 'operationalMaster',
          //   loadComponent: () => import('./Common/Operational-Master/operational-master/operational-master.component').then((m) => m.OperationalMasterComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'operationalMaster/:pk_OperationalId',
          //   loadComponent: () => import('./Common/Operational-Master/operational-master/operational-master.component').then((m) => m.OperationalMasterComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'operationalDetails',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Common/Operational-Master/operational-details/operational-details.component').then((m) => m.OperationalDetailsComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'subSectionMaster',
          //   loadComponent: () => import('./Tax/sub-section-master/sub-section-master.component').then((m) => m.SubSectionMasterComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'editsubSectionMaster/:id',
          //   loadComponent: () => import('./Tax/sub-section-master/sub-section-master.component').then((m) => m.SubSectionMasterComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'subSectionMasterList',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Tax/sub-section-master-list/sub-section-master-list.component').then((m) => m.SubSectionMasterListComponent),
          //   title: 'HRMS '
          // },

          // {
          //   path: 'cityCategoryMaster',
          //   loadComponent: () =>import('./Common/CategoryMaster/city-category-master.component').then( (m) => m.CityCategoryMasterComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'cityCategoryMaster/:pk_ccid',
          //   loadComponent: () =>import('./Common/CategoryMaster/city-category-master.component').then( (m) => m.CityCategoryMasterComponent),
          //   title: 'HRMS '
          // },
          // {
          //   path: 'cityCategoryMasterDetails',
          //   loadComponent: () =>import('./Common/city-category-master-details/city-category-master-details.component').then( (m) => m.CityCategoryMasterDetailsComponent),
          //   title: 'HRMS '
          // },
          // Repeated end--------------------------------------------------------------------------------------------------------------


          //Route Arrangement start here  (by priyanka)
          //payroll master(Employee)

          //payroll master(common)
         
         
          //Transaction

        
          {
            path: 'loanAllotment',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/loan-allotment/loan-allotment.component').then((m) => m.LoanAllotmentComponent),
            title: 'HRMS '
          },
          {
            path: 'loanAllotment/:pk_allotid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/loan-allotment/loan-allotment.component').then((m) => m.LoanAllotmentComponent),
            title: 'HRMS '
          },
          {
            path: 'loanAllotment_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/loan-allotment-list/loan-allotment-list.component').then((m) => m.LoanAllotmentListComponent),
            title: 'HRMS-  '
          },
          {
            path: 'autoSalaryProcessReim',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/auto-salary-process-reim/auto-salary-process-reim.component').then((m) => m.AutoSalaryProcessReimComponent),
            title: 'HRMS '
          },
          {
            path: 'loanTransaction',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/loan-transaction/loan-transaction.component').then((m) => m.LoanTransactionComponent),
            title: 'HRMS '
          },
          {
            path: 'loanTransaction/:pk_lid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/loan-transaction/loan-transaction.component').then((m) => m.LoanTransactionComponent),
            title: 'HRMS '
          },
          {
            path: 'loanTransaction_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/loan-transaction-list/loan-transaction-list.component').then((m) => m.LoanTransactionListComponent),
            title: 'HRMS '
          },

          {
            path: 'manualPunchBio',
            canActivate: [AuthGuard],

            loadComponent: () => import('./Transactions/manual-punch-bio/manual-punch-bio.component').then((m) => m.ManualPunchBioComponent),
            title: 'HRMS '
          },
        
          {
            path: 'autoSalaryProcess',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/auto-salary-process/auto-salary-process.component').then((m) => m.AutoSalaryProcessComponent),
            title: 'HRMS '
          },
          {
            path: 'stopSalary',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/stop-salary/stop-salary.component').then((m) => m.StopSalaryComponent),
            title: 'HRMS '
          },

          {
            path: 'autoBonusProcess',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/auto-bonus-process/auto-bonus-process.component').then((m) => m.AutoBonusProcessComponent),
            title: 'HRMS '
          },

           {
            path: 'LTAProcess',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/ltaprocess/ltaprocess.component').then((m) => m.LTAprocessComponent),
            title: 'HRMS '
          },
        
          {
            path: 'payStoppedSalary',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/pay-stopped-salary/pay-stopped-salary.component').then((m) => m.PayStoppedSalaryComponent),
            title: 'HRMS '
          },

          {
            path: 'manualIncomeTax',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/manual-income-tax/manual-income-tax.component').then((m) => m.ManualIncomeTaxComponent),
            title: 'HRMS '
          },
          {
            path: 'ITProcess',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/itprocess/itprocess.component').then((m) => m.ITProcessComponent),
            title: 'HRMS '
          },
          {
            path: 'lockIncomeTax',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/lock-income-tax/lock-income-tax.component').then((m) => m.LockIncomeTaxComponent),
            title: 'HRMS-  '
          },
          {
            path: 'arrearProcess',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/arrear-process/arrear-process.component').then((m) => m.ArrearProcessComponent),
            title: 'HRMS '
          },
          {
            path: 'newHeadAssign',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/new-head-assign/new-head-assign.component').then((m) => m.NewHeadAssignComponent),
            title: 'HRMS '
          },
          {
            path: 'salaryLock',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/salary-lock/salary-lock.component').then((m) => m.SalaryLockComponent),
            title: 'HRMS '
          },



           {
            path: 'salaryApprove',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/salary-approve/salary-approve.component').then((m) => m.SalaryApproveComponent),
            title: 'HRMS '
          },
          {
            path: 'Flexi-bill-Approval_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/approvel-flexi-bill-head-list/approvel-flexi-bill-head-list.component').then((m) => m.ApprovelFlexiBillHeadListComponent),
            title: 'HRMS '
          },

          {
            path: 'Flexi-bill-Approval/:fk_flexibillId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/flexi-head-bill-approval/flexi-head-bill-approval.component').then((m) => m.FlexiHeadBillApprovalComponent),
            title: 'HRMS '
          },

          
          // Tax


          {
            path: 'taxDeductor',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/tax-deductor/tax-deductor.component').then((m) => m.TaxDeductorComponent),
            title: 'HRMS '
          },
          {
            path: 'taxDeductor/:pk_dedId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/tax-deductor/tax-deductor.component').then((m) => m.TaxDeductorComponent),
            title: 'HRMS '
          },
          {
            path: 'taxDeductor_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/tax-deductor-list/tax-deductor-list.component').then((m) => m.TaxDeductorListComponent),
            title: 'HRMS '
          },

          {
            path: 'deductionSlab',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/deduction-slab/deduction-slab.component').then((m) => m.DeductionSlabComponent),
            title: 'HRMS '
          },
          {
            path: 'deductionSlab/:pk_slabid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/deduction-slab/deduction-slab.component').then((m) => m.DeductionSlabComponent),
            title: 'HRMS '
          },
          {
            path: 'deductionSlab_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/deduction-list/deduction-list.component').then((m) => m.DeductionListComponent),
            title: 'HRMS '
          },
          {
            path: 'sectionMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/section-master/section-master.component').then((m) => m.SectionMasterComponent),
            title: 'HRMS-  '
          },
          {
            path: 'sectionMaster/:pk_secid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/section-master/section-master.component').then((m) => m.SectionMasterComponent),
            title: 'HRMS-  '
          },
          {
            path: 'sectionMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/section-master-list/section-master-list.component').then((m) => m.SectionMasterListComponent),
            title: 'HRMS '
          },

          {
            path: 'subSectionMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/sub-section-master/sub-section-master.component').then((m) => m.SubSectionMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'subSectionMaster/:pk_subsecid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/sub-section-master/sub-section-master.component').then((m) => m.SubSectionMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'subSectionMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/sub-section-master-list/sub-section-master-list.component').then((m) => m.SubSectionMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'perquisiteMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/perquisite-master/perquisite-master.component').then((m) => m.PerquisiteMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'perquisiteMaster/:pk_perkId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/perquisite-master/perquisite-master.component').then((m) => m.PerquisiteMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'perquisiteMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/perquisite-master-list/perquisite-master-list.component').then((m) => m.PerquisiteMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'assignPerquisite',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/assign-perquisite/assign-perquisite.component').then((m) => m.AssignPerquisiteComponent),
            title: 'HRMS '
          },
          {
            path: 'assignPerquisite/:pk_perktrnId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/assign-perquisite/assign-perquisite.component').then((m) => m.AssignPerquisiteComponent),
            title: 'HRMS '
          },
          {
            path: 'assignPerquisite_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/assign-perquisite-list/assign-perquisite-list.component').then((m) => m.AssignPerquisiteListComponent),
            title: 'HRMS '
          },
          {
            path: 'MonthlyRentDetail',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/monthly-rent-detail/monthly-rent-detail.component').then((m) => m.MonthlyRentDetailComponent),
            title: 'HRMS '
          },
          {
            path: 'MonthlyRentDetail/:pk_rentId',
            loadComponent: () => import('./Tax/monthly-rent-detail/monthly-rent-detail.component').then((m) => m.MonthlyRentDetailComponent),
            title: 'HRMS '
          },
          {
            path: 'employeeOtherIncome',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/employee-other-income/employee-other-income.component').then((m) => m.EmployeeOtherIncomeComponent),
            title: 'HRMS '
          },
          {
            path: 'employeeOtherIncome/:pk_incomeid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/employee-other-income/employee-other-income.component').then((m) => m.EmployeeOtherIncomeComponent),
            title: 'HRMS '
          },
          {
            path: 'employeeOtherIncome_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/employee-other-income-list/employee-other-income-list.component').then((m) => m.EmployeeOtherIncomeListComponent),
            title: 'HRMS '
          },
          {
            path: 'Section-DocStatus',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/Section-doc/section-doc-status/section-doc-status.component').then((m) => m.SectionDocStatusComponent)
          },

          {
            path: 'Section-DocStatus/:pk_docid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/Section-doc/section-doc-status/section-doc-status.component').then((m) => m.SectionDocStatusComponent)
          },
          {
            path: 'Section-DocStatus_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/Section-doc/section-doc-list/section-doc-list.component').then((m) => m.SectionDocListComponent)
          },
          {
            path: 'reimdocStatus',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/reimdoc-status/reimdoc-status.component').then((m) => m.ReimdocStatusComponent),
            title: 'HRMS '
          },
          {
            path: 'reimdocStatus/:pk_docid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/reimdoc-status/reimdoc-status.component').then((m) => m.ReimdocStatusComponent),
            title: 'HRMS '
          },
          {
            path: 'reimdocStatus_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/reimdoc-status-list/reimdoc-status-list.component').then((m) => m.ReimdocStatusListComponent),
            title: 'HRMS '
          },

          {
            path: 'Approval-Section-Doc',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/Approval-Section-Doc/approval-sec-doc/approval-sec-doc.component').then((m) => m.ApprovalSecDocComponent)
          },


            {
            path: 'Approval-Section-Doc_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Tax/Approval-Section-Doc/approval-sec-doc-edit/approval-sec-doc-edit.component').then((m) => m.ApprovalSecDocEditComponent)
          },
          //Payroll reports
          {
            path: 'exportexcel',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/export-excel/export-excel.component').then((m) => m.ExportExcelComponent),
            title: 'HRMS -Export_Excel'
          },
           {
            path: 'complianceReport',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/compliance-report/compliance-report.component').then((m) => m.ComplianceReportComponent),
            title: 'HRMS -Export_Excel'
          },
          
          {    
            path: 'importCDO',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/import-cdo/import-cdo.component').then((m) => m.ImportCDOComponent),
            title: 'HRMS -Export_Excel'
          },

          {
            path: 'exportloan',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/export-loan/export-loan.component').then((m) => m.ExportLoanComponent),
            title: 'HRMS '
          },

          {
            path: 'exportcanteen',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/canteen/canteen.component').then((m) => m.CanteenComponent),
            title: 'HRMS'
          },

         


          //Import And Export

          {
            path: 'importEmployee',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/import-employee/import-employee.component').then((m) => m.ImportEmployeeComponent),
            title: 'HRMS '
          },
         
          {
            path: 'Emportattendance',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/attendace/attendace.component').then((m) => m.AttendaceComponent),
            title: 'HRMS Import Tax Report'
          },

           {
            path: 'ImportDaywiseAttendance',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/import-daywise-attendance/import-daywise-attendance.component').then((m) => m.ImportDaywiseAttendanceComponent),
            title: 'HRMS Import Tax Report'
          },

          {
            path: 'ExportImportSalaryHead',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/export-import-salary-head/export-import-salary-head.component').then((m) => m.ExportImportSalaryHeadComponent),
            title: 'HRMS Import Tax Report'
          },

          

          {
            path: 'ExportImportSalaryHeadDeduction',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/salary-deduction-head/salary-deduction-head.component').then((m) => m.SalaryDeductionHeadComponent),
            title: 'HRMS Import Tax Report'
          },

          // {
          //   path: 'ExportImportSalaryOtherHead',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Export-Import/export-import-salary-other-head/export-import-salary-other-head.component').then((m) => m.ExportImportSalaryOtherHeadComponent),
          //   title: 'HRMS Import Salary Other Head'
          // },

          {
            path: 'ExportImportSalaryOtherHead',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/salary-other-head/salary-other-head.component').then((m) => m.ExportImportSalaryOtherHeadComponent),
            title: 'HRMS Import Salary Other Head'
          },

          {
            path: 'IncomeTaxReport',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/import-tax-report/import-tax-report.component').then((m) => m.ExportIncomeTaxReportComponent),
            title: 'HRMS '
          },
          //setting
          {
            path: 'Compony-Parameter',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/company-parameter/company-parameter.component').then((m) => m.CompanyParameterComponent)
          },
   
          {
            path: 'Compony-Parameter/:pk_companyId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/company-parameter/company-parameter.component').then((m) => m.CompanyParameterComponent)
          },
          {
            path: 'Compony-Parameter_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/company-parameter-list/company-parameter-list.component').then((m) => m.CompanyParameterListComponent)
          },
          {
            path: 'Email-Configration_settings',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/e-mail-configration-settings/e-mail-configration-settings.component').then((m) => m.EMailConfigrationSettingsComponent)
          },

          {
            path: 'Salary-Sleep-Massage',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/salary-sleep-message/salary-sleep-message.component').then((m) => m.SalarySleepMessageComponent)
          },

          //  {
          //   path: 'LeaveConfiguration',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Settings').then((m) => m.LeaveConfigurationComponent)
          // },


          // payroll-help
          {
            path: 'payroll-workflow',
            canActivate: [AuthGuard],
            loadComponent: () => import('./payroll-help/payroll-workflow/payroll-workflow.component').then((m) => m.PayrollWorkflowComponent),
          },
          
          {
            path: 'payroll-organization',
            loadComponent: () => import('./payroll-help/payroll-organization/payroll-organization.component').then((m) => m.PayrollOrganizationComponent),
          },
           {
            path: 'ChannelMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/channel-master/channel-master.component').then((m) => m.ChannelMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'channelMaster/:pk_ChannelId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/channel-master/channel-master.component').then((m) => m.ChannelMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'ChannelMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Settings/channel-master-list/channel-master-list.component').then((m) => m.ChannelMasterListComponent),
            title: 'HRMS '
          },
           {
            path: 'salaryPayout',
            loadComponent: () =>
              import('./Transactions/salary-payout/salary-payout.component')
                .then(m => m.SalaryPayoutComponent)
          },
          {
            path: 'IncentiveProcess',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Transactions/incentive-process/incentive-process.component').then((m) => m.IncentiveProcessComponent),
            title: 'HRMS '
          },

          {
            path: 'daily-attendance',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./Export-Import/daily-attendance/daily-attendance.component')
                .then(m => m.DailyAttendanceComponent)
          },

 {
            path: 'ImportIncentive',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Export-Import/export-importincentive/export-importincentive.component').then((m) => m.ExportImportincentiveComponent),
            title: 'HRMS Import Incentive'
          },



        ]
      }

    ]
  }
];
