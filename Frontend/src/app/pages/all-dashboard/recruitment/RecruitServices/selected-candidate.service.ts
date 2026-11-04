import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SelectedCandidateService {

  constructor(private http: HttpClient) {}

  // Insert or update final selection status
  updateFinalSelectionStatus(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.SelectedCandidate_update }`;
    return this.http.put<any>(url, data);
  }

  // Get final selected candidates by Job ID
  getFinalSelectedCandidatesByJobId(fk_jobid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.SelectedCandidate_getById}/${fk_jobid}`;
    return this.http.get<any>(url);
  }

  // Get job dropdown list by field name
  getjob(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(url);
  }
}
