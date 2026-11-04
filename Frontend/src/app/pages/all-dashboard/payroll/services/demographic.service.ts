import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DemographicService {

  constructor(private http: HttpClient) { }


  // Get All Employee Weekly Offs with pagination
 
  getAllDemographicList(pageIndex: number, pageSize: number, filters: any = {}, searchTerm: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Demographic_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
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
       sortBy: filters.sortBy || "empcode",
      // userId: filters.userId || "",
       empStatus: filters.empStatus || "B"
     };
     return this.http.post<any>(url, requestBody);
   }

   GetDemographicById(fk_empid: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.Demographic_getbyId }/${fk_empid}`;
    return this.http.get<any>(apiUrl);
  }

  // DemographicUpdate(data: any): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.Demographic_update}`;
  //   return this.http.put<any>(view_url, data);
  // }
  DemographicUpdate(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Demographic_update}`;
    //const payload = { demographicMst: data }; // Wrap data in demographicMst
    console.log('Sending update request to:', view_url, 'with payload:', data); // Verify payload
    return this.http.put<any>(view_url, data);
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
      // userId: filters.userId || "",
       empStatus: filters.empStatus || "B"
     };
     return this.http.post<any>(url, requestBody);
   }

   getdropDawn(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  DownloadExcel(filters: any = {}): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.payroll.Demographic_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    const requestBody = {
      empCode: filters.empCode || "",
      empCodeManual: filters.empCodeManual || "",
      empName: filters.empName || "",
      selectedDepartments: filters.selectedDepartments || [],
      selectedDesignation: filters.selectedDesignation || "",
      selectedLocations: filters.selectedLocations || [],
      selectedNature: filters.selectedNature || "",
      selectedCity: filters.selectedCity || "",
      sortBy: filters.sortBy || "empcode",
      empStatus: filters.empStatus || "B"
    };
  
    return this.http.post<any>(view_url, requestBody);
  }

}
