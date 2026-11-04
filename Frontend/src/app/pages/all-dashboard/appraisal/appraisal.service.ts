import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class appraisalService {

  constructor(private http: HttpClient) { }


 
 

  add_Reminder_Setup( data:any):Observable<any> {
       const view_url = `${environment.baseURL1}${environment.Appraisal.add_Reminder_Setup}`;
       return this.http.post<any>(view_url,data);  // Returning any type
     }
     
  // Insert appraisal
  insert_Appraisal(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Appraisal.insert_Appraisal}`;
    return this.http.post<any>(url, data);
  }

  // Get all appraisal with pagination
  getAll_Appraisal(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Appraisal.getAll_Appraisal}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  // Get appraisal by ID
  getById_Appraisal(pk_appId: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Appraisal.getById_Appraisal}/${pk_appId}`;
    return this.http.get<any>(url);
  }

  // Update appraisal
  update_Appraisal(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Appraisal.update_Appraisal}`;
    return this.http.put<any>(url, data);
  }

  // Delete appraisal
  delete_Appraisal(pk_appId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Appraisal.delete_Appraisal}/${pk_appId}`;
    return this.http.delete<any>(url);
  }

     CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
  
      return this.http.get(view_url);
    }

   get_DropdownList(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
        return this.http.get(view_url);
      }
      
  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const url = `${environment.baseURL1}${environment.Appraisal.getAll_Appraisal}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

    getRolewiseKRAReport(
    RoleId: string | null,
    pageIndex: number,
    pageSize: number,
    searchTerm: string | null
  ): Observable<any> {
    let apiUrl = `${environment.baseURL1}${environment.Appraisal.rolewiseKRA_Report}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    // Append fk_empId if provided
    if (RoleId !== null && RoleId.trim() !== '') {
      apiUrl += `&RoleId=${encodeURIComponent(RoleId)}`;
    }

    // Append searchTerm if provided
    if (searchTerm !== null && searchTerm.trim() !== '') {
      apiUrl += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<any>(apiUrl);
  }
 getAppraisalStatusList(
    
    pageIndex: number,
    pageSize: number,
    searchTerm: string | null
  ): Observable<any> {
    let apiUrl = `${environment.baseURL1}${environment.Appraisal.getAppraisalStatusList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
// Append searchTerm if provided
    if (searchTerm !== null && searchTerm.trim() !== '') {
      apiUrl += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<any>(apiUrl);
  }


 getAppraisalPdfData(empcode: string): Observable<any> {
  const url = `${environment.baseURL1}${environment.Appraisal.getAppraisalPdfData}?empcode=${encodeURIComponent(empcode)}`;
  return this.http.get<any>(url);
}

  getSelfAssessmentReport(

    pageIndex: number,
    pageSize: number,
    searchTerm: string | null
  ): Observable<any> {
    let apiUrl = `${environment.baseURL1}${environment.Appraisal.selfassessment_Report}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    // Append searchTerm if provided
    if (searchTerm !== null && searchTerm.trim() !== '') {
      apiUrl += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<any>(apiUrl);
  }

  



}
