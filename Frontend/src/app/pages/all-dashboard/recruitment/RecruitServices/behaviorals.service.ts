import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class BehavioralsService {

  constructor(private http:HttpClient) {}


    add_behavioralMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Requitment.Insert_behavioralMaster }`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }


    get_behavioralMaster(pageIndex: number , pageSize: number):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Requitment.Get_behavioralMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
          return this.http.get(view_url);  // Returning any type
        }



// update Behavioral master

    update_behavioralMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Requitment.Update_behavioralMaster}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }



    // get by id or edit in functional master

    getById_behavioralMaster(pk_behaveid:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.Requitment.GetById_behavioralMaster}/${pk_behaveid}`;
      return  this.http.get<any[]>(view_url);
      }

  // delete in functional master

    delete_behavioralMaster(pk_behaveid: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Requitment.Delete_behavioralMaster }/${pk_behaveid}`;
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
        const view_url = `${environment.baseURL1}${environment.Requitment.Get_behavioralMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(view_url);  // Returning any type

        }




}
