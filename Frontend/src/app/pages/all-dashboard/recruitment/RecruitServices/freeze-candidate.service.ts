import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FreezeCandidateService {

  constructor(private http: HttpClient) {}

  // Update freezing final status
  updateFreezingFinalStatus(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.FreezeCandidate_update}`;
    return this.http.put<any>(url, data);
  }

  // Get freezing final status by Job ID
  getFreezingFinalStatusByJobId(fk_jobid: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.FreezeCandidate_getById}/${fk_jobid}`;
    return this.http.get<any>(url);
  }

     getjob(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
        return this.http.get(view_url);
     }

}
