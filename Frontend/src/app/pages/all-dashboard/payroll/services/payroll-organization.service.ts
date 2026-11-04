import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayrollOrganizationService {
  EmployeeListData(employeeFilters: { empCode: string; empCodeManual: string; empName: string; selectedDepartments: never[]; selectedDesignation: string; selectedLocations: never[]; selectedNature: string; selectedCity: string; sortBy: string; userId: string; empStatus: string; }) {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) { }


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
    // userId: filters.userId || "",s
     empStatus: filters.empStatus || "B",
       search: filters.search || "",
      pageNo: filters.pageNo || 1,
      pageSize: filters.pageSize || 100
   };
   return this.http.post<any>(url, requestBody);
 }

 

//  


  // getById_OrganizationChart(pk_empid: any): Observable<any> {
  //   debugger
  //   const view_url = `${environment.baseURL1}${environment.payroll.GetById_organizationChart}/${pk_empid}`;
  //   return this.http.get<any>(view_url);
  // }
  

    getById_OrganizationChart(pk_empid: any): Observable<any> {
 
     let view_url ;
    if(pk_empid==''){
        view_url = `${environment.baseURL1}${environment.payroll.GetById_organizationChart}`;
    }else{
      view_url = `${environment.baseURL1}${environment.payroll.GetById_organizationChart}?pk_empid=`+ pk_empid;
    }
    
    return this.http.get<any>(view_url);
  }

  

}
