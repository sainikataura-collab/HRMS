import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { insert } from '@amcharts/amcharts5/.internal/core/util/Array';

@Injectable({
  providedIn: 'root'
})
export class DueckaranceServiceService {

  constructor(private http:HttpClient) { }



   GetAll (pageIndex: number , pageSize: number):Observable<any> {
          const view_url = `${environment.baseURL1}${environment. Exit.GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
          return this.http.get(view_url);  // Returning any type
        }

         delete_ClaranceUser(pk_deptUserId: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Exit.delete_ClaranceUser}/${pk_deptUserId}`;
    return this.http.delete<any>(url);
  }



 addClearance(data: any): Observable<any> {
            const apiUrl = `${environment.baseURL1}${environment.Exit.addClearance}`;
            return this.http.post<any>(apiUrl, data);

      }

        updateClearance(data: any) : Observable<any> {
      const url = `${environment.baseURL1}${environment.Exit.updateClearance}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }


    getByIdClearanceUser(pk_deptUserId:number):Observable<any>{
      //const url=`${environment.baseURL1}${environment.Exit.getByIdClearanceUser}/${pk_deptUserId}`;
       const view_url = `${environment.baseURL1}${environment.Exit.getByIdClearanceUser}/${pk_deptUserId}`;
      return this.http.get<any[]>(view_url);

    }

    DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000000;
        const view_url = `${environment.baseURL1}${environment.Exit.GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(view_url);  // Returning any type

        }


}



