import { Routes } from '@angular/router';


export const routes: Routes = [
  {
  path: '',
  data: {
    title: 'setting'
  },
  children: [

 {
    path: 'resetpassword',
    loadComponent: () =>import('./resetpassword/resetpassword.component').then( (m) => m.ResetpasswordComponent),
    title: 'Collie - Under development'
  },
{
  path: 'profile',
  loadComponent: () =>import('./user-profile/user-profile.component').then( (m) => m.UserProfileComponent),
  title: 'Collie - Under development'
  },
{
  path: 'kyc-details',
  loadComponent: () =>import('./kyc-details/kyc-details.component').then((m)=>m.KycDetailsComponent),
  title: 'Collie - Under development'
  },

]
  }
];



