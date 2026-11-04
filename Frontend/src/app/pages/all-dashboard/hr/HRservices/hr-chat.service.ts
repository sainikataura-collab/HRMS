import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HrChatService {

  constructor(private http:HttpClient) { }
   GetTodayBirthday (): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.GetTodayBirthday}`;
        return this.http.get(view_url);
      }


       GetUpcomingBirthday (): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.GetUpcomingBirthday}`;
        return this.http.get(view_url);
      }


       GetEvents (): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.GetEvents}`;
        return this.http.get(view_url);
      }

       GetAniversary (): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.GetAniversary}`;
        return this.http.get(view_url);
      }

         GetActivity (): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.GetActivity}`;
        return this.http.get(view_url);
      }
}
