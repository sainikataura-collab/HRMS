import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaxConfigService {

  constructor(private http: HttpClient) { }

  // Get all tax config list
  getTaxConfigList(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Tax_getall}`;
    return this.http.get<any>(url);
  }

  // Insert tax config
  insertTaxConfig(taxConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Tax_insert}`;
    return this.http.post<any>(url, taxConfigList);
  }

  // Update tax config
  updateTaxConfig(taxConfigList: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Tax_Update}`;
    return this.http.put<any>(url, taxConfigList);
  }

}
