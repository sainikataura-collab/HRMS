import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadFileHistoryService {
  constructor(private http: HttpClient) {}

  saveUploadHistory(file: File, fileType: string, resultData?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('fileType', fileType);

    if (resultData !== undefined && resultData !== null) {
      formData.append('resultData', typeof resultData === 'string' ? resultData : JSON.stringify(resultData));
    }

    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    if (compId) {
      formData.append('companyId', compId);
    }

    const currentUserId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || sessionStorage.getItem('USERID') || localStorage.getItem('UserId') || '';
    if (currentUserId) {
      formData.append('userId', currentUserId);
    }

    const url = `${environment.baseURL1}${environment.vendor?.SaveUploadFileHistory || '/UploadFileHistory/SaveHistory'}`;
    return this.http.post<any>(url, formData);
  }

  getUploadHistory(fileType: string, pageIndex: number = 1, pageSize: number = 5): Observable<any> {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('CompanyId') || '';
    let url = `${environment.baseURL1}${environment.vendor?.GetUploadFileHistory || '/UploadFileHistory/GetHistory'}?fileType=${encodeURIComponent(fileType)}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (compId) {
      url += `&companyId=${encodeURIComponent(compId)}`;
    }
    return this.http.get<any>(url);
  }

  downloadFile(id: number): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.vendor.DownloadUploadFileHistory || '/UploadFileHistory/Download'}/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  viewFile(id: number): Observable<Blob> {
    const url = `${environment.baseURL1}${environment.vendor.ViewUploadFileHistory || '/UploadFileHistory/View'}/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
