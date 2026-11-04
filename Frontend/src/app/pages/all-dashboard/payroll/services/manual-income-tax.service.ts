import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManualIncomeTaxService {

  constructor(private http: HttpClient) { }

  // Get employee filter dropdown
  get_Employees_Ddl(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
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

  // Get month list
  getMonthlist(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(url);
  }

  // Get year list
  getYear(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(url);
  }

  // Get manual income tax list with pagination
  get_ManualIncomeTaxList(filters: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ManualIncomeTax_Getall}`;
    return this.http.post(url, filters);
  }
  updateManualIncomeTax(manualTaxList: any[]): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.ManualIncomeTax_Update}`;
    return this.http.put<any>(apiUrl, manualTaxList);
  }

}
