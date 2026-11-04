import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobMasterService {

  constructor(private http: HttpClient) {}

  addJobMaster(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.JobMaster_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllJobMasters(pageIndex: number, pageSize: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.JobMaster_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(apiUrl);
  }

  updateJobMaster(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.JobMaster_update}`;
    return this.http.post<any>(apiUrl, data);
  }

  getJobMasterById(pk_JobId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.JobMaster_getbyId}/${pk_JobId}`;
    return this.http.get<any>(apiUrl);
  }

  deleteJobMaster(jobId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.JobMaster_delete}/${jobId}`;
    return this.http.delete<any>(apiUrl);
  }

   getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.Requitment.Appreciation_image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }

    checkDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
    return this.http.get(view_url);
  }

  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.Requitment.JobMaster_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);
  }

    get_Employees_Ddl(filters: any = {}): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
    
    // Construct request body based on filters
    const requestBody = {
      empCode: filters.empCode || "",
      empCodeManual: filters.empCodeManual || "",
      empName: filters.empName || "",
      selectedDepartments: filters.selectedDepartments || [],
      selectedDesignation: filters.selectedDesignation || "",
      selectedLocations: filters.selectedLocations || [],
      selectedNature: filters.selectedNature || "",
      selectedCity: filters.selectedCity || "",
      sortBy: filters.sortBy || "",
      empStatus: filters.empStatus || "B"
    };
    return this.http.post<any>(url, requestBody);
  }

    getdropDawn(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }
}
