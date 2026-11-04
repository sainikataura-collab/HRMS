import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendorServiceMasterService {
  private readonly baseUrl = `${environment.baseURL1}/VendorService`;

  constructor(private http: HttpClient) { }

  getAll(filter: any): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceGetAll || '/VendorService/GetAll';
    return this.http.post<any>(`${environment.baseURL1}${endpoint}`, filter);
  }

  getById(id: number | string): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceGetById || '/VendorService/GetById';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}/${id}`);
  }

  insert(data: any): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceInsert || '/VendorService/Insert';
    return this.http.post<any>(`${environment.baseURL1}${endpoint}`, data);
  }

  update(data: any): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceUpdate || '/VendorService/Update';
    return this.http.post<any>(`${environment.baseURL1}${endpoint}`, data);
  }

  delete(id: number | string): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceDelete || '/VendorService/Delete';
    return this.http.delete<any>(`${environment.baseURL1}${endpoint}/${id}`);
  }

  getDropdownList(fieldName: string): Observable<any> {
    const endpoint = (environment as any).payroll?.DropdownList || '/General/dropdownList';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}/${fieldName}`);
  }

  getVendors(): Observable<any> {
    return this.getDropdownList('Vendor');
  }

  getLocations(): Observable<any> {
    return this.getDropdownList('Location');
  }

  getClients(): Observable<any> {
    return this.getDropdownList('Client');
  }

  getDdlListBasedOnCodeType(codeTypeId: string, organizationId: string = ''): Observable<any> {
    const endpoint = (environment as any).payroll?.GetDdlListBasedOnCodeType || '/General/GetDdlListBasedOnCodeType';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}?codeTypeId=${codeTypeId}&organizationId=${organizationId}`);
  }

  getLocationsByVendor(vendorId: string): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceGetLocationsByVendor || '/VendorService/GetLocationsByVendor';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}/${vendorId}`);
  }

  getClientsByLocation(locationIds: string): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceGetClientsByLocation || '/VendorService/GetClientsByLocation';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}/${locationIds}`);
  }

  uploadExcel(formData: FormData): Observable<any> {
    const endpoint = (environment as any).vendor?.VendorServiceUploadExcel || '/VendorService/UploadExcel';
    return this.http.post<any>(`${environment.baseURL1}${endpoint}`, formData);
  }
}
