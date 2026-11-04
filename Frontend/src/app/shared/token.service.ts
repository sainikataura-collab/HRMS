// token.service.ts
import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  
  setTokens(accessToken: string, refreshToken: string) {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  }


  getAccessToken() {
    return sessionStorage.getItem('accessToken');
  }

  KYCUserTypeId() {

  sessionStorage.getItem('KYCUserTypeId');
}

  getRefreshToken() {
    return sessionStorage.getItem('refreshToken');
  }

  clearTokens() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('usertype'); //added 28march2026 LR
  }

   // Decode the token to get its expiration time
   getAccessTokenExpiration(): number | null {
    const token = this.getAccessToken();
    if (token) {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp * 1000; // Convert to milliseconds
    }
    return null;
  }

  isAccessTokenExpired(): boolean {
    const expiration = this.getAccessTokenExpiration();
    if (expiration) {
      return Date.now() > expiration;
    }
    return true; // Treat as expired if no token exists
  }
}
