import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ZoneMasterService {
 

  constructor(private http:HttpClient) { }

  
  add_Zone( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_Zone}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }



 

  get_Zone(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_Zone}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_Zone}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }
  
 
  delete_Zone(zoneID : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_Zone}/${zoneID }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getZoneById(zoneID: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_ZoneById}/${zoneID}`;
    return this.http.get(view_url);
  }

  update_Zone(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_Zone}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

    // API call to fetch levels dynamically
    getZonalHR(fieldName: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
      return this.http.get(view_url);
    }


    // CheckDuplicateValue(fieldName: string,fieldValue: string,): Observable<any> {
    //   const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    //   return this.http.get(view_url);
    // }
    
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
    

  


}
