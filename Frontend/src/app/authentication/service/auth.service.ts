import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { TokenService } from '../../shared/token.service';
import { TokenManagerService } from '../../shared/services/token-manager.service';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private captchaValue: string = '';

  private readonly characters: string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  constructor(
    private http: HttpClient,
    private router: Router,
    public ngZone: NgZone,
    private tokenService: TokenService,
    private injector: Injector
  ) {}

  validateCompanyCode(companyCode: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Authentication.validateCompanyCode}`;
    return this.http.post<any>(url, { companyCode }).pipe(
      catchError((error) => {
        console.error('Error validating company code:', error);
        return throwError(error);
      })
    );
  }

  getLocationsByOfficeType(
    companyId: string,
    officeTypeId: string
  ): Observable<any> {
    const url = `${environment.baseURL1}${environment.Authentication.GetLocationByOfficeType}`;
    return this.http.post<any>(url, { companyId, officeTypeId }).pipe(
      catchError((error) => {
        console.error('Error fetching locations:', error);
        return throwError(error);
      })
    );
  }

  login(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Authentication.HrmsLogin}`;
    return this.http.post<any>(url, data).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return throwError(error);
      })
    );
  }
  loginWithCredentials(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Authentication.HrmsLogin}`;
    return this.http.post<any>(url, data).pipe(
      catchError((error) => {
        console.error('Error during login:', error);
        return throwError(error);
      })
    );
  }

  verify_otp_login(data: any) {
    {
      let view_url = `${environment.baseURL1}${environment.Authentication.verify_otp}`;
      return this.http.post(view_url, data).pipe(
        map((user: any) => {
          this.router.navigate(['/dash']);
          return user;
        })
      );
    }
  }

  verifyEmployeeOtp(data: any) {
    {
      let view_url = `${environment.baseURL1}${environment.Authentication.verify_otp}`;
      return this.http.post(view_url, data).pipe(
        map((user: any) => {
          this.router.navigate(['/dash']);
          return user;
        })
      );
    }
  }

  loggedIn() {
    return !!sessionStorage.getItem('accessToken');
  }

  loginAuth(data: any) {
    let view_url = `${environment.baseURL}${environment.Authentication.login}`;
    return this.http.post<any>(view_url, data);
  }

  registerCustomer(data: any) {
    let view_url = `${environment.baseURL}${environment.Authentication.register}`;
    return this.http.post<any>(view_url, data).pipe(
      map((user: any) => {
        return user;
      })
    );
  }

  verify_otp_register(data: any) {
    let view_url = `${environment.baseURL}${environment.Authentication.verify_otp_register}`;
    return this.http.post(view_url, data).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  resend_otp(data: any) {
    let view_url = `${environment.baseURL}${environment.Authentication.resend_otp}`;
    return this.http.post(view_url, data).pipe(
      map((user: any) => {
        return user;
      })
    );
  }

  generateCaptcha(length: number = 6): string {
    this.captchaValue = Array.from({ length }, () =>
      this.characters.charAt(Math.floor(Math.random() * this.characters.length))
    ).join('');
    return this.captchaValue;
  }
  validateCaptcha(input: string): boolean {
    return input === this.captchaValue;
  }
  refreshCaptcha(): string {
    return this.generateCaptcha();
  }

  logout(): Observable<any> {
    // Prepare the HTTP headers
    const apiUrl = `${environment.baseURL}${environment.Authentication.logout}`;
    return this.http.post(apiUrl, {});
  }

  forgotPassword(emailOrMobile: string): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Authentication.forgot_Password}`;
    return this.http.post<any>(apiUrl, { emailOrMobile });
  }

  resetPassword_token(token: string, newPassword: string): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.Authentication.reset_password_token}`;
    return this.http.post<any>(apiUrl, { token, newPassword });
  }

  emailverification(token: string, registrationId: string) {
    let view_url = `${environment.baseURL}${environment.Authentication.emailverification}`;
    return this.http.post<any>(view_url, { token, registrationId }).pipe(
      map((user: any) => {
        return user;
      })
    );
  }

  // Method to refresh the access token
  refreshAccessToken(): Observable<{
    accessToken: string;
    refreshToken: string;
  }> {
    const view_url = `${environment.baseURL}${environment.Authentication.refresh_token}`;
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    return this.http.post(view_url, { refreshToken }).pipe(
      map((response: any) => {
        const { accessToken, refreshToken } = response.data;

        // Save the new tokens in storage
        this.tokenService.setTokens(accessToken, refreshToken);
        return response.data;
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.tokenService.clearTokens(); // Clear tokens if refresh fails
        this.logoutAndRedirect(); // Log out the user if refresh fails
        return throwError(error);
      })
    );
  }

  // Logout and redirect to login page
  logoutAndRedirect(): void {
    this.logout();
    this.tokenService.clearTokens();
    localStorage.removeItem('usertype');
    this.router.navigate(['/auth/login']);
  }



}
