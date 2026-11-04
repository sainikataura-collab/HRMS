// import { Routes } from '@angular/router';


// export const routes: Routes = [
//   {
//   path: '',
//   data: {
//     title: 'training'
//   },
//   children: [
//     {
//       path: 'trainingdashboard',
//       loadComponent: () =>import('./training-dashboard/training-dashboard.component').then( (m) => m.TrainingDashboardComponent),
//       title: 'HRMS - Training-Dashboard'
//     },

//     // {
//     //   path: 'video-url-upload',
//     //   loadComponent: () =>import('./traning-video-url-upload/traning-video-url-upload.component').then( (m) => m.TraningVideoUrlUploadComponent),
//     //   title: 'HRMS - Training-Dashboard'
//     // },
//     // {
//     //   path: 'video-url-upload/:pk_trainingId',
//     //   loadComponent: () =>import('./traning-video-url-upload/traning-video-url-upload.component').then( (m) => m.TraningVideoUrlUploadComponent),
//     //   title: 'HRMS - Training-Dashboard'
//     // },
//     // {
//     //   path: 'video-url-upload-list',
//     //   loadComponent: () =>import('./traning-video-url-upload/traning-video-url-upload.component').then( (m) => m.TraningVideoUrlUploadComponent),
//     //   title: 'HRMS - Training-Dashboard'
//     // }
//   ]
// }];





import { Routes } from '@angular/router';
import { AuthGuard } from '../../../authentication/auth.guard';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'training'
    },
    children: [


      {
        path: 'trainingdashboard',
        loadComponent: () => import('./training-dashboard/training-dashboard.component').then( (m) => m.TrainingDashboardComponent),
        title: 'HRMS -Training Dashboard',
        children: [
          {
            path: '',
            loadComponent: () => import('./training-dash/training-dash.component').then( (m) => m.TrainingDashComponent),
            title: 'HRMS - Training dash'
          },

           // {
//  path: 'video-url-upload',
//   loadComponent: () =>import('./traning-video-url-upload/traning-video-url-upload.component').then( (m) => m.TraningVideoUrlUploadComponent),
//   title: 'HRMS - Training-video Url'
//  },
        




         {
            path: 'training_type_master_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-type-master-list/training-type-master-list.component').then((m) => m.TrainingTypeMasterListComponent),
            title: 'Apply_Local_Travel'
          },
          {
            path: 'training_type_master',
               canActivate: [AuthGuard],
              
            loadComponent: () => import('./training-type-master/training-type-master.component').then((m) => m.TrainingTypeMasterComponent),
            title: 'Apply_Local_Travel'
          },
          {
            path: 'training_type_master/:pk_typeId',
              canActivate: [AuthGuard],
            
            loadComponent: () => import('./training-type-master/training-type-master.component').then((m) => m.TrainingTypeMasterComponent),
            title: 'Apply_Local_Travel'
          },
  
           {
            path: 'TrainingRating',
             canActivate: [AuthGuard],
            
            loadComponent: () => import('./training-rating/training-rating.component').then( (m) => m.TrainingRatingComponent),
            title: 'HRMS - Task box dash'
          },
          {
            path: 'TrainingRating/:pk_ratingId',
               canActivate: [AuthGuard],
           
            loadComponent: () => import('./training-rating/training-rating.component').then( (m) => m.TrainingRatingComponent),
            title: 'HRMS - Task box dash'
          },
          {
            path: 'TrainingRating_list',
              canActivate: [AuthGuard],
              
            loadComponent: () => import('./training-rating-list/training-rating-list.component').then( (m) => m.TrainingRatingListComponent),
            title: 'HRMS - Task box dash'
          },

         {
            path: 'TrainingInstitute',
              canActivate: [AuthGuard],
            
            loadComponent: () => import('./training-institute/training-institute.component').then( (m) => m.TrainingInstituteComponent),
            title: 'Taravel_mode_Master_List'
          },

           {
            path: 'TrainingInstitute/:pk_instituteId',
              canActivate: [AuthGuard],
           
            loadComponent: () => import('./training-institute/training-institute.component').then( (m) => m.TrainingInstituteComponent),
            title: 'Taravel_mode_Master_List'
          },



           {
            path: 'TrainingInstitute_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-institute-list/training-institute-list.component').then( (m) => m.TrainingInstituteListComponent),
            title: 'Taravel_mode_Master_List'
          },


          //program and subprogram routes
          {
            path: 'program_master_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-master/program-master-list/program-master-list.component').then( (m) => m.ProgramMasterListComponent),
            title: 'Plan Training Calender'
            },
            {
            path: 'program_master',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-master/program-master/program-master.component').then( (m) => m.ProgramMasterComponent),
            title: 'Plan Training Calender'
          },
            {
            path: 'program_master/:programid',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-master/program-master/program-master.component').then( (m) => m.ProgramMasterComponent),
            title: 'Plan Training Calender'
          },
          
           {
            path: 'subprogram_master_list',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-master/sub-program-list/sub-program-list.component').then( (m) => m.SubProgramListComponent),
            title: 'Plan Training Calender'
            },

             {
            path: 'subprogram_master',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-master/sub-program/sub-program.component').then( (m) => m.SubProgramComponent),
            title: 'Plan Training Calender'
            },
             {
            path: 'subprogram_master/:subprogramId',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-master/sub-program/sub-program.component').then( (m) => m.SubProgramComponent),
            title: 'Plan Training Calender'
            },

            {
              path: 'TNI_List',
                canActivate: [AuthGuard],
              loadComponent: () => import('./training-transaction/tni-admin-list/tni-admin-list.component').then( (m) => m.TniAdminListComponent),
              title: 'Plan Training Calender'
            },
          
             //planning 
            {
            path: 'TrainingPlanning',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-transaction/training-planning/training-planning.component').then( (m) => m.TrainingPlanningComponent),
            title: 'Plan Training Calender'
            },

            {
            path: 'TrainingPlanning/:planningid',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-transaction/training-planning/training-planning.component').then( (m) => m.TrainingPlanningComponent),
            title: 'Plan Training Calender'
           },
            {
            path: 'TrainingPlanning_List',
              canActivate: [AuthGuard],
            loadComponent: () => import('./training-transaction/training-planning-list/training-planning-list.component').then( (m) => m.TrainingPlanningListComponent),
            title: 'Plan Training Calender'
          },
           {
            path: 'Calendar',
            loadComponent: () => import('./training-transaction/training-calendar-admin-view/training-calendar-admin-view.component').then(m => m.TrainingCalendarAdminViewComponent)
           },

            {
            path: 'All_Employees',
            loadComponent: () => import('./training-transaction/training-planned-employees/training-planned-employees.component').then(m => m.TrainingPlannedEmployeesComponent)
            },

           {
            path: 'All_Employees_Attendance',
            loadComponent: () => import('./admin-emp-attendance/admin-emp-attendance.component').then(m => m.AdminEmpAttendanceComponent)
           },
           
          {
            path: 'Training_content',
            canActivate: [AuthGuard],
            loadComponent: () => import('./training-transaction/training-meterial/training-meterial.component').then(m => m.TrainingMeterialComponent)
          },
          {
            path: 'Training_content/:pk_materialId',
            canActivate: [AuthGuard],
            loadComponent: () => import('./training-transaction/training-meterial/training-meterial.component').then(m => m.TrainingMeterialComponent)
          },

          {
            path: 'Training_content_list',
            canActivate: [AuthGuard],
            loadComponent: () => import('./training-transaction/training-material-list/training-material-list.component').then(m => m.TrainingMaterialListComponent)
          }
          ]
      }
    ]
  }
];

