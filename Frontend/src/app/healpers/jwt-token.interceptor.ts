import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SharedService } from '../shared/services/shared.service';
import { TokenService } from '../shared/token.service';
import { TokenManagerService } from '../shared/services/token-manager.service';


export const jwtTokenInterceptor: HttpInterceptorFn = (req, 
  next:HttpHandlerFn): Observable<HttpEvent<any>> => {
    const tokenService = inject(TokenService);    
    const tokenManagerService = inject(TokenManagerService);
    const loaderService = inject(SharedService);
    const token = tokenService.getAccessToken();

    let authReq = req.clone({
      headers: req.headers.set('Authorization', token ? `Bearer ${token}` : '')
    });

    if (!(req.body instanceof FormData)) {
    
      authReq = authReq.clone({
        headers: authReq.headers.set('Content-Type', 'application/json')
      });
    }

    
  return next(authReq).pipe(

    tap((event) => {
      if (event instanceof HttpResponse) {
        const responseBody = event.body;

         // Check the response body for the custom 'statusCode' and 'message' fields
         if (
          responseBody &&
          responseBody.StatusCode === 401 && // Check if the StatusCode in response body is 401
          responseBody.Message === 'Token has expired.' // Check if the message indicates token expiration
        ) {
          // Trigger token refresh when token is expired
          tokenManagerService.clearTokenRefreshScheduler();
          tokenManagerService.startTokenRefreshScheduler();

          // Optionally, you could redirect to login here if refreshing fails
          // sharedService.redirectToLogin();
        } else {
          // Handle other cases
          loaderService.HideLoader(); // Hide loader on successful response
        }
      }
    })
  );
};