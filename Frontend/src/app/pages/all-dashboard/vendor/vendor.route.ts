

import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'vendor_management'
    },
    children: [

      {
        path: 'vendor_managementdashboard',
        loadComponent: () => import('./vendor-dashboard/vendor-dashboard.component').then((m) => m.VendorDashboardComponent),
        title: 'HRMS -Vendor Management dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./vendor-dash/vendor-dash.component').then((m) => m.VendorDashComponent),
            title: 'HRMS -vendor dash'
          },

         {
            path: 'ratecard_excel_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./ratecard-excel-upload/ratecard-excel-upload.component').then((m) => m.RatecardExcelUploadComponent),
            title: 'HRMS - Rate Card Excel Upload'
          },


           {
            path: 'vendor_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-upload/vendor-upload.component').then((m) => m.VendorUploadComponent),
            title: 'HRMS - Vendor Upload'
          },
          {
            path: 'vendor_master_form_list',
             canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-master-list/vendor-master-list.component').then((m) => m.VendorMasterListComponent),
            title: 'HRMS - Vendor Master List'
          },
          {
            path: 'vendor_master_form',
             canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-master-form/vendor-master-form.component').then((m) => m.VendorMasterFormComponent),
            title: 'HRMS - Add Vendor'
          },
          {
            path: 'vendor_master_form/:pk_recId',
             canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-master-form/vendor-master-form.component').then((m) => m.VendorMasterFormComponent),
            title: 'HRMS - Edit Vendor'
          },
           {
            path: 'vendor_excel_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-excel-doc-list/vendor-excel-doc-list.component').then((m) => m.VendorExcelDocListComponent),
            title: 'HRMS - Vendor Excel Document List'
          },
          {
            path: 'vendor_excel_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-excel-doc-upload/vendor-excel-doc-upload.component').then((m) => m.VendorExcelDocUploadComponent),
            title: 'HRMS - Vendor Excel Document Upload'
          },
          {
            path: 'amazon_dsp_block_ratecard',
            canActivate: [AuthGuard],
            loadComponent: () => import('./amazon-dsp-block-ratecard/amazon-dsp-block-ratecard.component').then((m) => m.AmazonDSPBlockRatecardComponent),
            title: 'HRMS - Amazon DSP Block Ratecard'
          },
           {
            path: 'amazon_dsp_rate_card_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./amazon-dsp-rate-card-list/amazon-dsp-rate-card-list.component').then((m) => m.AmazonDspRateCardListComponent),
            title: 'HRMS - Amazon DSP RateCard List'
          },
          {
            path: 'amazon_dsp_rate_card_form',
            canActivate: [AuthGuard],
            loadComponent: () => import('./amazon-dsp-rate-card-form/amazon-dsp-rate-card-form.component').then((m) => m.AmazonDspRateCardFormComponent),
            title: 'HRMS - Add Amazon DSP RateCard'
          },
          {
            path: 'amazon_dsp_rate_card_form/:id',
            canActivate: [AuthGuard],
            loadComponent: () => import('./amazon-dsp-rate-card-form/amazon-dsp-rate-card-form.component').then((m) => m.AmazonDspRateCardFormComponent),
            title: 'HRMS - Edit Amazon DSP RateCard'
          },
          {
            path: 'common_rate_card',
            canActivate: [AuthGuard],
            loadComponent: () => import('./common-rate-card/common-rate-card.component').then((m) => m.CommonRateCardComponent),
            title: 'HRMS - Common Rate Card'
          },

          {
            path: 'common_rate_card/:pk_RateCardID',
            canActivate: [AuthGuard],
            loadComponent: () => import('./common-rate-card/common-rate-card.component').then((m) => m.CommonRateCardComponent),
            title: 'HRMS - Common Rate Card'
          },
          {
            path: 'common_rate_card_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./common-rate-card-list/common-rate-card-list.component').then((m) => m.CommonRateCardListComponent),
            title: 'HRMS - Common Rate Card List'
          },
          {
            path: 'update_audit_log',
            canActivate: [AuthGuard],
            loadComponent: () => import('./update-audit-log/update-audit-log.component').then((m) => m.UpdateAuditLogComponent),
            title: 'HRMS - Update Audit Log'
          },

           {
            path: 'vendor_transaction_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-transaction-upload/vendor-transaction-upload.component').then((m) => m.VendorTransactionUploadComponent),
            title: 'HRMS - Transaction Excel Upload'
          },

           {
            path: 'vendor_fhrid_mapping_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-fhrid-mapping-upload/vendor-fhrid-mapping-upload.component').then((m) => m.VendorFhridMappingUploadComponent),
            title: 'HRMS - Vendor FHRID Mapping Upload'
          }          ,
          {
            path: 'vendor_transaction_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-transaction-list/vendor-transaction-list.component').then((m) => m.VendorTransactionListComponent),
            title: 'HRMS - Vendor Transaction List'
          },
          {
            path: 'vendor_transaction_sync',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-transaction-sync/vendor-transaction-sync.component').then((m) => m.VendorTransactionSyncComponent),
            title: 'HRMS - Vendor Transaction Sync'
          },
          {
            path: 'vendor_deduction_entry',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-deduction-entry/vendor-deduction-entry.component').then((m) => m.VendorDeductionEntryComponent),
            title: 'HRMS - Vendor Deduction Entry'
          },
          {
            path: 'vendor_deduction_upload',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-deduction-upload/vendor-deduction-upload.component').then((m) => m.VendorDeductionUploadComponent),
            title: 'HRMS - Deduction Excel Upload'
          },
          {
            path: 'vendor_deduction_recovery_mis',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-deduction-recovery-mis/vendor-deduction-recovery-mis.component').then((m) => m.VendorDeductionRecoveryMisComponent),
            title: 'HRMS - Vendor Deduction & Recovery MIS'
          },
          {
            path: 'vendor_recovery_strategy_config',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-recovery-strategy-config/vendor-recovery-strategy-config.component').then((m) => m.VendorRecoveryStrategyConfigComponent),
            title: 'HRMS - Deduction Recovery Strategy Configuration'
          },
          {
            path: 'vendor_opening_deficit',
            canActivate: [AuthGuard],
            loadComponent: () => import('./vendor-opening-deficit/vendor-opening-deficit.component').then((m) => m.VendorOpeningDeficitComponent),
            title: 'HRMS - Vendor Opening Deficits'
          },
          {
            path: 'vendor_payment_settlement',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-payment-settlement/vendor-payment-settlement.component').then(
                (m) => m.VendorPaymentSettlementComponent
              ),
            title: 'HRMS - Vendor Payment Settlement'
          },

          //added code CJDARCL vendor management starts
          {
            path: 'vendor_service_master_list',
            loadComponent: () => import('./vendor-service-master-list/vendor-service-master-list.component').then((m) => m.VendorServiceMasterListComponent),
            title: 'HRMS - Vendor Service Master List'
          },
          {
            path: 'vendor_service_master_form',
            loadComponent: () => import('./vendor-service-master-form/vendor-service-master-form.component').then((m) => m.VendorServiceMasterFormComponent),
            title: 'HRMS - Add Vendor Service'
          },
          {
            path: 'vendor_service_master_form/:id',
            loadComponent: () => import('./vendor-service-master-form/vendor-service-master-form.component').then((m) => m.VendorServiceMasterFormComponent),
            title: 'HRMS - Edit Vendor Service'
          },
          {
            path: 'vendor_master_lite_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-master-lite-list/vendor-master-lite-list.component').then((m) => m.VendorMasterLiteListComponent),
            title: 'HRMS - Vendor Master Lite List'
          },
          {
            path: 'vendor_master_lite_form',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-master-lite-form/vendor-master-lite-form.component').then((m) => m.VendorMasterLiteFormComponent),
            title: 'HRMS - Add Vendor Lite'
          },
          {
            path: 'vendor_master_lite_form/:pk_recId',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-master-lite-form/vendor-master-lite-form.component').then((m) => m.VendorMasterLiteFormComponent),
            title: 'HRMS - Edit Vendor Lite'
          },
          {
            path: 'vendor_emp_doc_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-emp-doc-list/vendor-emp-doc-list.component').then((m) => m.VendorEmpDocListComponent),
            title: 'HRMS - Vendor Employee Documents'
          },
          {
            path: 'vendor_emp_doc_form',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-emp-doc-form/vendor-emp-doc-form.component').then((m) => m.VendorEmpDocFormComponent),
            title: 'HRMS - Upload Employee Documents'
          },
          {
            path: 'vendor_emp_doc_form/:empId',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-emp-doc-form/vendor-emp-doc-form.component').then((m) => m.VendorEmpDocFormComponent),
            title: 'HRMS - Upload Employee Documents'
          },
          {
            path: 'vendor_emp_doc_approval_list',
            canActivate: [AuthGuard],
            loadComponent: () =>
              import('./vendor-emp-doc-approval/vendor-emp-doc-approval.component').then((m) => m.VendorEmpDocApprovalComponent),
            title: 'HRMS - Vendor Employee Document Verification'
          }



          //added code CJDARCL vendor management ends





        ]














      }

    ]

  }]

