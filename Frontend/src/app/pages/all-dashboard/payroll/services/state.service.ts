import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor(private http: HttpClient) { }
 // Insert State
 addStateMaster(data: any): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.State_insert}`;
  return this.http.post<any>(apiUrl, data);
}

// Get All States with pagination
getAllStates(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.State_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
  return this.http.get<any>(url);
}

// Update State
updateState(stateData: any): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.State_update}`;
  return this.http.put<any>(apiUrl, stateData);
}

// Get State by ID
getStateById(stateId: string): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.State_getbyId}/${stateId}`;
  return this.http.get<any>(apiUrl);
}

// Delete State
deleteState(stateId: string): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.State_delete}/${stateId}`;
  return this.http.delete<any>(apiUrl);
}

// Check for duplicate values
checkDuplicateValue(fieldName: string, fieldValue: string, stateId?: string): Observable<any> {
  let viewUrl = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
  if (stateId) {
    viewUrl += `&generalId=${stateId}`;
  }
  return this.http.get(viewUrl);
}

  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.State_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);  // Returning any type
  }

  // Get Earning Heads
  getEarningHeads(): Observable<any> {
    const url = `${environment.baseURL1}/State/earning-heads`;
    return this.http.get<any>(url);
  }

}
