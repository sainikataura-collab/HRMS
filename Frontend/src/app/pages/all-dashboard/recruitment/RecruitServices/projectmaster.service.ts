import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectmasterService { 

  constructor(private http: HttpClient) { }

  // Insert Project Master
  add_ProjectMaster(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Project_insert}`;
    return this.http.post<any>(url, data);
  }

  // Get all Project Masters with pagination
  get_ProjectMaster(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Project_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  // Update Project Master
  update_ProjectMaster(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Project_update}`;
    return this.http.put<any>(url, data);
  }

  // Get Project Master by Id
  getById_ProjectMaster(pk_projectId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Project_getbyId}/${pk_projectId}`;
    return this.http.get<any>(url);
  }

  // Delete Project Master by Id
  delete_ProjectMaster(pk_projectId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Project_delete}/${pk_projectId}`;
    return this.http.delete<any>(url);
  }

  // Check duplicate value in a field
  CheckDuplicateValue(fieldName: string, fieldValue: string, projectId?: string): Observable<any> {
    let url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (projectId) {
      url += `&generalId=${projectId}`;
    }
    return this.http.get<any>(url);
  }

  // Download Excel (all projects)
  DownloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const url = `${environment.baseURL1}${environment.Requitment.Project_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }
}
