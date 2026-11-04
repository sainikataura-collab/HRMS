import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QualificationDetailService {

  constructor(private http:HttpClient) { }
     
   
   add_ExperienceDetails( data:any):Observable<any> {
         const view_url = `${environment.baseURL1}${environment.payroll.Insert_EmpQualif}`;
         return this.http.post<any>(view_url,data);  // Returning any type
  }

    update_QualificationDetails(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.Update_EmpQualif}`;
      return this.http.put<any>(url, data);  // UPDATE operation
    }
    
    getQualificationById(pk_empqualid: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.gellAll_EmpQualifbyId}/${pk_empqualid}`;
      return this.http.get(view_url);
    }

   

  // getEmpList(fieldName: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  //   return this.http.get(view_url);

  // }

  getEmpList(filters: any = {}): Observable<any> {
    const url =` ${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddlfor100}`;
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
       empStatus: filters.empStatus || "B",
        search: filters.search || "",
      pageNo: filters.pageNo || 1,
      pageSize: filters.pageSize || 100
     };
     return this.http.post<any>(url, requestBody);
   }

  //  getQualificationListBasedOnSelectedEmployee(fk_empid: string | null, pageIndex: number, pageSize: number): Observable<any> {
  //   const view_url = `${environment.baseURL1}/QualificationDetails?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_empid=${fk_empid}`;
    
  //   return this.http.get<any>(view_url);
  // }


  getQualificationListBasedOnSelectedEmployee(
    fk_empid: string | null,  pageIndex: number,  pageSize: number ): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.gellAllEmpQualif}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
    if (fk_empid !== null) {
      view_url += `&fk_empid=${fk_empid}`;
    }
  
    return this.http.get<any>(view_url);
  }
  

  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.gellAllEmpQualif}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }





  delete_QualificationDetails(pk_empqualid : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.payroll.deleteEmpQualif}/${pk_empqualid }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }
  
}
