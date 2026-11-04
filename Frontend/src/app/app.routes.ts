import { Routes } from '@angular/router';
import { auth } from './shared/routes/auth.routes';
import { AuthenticationLayoutComponent } from './shared/layouts/authentication-layout/authentication-layout.component';
import { DashboardLayoutComponent } from './shared/layouts/dashboard-layout/dashboard-layout.component';
import { dash } from './shared/routes/dash.routes';
import { EmailverificationComponent } from './pages/emailverification/emailverification.component';
import { EmailphoneverificationComponent } from './authentication/emailphoneverification/emailphoneverification.component';
import { AuthGuard } from './authentication/auth.guard';
import { OnBoardingLayoutComponent } from './shared/layouts/on-boarding-layout/on-boarding-layout.component';
import { on_boarding  } from './shared/routes/on_board.routes';
import { CandidateReviewComponent } from './on_boarding/pages/candidate-review/candidate-review.component';

export const routes: Routes = [
    
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    {
      path: 'auth', 
      component: AuthenticationLayoutComponent,
      children: auth
    },
    {
      path: 'dash', 
      component: DashboardLayoutComponent,
       children: dash
    },

 
    {
      path: 'emailverification', 
      component: EmailverificationComponent
    }, 

    // {
    //   path: 'on_boarding',
    //   component:OnBoardingLayoutComponent,
    //   children:on_boarding    
    // }

     //  Onboarding with conditional layout
  {
    path: 'on_boarding',
    children: [
      //  Routes WITH layout (sidebar + header)
      {
        path: '',
        component: OnBoardingLayoutComponent,
        children: on_boarding.filter(route => 
          route.path !== 'completed' && route.path !== 'access-denied'
        )
      },
      //  Routes WITHOUT layout (standalone pages)
      ...on_boarding.filter(route => 
        route.path === 'completed' || route.path === 'access-denied'
      )
    ]
  },
  // ✅ HR Review Route - Public, no layout, no guard
    {
      path: 'candidate-review/:key',
      component: CandidateReviewComponent
    },

        // ✅ Public Walk-In Candidate Application Route - Public, no layout, QR Secured
    {
      path: 'public-apply/:qrToken',
      loadComponent: () => import('./pages/public-apply/public-walkin-apply.component').then(m => m.PublicWalkinApplyComponent),
      title: 'Spot Hiring & Walk-In Application'
    },
    {
      path: 'public-apply',
      loadComponent: () => import('./pages/public-apply/public-walkin-apply.component').then(m => m.PublicWalkinApplyComponent),
      title: 'Spot Hiring & Walk-In Application'
    }

 
];
