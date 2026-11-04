import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpweekoffmasterService {
  
  constructor(private http: HttpClient) { }
 // Submit/Create Employee Weekly Off
 submitEmpweekoffmasterData(data: any): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.EmpWeeklyOff_insert}`;
  return this.http.post<any>(apiUrl, data);
}

// Get All Employee Weekly Offs with pagination
getAllEmpWeeklyOff(pageIndex: number, pageSize: number): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.EmpWeeklyOff_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get<any>(apiUrl);
}

// Update Employee Weekly Off
updateEmpWeeklyOff(data: any): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.EmpWeeklyOff_update}`;
  return this.http.put<any>(apiUrl, data);
}

// Get Employee Weekly Off by ID
getEmpWeeklyOffById(woffId: string): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.EmpWeeklyOff_getbyId}/${woffId}`;
  return this.http.get<any>(apiUrl);
}

// Delete Employee Weekly Off
deleteEmpWeeklyOff(woffId: string): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.EmpWeeklyOff_delete}/${woffId}`;
  return this.http.delete<any>(apiUrl);
}

getEmployee(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}

get_Employees(pageIndex: number, pageSize: number, filters: any = {}): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
   
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
     empStatus: filters.empStatus || ""
   };
   return this.http.post<any>(url, requestBody);
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
