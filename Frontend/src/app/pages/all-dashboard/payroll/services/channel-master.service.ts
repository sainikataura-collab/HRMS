import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChannelMasterService {

  constructor(private http: HttpClient) { }
   
  add_ChannelMaster(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_channelMaster}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }

  get_ChannelMaster(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_channelMaster}`;
    return this.http.get<any>(view_url);  // Returning any type
  }

  getById_ChannelMaster(pk_ChannelId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_channelMaster}/${pk_ChannelId}`;
    return this.http.get<any[]>(view_url);
  }

  update_ChannelMaster(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_channelMaster}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }

  delete_ChannelMaster(pk_ChannelId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Delete_channelMaster}/${pk_ChannelId}`;
    return this.http.delete<any>(view_url);
  }

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    
    return this.http.get(view_url);
  }

  DownloadExcel(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_channelMaster}`;
    return this.http.get<any>(view_url);  // Returning any type
  }
}