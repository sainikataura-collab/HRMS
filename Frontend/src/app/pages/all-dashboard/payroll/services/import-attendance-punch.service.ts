import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImportAttendancePunchService {

  constructor(private http:HttpClient) { }
    
    PreviewSalaryHeadComparison(formData: FormData): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.PreviewSalaryHeadComparison}`;
    return this.http.post<any>(view_url, formData);
  }
  PreviewSalaryOtherHeadComparison(formData: FormData): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.PreviewSalaryOtherHeadComparison}`;
    return this.http.post<any>(view_url, formData);
  }
    exportExcel(): Observable<Blob> {
      const view_url = `${environment.baseURL}${environment.payroll.ExportMaster}`;
      return this.http.get(view_url, { responseType: 'blob' });  // Corrected type
    }
    
  add_Job( data:any):Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.BankMaster}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

  GetincentiveExportImport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportImportIncentive}`;
    return this.http.post<any>(view_url, body);
  }
   ExportincentiveHead(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportincentiveHead}`;
    return this.http.post<any>(view_url, body);
  }

  IncentiveHead_ForImport(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll.ImportincentiveHead}`;
    return this.http.post<any>(view_url, formData);
  }


  uploadFile(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll. employeeuploadexcel      }`;
    return this.http.post<any>(view_url, formData);
  }

  SAL_EmpAttendance_ForExportImport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.SAL_EmpAttendance_ForExportImport}`;
    return this.http.post<any>(view_url, body);
  }

  SAL_EmpAttendance_ForExport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.SAL_EmpAttendance_ForExport}`;
    return this.http.post<any>(view_url, body);
  }

  
  ExportSalaryHead(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.exportsalartHead}`;
    return this.http.post<any>(view_url, body);
  }

  SAL_EmpAttendance_ForImport(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll. SAL_EmpAttendance_ForImport      }`;
    return this.http.post<any>(view_url, formData);
  }

  GetEmpHeadExportImport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportImportSalaryHeadList}`;
    return this.http.post<any>(view_url, body);
  }

  salartHead_ForImport(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll. ImportSalaryHead      }`;
    return this.http.post<any>(view_url, formData);
  }
  GetEmpOtherDetailExportImport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_EmpOtherDetailsImpExp}`;
    return this.http.post<any>(view_url, body);
  }
EmpOtherDetailImport(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll.Import_EmpOtherDetailsImpExp      }`;
    return this.http.post<any>(view_url, formData);
  }

   //SalaryOtherHeadead
  ExportSalaryOtherHead(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportsalaryOtherHead}`;
    return this.http.post<any>(view_url, body);
  }

  GetEmpOtherHeadExportImport(body: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ExportImportSalaryOtherHeadList}`;
    return this.http.post<any>(view_url, body);
  }

  SalaryOtherHead_ForImport(formData: FormData): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.ImportSalaryOtherHead}`;
    return this.http.post<any>(view_url, formData);
  }
 //leave taken

    uploadFileLeaveTaken(formData: FormData): Observable<any> {
    debugger
    const view_url = `${environment.baseURL1}${environment.payroll. LeaveTakenuploadexcel}`;
    return this.http.post<any>(view_url, formData);
  }
}