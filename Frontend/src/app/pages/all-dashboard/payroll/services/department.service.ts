import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
 

  constructor(private http:HttpClient) { }

  
  add_department( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Department}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

 
  getDepartment(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.gellAllDepartment}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get(view_url);
  }

  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.gellAllDepartment}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }
  
 
  deleteDepartment(departmentId : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.deleteDepartment }/${departmentId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getDepartmentById(departmentId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.deleteDepartment }/${departmentId}`;
    return this.http.get(view_url);
  }

  update_department(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Department}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

  getHODList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }


  
  // for sub Department master

  add_subdepartment( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_SubDepartment}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

 
  get_subdepartment(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_SubDepartment}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

  DownloadExcelSubDepartment():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_SubDepartment}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }
  
  delete_SubDepartment(departmentId : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_SubDepartment }/${departmentId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  get_SubDepartmentById(departmentId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_SubDepartmentById }/${departmentId}`;
    return this.http.get(view_url);
  }

  update_Subdepartment(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_SubDepartment}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }
 
  getCommonList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

 


  
 


}


