import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TaxDeductorService {

   constructor(private http: HttpClient) { }
      
    add_TaxDeductor(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.TaxDeductor_insert}`;
      return this.http.post<any>(url, data);
    }
    
    get_TaxDeductor(page: number, pageSize: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.TaxDeductor_getall}?pageIndex=${page}&pageSize=${pageSize}`;
      return this.http.get<any>(url);
    }
    
    update_TaxDeductor(id: number, data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.TaxDeductor_update}`;
      return this.http.put<any>(url, data);
    }
    
    get_TaxDeductorById(pk_dedid: string): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.TaxDeductor_getbyId}/${pk_dedid}`;
      return this.http.get<any>(url);
    }
    
    delete_TaxDeductor(pk_dedid: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.TaxDeductor_delete}/${pk_dedid}`;
      return this.http.delete<any>(url);
    }


    
   getdropDawn(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

    DownloadExcel():Observable<any> {
      var pageIndex =0;
      var pageSize=100000;
      const view_url = `${environment.baseURL1}${environment.payroll.State_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.get<any>(view_url);  // Returning any type
    
    }
}
