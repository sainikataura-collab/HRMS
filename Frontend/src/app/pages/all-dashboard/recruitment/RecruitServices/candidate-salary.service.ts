import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateSalaryService {

  constructor(private http: HttpClient) { }


  add_CandidateSalary(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.Insert_CandidateSalary}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }


  get_CandidateSalary(page: number, pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.get_CandidateSalary}`;
    return this.http.get<any>(view_url);  // Returning any type
  }


  update_CandidateSalary(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.Update_CandidateSalary}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }


  delete_CandidateSalary(pk_recId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.delete_CandidateSalary}/${pk_recId}`;
    return this.http.delete<any>(view_url);  // Returning any type
  }

  // get_CandidateSalaryByid(pk_recId: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.Requitment.get_CandidateDetails}?pk_recId=${pk_recId}`;
  //   return this.http.get<any>(view_url);  // Returning any type
  //}

  get_CandidateSalaryByid(pk_recId: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Requitment.get_CandidateDetails}?pk_recId=${pk_recId}`;
  return this.http.get<any>(view_url);  // Returning any type
}

  get_CandidateNameSerach(candidatename: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.get_CandidateName}/${candidatename}`;
    return this.http.get<any>(view_url);  // Returning any type
  }


   get_ScreeningJobId(fk_jobid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Requitment.get_ScreeningApp}/?fk_jobid=${fk_jobid}`;
    return this.http.get(view_url);
  }








  

  // check dublicate data entry in descrption
  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }

    return this.http.get(view_url);
  }

  DownloadExcel(): Observable<any> {
    var pageIndex = 0;
    var pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.Requitment.get_CandidateSalary}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

  }



}
