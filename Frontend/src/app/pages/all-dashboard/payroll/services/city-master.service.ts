import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CityMasterService {
 

  constructor(private http:HttpClient) { }

  
  add_City( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_City}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }



 
  // Get City List by State ID (Handles Null State)
  get_CityListByStateId(pageIndex: number, pageSize: number, fk_stateid: number | null, searchTerm: string = ''): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (fk_stateid !== null) {
      view_url += `&fk_stateid=${encodeURIComponent(fk_stateid)}`;
    }
    if (searchTerm) {
      view_url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    return this.http.get(view_url);
  }
    

  // get_CityListByStateId(pageIndex: number,pageSize: number,fk_stateid:number): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_stateid=${fk_stateid}`;
  //   return this.http.get(view_url);
  // }
  get_City(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get(view_url);
  }
  
 
  delete_City(pk_cityid : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_City}/${pk_cityid }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getCityById(pk_cityid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_CityById}/${pk_cityid}`;
    return this.http.get(view_url);
  }

  update_City(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_City}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

    // API call to fetch levels dynamically
    getStateList(fieldName: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
      return this.http.get(view_url);
    }



    
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
    
    DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
      return this.http.get<any>(view_url);  // Returning any type
  
 }

  


}
