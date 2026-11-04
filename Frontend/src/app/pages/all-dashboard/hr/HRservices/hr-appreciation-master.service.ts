import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HrAppreciationMasterService {

  constructor(private http: HttpClient) { }

  addAppreciation(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HrAppreciation_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllAppreciations(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.HR.HrAppreciation_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  updateAppreciation(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HrAppreciation_update}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAppreciationById(pk_appreciationId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HrAppreciation_getbyId}/${pk_appreciationId}`;
    return this.http.get<any>(apiUrl);
  }

  deleteAppreciation(pk_appreciationId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.HR.HrAppreciation_delete}/${pk_appreciationId}`;
    return this.http.delete<any>(apiUrl);
  }

  checkDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get(view_url);
  }

  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.HR.HrAppreciation_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }

  get_Employees_Ddl(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
    
    // Construct request body based on filters
    const requestBody = {
      empCode: filters.empCode || "",
      empCodeManual: filters.empCodeManual || "",
      empName: filters.empName || "",
      selectedDepartments: filters.selectedDepartments || [],
      selectedDesignation: filters.selectedDesignation || "",
      selectedLocations: filters.selectedLocations || [],
      selectedNature: filters.selectedNature || "",
      selectedCity: filters.selectedCity || "",
      sortBy: filters.sortBy || "",
      empStatus: filters.empStatus || "B"
    };
    return this.http.post<any>(url, requestBody);
  }

  getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.HR.Image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }
}