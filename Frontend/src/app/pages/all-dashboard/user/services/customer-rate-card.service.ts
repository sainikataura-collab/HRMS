import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerRateCardService {
  constructor(private http: HttpClient) { }

  insert(data: any): Observable<any> {
    return this.http.post<any>(`${environment.baseURL}${environment.payroll.customerRateCard_insert}`, data);
  }

  update(data: any): Observable<any> {
    return this.http.put<any>(`${environment.baseURL}${environment.payroll.customerRateCard_update}`, data);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}${environment.payroll.customerRateCard_getById}/${id}`);
  }

  getAll(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    let url = `${environment.baseURL}${environment.payroll.customerRateCard_getAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    return this.http.get<any>(url);
  }

  DownloadExcel(): Observable<any> {
    let url = `${environment.baseURL}${environment.payroll.customerRateCard_getAll}?pageIndex=0&pageSize=100000`;
    return this.http.get<any>(url);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.baseURL}${environment.payroll.customerRateCard_getById}/${id}`);
  }

  getDynamicHeads(): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}/CustomerRateCard/GetDynamicHeads`);
  }

  uploadCustomerRateCardExcel(formData: FormData): Observable<any> {
    const url = `${environment.baseURL}/CustomerRateCard/CustomerRateCardExcelUpload`;
    return this.http.post<any>(url, formData);
  }
   getMinimumWage(locationId: string, categoryId: string): Observable<any> {
    const url = `${environment.baseURL}/CustomerRateCard/GetMinimumWage?locationId=${encodeURIComponent(locationId)}&categoryId=${encodeURIComponent(categoryId)}`;
    return this.http.get<any>(url);
  }

   getLocationsByCustomer(customerId: string | number): Observable<any> {
    const url = `${environment.baseURL}/CustomerRateCard/GetLocationsByCustomer/${customerId}`;
    return this.http.get<any>(url);
  }
}
