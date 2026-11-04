import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanTransactionService {
  
  constructor(private http: HttpClient) { }

  add_LoanTransaction(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanTransaction_insert}`;
    return this.http.post<any>(url, data);
  }

  get_All_LoanTransaction(fk_empid: string | null, pageIndex: number, pageSize: number): Observable<any> {
    let url = `${environment.baseURL1}${environment.payroll.LoanTransaction_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (fk_empid !== null && fk_empid.trim() !== '') {
      url += `&fk_empid=${fk_empid}`;
    }
    console.log('Loan Transaction API URL:', url);
    return this.http.get<any>(url);
  }

  update_LoanTransaction(id: string, data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanTransaction_update}`;
    return this.http.put<any>(url, data);
  }

  get_LoanTransactionById(pk_lid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanTransaction_getbyId}/${pk_lid}`;
    return this.http.get<any>(url);
  }

  delete_LoanTransaction(pk_lid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.LoanTransaction_delete}/${pk_lid}`;
    return this.http.delete<any>(url);
  }

  getEmployee(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

   get_Employees_Ddl(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddlfor100}`;

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
      // userId: filters.userId || "",
      empStatus: filters.empStatus || "B",
      search: filters.search || "",
      pageNo: filters.pageNo || 1,
      pageSize: filters.pageSize || 100
    };
    return this.http.post<any>(url, requestBody);
  }
}
