import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HrPolicyService {

  constructor( private http:HttpClient) { }

  get_List(): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Hrdocument.Hrpolicy}`;
      return this.http.get<any>(view_url);
    }
    

    getrebateDoc(filename:string): Observable<Blob> {
   // const view_url ='' ${environment.baseURL1}${environment.Hrdocument.Get_Doc}?filename=${filename};
     const view_url = `${environment.baseURL1}${environment.Hrdocument.Get_Doc}?filename=${filename}`;
    return this.http.get(view_url,{ responseType: 'blob' });
  }
}
