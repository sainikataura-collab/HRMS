import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CostMasterService {

  constructor(private http: HttpClient) { }

  // Add Cost Master
  add_costMaster(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_CostMaster}`;
    return this.http.post<any>(view_url, data);
  }

  // Get Cost Master List with Pagination
  get_costMaster(pageIndex: number, pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_CostMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }

  // Update Cost Master
  update_costMaster(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_CostMaster}`;
    return this.http.put<any>(view_url, data);
  }

  // Get Cost Master by ID
  getById_costMaster(pk_cost_centre_id: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_CostMaster}/${pk_cost_centre_id}`;
    return this.http.get<any>(view_url);
  }

  // Delete Cost Master
  delete_costMaster(pk_cost_centre_id: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Delete_CostMaster}/${pk_cost_centre_id}`;
    return this.http.delete<any>(view_url);
  }

  // Check for duplicate value
  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get<any>(view_url);
  }

  // Download all Cost Master data for Excel
  DownloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.payroll.Get_CostMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }
}
