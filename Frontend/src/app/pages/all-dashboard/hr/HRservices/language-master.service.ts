import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LanguageMasterService {
  

  constructor(private http:HttpClient) { }
  // add Language master
      add_languageMaster(data:any):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.Insert_LanguageMaster }`;
        return this.http.post<any>(view_url,data);  // Returning any type
      }



       // Get Functional master

       get_languageMaster(pageIndex: number , pageSize: number):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.Get_LanguageMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        return this.http.get(view_url);  // Returning any type
      }
  

       // update functional master
   
    update_languageMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.Update_LanguageMaster}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }

    // get by id or edit in functional master

      getById_languageMaster(pk_langid:number):Observable<any>{
        const view_url=`${environment.baseURL1}${environment.HR.GetById_LanguageMaster}/${pk_langid}`;
        return this.http.get<any[]>(view_url);
      }

      
      // delete in functional master
  
    delete_languageMaster(pk_langid:number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.Delete_LanguageMaster}/${pk_langid}`;
      return this.http.delete<any>(view_url);
    }


      // check dublicate data entry in descrption
      CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: number): Observable<any> {
        let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
        if (generalId) {
          view_url += `&generalId=${generalId}`;
        }
      
        return this.http.get(view_url);
      }

    
    DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.HR.Get_LanguageMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
      return this.http.get<any>(view_url);  // Returning any type
  
      }
  
     

  
}
