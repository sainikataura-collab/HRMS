import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MasterImportService {

  constructor(private http: HttpClient) {}

  importCityMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportCityMaster}`;
    return this.http.post<any>(url, formData);
  }

  importDesignationMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportDesignationMaster}`;
    return this.http.post<any>(url, formData);
  }

  importDepartmentMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportDepartmentMaster}`;
    return this.http.post<any>(url, formData);
  }

  importLocationMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportLocationMaster}`;
    return this.http.post<any>(url, formData);
  }

  importClientMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportClientMaster}`;
    return this.http.post<any>(url, formData);
  }

  importOutletMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportOutletMaster}`;
    return this.http.post<any>(url, formData);
  }
   importBranchMaster(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ImportBranchMaster}`;
    return this.http.post<any>(url, formData);
  }

}
