import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankMasterService {

  constructor(private http:HttpClient) { }
   
   add_BankMaster( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Insert_bankMaster }`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    get_BankMaster(pageIndex: number, pageSize: number, searchTerm: string = ''):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Get_bankMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
      return this.http.get<any>(view_url);
    }
    getById_BankMaster(pk_BankId:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.payroll.GetById_bankMaster}/${pk_BankId}`;
      return  this.http.get<any[]>(view_url);
      }
    update_BankMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Update_bankMaster}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }
    delete_BankMaster(pk_BankId: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.Delete_bankMaster}/${pk_BankId}`;
      return this.http.delete<any>(view_url);
    }
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
    const view_url = `${environment.baseURL1}${environment.payroll.Get_bankMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }


}
