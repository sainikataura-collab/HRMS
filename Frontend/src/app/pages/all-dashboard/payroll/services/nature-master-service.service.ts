import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NatureMasterServiceService {

  constructor(private http:HttpClient) { }

  add_NatureMaster( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll. Insert_natureMaster }`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
  
    get_NatureMaster(pageIndex: number , pageSize: number):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Get_natureMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

      return this.http.get(view_url);  // Returning any type
    }

    getById_NatureMaster(pk_natureid:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.payroll.GetById_natureMaster}/${pk_natureid}`;
      return  this.http.get<any[]>(view_url);
      }
   
    update_NatureMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Update_natureMaster}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }

    delete_NatureMaster(pk_natureid:string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Delete_natureMaster}/${pk_natureid}`;
      return this.http.delete<any>(view_url);
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
        const view_url = `${environment.baseURL1}${environment.payroll.Get_natureMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
        return this.http.get<any>(view_url);  // Returning any type
    
        }
    
}
