import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TniService {

 constructor(private http: HttpClient) { }

  //TNI SErvice


 getList(params: any): Observable<any[]> {
    const url = `${environment.baseURL1}${environment.Training.AdminList_TNI}`;
    return this.http.get<any[]>(url, { params });
  }

getApprovedTNI(subProgramId?: number): Observable<any> {
  let view_url = `${environment.baseURL1}${environment.Training.TNI_GetAll}`;
  if (subProgramId) {
    view_url += `?subProgramId=${subProgramId}`;
  }
  return this.http.get<any>(view_url);
}

takeAction(body: { 
  pk_TNIId: number; 
  TNILineId: number;      // ✅ new
  action: string; 
  adminComments?: string;
}): Observable<any> {
  const url = `${environment.baseURL1}${environment.Training.AdminAction_TNI}`;
  return this.http.post<any>(url, body);
}

}
