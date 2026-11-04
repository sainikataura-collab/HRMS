import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompensationService {

  constructor(private http: HttpClient) { }

    get_RebateDocList(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_RebateDocumentList}`;
    return this.http.get<any>(view_url);
  }
    getsectionddl(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_sectionDropdown}`;
    return this.http.get(view_url);
  }
      getsubsectionddl(pk_secid:string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_subsectionDropdown}?pk_secid=${pk_secid}`;
    return this.http.get(view_url);
  }
  
  insert_RebateDocument(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.insert_RebateDocument}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }

 getrebateDoc(filename:string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_RebateDoc}?filename=${filename}`;
    return this.http.get(view_url,{ responseType: 'blob' });
  }
  
 getByIdrebateDoc(pk_docid:Number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_RebateDocById}?pk_docid=${pk_docid}`;
    return this.http.get(view_url);
  }
  

    Update_RebateDocument(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Update_RebateDocById}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }


    get_TaxDocList(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_TaxComputationlist}`;
    return this.http.get<any>(view_url);
  }

      get_finyear(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_Finyear}`;
    return this.http.get<any>(view_url);
  }

   getHeadNameDetails(pk_headId:string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_HeadNamedetails}?pk_headId=${pk_headId}`;
    return this.http.get(view_url);
  }
  

     getEmp_Payslip(fk_monthid:string,fk_yearid:string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_Emp_Salary_PaySlip}?fk_monthid=${fk_monthid}&fk_yearid=${fk_yearid}`;
    return this.http.get(view_url);
  }

    getEmp_PFSavingIncomeTax(fk_finid:string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Compensation.Get_ConsolidatedSalary}?fk_finid=${fk_finid}`;
    return this.http.get(view_url);
  }

  Download_SalarySlip_ForEmployee(fk_monthid: string, fk_yearid: string) {
    const url = `${environment.baseURL1}${environment.Compensation.Download_salaryslip_ForEmployee}?fk_monthid=${fk_monthid}&fk_yearid=${fk_yearid}`;
    return this.http.post<any>(url, {});
  }

  Download_SalarySlip_Pdf_ForEmployee(fk_monthid: string, fk_yearid: string): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.Compensation.Download_salaryslip_pdf_ForEmployee}?fk_monthid=${fk_monthid}&fk_yearid=${fk_yearid}`;
    return this.http.post(url, {}, { responseType: 'blob' });
  }
  //added new 
  Export_pdf(payload: any) {
    const url= `${environment.baseURL1}${environment.payroll.Export_pdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' //  important so Angular treats it as file
  });
}


 getActiveModules(): Observable<any> {
   const view_url = `${environment.baseURL1}${environment.Compensation.GetActiveModules}`;
    return this.http.get(view_url);
    // return this.http.get<any>(`${this.baseUrl}/GetActiveModules`);
  }

  updateTaxRegime(taxRegime: string): Observable<any> {
  const url = `${environment.baseURL1}${environment.Compensation.UpdateAsyncTaxReigme}?TaxRegime=${taxRegime}`;
  // // api/v1/TaxRegism/UpdateAsync?TaxRegime=${taxRegime}`;
  return this.http.put<any>(url, {});  // PUT with empty body
}
}
