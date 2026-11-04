import { Injectable } from '@angular/core';
import { TokenService } from '../token.service';
import { AuthService } from '../../authentication/service/auth.service';


@Injectable({
  providedIn: 'root',
})
export class TokenManagerService {
  private refreshTimer: any;

  constructor(private tokenService: TokenService, private authService: AuthService) {}

   /**
   * Starts the token refresh scheduler.
   * It calculates when to refresh the access token based on its expiration time.
   */
  startTokenRefreshScheduler(): void {    

   this.clearTokenRefreshScheduler();

     // Get the token expiration time (ensure this is in milliseconds)
    const expiration = this.tokenService.getAccessTokenExpiration();
    if (expiration) {
      const timeout = expiration - Date.now() - 60000; // Refresh 1 minute before expiration
      // Only set a timeout if the token will expire in more than 1 minute
      if (timeout > 0) {
        this.refreshTimer = setTimeout(() => {
          this.authService.refreshAccessToken().subscribe({
            next: () => {
              console.log('Access token refreshed successfully');
           
               this.startTokenRefreshScheduler();
            },
            error: () => 
              {
                console.error('Failed to refresh access token');
                 // Redirect to login or handle error
               // In case of failure, clear the tokens and redirect to login page
              this.authService.logoutAndRedirect(); // Call the logoutAndRedirect method
              }

          });
        }, timeout);
      }
    }
  }

   /**
   * Clears the token refresh scheduler.
   * If a refresh cycle is running, it will be stopped.
   */
  clearTokenRefreshScheduler(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
