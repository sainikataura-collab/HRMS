import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlexiBillApprovalService {



 constructor(private http: HttpClient) { }

  // 🔹 Insert Approval
  // insertManpowerApproval(data: any): Observable<any> {
  //   const apiUrl = `${environment.baseURL1}${environment.payroll.FlexiBillApprovalList}`;
  //   return this.http.post<any>(apiUrl, data);
  // }

  // 🔹 Get All Approvals (Add pagination if needed)
  // get_FlexiBill_List(): Observable<any> {
  //   const apiUrl = `${environment.baseURL1}${environment.payroll.FlexiBillApprovalList}`;
  //   return this.http.get<any>(apiUrl);
  // }


    get_FlexiBill_List(filters: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.FlexiBillApprovalList}`;
        return this.http.post(apiUrl, filters); // Send filters as a POST request
    }

  get_Employees(pageIndex: number, pageSize: number, filters: any = {}): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
   
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
    // userId: filters.userId || "",
     empStatus: filters.empStatus || ""
   };
   return this.http.post<any>(url, requestBody);
 }

   get_Flexi_bill_HeadById(flexibillheadByid: Number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.FlexiBillApproval_getDetails }/${flexibillheadByid}`;
    return this.http.get(view_url);
  }

  getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.HR.Image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }
insertApproval(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.payroll.FlexiBillApproval_Insert}`;
    return this.http.post<any>(apiUrl, data);
  }

}
