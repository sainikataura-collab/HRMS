import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerShiftRateBonusService {
  private readonly baseUrl = `${environment.baseURL1}/CustomerShiftRateBonus`;

  constructor(private http: HttpClient) { }

  getAll(filter: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/GetAll`, filter);
  }

  getById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/GetById/${id}`);
  }

  insert(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Insert`, data);
  }

  update(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Update`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/Delete/${id}`);
  }

  getDropdownList(fieldName: string): Observable<any> {
    const endpoint = (environment as any).payroll?.DropdownList || '/General/dropdownList';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}/${fieldName}`);
  }

  getClients(): Observable<any> {
    return this.getDropdownList('Client');
  }

  getLocations(): Observable<any> {
    return this.getDropdownList('Location');
  }

  bulkInsert(list: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/BulkInsert`, list);
  }
}
