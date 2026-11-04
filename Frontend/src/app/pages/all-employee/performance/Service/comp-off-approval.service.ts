import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompOffApprovalService {

  constructor(private http: HttpClient) { }

  // Insert CompOff Approval
  insertCompOffApproval(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.insert_CompOffRequestApproval}`;
    return this.http.post<any>(url, data);
  }

  // Get All CompOff Approvals
  getAllCompOffApprovals(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.getAll_CompOffRequestApproval}`;
    return this.http.get<any>(url);
  }

  // Get CompOff Approval By ID
  getCompOffApprovalById(pk_applycompoffId: number): Observable<any> {
  const url = `${environment.baseURL1}${environment.Leave.getById_CompOffRequestApproval}/${pk_applycompoffId}`;
  return this.http.get<any>(url);
}

}
