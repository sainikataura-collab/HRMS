import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CtcConfigService {

  constructor(private http: HttpClient) { }

  // Save new CTC Configuration
  saveCTCConfig(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CTCConfig_insert}`;
    return this.http.post<any>(url, data);
  }

  // Get all CTC Configurations with pagination
  getCTCConfigs(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CTCConfig_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get(url);
  }

  // Get CTC Configuration by ID
  getCTCConfigById(configId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CTCConfig_getbyId}/${configId}`;
    return this.http.get<any>(url);
  }

  // Update CTC Configuration
  updateCTCConfig(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CTCConfig_update}`;
    return this.http.put<any>(url, data);
  }

  // Delete CTC Configuration
  deleteCTCConfig(configId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CTCConfig_delete}/${configId}`;
    return this.http.delete<any>(url);
  }

  // Get heads by type (E, R, D) for CTC components
  getHeadsByType(): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CTCConfig_heads}`;
    return this.http.get<any>(url);
  }

  // Get dropdown data (Location, Department, Category, Grade)
  getDropdownList(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(url);
  }
}
