import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeaveAssessmentService {
 

  constructor(private http:HttpClient) { }

  
 
  // saveLeaveAssignment(data: any): Observable<any> {
  //   const view_url = `${environment.baseURL}${environment.payroll.Department}`;
  //   return this.http.post<any>(view_url,data);  // Returning any type
  // }
//for employee
  getEmployee(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
  //get leave
  getLeave(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  //get employee details
  getEmployeeDetails(empCode: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getEmployeeDetails}/${empCode}`;
   
    return this.http.get<any>(view_url);
  }
//get leave  details
  getLeaveDetails(leaveid:string,empId:string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getLeaveDetails}/${empId }/${leaveid}`;
   
    return this.http.get<any>(view_url);
  }

//inset leave
add_leave( data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.addleave}`;
  return this.http.post<any>(view_url,data);  // Returning any type
}
//get All
get_All_leave(employeeId: string | null,pageIndex: number,pageSize: number): Observable<any> {
  let view_url = `${environment.baseURL1}${environment.payroll.get_All_leave}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  if (employeeId !== null) {
    view_url += `&employeeId=${employeeId}`;
  }
  return this.http.get(view_url);
}

getById_leave(pk_assignid:string):Observable<any>{
  const view_url = `${environment.baseURL1}${environment.payroll.getById_leave}/${pk_assignid}`;
  return  this.http.get<any[]>(view_url);
  }

//update leave
update_leave(data: any): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.update_leave}`;
  return this.http.put<any>(url, data);  // UPDATE operation
}
//delete  leave 
delete_leave(pk_assignid:string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.delete_leave}/${pk_assignid}`;
  return this.http.delete<any>(view_url);
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

 get_Employees_Ddlfor100(filters: any = {}): Observable<any> {
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
