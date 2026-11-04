import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SalarySleepMessageService {
  constructor(private http: HttpClient) {}

  MonthSalSlip_Insert(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.MonthSalSlip_Insert}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }

  //subsection list
  getMonthlist(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  getYear(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  get_Salarylock(
    pageIndex1: number,
    pageSize1: number,
    pageIndex2: number,
    pageSize2: number,
    data: any
  ): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_Salarylock}?pageIndex1=${pageIndex1}&pageSize1=${pageSize1}&pageIndex2=${pageIndex2}&pageSize2=${pageSize2}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }
  get_emplyeeSalaryunlock(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_UnlockSalaryemplyeelist}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }

  get_emplyeeSalarylock(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_lockSalaryemplyeelist}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }

  //for the Salary Approved
  get_Salaryapproved(
    pageIndex1: number,
    pageSize1: number,
    pageIndex2: number,
    pageSize2: number,
    data: any
  ): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetsalaryApprovedList}?pageIndex1=${pageIndex1}&pageSize1=${pageSize1}&pageIndex2=${pageIndex2}&pageSize2=${pageSize2}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }
  get_emplyeeSalarydisapproved(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DisapproveSalaryEmplyeelist}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }

  get_emplyeeSalaryapproved(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.approveSalaryEmplyeelist}`;
    return this.http.post<any>(view_url, data); // Returning any type
  }


  

 /**
* Fetches both pending-payout and already-paid-out lists for a given month/year.
* Maps to: POST /api/v1/SalaryPayout/GetsalaryPayoutList
*/
  get_SalaryPayout(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.GetsalaryPayoutList}`;
    return this.http.post<any>(url, data);
  }

  /**
   * Marks the selected employees as paid out.
   * Maps to: POST /api/v1/SalaryPayout/ProcessSalaryPayout
   * Payload includes: selectedEmpIds[], fk_monthId, fk_yearId, ...filters
   */
  processSalaryPayout(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.ProcessSalaryPayout}`;
    return this.http.post<any>(url, data);
  }

  processSalaryUnPayout(data: any): Observable<any> {
    const url = `${environment.baseURL1}/SalaryPayout/ProcessSalaryUnPayout`;
    return this.http.post<any>(url, data);
  }

  /**
   * Downloads the salary payout Excel report.
   * Maps to: POST /api/v1/SalaryPayout/DownloadSalaryPayoutReport
   */
  downloadSalaryPayoutReport(data: any): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.payroll.DownloadSalaryPayoutReport}`;
    return this.http.post(url, data, { responseType: 'blob' });
  }

  downloadSalaryPayoutPdf(data: any): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.payroll.DownloadSalaryPayoutPdf}`;
    return this.http.post(url, data, { responseType: 'blob' });
  }


  getDropdownList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(view_url);
  }

}
