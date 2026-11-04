import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApproveManpowerRequisitionService {

  constructor(private http: HttpClient) { }

  // 🔹 Insert Approval
  insertManpowerApproval(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.insert_ManpowerApproval}`;
    return this.http.post<any>(apiUrl, data);
  }

  // 🔹 Get All Approvals (Add pagination if needed)
  getAllManpowerApprovals(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.getAll_ManpowerApproval}`;
    return this.http.get<any>(apiUrl);
  }

  // 🔹 Download Excel (Optional: Export Approval List)
  downloadApprovalExcel(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.getAll_ManpowerApproval}`;
    return this.http.get<any>(apiUrl);
  }
}
