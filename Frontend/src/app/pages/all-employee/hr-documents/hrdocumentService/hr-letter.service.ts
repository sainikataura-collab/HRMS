import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HrLetterService {

  constructor( private http:HttpClient) { }
  
    get_HrLetter(): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Hrdocument.get_HrLetter}`;
        return this.http.get<any>(view_url);
      }
      

   
      getEmployeeLetters(fk_empid: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Hrdocument.get_EmployeeLetters}/${encodeURIComponent(fk_empid)}`;
        return this.http.get<any>(view_url);
    }
  
      getHrdoc(filename:string): Observable<Blob> {
     // const view_url ='' ${environment.baseURL1}${environment.Hrdocument.Get_Doc}?filename=${filename};
       const view_url = `${environment.baseURL1}${environment.Hrdocument.getHrdoc
        
       }?filename=${filename}`;
      return this.http.get(view_url,{ responseType: 'blob' });
    }

      getImage(imageName: string): Observable<Blob> {
      const view_url = `${environment.baseURL1}${environment.Hrdocument.getHrdoc}/${imageName}`;
      return this.http.get(view_url, { responseType: 'blob' });
   }

   
  downloadFormat(pk_trnid: number): Observable<Blob> {
   return this.http.get(
     `${environment.baseURL1}${environment.Hrdocument.downloadletter}/${pk_trnid}`,
     { responseType: 'blob' }
   );
 }

 
 updateLetterStatus(pk_trnid: number, status: boolean,remark: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Hrdocument.UpdateStatus}?pk_trnid=${pk_trnid}&status=${status}&remark=${remark}`;
  return this.http.post<any>(view_url, {});
}



}
