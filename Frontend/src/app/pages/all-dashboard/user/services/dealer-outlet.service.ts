import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class
  DealerOutletService {

  constructor(private http: HttpClient) { }

  getcommondropdown(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  insertDealerOutlet(data: any) {
    const view_url = `${environment.baseURL1}${environment.dealerOutlet}`;
    return this.http.post<any>(view_url, data);
  }

  UpdateDealerOutlet(data: any) {
    const view_url = `${environment.baseURL1}${environment.dealerOutlet}`;
    return this.http.put<any>(view_url, data);
  }

  get_All(pageIndex: number, pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.dealerOutlet}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

    DownloadExcel(): Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.dealerOutlet}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

   
  delete(pk_dealerOutletId: number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.dealerOutlet}/${pk_dealerOutletId}`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

   getById(pk_dealerOutletId: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.dealerOutlet}/${pk_dealerOutletId}`;
      return this.http.get(view_url);
    }


    GetDdlListBasedOnCodeType(codeTypeId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}`;
    return this.http.get<any>(view_url);
  }

   
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
}


