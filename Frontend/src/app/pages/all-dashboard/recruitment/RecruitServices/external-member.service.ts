import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExternalMemberService {

  constructor(private http:HttpClient) { }
             add_externalMember( data:any):Observable<any> {
                  const view_url = `${environment.baseURL1}${environment.Requitment.add_externalMember}`;
                  return this.http.post<any>(view_url,data);  // Returning any type
                }
                get_externalMember(page: number, pageSize: number):Observable<any> {
                  const view_url = `${environment.baseURL1}${environment.Requitment.get_externalMember}`;
                  return this.http.get<any>(view_url);  // Returning any type
                }
                update_externalMember(data:any):Observable<any> {
                  const view_url = `${environment.baseURL1}${environment.Requitment.update_externalMember}`;
                  return this.http.put<any>(view_url,data);  // Returning any type
                }
                delete_externalMember(Pk_ExMemberId:string):Observable<any> {
                  const view_url = `${environment.baseURL1}${environment.Requitment.delete_externalMember}/${Pk_ExMemberId}`;
                  return this.http.delete<any>(view_url);  // Returning any type
                }


                get_externalMemberByid(Pk_ExMemberId:string):Observable<any> {
                  const view_url = `${environment.baseURL1}${environment.Requitment.get_externalMemberByid}/${Pk_ExMemberId}`;
                  return this.http.get<any>(view_url);  // Returning any type
                }


                 // check dublicate data entry in descrption
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }

     DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Requitment.get_externalMember}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
        return this.http.get<any>(view_url);  // Returning any type
    
        }
   


}
