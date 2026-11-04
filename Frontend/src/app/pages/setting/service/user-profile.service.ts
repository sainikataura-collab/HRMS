import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<any> {
    const url = `${environment.baseURL1}${environment.userprofile.getUserProfile}`;
    return this.http.get<any>(url);
  }

  getImage(imageName: string): Observable<Blob> {
           const view_url = `${environment.baseURL1}${environment.HR.User_image }/${imageName}`;
            return this.http.get(view_url, { responseType: 'blob' });
            }
}
