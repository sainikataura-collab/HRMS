import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpwiseRptService {

  constructor(private http: HttpClient) { }
  getKRAReportList(
    fk_empId: string | null,
    pageIndex: number,
    pageSize: number,
    searchTerm: string | null
  ): Observable<any> {
    let apiUrl = `${environment.baseURL1}${environment.Appraisal.getAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    // Append fk_empId if provided
    if (fk_empId !== null && fk_empId.trim() !== '') {
      apiUrl += `&fk_empId=${encodeURIComponent(fk_empId)}`;
    }

    // Append searchTerm if provided
    if (searchTerm !== null && searchTerm.trim() !== '') {
      apiUrl += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<any>(apiUrl);
  }

  getCommanList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

}
