import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class functionalService{
 

    constructor(private http:HttpClient) { }
  // add functional master
    add_functionalMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Insert_functionalMaster }`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }

    // Get Functional master

    get_functionalMaster(pageIndex: number , pageSize: number):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Get_functionalMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get(view_url);  // Returning any type
    }

    // update functional master
   
    update_functionalMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Update_functionalMaster}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }
  

    // get by id or edit in functional master
  
    getById_functionalMaster(pk_functional_id:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.payroll.GetById_functionalMaster}/${pk_functional_id}`;
      return  this.http.get<any[]>(view_url);
      }

      // delete in functional master
  
    delete_functionalMaster(pk_functional_id: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Delete_functionalMaster}/${pk_functional_id}`;
      return this.http.delete<any>(view_url);
    }
  

    // check dublicate data entry in descrption
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
        const view_url = `${environment.baseURL1}${environment.payroll.Get_functionalMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
        return this.http.get<any>(view_url);  // Returning any type
    
        }
    
  
  


}
