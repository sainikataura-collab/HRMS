import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuarterService {

  constructor(private http: HttpClient) {}

  saveQuarter(data: any): Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.Department}`;
     return this.http.post<any>(view_url,data);  // Returning any type
     } 
     
}
