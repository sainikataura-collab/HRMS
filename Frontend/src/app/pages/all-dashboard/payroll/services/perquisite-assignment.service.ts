import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerquisiteAssignmentService {

  constructor(private http:HttpClient) { }
//get employee
  getEmployee(fieldName: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
      return this.http.get(view_url);
    }
    
   //get employee details
getEmployeeDetails(empCode: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.getEmployeeDetails}/${empCode}`;
     
      return this.http.get<any>(view_url);
    }
    //get prerquisite
    getPerquisite(fieldName: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
      return this.http.get(view_url);
    }
    //get employee for filter'
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

     //inset leave
add_perquisite( data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.add_perquisite}`;
  return this.http.post<any>(view_url,data);  // Returning any type
}
//get All
get_All_perquisite(fk_empid: string | null,pageIndex: number,pageSize: number): Observable<any> {
  let view_url = `${environment.baseURL1}${environment.payroll.get_All_perquisite}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  if (fk_empid!== null) {
    view_url += `&fk_empid=${fk_empid}`;
    console.log('API URL:', view_url); // Debugging the URL
  }
  return this.http.get(view_url);
}

getById_perquisite(pk_perktrnId:string):Observable<any>{
  const view_url = `${environment.baseURL1}${environment.payroll.getById_perquisite}/${pk_perktrnId}`;
  return  this.http.get<any[]>(view_url);
  }

//update leave
update_perquisite(data: any): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.update_perquisite}`;
  return this.http.put<any>(url, data);  // UPDATE operation
}
//delete  leave 
delete_perquisite(pk_perktrnId:string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.delete_perquisite}/${pk_perktrnId}`;
  return this.http.delete<any>(view_url);
}

 //download the excel
 DownloadExcel():Observable<any> {
  var pageIndex =0;
  var pageSize=100000;
  const view_url = `${environment.baseURL1}${environment.payroll.get_All_perquisite}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  return this.http.get<any>(view_url);  // Returning any type

  }

}
