import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalTaxService {

 
   constructor(private http:HttpClient) { }
 
   add_professionalTaxSlab(data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Insert_professionalTaxSlab }`;
     return this.http.post<any>(view_url,data);  // Returning any type
   }

     get_professionalTaxSlab(fk_stateid: number | null, pageIndex: number , pageSize: number, searchTerm: string = ""):Observable<any> {
     let view_url = `${environment.baseURL1}${environment.payroll.Get_professionalTaxSlab}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
     if (fk_stateid !== null) {
      view_url += `&fk_stateid=${fk_stateid}`;
    }
     return this.http.get(view_url);  // Returning any type
   }
   

  
   update_professionalTaxSlab(data:any):Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Update_professionalTaxSlab}`;
     return this.http.put<any>(view_url,data);  // Returning any type
   }
 
 
   getById_professionalTaxSlab(pk_slabid:string):Observable<any>{
     const view_url = `${environment.baseURL1}${environment.payroll.GetById_professionalTaxSlab}/${pk_slabid}`;
     return  this.http.get<any[]>(view_url);
     }
 
   delete_professionalTaxSlab(pk_slabid: string): Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.Delete_professionalTaxSlab}/${pk_slabid}`;
     return this.http.delete<any>(view_url);
   }
 
 
   get_DropdownList(fieldName: string): Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
     return this.http.get(view_url);
   }
   DownloadExcel():Observable<any> {
     var pageIndex =0;
     var pageSize=100000;
     const view_url = `${environment.baseURL1}${environment.payroll.Get_professionalTaxSlab}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
 
     return this.http.get<any>(view_url);  // Returning any type
 
     }
 }
 