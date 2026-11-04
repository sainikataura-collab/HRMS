import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  constructor(private http: HttpClient) { }
   add_Candidate( data:any):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.add_Candidate}`;
        return this.http.post<any>(view_url,data);  // Returning any type
      }
    //get the section 
     get_Candidate(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.get_Candidate}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
        return this.http.get(view_url);
      }
      
     //delete the section 
      delete_Candidate(pk_formatid : number): Observable<any> {
        const delete_url = `${environment.baseURL1}${environment.HR.delete_Candidate}/${pk_formatid }`;
        return this.http.delete<any>(delete_url);  // Sending pk_id in URL
      }
    //get  the section  by id
      get_Candidate_ById(pk_formatid: number): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.get_Candidate_ById}/${pk_formatid}`;
        return this.http.get(view_url);
      }
    //update the section
    
      update_Candidate(data: any): Observable<any> {
        const url = `${environment.baseURL1}${environment.HR.update_Candidate}`;
        return this.http.put<any>(url, data);  // UPDATE operation
      }
       //download the excel
       DownloadExcel():Observable<any> {
         var pageIndex =0;
         var pageSize=100000;
         const view_url = `${environment.baseURL1}${environment.HR.get_Candidate}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     
         return this.http.get<any>(view_url);  // Returning any type
     
         }
         getEmployee(fieldName: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
          return this.http.get(view_url);
        }
  
} 
