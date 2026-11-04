import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { CandidateValidationService } from '../services/candidate-validation.service';

import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CompanyConfigService } from '../services/company-config.service';


export const candidateKeyGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const validationService = inject(CandidateValidationService);
  const configService = inject(CompanyConfigService);
  const candidateService = inject(CandidateExperienceDetailService);
  
  // Get key from URL or sessionStorage
  const keyFromUrl = route.queryParams['key'];
  const keyFromStorage = sessionStorage.getItem('candidateKey');
  
  const candidateKey = keyFromUrl || keyFromStorage;
  
  // No key at all
  if (!candidateKey) {
    router.navigate(['/on_boarding/access-denied'], {
      queryParams: { reason: 'no-key' }
    });
    return false;
  }
  
  // Basic format validation
  const urlSafePattern = /^[A-Za-z0-9_-]+$/;
  if (!urlSafePattern.test(candidateKey) || candidateKey.length < 40) {
    router.navigate(['/on_boarding/access-denied'], {
      queryParams: { reason: 'invalid-key' }
    });
    return false;
  }
  
  // Store key if it came from URL
  if (keyFromUrl) {
    sessionStorage.setItem('candidateKey', keyFromUrl);
  }
  
  // Validate with backend
  return validationService.validateCandidateKey(candidateKey).pipe(
    switchMap(result => {
      if (!result.isValid) {
        router.navigate(['/on_boarding/access-denied'], {
          queryParams: { reason: 'invalid-key' }
        });
        return of(false);
      }
      
      if (result.isCompleted) {
        router.navigate(['/on_boarding/completed']);
        return of(false);
      }

      if (result.candidateName) {
        sessionStorage.setItem('candidateName', result.candidateName);
      }
      if (result.candidateId) {
        sessionStorage.setItem('candidateId', result.candidateId);
      }
      if (result.lastOpenedDate) {
        sessionStorage.setItem('lastOpenedDate', result.lastOpenedDate);
      }
      
      // ✅ NEW: Check form visibility
      const formType = route.data['formType'] as string;
      
      // If no formType specified, allow access (e.g., final-submission)
      if (!formType) {
        return of(true);
      }
      
      // Check if config is already loaded
      let config = configService.getConfig();
      
      if (config) {
        return of(checkFormVisibility(config, formType, router));
      }
      
      // Load config if not available
      return candidateService.getMandatoryDetails().pipe(
        map(res => {
          if (res.isSuccess && res.data) {
            config = res.data;
            configService.setConfig(res.data);
            if (res.data.companyName) {
              sessionStorage.setItem('companyName', res.data.companyName);
            }
            if (res.data.companyLogo) {
              sessionStorage.setItem('companyLogo', res.data.companyLogo);
            }
          } else {
            config = configService.getDefaultConfig();
          }
          return checkFormVisibility(config, formType, router);
        })
      );
    })
  );
};

/**
 * Check if form is visible based on company config
 */
function checkFormVisibility(config: any, formType: string, router: Router): boolean {
  let isVisible = true;

  switch (formType) {
    case 'pan':
      isVisible = config.panVisible;
      break;
     case 'lifeInsurance':
      isVisible = config.lifeinsuranceVisible;
      break;  
    case 'aadhaar':
      isVisible = config.aadhaarVisible;
      break;
    case 'basicInfo':
      isVisible = config.basicInfoVisible;
      break;
    case 'qualification':
      isVisible = config.qualificationVisible;
      break;
    case 'experience':
      isVisible = config.experienceVisible;
      break;
    case 'family':
      isVisible = config.familyVisible;
      break;
    case 'voter':
      isVisible = config.voterVisible;
      break;
    case 'bankAccount':
      isVisible = config.bankAccountVisible;
      break;
    default:
      isVisible = true;
  }

  if (!isVisible) {
    router.navigate(['/on_boarding/access-denied'], {
      queryParams: { reason: 'form-hidden' }
    });
    return false;
  }

  return true;
}

// export const candidateKeyGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
//   const router = inject(Router);
//   const validationService = inject(CandidateValidationService);

//   const configService = inject(CompanyConfigService);
//   const candidateService = inject(CandidateExperienceDetailService);
  
  
//   // Get key from URL or sessionStorage
//   const keyFromUrl = route.queryParams['key'];
//   const keyFromStorage = sessionStorage.getItem('candidateKey');
  
//   const candidateKey = keyFromUrl || keyFromStorage;
  
//   // No key at all
//   if (!candidateKey) {
//     router.navigate(['/on_boarding/access-denied'], {
//       queryParams: { reason: 'no-key' }
//     });
//     return false;
//   }
  
//   // Basic format validation
//   const urlSafePattern = /^[A-Za-z0-9_-]+$/;
//   if (!urlSafePattern.test(candidateKey) || candidateKey.length < 40) {
//     router.navigate(['/on_boarding/access-denied'], {
//       queryParams: { reason: 'invalid-key' }
//     });
//     return false;
//   }
  
//   // Store key if it came from URL
//   if (keyFromUrl) {
//     sessionStorage.setItem('candidateKey', keyFromUrl);
//   }
  
//   // Validate with backend
//   return validationService.validateCandidateKey(candidateKey).pipe(
//     map(result => {
//       if (!result.isValid) {
//         //  Invalid key - redirect to access denied
//         router.navigate(['/on_boarding/access-denied']);
//         return false;
//       }
      
//       if (result.isCompleted) {
//         //  Onboarding completed - redirect to completion page
//         router.navigate(['/on_boarding/completed']);
//         return false;
//       }
      
//       // Valid and not completed - allow access
//       return true;
//     })
//   );
// };