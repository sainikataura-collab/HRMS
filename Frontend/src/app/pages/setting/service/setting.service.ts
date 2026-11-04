import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  constructor(private http: HttpClient, private router: Router, public ngZone: NgZone) {

  }

resent_password(data: any) {
     const url = `${environment.baseURL1}${environment.Setting.reset_password}`;
    return this.http.post<any>(url, data);
   }

   verify_old_password(data: any): Observable<any> {
     const url = `${environment.baseURL1}${environment.Setting.verify_old_password}`;
      return this.http.post<any>(url, data);
}
   user_profile() {
    const url = `${environment.baseURL}${environment.Setting.user_profile}`;
   return this.http.get<any>(url);
  }
}
