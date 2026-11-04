import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) {}

  submitAccountData(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.Account_insert}`;  // Replace with your actual API URL
    return this.http.post(apiUrl, data);  // Replace 'data' with the actual data object to be sent to the API endpoint  
  }
  getAllAccounts(pageIndex: number , pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Account_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }
  
  updateAccount(account: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.Account_update}`;  // Ensure 'update' exists in environment
    return this.http.put<any>(apiUrl, account);
  }
   // Get account by ID
   getAccountById(account_id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.Account_getbyId}/${account_id}`;
    return this.http.get<any>(apiUrl);
  }
  
  deleteAccount(account_id: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.Account_delete}/${account_id}`;
    return this.http.delete<any>(apiUrl);
  }

  // Check for duplicate values
checkDuplicateValue(fieldName: string, fieldValue: string, account_id?: string): Observable<any> {
  let viewUrl = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
  if (account_id) {
    viewUrl += `&generalId=${account_id}`;
  }
  return this.http.get(viewUrl);
}


DownloadExcel():Observable<any> {
  var pageIndex =0;
  var pageSize=100000;
  const view_url = `${environment.baseURL1}${environment.payroll.Account_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  return this.http.get<any>(view_url);  // Returning any type

}
  

}
