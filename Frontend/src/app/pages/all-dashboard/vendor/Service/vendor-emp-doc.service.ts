import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendorEmpDocService {

  private apiBaseUrl = environment.baseURL;
  private vendorEmpDocUrl = (environment as any).vendorEmployeeDoc;
  private commonUrl = environment.CommonSearch;
  private payrollUrl = environment.payroll;

  constructor(private http: HttpClient) { }

  // ── VENDOR SIDE ──────────────────────────────────────────────────────────

  getVendorEmpDocList(searchTerm: string = '', pageIndex: number = 0, pageSize: number = 20, vendorId: string = ''): Observable<any> {
    const endpoint = this.vendorEmpDocUrl?.GetVendorEmpDocList || '/VendorEmployeeDoc/GetVendorEmpDocList';
    const url = `${this.apiBaseUrl}${endpoint}?searchTerm=${encodeURIComponent(searchTerm)}&pageIndex=${pageIndex}&pageSize=${pageSize}&vendorId=${encodeURIComponent(vendorId)}`;
    return this.http.get<any>(url);
  }

  // ── HR / ADMIN SIDE ──────────────────────────────────────────────────────

  getHREmpDocList(
    vendorId: string = '',
    locationId: string = '',
    status: string = '',
    searchTerm: string = '',
    pageIndex: number = 0,
    pageSize: number = 20
  ): Observable<any> {
    const vId = vendorId && vendorId !== 'null' && vendorId !== 'undefined' ? vendorId : '';
    const lId = locationId && locationId !== 'null' && locationId !== 'undefined' ? locationId : '';
    const st = status && status !== 'null' && status !== 'undefined' ? status : '';
    const term = searchTerm && searchTerm !== 'null' && searchTerm !== 'undefined' ? searchTerm : '';

    const endpoint = this.vendorEmpDocUrl?.GetHREmpDocList || '/VendorEmployeeDoc/GetHREmpDocList';
    const url = `${this.apiBaseUrl}${endpoint}?vendorId=${encodeURIComponent(vId)}&locationId=${encodeURIComponent(lId)}&status=${encodeURIComponent(st)}&searchTerm=${encodeURIComponent(term)}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  exportHREmpDocList(
    vendorId: string = '',
    locationId: string = '',
    status: string = '',
    searchTerm: string = ''
  ): Observable<any> {
    const vId = vendorId && vendorId !== 'null' && vendorId !== 'undefined' ? vendorId : '';
    const lId = locationId && locationId !== 'null' && locationId !== 'undefined' ? locationId : '';
    const st = status && status !== 'null' && status !== 'undefined' ? status : '';
    const term = searchTerm && searchTerm !== 'null' && searchTerm !== 'undefined' ? searchTerm : '';

    const endpoint = this.vendorEmpDocUrl?.ExportHREmpDocList || '/VendorEmployeeDoc/ExportHREmpDocList';
    const url = `${this.apiBaseUrl}${endpoint}?vendorId=${encodeURIComponent(vId)}&locationId=${encodeURIComponent(lId)}&status=${encodeURIComponent(st)}&searchTerm=${encodeURIComponent(term)}`;
    return this.http.get<any>(url);
  }

  // ── DOCUMENTS BY EMPLOYEE ────────────────────────────────────────────────

  getDocsByEmpAndVendor(empId: string, vendorId: string = ''): Observable<any> {
    const endpoint = this.vendorEmpDocUrl?.GetDocsByEmpAndVendor || '/VendorEmployeeDoc/GetDocsByEmpAndVendor';
    const url = `${this.apiBaseUrl}${endpoint}?empId=${encodeURIComponent(empId)}&vendorId=${encodeURIComponent(vendorId)}`;
    return this.http.get<any>(url);
  }

  // ── UPLOAD DOCUMENTS ─────────────────────────────────────────────────────

  uploadEmployeeDocuments(formData: FormData): Observable<any> {
    const endpoint = this.vendorEmpDocUrl?.UploadEmployeeDocuments || '/VendorEmployeeDoc/UploadEmployeeDocuments';
    return this.http.post<any>(`${this.apiBaseUrl}${endpoint}`, formData);
  }

  // ── APPROVE / REJECT STATUS ──────────────────────────────────────────────

  updateDocStatus(payload: { pk_docId: number; status: string; rejectionRemarks?: string }): Observable<any> {
    const endpoint = this.vendorEmpDocUrl?.UpdateDocStatus || '/VendorEmployeeDoc/UpdateDocStatus';
    return this.http.post<any>(`${this.apiBaseUrl}${endpoint}`, payload);
  }

  // ── GET USER ROLE INFO (IS VENDOR CHECK) ───────────────────────────────────

  getUserRoleInfo(): Observable<any> {
    const endpoint = '/VendorEmployeeDoc/GetUserRoleInfo';
    return this.http.get<any>(`${this.apiBaseUrl}${endpoint}`);
  }

  // ── DELETE DOCUMENT ───────────────────────────────────────────────────────

  deleteDocument(pk_docId: number): Observable<any> {
    const endpoint = this.vendorEmpDocUrl?.DeleteDocument || '/VendorEmployeeDoc/DeleteDocument';
    return this.http.delete<any>(`${this.apiBaseUrl}${endpoint}/${pk_docId}`);
  }

  // ── DOWNLOAD / VIEW URL ──────────────────────────────────────────────────

  getDownloadUrl(pk_docId: number): string {
    const endpoint = this.vendorEmpDocUrl?.DownloadDocument || '/VendorEmployeeDoc/DownloadDocument';
    return `${this.apiBaseUrl}${endpoint}/${pk_docId}`;
  }

  downloadFileBlob(pk_docId: number): Observable<Blob> {
    const url = this.getDownloadUrl(pk_docId);
    return this.http.get(url, { responseType: 'blob' });
  }

  markDocAsViewed(pk_docId: number): Observable<any> {
    const endpoint = '/VendorEmployeeDoc/MarkDocAsViewed';
    return this.http.post<any>(`${this.apiBaseUrl}${endpoint}/${pk_docId}`, {});
  }

  // ── COMMON & DROPDOWN HELPER METHODS ────────────────────────────────────

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
  getDdlListBasedOnCodeType(codeTypeId: string | number, organizationId: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}&organizationId=${organizationId}`;
    return this.http.get<any>(url);
  }

  getDocumentTypes(): Observable<any> {
    return this.getDdlListBasedOnCodeType('22');
  }

  getVendors(): Observable<any> {
    return this.getDropdownList('Vendor');
  }

  getLocations(): Observable<any> {
    return this.getDropdownList('Location');
  }

  getEmployees(vendorId: string = '', searchTerm: string = ''): Observable<any> {
    const endpoint = this.vendorEmpDocUrl?.GetEmployeesByVendor || '/VendorEmployeeDoc/GetEmployeesByVendor';
    const url = `${this.apiBaseUrl}${endpoint}?vendorId=${encodeURIComponent(vendorId)}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get<any>(url);
  }
}
