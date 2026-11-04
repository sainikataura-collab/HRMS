import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILeaveType } from '../Interface/icommon';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeMasterService {
 

  constructor(private http:HttpClient) { }


  add_LeaveType( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_LeaveType}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  
  update_LeaveType(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_LeaveType}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

  getLeaveTypeById(pk_leaveid: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_LeaveTypeById}/${pk_leaveid}`;
    return this.http.get(view_url);
  }
  
  getLeaveTypedetailsById(pk_leaveid: number,fk_natureid?:string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.get_LeaveTypeById}/${pk_leaveid}`;
    if(fk_natureid) {
      view_url += `?fk_natureid=${fk_natureid}`;

    }
    return this.http.get(view_url);
  }
  




  


  delete_LeaveType(pk_leaveid : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_LeaveType}/${pk_leaveid }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getLeaveNature(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  getEmployeeNature(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
  
  get_LeaveTypeList(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_LeaveTypeList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return  this.http.get<any>(view_url);
  }
 

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
  
    return this.http.get(view_url);
  }
  
  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_LeaveTypeList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

}


}
