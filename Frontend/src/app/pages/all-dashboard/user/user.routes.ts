import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'user',
    },
    children: [
      {
        path: 'userdashboard',
        loadComponent: () =>
          import('./user-dashboard/user-dashboard.component').then(
            (m) => m.UserDashboardComponent
          ),
        title: 'HRMS -User Dashboard',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./user-dash/user-dash.component').then(
                (m) => m.UserDashComponent
              ),
            title: 'HRMS - User dash',
          },
          //Create Masters
          {
            path: 'user-master',
            canActivate: [AuthGuard],
            loadComponent: () => import('./manageUser/user-master/user-master.component').then((m) => m.UserMasterComponent
            ),
            title: 'HRMS - Change Web user',
          },
          
          {
            path: 'user-master/:pk_userId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./manageUser/user-master/user-master.component').then((m) => m.UserMasterComponent
            ),
            title: 'HRMS - Change Web user',
          },
          {
            path: 'user-master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./manageUser/user-master-list/user-master-list.component').then((m) => m.UserMasterListComponent),
            title: 'HRMS - Change Web user',
          },
          {
            path: 'CtcConfiguration',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/ctc-configuration/ctc-configuration.component').then((m) => m.CtcConfigurationComponent),
            title: 'HRMS Ctc Configuration'
          },
          {
            path: 'CtcConfiguration/:pk_ctcConfigId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/ctc-configuration/ctc-configuration.component').then((m) => m.CtcConfigurationComponent),
            title: 'HRMS Ctc Configuration'
          },
          {
            path: 'CtcConfiguration_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/ctc-configuration-list/ctc-configuration-list.component').then((m) => m.CtcConfigurationListComponent),
            title: 'HRMS Ctc Configuration List'
          },
          {
            path: 'MasterImportExcel',
            loadComponent: () => import('./master-import-excel/master-import-excel.component').then(m => m.MasterImportExcelComponent),
            title: 'HRMS - Master Import Excel'
          },




          {
            path: 'officeTypeMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/office-type-master/office-type-master.component').then((m) => m.OfficeTypeMasterComponent),
            title: 'HRMS - User dash',
          },

          {
            path: 'officeTypeMaster/:officeTypeID',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/office-type-master/office-type-master.component').then((m) => m.OfficeTypeMasterComponent),
            title: 'HRMS Office Type Master Deatils Updates',
          },

          {
            path: 'officeTypeMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/office-type-master-list/office-type-master-list.component').then((m) => m.OfficeTypeMasterListComponent),
            title: 'HRMS - User dash',
          },

          {
            path: 'locationMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/location-master/location-master.component').then((m) => m.LocationMasterComponent),
            title: 'HRMS - User dash',
          },

          {
            path: 'locationMaster/:pk_locid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/location-master/location-master.component').then((m) => m.LocationMasterComponent),
            title: 'HRMS - User dash',
          },

          {
            path: 'locationMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/location-master-list/location-master-list.component').then((m) => m.LocationMasterListComponent),
            title: 'HRMS - User dash',
          },

          {
            path: 'roleMaster',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./createMaster/role-master/role-master.component').then((m) => m.RoleMasterComponent),
            title: 'HRMS - User dash',
          },
          {
            path: 'roleMaster/:pk_roleId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/role-master/role-master.component').then((m) => m.RoleMasterComponent),
            title: 'HRMS - User dash',
          },
          {
            path: 'roleMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/role-master-list/role-master-list.component').then((m) => m.RoleMasterListComponent),
            title: 'HRMS - User dash',
          },

          {
            path: 'financialYear',
            canActivate: [AuthGuard],
            loadComponent: () => import('./financial-year/financial-year.component').then((m) => m.FinancialYearComponent),
            title: 'HRMS '
          },
          {
            path: 'financialYear/:pk_finid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./financial-year/financial-year.component').then((m) => m.FinancialYearComponent),
            title: 'HRMS '
          },
          {
            path: 'financialYear_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./financial-year-list/financial-year-list.component').then((m) => m.FinancialYearListComponent),
            title: 'HRMS '
          },


          {
            path: 'taxDeductor',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/tax-deductor/tax-deductor.component').then((m) => m.TaxDeductorComponent),
            title: 'HRMS '
          },
          {
            path: 'taxDeductor/:pk_dedId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/tax-deductor/tax-deductor.component').then((m) => m.TaxDeductorComponent),
            title: 'HRMS '
          },
          {
            path: 'taxDeductor_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/tax-deductor-list/tax-deductor-list.component').then((m) => m.TaxDeductorListComponent),
            title: 'HRMS '
          },

          {
            path: 'deductionSlab',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/deduction-slab/deduction-slab.component').then((m) => m.DeductionSlabComponent),
            title: 'HRMS '
          },
          {
            path: 'deductionSlab/:pk_slabid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/deduction-slab/deduction-slab.component').then((m) => m.DeductionSlabComponent),
            title: 'HRMS '
          },
          {
            path: 'deductionSlab_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/deduction-list/deduction-list.component').then((m) => m.DeductionListComponent),
            title: 'HRMS '
          },

          {
            path: 'city-master',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/City-Master/city-master/city-master.component').then((m) => m.CityMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'city-master/:pk_cityid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll//Common/City-Master/city-master/city-master.component').then((m) => m.CityMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'city-master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/City-Master/city-master-list/city-master-list.component').then((m) => m.CityMasterListComponent),
            title: 'HRMS '
          },

          {
            path: 'Compony-Parameter',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/company-parameter/company-parameter.component').then((m) => m.CompanyParameterComponent)
          },
          {
            path: 'Compony-Parameter/:pk_companyId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/company-parameter/company-parameter.component').then((m) => m.CompanyParameterComponent)
          },
          {
            path: 'Compony-Parameter_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/company-parameter-list/company-parameter-list.component').then((m) => m.CompanyParameterListComponent)
          },

          {
            path: 'level-master',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Level-Master/level-master/level-master.component').then((m) => m.LevelMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'level-master/:pk_levelid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Level-Master/level-master/level-master.component').then((m) => m.LevelMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'level-master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Level-Master/level-master-list/level-master-list.component').then((m) => m.LevelMasterListComponent),
            title: 'HRMS '
          },

          {
            path: 'DepartmentForm_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/DepartmentMaster/department-master-list/department-master-list.component').then((m) => m.DepartmentMasterListComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'DepartmentForm',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/DepartmentMaster/department-master/department-master.component').then((m) => m.DepartmentMasterComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'DepartmentForm/:pk_DeptId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/DepartmentMaster/department-master/department-master.component').then((m) => m.DepartmentMasterComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'sectionMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/section-master/section-master.component').then((m) => m.SectionMasterComponent),
            title: 'HRMS-  '
          },
          {
            path: 'sectionMaster/:pk_secid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/section-master/section-master.component').then((m) => m.SectionMasterComponent),
            title: 'HRMS-  '
          },
          {
            path: 'sectionMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/section-master-list/section-master-list.component').then((m) => m.SectionMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'DesignationForm_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/DesignationMaster/designation-master-list/designation-master-list.component').then((m) => m.DesignationMasterListComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'DesignationForm',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/DesignationMaster/designationmaster/designationmaster.component').then((m) => m.DesignationmasterComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'DesignationForm/:pk_desgid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/DesignationMaster/designationmaster/designationmaster.component').then((m) => m.DesignationmasterComponent),
            title: 'HRMS - Hr-Dashboard'
          },

          {
            path: 'subSectionMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/sub-section-master/sub-section-master.component').then((m) => m.SubSectionMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'subSectionMaster/:pk_subsecid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/sub-section-master/sub-section-master.component').then((m) => m.SubSectionMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'subSectionMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/sub-section-master-list/sub-section-master-list.component').then((m) => m.SubSectionMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'CostMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/CostMaster/all-cost-master/all-cost-master.component').then((m) => m.AllCostMasterComponent),
            title: 'HRMS Functional List'
          },
          {
            path: 'CostMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/CostMaster/cost-master/cost-master.component').then((m) => m.CostMasterComponent),
            title: 'HRMS Functional Deatils'
          },

          {
            path: 'CostMaster/:pk_cost_centre_id',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/CostMaster/cost-master/cost-master.component').then((m) => m.CostMasterComponent),
            title: 'HRMS Functional Deatils'
          },
          {
            path: 'gradeMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/GradeMaster/grade-master/grade-master.component').then((m) => m.GradeMasterComponent),
            title: 'HRMS Import Tax Report'
          },
          {
            path: 'gradeMaster/:pk_classid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/GradeMaster/grade-master/grade-master.component').then((m) => m.GradeMasterComponent),
            title: 'HRMS Import Tax Report'
          },
          {
            path: 'gradeMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/GradeMaster/grade-master-list/grade-master-list.component').then((m) => m.GradeMasterListComponent),
            title: 'HRMS Import Tax Report'
          },
          {
            path: 'bankMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Bank-Master/bank-master/bank-master.component').then((m) => m.BankMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'bankMaster/:pk_BankId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Bank-Master/bank-master/bank-master.component').then((m) => m.BankMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'bankMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Bank-Master/bank-master-list/bank-master-list.component').then((m) => m.BankMasterListComponent),
            title: 'HRMS '
          },

          {
            path: 'perquisiteMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/perquisite-master/perquisite-master.component').then((m) => m.PerquisiteMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'perquisiteMaster/:pk_perkId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/perquisite-master/perquisite-master.component').then((m) => m.PerquisiteMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'perquisiteMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/perquisite-master-list/perquisite-master-list.component').then((m) => m.PerquisiteMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'head-master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/HeadMaster/head-master-list/head-master-list.component').then((m) => m.HeadMasterListComponent),
          },
          {
            path: 'head-master',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/HeadMaster/head-master/head-master.component').then((m) => m.HeadMasterComponent),
          },
          {
            path: 'head-master/:pk_headid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/HeadMaster/head-master/head-master.component').then((m) => m.HeadMasterComponent),
          },
          {
            path: 'professionalTax',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/professional-tax/professional-tax.component').then((m) => m.ProfessionalTaxComponent),
            title: 'HRMS '
          },
          {
            path: 'professionalTax/:pk_slabid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/professional-tax/professional-tax.component').then((m) => m.ProfessionalTaxComponent),
            title: 'HRMS '
          },
          {
            path: 'professionalTax_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Tax/professional-tax-list/professional-tax-list.component').then((m) => m.ProfessionalTaxListComponent),
            title: 'HRMS '
          },
          {
            path: 'Lwf_Slab_Master',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/LWF-Slab-Master/lwf-slab-mst/lwf-slab-mst.component').then((m) => m.LwfSlabMstComponent)
          },
          {
            path: 'Lwf_Slab_Master/:pk_slabid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/LWF-Slab-Master/lwf-slab-mst/lwf-slab-mst.component').then((m) => m.LwfSlabMstComponent)
          },
          {
            path: 'Lwf_Slab_Master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/LWF-Slab-Master/lwf-slab-master-list/lwf-slab-master-list.component').then((m) => m.LwfSlabMasterListComponent)
          },
          {
            path: 'Leave-Master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/LeaveTypeMaster/all-leavtype/all-leavtype.component').then((m) => m.AllLeavtypeComponent),
          },

          {
            path: 'Leave-Master',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/LeaveTypeMaster/leave-type/leave-type.component').then((m) => m.LeaveTypeComponent),
          },
          {
            path: 'Leave-Master/:pk_leaveid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/LeaveTypeMaster/leave-type/leave-type.component').then((m) => m.LeaveTypeComponent),
          },
          {
            path: 'zonemaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/ZoneMaster/zone-master/zone-master.component').then((m) => m.ZoneMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'zonemaster/:pk_zoneId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/ZoneMaster/zone-master/zone-master.component').then((m) => m.ZoneMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'zonemaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/ZoneMaster/zone-master-list/zone-master-list.component').then((m) => m.ZoneMasterListComponent),
            title: 'HRMS '
          },

          {
            path: 'categoryMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Category-Master/category-master copy/category-master.component').then((m) => m.CategoryMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'categoryMaster/:pk_Catid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Category-Master/category-master copy/category-master.component').then((m) => m.CategoryMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'categoryMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Category-Master/category-details copy/category-details.component').then((m) => m.CategoryDetailsComponent),
            title: 'HRMS '
          },

          {
            path: 'regligionMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Religion-Master/regligion-master/regligion-master.component').then((m) => m.RegligionMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'regligionMaster/:pk_religionid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Religion-Master/regligion-master/regligion-master.component').then((m) => m.RegligionMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'regligionMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Religion-Master/regligion-master-list/regligion-master-list.component').then((m) => m.ReligionMasterListComponent),
            title: 'HRMS '
          },
          {
            path: 'natureMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Nature/nature-master/nature-master.component').then((m) => m.NatureMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'natureMaster/:pk_natureid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Nature/nature-master/nature-master.component').then((m) => m.NatureMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'natureMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Nature/nature-detail/nature-detail.component').then((m) => m.NatureDetailComponent),
            title: 'HRMS '
          },
          {
            path: 'FunctionalMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/FunctionalMaster/all-functional-master/all-functional-master.component').then((m) => m.AllFunctionalMasterComponent),
            title: 'HRMS Functional List'
          },
          {
            path: 'FunctionalMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/FunctionalMaster/functional-master/functional-master.component').then((m) => m.FunctionalMasterComponent),
            title: 'HRMS Functional Deatils'
          },

          {
            path: 'FunctionalMaster/:pk_functional_id',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/FunctionalMaster/functional-master/functional-master.component').then((m) => m.FunctionalMasterComponent),
            title: 'HRMS Functional Deatils Updates'
          },


          {
            path: 'RoleMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/role-master/role-master.component').then((m) => m.RoleMasterComponent),
            title: 'HRMS Role Master Deatils'
          },

          {
            path: 'RoleMaster/:roleId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/role-master/role-master.component').then((m) => m.RoleMasterComponent),
            title: 'HRMS Role Master Deatils'
          },

          {
            path: 'RoleMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/role-master-list/role-master-list.component').then((m) => m.RoleMasterListComponent),
            title: 'HRMS Role Master Deatils'
          },
          {
            path: 'operationalMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Operational-Master/operational-master/operational-master.component').then((m) => m.OperationalMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'operationalMaster/:pk_OperationalId',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Operational-Master/operational-master/operational-master.component').then((m) => m.OperationalMasterComponent),
            title: 'HRMS '
          },
          {
            path: 'operationalMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/Operational-Master/operational-details/operational-details.component').then((m) => m.OperationalDetailsComponent),
            title: 'HRMS '
          },
          {
            path: 'StateMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/StateMaster/state-master/state-master.component').then((m) => m.StateMasterComponent)
          },
          {
            path: 'StateMaster/:pk_stateid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/StateMaster/state-master/state-master.component').then((m) => m.StateMasterComponent)
          },
          {
            path: 'StateMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/StateMaster/state-master-list/state-master-list.component').then((m) => m.StateMasterListComponent)
          },
          {
            path: 'Sub-Department_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/SubDepartMaster/sub-department-list/sub-department-list.component').then((m) => m.SubDepartmentListComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'Sub-Department',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/SubDepartMaster/sub-department-master/sub-department-master.component').then((m) => m.SubDepartmentMasterComponent),
            title: 'HRMS - Hr-Dashboard'
          },
          {
            path: 'Sub-Department/:pk_subdeptid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Common/SubDepartMaster/sub-department-master/sub-department-master.component').then((m) => m.SubDepartmentMasterComponent),
            title: 'HRMS - Hr-Dashboard'
          },

          //Manage User 
          {
            path: 'PageRights',
            canActivate: [AuthGuard],
            loadComponent: () => import('./manageUser/page-rights/page-rights.component').then((m) => m.PageRightsComponent
            ),
            title: 'HRMS - Change Web user',
          },




          //Added by RaJ 06May2026
          {
            path: 'general',
            loadComponent: () => import('../payroll/Settings/general/general.component').then(m => m.GeneralComponent),
            title: 'HRMS',
          },

          {
            path: 'general/list/:id',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/general/list/list.component').then(m => m.ListComponent)
          },

          {
            path: 'insert', // Add New (No codeId)
            loadComponent: () => import('../payroll/Settings/general/insert/insert.component').then(m => m.InsertComponent)
          },
          {
            path: 'insert/:id',
            loadComponent: () => import('../payroll/Settings/general/insert/insert.component').then(m => m.InsertComponent)
          },
          {
            path: 'view/:id',
            loadComponent: () => import('../payroll/Settings/general/view/view.component').then(m => m.ViewComponent)
          },
          {
            path: 'clientMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/client-master/client-master.component').then((m) => m.ClientMasterComponent)
          },
          {
            path: 'clientMaster/:pk_cost_centre_id',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/client-master/client-master.component').then((m) => m.ClientMasterComponent)
          },
          {
            path: 'clientMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../payroll/Settings/client-master-list/client-master-list.component').then((m) => m.ClientMasterListComponent)
          },


            {
            path: 'DealerOutlet',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/Dealer/outlet-master/outlet-master.component').then((m) => m.OutletMasterComponent)
          },
          {
            path: 'DealerOutlet/:pk_dealerOutletId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/Dealer/outlet-master/outlet-master.component').then((m) => m.OutletMasterComponent)
          },
          {
            path: 'DealerOutlet_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/Dealer/outlet-master-list/outlet-master-list.component').then((m) => m.OutletMasterListComponent)
          },



          // branch

          {
            path: 'BranchMaster',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/branch-master/branch-master.component').then((m) => m.BranchMasterComponent)
          },
          {
            path: 'BranchMaster/:pk_branchId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/branch-master/branch-master.component').then((m) => m.BranchMasterComponent)
          },
          {
            path: 'BranchMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/branch-master-list/branch-master-list.component').then((m) => m.BranchMasterListComponent)
          },

          {
            path: 'Leave-MasterClient_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('../user/createMaster/leave-master-client-list/leave-master-client-list.component').then((m) => m.LeaveMasterClientListComponent),
          },

          {
            path: 'Leave-MasterClient',
            canActivate: [AuthGuard],
            loadComponent: () => import('../user/createMaster/leave-master-client/leave-master-client.component').then((m) => m.LeaveMasterClientComponent),
          },
          {
            path: 'Leave-MasterClient/:pk_leaveid',
            canActivate: [AuthGuard],
            loadComponent: () => import('../user/createMaster/leave-master-client/leave-master-client.component').then((m) => m.LeaveMasterClientComponent),
          },

          // Customer Rate Card Routes
          {
            path: 'customerRateCard_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/customer-rate-card-list/customer-rate-card-list.component').then((m) => m.CustomerRateCardListComponent)
          },
          {
            path: 'customerRateCardUpload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/customer-rate-card-upload/customer-rate-card-upload.component').then((m) => m.CustomerRateCardUploadComponent),
            title: 'HRMS - Customer Rate Card Upload'
          },
          {
            path: 'customerRateCard',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/customer-rate-card/customer-rate-card.component').then((m) => m.CustomerRateCardComponent)
          },
          {
            path: 'customerRateCard/:rateCardId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./createMaster/customer-rate-card/customer-rate-card.component').then((m) => m.CustomerRateCardComponent)
          },







          //NOt in working
          // {
          //   path: 'WebPageMaster',

          //   loadComponent: () =>
          //     import(
          //       './createMaster/web-page-master/web-page-master.component'
          //     ).then((m) => m.WebPageMasterComponent),
          //   title: 'HRMS - Change Web user',
          // },

          // {
          //   path: 'web-page-master-list',
          //      canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './createMaster/web-page-master-list/web-page-master-list.component'
          //     ).then((m) => m.WebPageMasterListComponent),
          //   title: 'HRMS - Change Web user',
          // },
          //  {
          //   path: 'webPageMaster',
          //    loadComponent: () =>import('./createMaster/web-page-master/web-page-master.component').then((m) => m.WebPageMasterComponent),
          //   title: 'HRMS - User dash',
          // },
          // {
          //   path: 'pageTypeRoleLink',

          //   loadComponent: () =>
          //     import('./createMaster/page-type-role-link/page-type-role-link.component').then((m) => m.PageTypeRoleLinkComponent),
          //   title: 'HRMS - User dash',
          // },
          // {
          //   path: 'pageTypeRoleLinkList',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import('./createMaster/page-type-role-link-list/page-type-role-link-list.component').then((m) => m.PageTypeRoleLinkListComponent),
          //    title: 'HRMS - User dash',
          // },
          //  {
          //   path: 'changewebuser',
          //    canActivate: [AuthGuard],
          //   loadComponent: () =>import('./manageUser/change-web-user/change-web-user.component').then((m) => m.ChangeWebUserComponent),
          //   title: 'HRMS - Change Web user',
          // },
          // {
          //   path: 'password',
          //   canActivate: [AuthGuard],
          //    loadComponent: () => import('./manageUser/password/password.component').then((m) => m.PasswordComponent
          //     ),
          //   title: 'HRMS - Password',
          // },

          //------------not in working end
          // Repeated--------------------

          //   {
          //   path: 'user-master-List',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './manageUser/user-master-list/user-master-list.component'
          //     ).then((m) => m.UserMasterListComponent),
          //   title: 'HRMS - Change Web user',
          // },
          // {
          //   path: 'user-master',
          //   loadComponent: () =>
          //     import('./manageUser/user-master/user-master.component').then(
          //       (m) => m.UserMasterComponent
          //     ),
          //   title: 'HRMS - Change Web user',
          // },

          // {
          //   path: 'officeTypeMasterList',
          //  canActivate: [AuthGuard], 
          //   loadComponent: () =>
          //     import(
          //       './createMaster/office-type-master-list/office-type-master-list.component'
          //     ).then((m) => m.OfficeTypeMasterListComponent),
          //   title: 'HRMS - User dash',
          // },
          // {
          //   path: 'locationMasterList',
          //   canActivate: [AuthGuard],
          //   loadComponent: () =>
          //     import(
          //       './createMaster/location-master-list/location-master-list.component'
          //     ).then((m) => m.LocationMasterListComponent),
          //   title: 'HRMS - User dash',
          // },

          //repeated end---------

        ],
      },
    ],
  },
];
