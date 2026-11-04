import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlexiSalaryService {

  constructor(private http: HttpClient) {}

  insertFlexiBill(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Compensation.insertFlexiBill}`;
    return this.http.post<any>(apiUrl, data);
  }

  getFlexiBills(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Compensation.getFlexiBills}`;
    return this.http.get<any>(apiUrl);
  }

  deleteFlexiBill(flexiBillId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Compensation.deleteFlexiBill}/${flexiBillId}`;
    return this.http.delete<any>(apiUrl);
  }

  getFlexiHeadDropdown(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Compensation.getFlexiHeadDropdown}`;
    return this.http.get<any>(apiUrl);
  }

  validateBill(fk_headid: number, billDate: string, billAmt: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Compensation.validateBill}?fk_headid=${fk_headid}&billDate=${billDate}&billAmt=${billAmt}`;
    return this.http.get<any>(apiUrl);
  }

    getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.HR.Image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }
}