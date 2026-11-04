import { Routes } from '@angular/router';
import path from 'path';
import { candidateKeyGuard } from './guards/candidate-key.guard';

export const onboardingRoutes: Routes = [ 
  { path: '', redirectTo: 'aadhaar', pathMatch: 'full' },
   //  Protected routes with guard
    {
    path: 'life-insurance',
    canActivate: [candidateKeyGuard],
    data: { formType: 'lifeInsurance' },
    loadComponent: () => import('./life-insurance-verification/life-insurance-verification.component')
      .then((m) => m.LifeInsuranceVerificationComponent),
    title: 'HRMS - Life Insurance'
  },
  {
    path: 'aadhaar',
    canActivate: [candidateKeyGuard],
    data: { formType: 'aadhaar' },
    loadComponent: () => import('./aadhar-verification/aadhar-verification.component')
      .then((m) => m.AadharVerificationComponent),
    title: 'HRMS - Aadhar Verification'
  },
  {
    path: 'pan',
    canActivate: [candidateKeyGuard], 
    data: { formType: 'pan' }, 
    loadComponent: () => import('./pan-verification/pan-verification.component')
      .then((m) => m.PanVerificationComponent),
    title: 'HRMS - Pan Verification'
  },
  {
  path: 'education',
  canActivate: [candidateKeyGuard], 
  data: { formType: 'qualification' },  
  loadComponent: () => import('./candidate-qualification-details/candidate-qualification-details.component')
    .then((m) => m.CandidateQualificationDetailsComponent),
  title: 'HRMS - Education Details'
},
  {
    path: 'previous_experience',
    canActivate: [candidateKeyGuard], 
     data: { formType: 'experience' },
    loadComponent: () => import('./candidate-experience-details/candidate-experience-details.component')
      .then((m) => m.CandidateExperienceDetailsComponent),
    title: 'HRMS - Previous Experience'
  },
  {
   path: 'family_details',
   canActivate: [candidateKeyGuard], 
   data: { formType: 'family' },
  loadComponent: () => import('./candidate-family-details/candidate-family-details.component').then((m)=>m.CandidateFamilyDetailsComponent),
  title: 'HRMS - family_details'
 },
    {
    path: 'basicInfo',
    canActivate: [candidateKeyGuard], 
    data: { formType: 'basicInfo' },
    loadComponent: () => import('./basic-information/basic-information.component')
      .then((m) => m.BasicInformationComponent),
    title: 'HRMS - basicInfo'
  },
  {
    path: 'bank',
    canActivate: [candidateKeyGuard],
    data: { formType: 'bankAccount' },
    loadComponent: () => import('./bank-verification/bank-verification.component')
      .then((m) => m.BankVerificationComponent),
    title: 'HRMS - Bank Verification'
  },
  {
    path: 'driving-licence',
    canActivate: [candidateKeyGuard],
    data: { formType: 'drivingLicence' },
    loadComponent: () => import('./driving-licence-verification/driving-licence-verification.component')
      .then((m) => m.DrivingLicenceVerificationComponent),
    title: 'HRMS - Driving Licence'
  },
  {
    path: 'voter',
    canActivate: [candidateKeyGuard], 
    data: { formType: 'voter' },
    loadComponent: () => import('./voter-verification/voter-verification.component')
      .then((m) => m.VoterVerificationComponent),
    title: 'HRMS - Voter Verification'
  },
  {
    path: 'vendor-gst',
    canActivate: [candidateKeyGuard], 
    data: { formType: 'vendorGst' },
    loadComponent: () => import('./vendor-gst-verification/vendor-gst-verification.component')
      .then((m) => m.VendorGstVerificationComponent),
    title: 'HRMS - Vendor GST Details'
  },
  {
    path: 'signature',
    canActivate: [candidateKeyGuard], 
    data: { formType: 'signature' },
    loadComponent: () => import('./signature-verification/signature-verification.component')
      .then((m) => m.SignatureVerificationComponent),
    title: 'HRMS - Signature'
  },
  {
    path: 'photograph',
    canActivate: [candidateKeyGuard], 
    data: { formType: 'photograph' },
    loadComponent: () => import('./photograph-verification/photograph-verification.component')
      .then((m) => m.PhotographVerificationComponent),
    title: 'HRMS - Recent Photograph'
  },

 //  Final Submission Route - PROTECTED
  {
    path: 'final-submission',
    canActivate: [candidateKeyGuard],
    loadComponent: () => import('./pages/final-submission/final-submission.component')
      .then((m) => m.FinalSubmissionComponent),
    title: 'HRMS - Final Submission'
  },
   {
    path: 'eshram',
    canActivate: [candidateKeyGuard],
    data: { formType: 'eshram' },
    loadComponent: () => import('./eshram-verification/eshram-verification.component')
      .then((m) => m.EshramVerificationComponent),
    title: 'HRMS - E-Shram Card'
  },
  {
    path: 'ayushman',
    canActivate: [candidateKeyGuard],
    data: { formType: 'ayushman' },
    loadComponent: () => import('./ayushman-verification/ayushman-verification.component')
      .then((m) => m.AyushmanVerificationComponent),
    title: 'HRMS - Ayushman Card'
  },


 
  //  Special pages WITHOUT guard and WITHOUT layout
  {
    path: 'completed',
    loadComponent: () => import('./pages/onboarding-completed/onboarding-completed.component')
      .then((m) => m.OnboardingCompletedComponent),
    title: 'HRMS - Onboarding Completed'
  },


  {
    path: 'access-denied',
    loadComponent: () => import('./pages/access-denied/access-denied.component')
      .then((m) => m.AccessDeniedComponent),
    title: 'HRMS - Access Denied'
  },




 
 
];