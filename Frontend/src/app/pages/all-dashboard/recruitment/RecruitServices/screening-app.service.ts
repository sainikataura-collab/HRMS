import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScreeningAppService {

 constructor(private http:HttpClient) { }
 
    getjob(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
        return this.http.get(view_url);
     }

    //  ScreeningApp?fk_jobid=GU-1

   get_ScreeningJobId(fk_jobid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.get_ScreeningApp}/?fk_jobid=${fk_jobid}`;
    return this.http.get(view_url);
  }



  //   get_ScreeningJobId(pageIndex: number,pageSize: number,fk_jobid: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.Requitment.get_ScreeningApp}?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_jobid=${fk_jobid}`;
  //   return this.http.get(view_url);
  // }

     update_ScreeningApp( data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Requitment.update_ScreeningApp}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }

}
