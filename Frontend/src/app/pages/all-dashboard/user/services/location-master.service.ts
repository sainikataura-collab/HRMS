import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationMasterService {
 constructor(private http:HttpClient) { }
    
 
   //insert 
   add_location( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.add_location}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
//get the section 
 get_location(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_location}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get(view_url);
  }
  
 //delete the section 
  delete_location(pk_locid : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_location}/${pk_locid }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }
//get  the section  by id
  getlocationById(pk_locid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.getlocationById}/${pk_locid}`;
    return this.http.get(view_url);
  }
//update the section
  update_location(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.update_location}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

   //download the excel
   DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_location}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }

    //get employee
  getEmployee(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  getlocation(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  getcommondropdown(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }


  CityByState(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.CitybyStateList}/${fieldName}`;
    return this.http.get(view_url);
  }

 

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
  
    return this.http.get(view_url);
  }

  getIsLMVendorExpense(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.IsLMVendorExpense}`;
    return this.http.get(view_url);
  }


}

