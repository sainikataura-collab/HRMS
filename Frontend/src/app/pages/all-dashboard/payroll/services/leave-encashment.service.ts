import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeaveEncashmentService {
constructor(private http:HttpClient) { }
      
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
    
        getEmployee(fieldName: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
          return this.http.get(view_url);
        }
       //get employee details
  getEmployeeDetails(empCode: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getEmployeeDetails}/${empCode}`;
   
    return this.http.get<any>(view_url);
  } 
        //get leave
  getLeave(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

     //get month list
getMonthlist(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}

getYear(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}
 
         //inset leave
    add_LeaveEncash( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.add_LeaveEncash}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    //get All
    get_All_LeaveEncash(fk_empid: string | null,pageIndex: number,pageSize: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.get_All_LeaveEncash}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      if (fk_empid!== null) {
        view_url += `&fk_empid=${fk_empid}`;
        console.log('API URL:', view_url); // Debugging the URL
      }
      return this.http.get(view_url);
    }
    
    getById_LeaveEncash(pk_encashid:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.payroll.getById_LeaveEncash}/${pk_encashid}`;
      return  this.http.get<any[]>(view_url);
      }
    
    //update leave
    update_LeaveEncash(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.update_LeaveEncash}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }
    //delete  leave 
    delete_LeaveEncash(pk_encashid:string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.delete_LeaveEncash}/${pk_encashid}`;
      return this.http.delete<any>(view_url);
    }
    
     //download the excel
     DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.payroll.get_All_LeaveEncash}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
      return this.http.get<any>(view_url);  // Returning any type
    
      }
    
  //balance leave
  getBalanceLeave(fk_empid: string, fk_leaveid:Number): Observable<any> {
    
    const view_url = `${environment.baseURL1}${environment.payroll.getBalanceLeave}/${fk_empid}/${fk_leaveid}`;
    return this.http.get<any>(view_url);
    }


    // calculate encashment amount
calculateLeaveEncashmentAmount(data: any): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.calculateLeaveEncashment}`;
  return this.http.post<any>(url, data);
}




}



