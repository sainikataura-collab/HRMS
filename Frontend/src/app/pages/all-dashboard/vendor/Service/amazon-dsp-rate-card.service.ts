import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AmazonDspBlockRateCard {
  pk_BlockRateCardID?: number;
  locationID?: string;
  locationName?: string;
   block?: string;
  blockName?: string;
  vehicleType?: string;
  vehicleTypeName?: string;
  rate?: string;
  effectiveFrom?: string | Date;
  fk_CompanyID?: string;
  dated?: string | Date | null;
  source?: string | null;
  filePath?: string | null;
  uploadTime?: string | Date | null;
  fk_InsUserID?: string;
  fk_UpdUserID?: string;
  fk_InsDateID?: string;
  fk_UpdDateID?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AmazonDspRateCardService {

  constructor(private http: HttpClient) { }

  getAll(pageIndex: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    const endpoint = (environment as any).AmazonDspBlockRateCard?.GetAll || '/AmazonDspBlockRateCard/GetAll';
    const url = `${environment.baseURL1}${endpoint}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get<any>(url);
  }

  getById(id: number | string): Observable<any> {
    const endpoint = (environment as any).AmazonDspBlockRateCard?.GetById || '/AmazonDspBlockRateCard/GetById';
    const url = `${environment.baseURL1}${endpoint}/${id}`;
    return this.http.get<any>(url);
  }

  insert(data: AmazonDspBlockRateCard): Observable<any> {
    const endpoint = (environment as any).AmazonDspBlockRateCard?.Insert || '/AmazonDspBlockRateCard/Insert';
    const url = `${environment.baseURL1}${endpoint}`;
    return this.http.post<any>(url, data);
  }

  update(data: AmazonDspBlockRateCard): Observable<any> {
    const endpoint = (environment as any).AmazonDspBlockRateCard?.Update || '/AmazonDspBlockRateCard/Update';
    const url = `${environment.baseURL1}${endpoint}`;
    return this.http.post<any>(url, data);
  }

  uploadBlockRateCardExcel(formData: FormData): Observable<any> {
    const url = `${environment.baseURL1}${environment.vendor.UploadBlockRateCard}`;
    return this.http.post<any>(url, formData);
  }

  // Dropdown helpers from General controller
  getDropdownList(fieldName: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get<any>(url);
  }

  getDdlListBasedOnCodeType(codeTypeId: string | number, organizationId: string = ''): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}&organizationId=${organizationId}`;
    return this.http.get<any>(url);
  }


  getExcelDocumentList(pageIndex: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    const endpoint = environment.vendor?.GetBlockRateCardExcelDocumentList ;
    const url = `${environment.baseURL1}${endpoint}?pageIndex=${pageIndex}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(searchTerm)}`;
    return this.http.get<any>(url);
  }

  downloadExcelDocument(id: number | string): Observable<Blob> {
    const endpoint = environment.vendor?.DownloadBlockRateCardExcelDocument;
    const url = `${environment.baseURL1}${endpoint}/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }
   
}
