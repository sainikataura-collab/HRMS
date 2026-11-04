import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmpEventService {

  
  constructor(private http: HttpClient) { }


  getRecentActivity(): Observable<any> {
  const url = `${environment.baseURL1}${environment.HR.EventRecentActivity}`;
  return this.http.get(url);
}

getDashboardData(year?: number | null, month?: number | null): Observable<any> {
  let url = `${environment.baseURL1}${environment.HR.EventDahsboard}`;
  
  // Add query parameters dynamically
  const params: any = {};
  if (year) params['fk_yearid'] = year;
  if (month) params['monthid'] = month;

  return this.http.get(url, { params });
}


}
