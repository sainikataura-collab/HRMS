import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';


export const admin: Routes = [
  { path: '', redirectTo: 'redirect-dashboard', pathMatch: 'full' },

  {
    path: 'redirect-dashboard',
    loadComponent: () =>
      import('../shared/components/RedirectComponent').then((m) => m.RedirectComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'HRMS - Admin Dashboard',
  },
  {
    path: 'employee-dashboard',
    loadComponent: () =>
      import('../emp-dashboard/emp-dashboard.component').then((m) => m.EmpDashboardComponent),
    title: 'HRMS - Employee Dashboard',
  },
];


@NgModule({
  imports: [RouterModule.forRoot(admin)],
  exports: [RouterModule],
})
export class dashboardRoutingModule {
  static routes = admin;
}

