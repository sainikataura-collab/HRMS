import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperationalMasterService {

 constructor(private http:HttpClient) { }
 
  
     add_OperationalMaster(data: any): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll.Operational_insert}`;
      return this.http.post<any>(apiUrl, data);
    }

    getAllOperational(pageIndex: number, pageSize: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.Operational_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get<any>(url);
    }

    updateOperational(operationalId:any): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll.Operational_update}`;
      return this.http.put<any>(apiUrl, operationalId);
    }

    getOperationalById(operationalId: string): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll.Operational_getbyId}/${operationalId}`;
      return this.http.get<any>(apiUrl);
    }

    deleteOperational(operationalId: string): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.payroll.Operational_delete}/${operationalId}`;
      return this.http.delete<any>(apiUrl);
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
      const view_url = `${environment.baseURL1}${environment.payroll.Operational_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
      return this.http.get<any>(view_url);  // Returning any type
    
    }
}
