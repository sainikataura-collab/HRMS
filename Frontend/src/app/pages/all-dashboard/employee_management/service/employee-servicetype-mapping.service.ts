import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ServiceTypeMappingModel {
  pk_servicetypeid?: number;
  serviceType: string;
  serviceTypeName?: string;
  esi: boolean;
  pf: boolean;
  lwf: boolean;
  pt: boolean;
  fk_CompanyID?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeServiceTypeMappingService {
  private readonly baseUrl = `${environment.baseURL1}/EmployeeServiceTypeMapping`;

  constructor(private http: HttpClient) { }

  getAll(filter: { pageIndex: number; pageSize: number; searchTerm?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/GetAll`, filter);
  }

  getById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  insert(data: ServiceTypeMappingModel): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Insert`, data);
  }

  update(data: ServiceTypeMappingModel): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Update`, data);
  }

  getServiceTypes(companyId: string = ''): Observable<any> {
    const endpoint = (environment as any).payroll?.GetDdlListBasedOnCodeType || '/General/GetDdlListBasedOnCodeType';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}?codeTypeId=14&organizationId=${companyId}`);
  }
}
