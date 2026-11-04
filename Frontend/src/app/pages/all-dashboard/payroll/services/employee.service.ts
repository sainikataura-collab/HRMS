import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private baseUrl = `${environment.baseURL1}`;

  constructor(private http: HttpClient) { }

  DownloadSalarySlipPdf(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.DownloadSalarySlipPdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob'
  });
}

  
downloadViewSalaryReportlistforexportype1(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewSalaryReportlistfor1}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}

 CityByState (fieldName: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.CitybyStateList}/${fieldName}`;
          return this.http.get(view_url);
        }

        GenerateESIChallan(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GenerateESIChallan}`;
  return this.http.post(url, payload, {
    responseType: 'blob' //  important
  });
}

 GenerateGratuityPdf(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GenerateGratuityPdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}


GenerateBonusRegisterPdf(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GenerateBonusRegisterPdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' //  important
  });
}

DownloadOverTimePdf(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.DownloadOverTimePdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' //  important
  });
}



  // Get employees with pagination and filters (Now using POST method)
  get_Employees(pageIndex: number, pageSize: number, filters: any = {}): Observable<any> {
   const url = `${this.baseUrl}${environment.payroll.Employee_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
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
  Export_Employeelist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.Export_emplyeelist}`;
    return this.http.post<any>(url, requestBody);
  
  }

  downloadForm12Reportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadForm12Reportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}


   downloadViewSalaryReportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewSalaryReportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}


  Export_Attendancelist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.Export_attendance}`;
    return this.http.post<any>(url, requestBody);
  
  }
  downloadViewAttendanceReportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewAttendanceReportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}


DownloadPFForm3(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GeneratePfForm3}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}


 Export_Compliancelist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.Export_Compliancelist}`;
    return this.http.post<any>(url, requestBody);
  
  }


  
   DownloadcomplianceReport(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadComplianceExcel}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}


  // Export_Leavelist(requestBody:any){
  //   const url= `${this.baseUrl}${environment.payroll.Export_leave}`;
  //   return this.http.post<any>(url, requestBody);
  //   } 
 Export_Leavelist(requestBody: any, pageIndex: number = 0, pageSize: number = 10, searchTerm: string | null = null) {
    let url = `${this.baseUrl}${environment.payroll.Export_leave}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (searchTerm !== null && searchTerm.trim() !== '') {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    return this.http.post<any>(url, requestBody);
  }

// added by pp 8/10/2025 for leave report export
 downloadViewLeaveReportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewLeaveReportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}





   Change_WebUser(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.UserChangePassword}`;
    return this.http.post<any>(url, data);
}
 
  
  View_Canteenlist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.View_canteen}`;
    return this.http.post<any>(url, requestBody); 
  } 


  downloadViewCanteenReportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewCanteenReportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}

  Export_Canteenlist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.Export_canteen}`;
      return this.http.post(url, requestBody, {
        responseType: 'blob' //  important so Angular treats it as file
      });
 
} 

//ANJALI
DownloadMusterRollPdf(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.DownloadMusterRollPdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}

DownloadFORMDPdf(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.DownloadFORMDPdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}


  Export_Loanlist(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.Export_loan}`;
    return this.http.post<any>(url, requestBody);
  
  } 
  

   downloadViewLoanReportlist(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadViewLoanReportlist}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}

    Download_SalarySlip(requestBody:any){
    const url= `${this.baseUrl}${environment.HR.Download_SalarySlip}`;
    return this.http.post<any>(url, requestBody);
  
  }
  
  

   add_Employee_Image( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.Employee_Image_Upload}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
    Get_Employee_Image( pageIndex:number,pageSize:number):Observable<any> {
      const requestBody = {
        pageIndex: pageIndex || 0,
        pageSize: pageSize || 10,
      }
      const view_url = `${environment.baseURL1}${environment.HR.Employee_Image_Get}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      return this.http.post<any>(view_url,requestBody);  // Returning any type
    }
    
    Delete_Employee_Image( imgId:string):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.HR.Employee_Image_Delete}?imgId=${imgId}`;
      return this.http.delete<any>(view_url);  // Returning any type
    }

    getImage(imageName: string): Observable<Blob> {
      const view_url =` ${environment.baseURL1}${environment.HR.usr_image}/${imageName}`;
       return this.http.get(view_url, { responseType: 'blob' });
}

 Export_pdf(payload: any) {
    const url= `${this.baseUrl}${environment.payroll.Export_pdf}`;
  return this.http.post(url, payload, {
    responseType: 'blob' //  important so Angular treats it as file
  });
}
 
  
Export_IncomeTaxReport(requestBody: any) {
  const url = `${this.baseUrl}${environment.payroll.IncomeTaxReport}`;
  return this.http.post<any>(url, requestBody);
}
// added by pp 13/10/2025
downloadExport_IncomeTaxReport(body: any): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.payroll.downloadExport_IncomeTaxReport}`;
  return this.http.post(view_url, body, { responseType: 'blob' });
}


// frot he data 
// 
DownloadPdfFile(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.DownloadPdfFile}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}

//ragini code added
DownloadPdfFileV2(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.DownloadPdfFileV2}`;
  return this.http.post(url, payload, {
    responseType: 'blob' 
  });
}

DownloadForm5(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GenerateForm5}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}
DownloadForm10(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GenerateForm10}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}


GeneratePFStatement(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GeneratePFStatement}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}

GenerateESIStatement(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GenerateESIStatement}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}

GeneratePFform12A(payload: any) {
  const url = `${this.baseUrl}${environment.payroll.GeneratePFform12A}`;
  return this.http.post(url, payload, {
    responseType: 'blob' // ⚡ important
  });
}


  
GetCDOList(payload: any): Observable<any> {
  const url = `${this.baseUrl}${environment.payroll.GetCDOList}`;
  return this.http.post<any>(url, payload);
}


ImportCDOExcel(formData: FormData): Observable<any> {
  const url = `${this.baseUrl}${environment.payroll.ImportCDOExcel}`;
  return this.http.post<any>(url, formData);
}


LeaveTypeClientWise(fk_costcentreid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.LeaveTypeClientWise}/${fk_costcentreid}`;
    return this.http.get(view_url);
  }

  View_bill(requestBody:any){
    const url= `${this.baseUrl}${environment.payroll.View_bill}`;
    return this.http.post<any>(url, requestBody);
  
  }

  Save_bill(requestBody:any){
    const url= `${this.baseUrl}/ExportReport/SaveBillReportlist`;
    return this.http.post<any>(url, requestBody);
  }

  getBillGenerationList(requestBody:any){
    const url = `${this.baseUrl}/ExportReport/GetBillGenerationList`;
    return this.http.post<any>(url, requestBody);
  }

  getBillGenerationDetail(billId: string){
    const url = `${this.baseUrl}/ExportReport/GetBillGenerationDetail?billId=${billId}`;
    return this.http.get<any>(url);
  }

   
  downloadViewBillReportlist(body: any): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.payroll.downloadViewBillReportlist}`;
    return this.http.post(view_url, body, { responseType: 'blob' });
  }

  downloadBillGenerationExcel(body: any): Observable<Blob> {
    const url = `${this.baseUrl}/ExportReport/downloadBillGenerationExcel`;
    return this.http.post(url, body, { responseType: 'blob' });
  }

  downloadBillGenerationPDF(body: any): Observable<Blob> {
    const url = `${this.baseUrl}/ExportReport/downloadBillGenerationPDF`;
    return this.http.post(url, body, { responseType: 'blob' });
  }


}
