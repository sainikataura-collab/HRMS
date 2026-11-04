import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { authenticationRoutingModule } from '../../authentication/authentication.routes';
import { Error404Component } from '../components/error404/error404.component';

export const auth: Routes = [  
  { 
    path: '',
    children: [
      ...authenticationRoutingModule.routes,
      {
        path:'**',component:Error404Component
       },

  ]
},
];
const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled', // Restores the scroll position to the top on navigation
  anchorScrolling: 'enabled',           // Allows scrolling to specific anchor elements
};
@NgModule({
    imports: [RouterModule.forRoot(auth)],
    exports: [RouterModule]
})
export class SaredRoutingModule { }
