import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

export const admin: Routes = [ 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',loadComponent: () =>import('./login/login.component').then( (m) => m.LoginComponent),
          title: 'HRMS'
    },
    {
        path: 'signup',loadComponent: () =>import('./signup/signup.component').then( (m) => m.SignupComponent),
          title: 'HRMS'
    },
     
    {
        path: 'otp',loadComponent: () =>import('./otp/otp.component').then( (m) => m.OtpComponent),
       title: 'HRMS'
    },

    {
        path: 'forgot-password',loadComponent: () =>import('./emailphoneverification/emailphoneverification.component').then( (m) => m.EmailphoneverificationComponent),
           title: 'HRMS'
    },

     
];

@NgModule({
  imports: [RouterModule.forRoot(admin)],
  exports: [RouterModule],
})
export class authenticationRoutingModule {
  static routes = admin;
}