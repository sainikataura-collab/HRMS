import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class VendorLiteService {

  private apiBaseUrl = environment.baseURL;
  private vendorLiteUrl = environment.vendorLite;
  private commonUrl = environment.CommonSearch;
  private settingUrl = environment.Setting;
  private payrollUrl = environment.payroll;

  constructor(private http: HttpClient) { }

  // ── VENDOR LITE ENDPOINTS ──────────────────────────────────────────────────

  getAllVendorLite(pageIndex: number, pageSize: number, searchTerm: string = ''): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${searchTerm}`);
  }

  getVendorLiteById(pk_recId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.GetById}/${pk_recId}`);
  }

  insertVendorLite(vendorModel: any): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.InsertVendorLite}`, vendorModel);
  }

  updateVendorLite(vendorModel: any): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.UpdateVendorLite}`, vendorModel);
  }

  uploadVendorDocuments(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.UploadDocuments}`, formData);
  }

  getVendorDocuments(vendorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.GetDocuments}/${vendorId}`);
  }

  deleteVendorDocument(pk_docId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.DeleteDocument}/${pk_docId}`);
  }

  downloadVendorDocumentBlob(pk_docId: number): Observable<Blob> {
    const url = `${this.apiBaseUrl}/VendorLite/DownloadVendorDocument/${pk_docId}`;
    return this.http.get(url, { responseType: 'blob' });
  }


  // ── COMMON & DROPDOWN ENDPOINTS (Reused from existing logic) ───────────────

  // // Used for getting Document Types (CodeTypeId = 9)
  // getDdlListBasedOnCodeType(codeTypeId: number, companyId: string = ''): Observable<any> {
  //   return this.http.get<any>(`${this.apiBaseUrl}${this.payrollUrl.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}&companyId=${companyId}`);
  // }

  // getDropdownList(fieldName: string): Observable<any> {
  //   return this.http.get<any>(`${this.apiBaseUrl}${this.commonUrl.DropdownList}?fieldname=${fieldName}`);
  // }

  // getCitiesByState(stateId: string): Observable<any> {
  //   return this.http.get<any>(`${this.apiBaseUrl}${this.payrollUrl.CitybyStateList}?StateId=${stateId}`);
  // }


  // Fetch dropdown list using General NameValueMapping API
  getDropdownList(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(url);
  }

  // Fetch city list based on State ID
  getCitiesByState(stateId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CitybyStateList}/${stateId}`;
    return this.http.get<any>(url);
  }

  // Fetch dropdown list based on code type ID
  getDdlListBasedOnCodeType(codeTypeId: string, organizationId: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}&organizationId=${organizationId}`;
    return this.http.get<any>(url);
  }
    uploadVendorLogo(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}${this.vendorLiteUrl.UploadVendorLogo}`, formData);
  }
}
