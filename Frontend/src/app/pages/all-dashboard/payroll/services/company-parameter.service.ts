import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Idepartment } from '../Interface/icommon';

@Injectable({
  providedIn: 'root'
})
export class CompanyParameterService {
 

  constructor(private http:HttpClient) { }

  
add_companyparameter( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.add_companyparameter}`;
    return this.http.post<any>(view_url,data);  // Returning any type
}

getById_companyparameter(pk_companyId:string):Observable<any>{
  const view_url = `${environment.baseURL1}${environment.payroll.getById_companyparameter}/${pk_companyId}`;
  return  this.http.get<any[]>(view_url);
  }
  

//update leave
update_companyparameter(data: any): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.update_companyparameter}`;
  return this.http.put<any>(url, data);  // UPDATE operation
}

get_All_companyparameter(pageIndex: number,pageSize: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.get_All_companyparameter}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get(view_url);
}
 //download the excel
 DownloadExcel():Observable<any> {
  var pageIndex =0;
  var pageSize=100000;
  const view_url = `${environment.baseURL1}${environment.payroll.get_All_companyparameter}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  return this.http.get<any>(view_url);  // Returning any type

  }

  getEmployee(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }
  
    return this.http.get(view_url);
  }
  uploadCompanyLogo(formData: FormData) {
  return this.http.post<any>(
    `${environment.baseURL1}/CompanyConfig/UploadCompanyLogo`,
    formData
  );
}

uploadCompanyStamp(formData: FormData) {
    return this.http.post<any>(
      `${environment.baseURL1}/CompanyConfig/UploadCompanyStamp`,
      formData
    );
  }

   getImage(imageName: string): Observable<Blob> {
           const view_url = `${environment.baseURL1}${environment.payroll.User_image }/${imageName}`;
            return this.http.get(view_url, { responseType: 'blob' });
            }


}
