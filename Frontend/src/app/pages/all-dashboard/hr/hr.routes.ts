


import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'hr'
    },
    children: [

      {
        path: 'hrdashboard',
        loadComponent: () => import('./hr-dashboard/hr-dashboard.component').then( (m) => m.HrDashboardComponent),
        title: 'HRMS - Employee-Salary',
        children: [
          {
            path: '',
            loadComponent: () => import('./hr-dash/hr-dash.component').then( (m) => m.HrDashComponent),
            title: 'HRMS - Employee-Salary'
          },
         
          //Route not in use


          // {
          //   path: 'HR_Negligence_Mst',
          //   loadComponent: () => import('./hr-management/negligencemaster/negligencemaster.component').then( (m) => m.NegligencemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          //  {
          //   path: 'Confirmation-Attribute-Master',
          //   loadComponent: () => import('./hr-management/confirmationattributemaster/confirmationattributemaster.component').then( (m) => m.ConfirmationattributemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          // {
          //   path: 'Edit-Confirmation-Attribute-Master/:id',
          //   loadComponent: () => import('./hr-management/confirmationattributemaster/confirmationattributemaster.component').then( (m) => m.ConfirmationattributemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Confirmation-Attribute-Master-list',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./hr-management/confirmationattributemaster-list/confirmationattributemaster-list.component').then( (m) => m.ConfirmationattributemasterListComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          //   {
          //   path: 'ClearanceDepartment_User',
          //   loadComponent: () => import('./hr-management/userparametermaster/userparametermaster.component').then( (m) => m.UserparametermasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Edit_ClearanceDepartment_User/:id',
          //   loadComponent: () => import('./hr-management/userparametermaster/userparametermaster.component').then( (m) => m.UserparametermasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'ClearanceDepartment_User_list',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./hr-management/userparametermaster-list/userparametermaster-list.component').then( (m) => m.UserparametermasterListComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          //    {
          //   path: 'Due_Clearence',
          //   loadComponent: () => import('./hr-management/dueclearencemaster/dueclearencemaster.component').then( (m) => m.DueclearencemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Edit_Due_Clearence/:id',
          //   loadComponent: () => import('./hr-management/dueclearencemaster/dueclearencemaster.component').then( (m) => m.DueclearencemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Due_Clearence_list',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./hr-management/dueclearencemaster-list/dueclearencemaster-list.component').then( (m) => m.DueclearencemasterListComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          //   {
          //   path: 'CRD_BudgetIssue_Mst',
          //   loadComponent: () => import('./hr-management/budgetissuemaster/budgetissuemaster.component').then( (m) => m.BudgetissuemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Edit_CRD_BudgetIssue_Mst/:id',
          //   loadComponent: () => import('./hr-management/appreciatormaster/appreciatormaster.component').then( (m) => m.AppreciatormasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'CRD_BudgetIssue_Mst_list',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./hr-management/budgetissuemaster-list/budgetissuemaster-list.component').then( (m) => m.BudgetissuemasterListComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          //   {
          //   path: 'Appreciator_Master',
          //   loadComponent: () => import('./hr-management/appreciatormaster/appreciatormaster.component').then( (m) => m.AppreciatormasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Edit-Appreciator-Master/:id',
          //   loadComponent: () => import('./hr-management/appreciatormaster/appreciatormaster.component').then( (m) => m.AppreciatormasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'Appreciator-Master-list',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./hr-management/appreciatormaster-list/appreciatormaster-list.component').then( (m) => m.AppreciatormasterListComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          //   {
          //   path: 'Company-Policy',
          //   loadComponent: () => import('./policies-Master/policies-master/policies-master.component').then( (m) => m.PoliciesMasterComponent),
          //   title: 'Under - Employee Master'
          // },

          // {
          //   path: 'Company-Policy-List',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./policies-Master/policies-master-all/policies-master-all.component').then( (m) => m.PoliciesMasterAllComponent),
          //   title: 'Under - Employee Master'
          // },
          // {
          //   path: 'Company-Policy-Detail-List',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./Policies-Detail/all-policy-detail/all-policy-detail.component').then( (m) => m.AllPolicyDetailComponent),
          //   title: 'Under - Employee Master'
          // },

          //     {
          //   path: 'SKP_Attribute_Mst',
          //   loadComponent: () => import('./hr-management/skpattributemaster/skpattributemaster.component').then( (m) => m.SKPattributemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },

          // {
          //   path: 'edit-SKP_Attribute_Mst/:id',
          //   loadComponent: () => import('./hr-management/skpattributemaster/skpattributemaster.component').then( (m) => m.SKPattributemasterComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          // {
          //   path: 'SKP_Attribute_Mst-list',
          //     canActivate: [AuthGuard],
          //   loadComponent: () => import('./hr-management/skpattributemaster-list/skpattributemaster-list.component').then( (m) => m.SKPattributemasterListComponent),
          //   title: 'HRMS - Employee-Salary'
          // },
          //  {
          //   path: 'List-dashboar-details',
          //   canActivate: [AuthGuard],
          //   loadComponent: () => import('./Dash-Board/dashboard-details/dashboard-details.component').then((m) => m.DashboardDetailsComponent),
          //   title: 'Under - Employee Master'
          // },
          // {
          //   path: 'dashboar-master',
          //   loadComponent: () => import('./Dash-Board/dashboard-master/dashboard-master.component').then((m) => m.DashboardMasterComponent),
          //   title: 'Under - Employee Master'
          // }
          // ,
          // not in used end------------------------------------------------------------------

          //Hr management 

          {
            path: 'Appreciation_Mst',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/appreciation-master/appreciation-master.component').then((m) => m.AppreciationMasterComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Appreciation_Mst/:pk_appreciationId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/appreciation-master/appreciation-master.component').then((m) => m.AppreciationMasterComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Appreciation_Mst_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/appreciation-master-list/appreciation-master-list.component').then((m) => m.AppreciationMasterListComponent),
            title: 'HRMS - Employee-Salary'
          },

          {
            path: 'HR_Employee_Complaint_Mst',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/complaintmaster/complaintmaster.component').then((m) => m.ComplaintmasterComponent),
            title: 'HRMS - Employee-Salary'
          },

          {
            path: 'HR_Employee_Complaint_Mst/:pk_complaintId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/complaintmaster/complaintmaster.component').then((m) => m.ComplaintmasterComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'HR_Employee_Complaint_Mst_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/complaintmaster-list/complaintmaster-list.component').then((m) => m.ComplaintmasterListComponent),
            title: 'HRMS - Employee-Salary'
          },

          {
            path: 'Appreciator_Master',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/appreciatormaster/appreciatormaster.component').then((m) => m.AppreciatormasterComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Appreciator_Master/:pk_crdauthId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/appreciatormaster/appreciatormaster.component').then((m) => m.AppreciatormasterComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Appreciator_Master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/appreciatormaster-list/appreciatormaster-list.component').then((m) => m.AppreciatormasterListComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'EmployeeKRAPLI',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/employee-krapli/employee-krapli.component').then((m) => m.EmployeeKRAPLIComponent),
            title: 'HRMS - Employee-Salary'
          },


          {
            path: 'SKP_Attribute_Mst',
             canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/skpattributemaster/skpattributemaster.component').then((m) => m.SKPattributemasterComponent),
            title: 'HRMS - Employee-Salary'
          },


          {
            path: 'SKP_Attribute_Mst/:pk_attributeId',
             canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/skpattributemaster/skpattributemaster.component').then((m) => m.SKPattributemasterComponent),
            title: 'HRMS - Employee-Salary'
          },


          {
            path: 'SKP_Attribute_Mst_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/skpattributemaster-list/skpattributemaster-list.component').then((m) => m.SKPattributemasterListComponent),
            title: 'HRMS - Employee-Salary'
          },

          {
            path: 'HR_Confirmation_EmailSetting',
             canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/hr-confirmation-emailsetting/hr-confirmation-emailsetting.component').then((m) => m.HrConfirmationEmailsettingComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'HR_Confirmation_EmailSetting/:pk_conrequesemailtId',
             canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/hr-confirmation-emailsetting/hr-confirmation-emailsetting.component').then((m) => m.HrConfirmationEmailsettingComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'HR_Confirmation_EmailSetting_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/hr-confirmation-emailsetting-list/hr-confirmation-emailsetting-list.component').then((m) => m.HrConfirmationEmailsettingListComponent),
            title: 'HRMS - Employee-Salary'
          },
            {
            path: 'LanguageMaster',
             canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/language-master/language-master.component').then((m) => m.LanguageMasterComponent),
          },

          {
            path: 'LanguageMaster_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/language-master-list/language-master-list.component').then((m) => m.LanguageMasterListComponent),
          },

          {
            path: 'LanguageMaster/:pk_langid',
             canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/language-master/language-master.component').then((m) => m.LanguageMasterComponent),
          },

          {
            path: 'dashboar-master',
              canActivate: [AuthGuard],
            loadComponent: () => import('./Dash-Board/dashboard-master/dashboard-master.component').then((m) => m.DashboardMasterComponent),
            title: 'Under - Employee Master'
          },

          {
            path: 'dashboar-master/:pk_dashId',
              canActivate: [AuthGuard],
            loadComponent: () => import('./Dash-Board/dashboard-master/dashboard-master.component').then((m) => m.DashboardMasterComponent),
            title: 'Under - Employee Master'
          }
          ,

          {
            path: 'dashboar-master_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Dash-Board/dashboard-details/dashboard-details.component').then((m) => m.DashboardDetailsComponent),
            title: 'Under - Employee Master'
          },

           {
            path: 'Circular-Forms-Uploads',
              canActivate: [AuthGuard],
            loadComponent: () => import('./Circular&FormUpload/circular/circular.component').then((m) => m.CircularComponent),
            title: 'Under - Employee Master'
          },
          {
            path: 'Circular-Forms-Uploads/:pk_uploadId',
              canActivate: [AuthGuard],
            loadComponent: () => import('./Circular&FormUpload/circular/circular.component').then((m) => m.CircularComponent),
            title: 'Under - Employee Master'
          },
          {
            path: 'Circular-Forms-Uploads_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Circular&FormUpload/list-circular/list-circular.component').then((m) => m.ListCircularComponent),
            title: 'Under - Employee Master'
          },
          
          //Emp management
          {
            path: 'AccidentDetail',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Emp-Management/accident-details/accident-details.component').then((m) => m.AccidentDetailsComponent),
            title: 'HRMS - Employee-Salary'
          },

          {
            path: 'AccidentDetail/:pk_accidentId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Emp-Management/accident-details/accident-details.component').then((m) => m.AccidentDetailsComponent),
            title: 'HRMS - Employee-Salary'
          },

          {
            path: 'AccidentDetail_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Emp-Management/accident-details-list/accident-details-list.component').then((m) => m.AccidentDetailsListComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Employee_Image_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Emp-Management/employee-image-upload-list/employee-image-upload-list/employee-image-upload-list.component').then((m) => m.EmployeeImageUploadListComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Employee_Image_Mst',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Emp-Management/employee-image-upload/employee-image-upload/employee-image-upload.component').then((m) => m.EmployeeImageUploadComponent),
            title: 'HRMS - Employee-Salary'
          },

          //generate letter 
          {
            path: 'Candidate',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Generate-Letter/candidate/candidate.component').then((m) => m.CandidateComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Candidate/:pk_formatid',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Generate-Letter/candidate/candidate.component').then((m) => m.CandidateComponent),
            title: 'HRMS - Employee-Salary'
          },
          {
            path: 'Candidate_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Generate-Letter/candidate-list/candidate-list.component').then((m) => m.CandidateListComponent),
            title: 'HRMS - Employee-Salary'
          },

            {
            path: 'hr-chatboat',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-chat/hr-chatboat/hr-chatboat.component').then((m) => m.HrChatboatComponent),
            title: 'HRMS - hr-chat'
          },




           {
            path: 'event',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/event-master/event-master.component').then((m) => m.EventMasterComponent),
            title: 'HRMS - Event'
          },
           {
            path: 'event/:pk_eventId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/event-master/event-master.component').then((m) => m.EventMasterComponent),
            title: 'HRMS - Event'
          },
           {
            path: 'event_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./hr-management/event-master-list/event-master-list.component').then((m) => m.EventMasterListComponent),
            title: 'HRMS - Event'
          },


          {
            path: 'Generate_letters',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Generate-Letter/generate-letters/generate-letters.component').then((m) => m.GenerateLettersComponent),
            title: 'HRMS - Event'
          },
          
            {
            path: 'Generate_letters_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./Generate-Letter/generate-letters-list/generate-letters-list.component').then((m) => m.GenerateLettersListComponent),
            title: 'HRMS - Event'
          },
          
          
        ]
      }
    
    ]
  }
];
