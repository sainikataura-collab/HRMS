import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        data: {
            title: 'emp-training'
        },
        children: [
            {
                path: 'emp-trainingdashboard',
                loadComponent: () => import('./emp-training-dashboard/emp-training-dashboard.component').then((m) => m.EmpTrainingDashboardComponent),
                title: 'HRMS - Emp training',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./emp-training-dash/emp-training-dash.component').then((m) => m.EmpTrainingDashComponent),
                        title: 'HRMS - emp trainingdash'
                    },


                    {
                    path: 'Training_Need_Identification',
                    loadComponent: () => import('./training-need-identification/training-need-identification.component').then((m) => m.TrainingNeedIdentificationComponent),
                    title: 'Plan Training Calender'
                },

                {
                    path: 'TNI_List_For_Employee',
                    loadComponent: () => import('./training-need-identification-list/training-need-identification-list.component').then((m) => m.TrainingNeedIdentificationListComponent),
                    title: 'Plan Training Calender'
                },

                {
                    path: 'TNI_View_Form_for_Employee',
                    loadComponent: () => import('./training-calendar-view/training-calendar-view.component').then((m) => m.TrainingCalendarViewComponent),
                    title: 'Plan Training Calender'
                },
                {
                    path: 'Employee_Calendar',
                    loadComponent: () => import('./emp-training-calendar/emp-training-calendar.component').then((m) => m.EmpTrainingCalendarComponent),
                    title: 'Plan Training Calender'
                },

                
                {
                    path: 'Mark_Attendance',
                    loadComponent: () => import('./training-mark-attendance/training-mark-attendance.component').then((m) => m.TrainingMarkAttendanceComponent),
                    title: 'Plan Training Calender'
                },
                {
                    path: 'Mark_Attendance_View',
                    loadComponent: () => import('./training-mark-attendance-view/training-mark-attendance-view.component').then((m) => m.TrainingMarkAttendanceViewComponent),
                    title: 'Plan Training Calender'
                }, 
                {
                    path: 'Training-Material_List',
                    loadComponent: () => import('./training-material-emp/training-material-emp.component').then((m) => m.TrainingMaterialEmpComponent),
                    title: 'Plan Training Calender'
                }, 
                 {
                    path: 'training-feedback',
                    loadComponent: () => import('./training-feedback/training-feedback.component').then((m) => m.TrainingFeedbackComponent),
                    title: 'Plan Training Calender'
                }, 

                        
                        ]
                    }
                ]
            }
        ]



