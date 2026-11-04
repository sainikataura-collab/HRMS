
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenerateLettersService {

  constructor(private http: HttpClient) { }
   insert( data:any):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.insert_letter}`;
        return this.http.post<any>(view_url,data);  // Returning any type
      }


     Getheads (companyId?: string): Observable<any> {
        let view_url = `${environment.baseURL1}${environment.HR.GetHeads}`;
        if (companyId) {
          view_url += `?companyId=${encodeURIComponent(companyId)}`;
        }
        return this.http.get(view_url);
      }

  getCandidateLetterGrid(
    pageIndex: number,
    pageSize: number,
    fk_formatid: number | null
  ): Observable<any> {
    const url = `${environment.baseURL1}${environment.HR.getCandidateLetterGrid}?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_formatid=${fk_formatid ?? ''}`;
    return this.http.get<any>(url);
  }
  delete(pk_trnid: number) {
  const url = `${environment.baseURL1}${environment.HR.delete}/${pk_trnid}`;
  return this.http.delete<any>(url);
}

 downloadFormat(pk_trnid: number): Observable<Blob> {
  return this.http.get(
    `${environment.baseURL1}${environment.HR.downloadletter}/${pk_trnid}`,
    { responseType: 'blob' }
  );
}

 getEmployeeById(fk_empId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.HR.SelectEmployee}/${fk_empId}`;
    return this.http.get<any>(url);
  }


 // ✅ CORRECTED PUBLISH METHOD
    publishLetter(pk_trnid: number): Observable<any> {
  const senderName = sessionStorage.getItem('username') ?? 'HR Team';

  const url = `${environment.baseURL1}${environment.HR.publishLetter}/${pk_trnid}`;

  return this.http.put(`${url}?senderName=${encodeURIComponent(senderName)}`, {});
}



}
