import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LWFSlabMasterService {
 

  constructor(private http:HttpClient) { }

  
  add_LwfSalb( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_LWFSlab}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }



 

   get_LwfSalb(fk_stateid: number | null, pageIndex: number, pageSize: number, searchTerm: string = ""): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.get_All_LWFSlab}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
    if (fk_stateid !== null && fk_stateid !== undefined) {
      view_url += `&fk_stateid=${fk_stateid}`;
    }
    return this.http.get(view_url);
  }
 
  delete_LwfSalb(slabId : number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.delete_LWFSlab}/${slabId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getLwfSlabById(slabId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_ByIdLWFSlab}/${slabId}`;
    return this.http.get(view_url);
  }

  update_LwfSalb(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Update_LWFSlab}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

   // API call to fetch levels dynamically
   getStateList(fieldName: string): Observable<any> {
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
    

    DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
      return this.http.get<any>(view_url);  // Returning any type
  
    }

  


}
