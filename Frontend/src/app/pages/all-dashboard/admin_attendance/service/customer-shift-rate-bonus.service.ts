import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerShiftRateBonusService {

  constructor(private http: HttpClient) { }

  // Get All Records
  getAll(filter: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CustomerShiftRateBonus_GetAll}`;
    return this.http.post<any>(url, filter);
  }

  get_CustomerShiftRateBonus(filter: any): Observable<any> {
    return this.getAll(filter);
  }

  // Get By Primary Key ID
  getById(id: number | string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CustomerShiftRateBonus_GetById}/${id}`;
    return this.http.get<any>(url);
  }

  get_CustomerShiftRateBonusById(id: number | string): Observable<any> {
    return this.getById(id);
  }

  // Insert Record
  insert(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CustomerShiftRateBonus_Insert}`;
    return this.http.post<any>(url, data);
  }

  add_CustomerShiftRateBonus(data: any): Observable<any> {
    return this.insert(data);
  }

  // Update Record
  update(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CustomerShiftRateBonus_Update}`;
    return this.http.post<any>(url, data);
  }

  update_CustomerShiftRateBonus(data: any): Observable<any> {
    return this.update(data);
  }

  // Delete Record
  delete(id: number | string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CustomerShiftRateBonus_Delete}/${id}`;
    return this.http.delete<any>(url);
  }

  delete_CustomerShiftRateBonus(id: number | string): Observable<any> {
    return this.delete(id);
  }

  // Dropdown Lists
  getDropdownList(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(url);
  }

  get_DropdownList(fieldName: string): Observable<any> {
    return this.getDropdownList(fieldName);
  }

  getClients(): Observable<any> {
    return this.getDropdownList('Client');
  }

  getLocations(): Observable<any> {
    return this.getDropdownList('Location');
  }

  getLocationsByClient(clientId: string): Observable<any> {
    const url = `${environment.baseURL1}/CustomerShiftRateBonus/GetLocationsByClient?clientId=${encodeURIComponent(clientId)}`;
    return this.http.get<any>(url);
  }

  getClientsByLocation(locationId: string): Observable<any> {
    const url = `${environment.baseURL1}/CustomerShiftRateBonus/GetClientsByLocation?locationId=${encodeURIComponent(locationId)}`;
    return this.http.get<any>(url);
  }

  // Bulk Insert / Excel Import
  bulkInsert(list: any[]): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.CustomerShiftRateBonus_BulkInsert}`;
    return this.http.post<any>(url, list);
  }

  import_CustomerShiftRateBonus(list: any[]): Observable<any> {
    return this.bulkInsert(list);
  }

  // Download Excel Export
  DownloadExcel(filter: any): Observable<any> {
    const exportFilter = { ...filter, pageIndex: 1, pageSize: 100000 };
    return this.getAll(exportFilter);
  }
}
