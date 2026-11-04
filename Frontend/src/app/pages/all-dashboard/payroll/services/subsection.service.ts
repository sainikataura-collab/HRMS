import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubsectionService {

  constructor(private http: HttpClient) { }

  // Insert Subsection
  addSubsectionMaster(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.SubSection_insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  // Get All Subsections with pagination
  getAllSubsections(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.SubSection_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  // Update Subsection
  updateSubsection(subsectionData: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.SubSection_update}`;
    return this.http.put<any>(apiUrl, subsectionData);
  }

  // Get Subsection by ID
  getSubsectionById(subsectionId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.SubSection_getbyId}/${subsectionId}`;
    return this.http.get<any>(apiUrl);
  }

  // Delete Subsection
  deleteSubsection(subsectionId: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.SubSection_delete}/${subsectionId}`;
    return this.http.delete<any>(apiUrl);
  }


  getDescription(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  // Check for duplicate values
  checkDuplicateValue(fieldName: string, fieldValue: string, subsectionId?: string): Observable<any> {
    let viewUrl = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (subsectionId) {
      viewUrl += `&generalId=${subsectionId}`;
    }
    return this.http.get(viewUrl);
  }

  // Download Excel
  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const viewUrl = `${environment.baseURL1}${environment.payroll.SubSection_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(viewUrl);  // Returning any type
  }
}