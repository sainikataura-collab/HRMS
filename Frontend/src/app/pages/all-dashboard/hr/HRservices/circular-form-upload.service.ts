import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class circularformService{
 constructor(private http:HttpClient) { }

 
 CommonDropDown(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}

  add_DocUpload( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.Insert_DocUpload}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

 
  get_DocUpload(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.get_DocUpload}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.HR.get_DocUpload}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);  // Returning any type

    }
  
 
  delete_DocUpload(departmentId : number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.HR.delete_DocUpload }/${departmentId }`;
    return this.http.delete<any>(delete_url);
  }
  getImage(imageName: string): Observable<Blob> {
      const view_url = `${environment.baseURL1}${environment.HR.user_image}/${imageName}`;
      return this.http.get(view_url, { responseType: 'blob' });
   }

  get_DocUploadById(pk_UploadId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.HR.get_DocUploadById }/${pk_UploadId}`;
    return this.http.get(view_url);
  }

  update_DocUpload(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.HR.Update_DocUpload}`;
    return this.http.put<any>(url, data);  
  }
}
