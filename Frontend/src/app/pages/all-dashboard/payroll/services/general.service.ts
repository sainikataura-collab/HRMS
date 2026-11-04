import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor(private http: HttpClient) { }


  // Get all Geo records with pagination
  getAllGeneral(pageNumber: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}${environment.payroll.general}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }


  // GetListBasedOnCodeType(pageNumber: number, pageSize: number): Observable<any> {
  //   return this.http.get<any>(`${environment.baseURL}${environment.Master.GetListBasedOnCodeType}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  // }

  GetListBasedOnCodeType(codeTypeId: string, pageNumber: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}${environment.payroll.GetListBasedOnCodeType}?codeTypeId=${codeTypeId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }




  // Create a new Geo record
  generalPost(CodeTypeByName: any): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.payroll.generalPost}`;
    return this.http.post<any>(apiUrl, CodeTypeByName);
  }

  generalGetby(codeId: string, codeTypeId: string): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.payroll.generalPost}/${codeId}/${codeTypeId}`;
    return this.http.get<any>(apiUrl);
  }


  generalupdate(CodeTypeByName: any, codeTypeId: string): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.payroll.GeneralUpdate}/${codeTypeId}`;

    return this.http.put<any>(apiUrl, CodeTypeByName);
  }

  // GetDdlListBasedOnCodeType(codeTypeId:string): Observable<any> {
  //   const apiUrl = `${environment.baseURL}${environment.Master.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}`;
  //   return this.http.get<any>(apiUrl );
  // }

  // general.service.ts

  GetDdlListBasedOnCodeType(
    codeTypeId: string,
    organizationId?: number  //  Already optional
  ): Observable<any> {
    let params = new HttpParams().set('codeTypeId', codeTypeId);

    //  Add organizationId only if it's a valid number
    if (organizationId !== undefined && organizationId !== null && organizationId > 0) {
      params = params.set('organizationId', organizationId.toString());
    }

    return this.http.get(
      `${environment.baseURL}${environment.payroll.GetDdlListBasedOnCodeType}`,
      { params }
    );
  }

  // getDdlList(fieldName: string, referenceId: number = 0, extraColumnNeed: boolean = false): Observable<any> {
  //   const apiUrl = `${environment.baseURL}${environment.Master.GetDdlList}?fieldName=${fieldName}&referenceId=${referenceId}&extraColumnNeed=${extraColumnNeed}`;
  //   return this.http.get<any>(apiUrl );
  // }

  getDdlList(
    fieldName: string,
    referenceId?: number,
    extraColumnNeed?: boolean,
    isEditMode?: boolean,
    selectedIds?: string
  ) {
    return this.http.get<any>(`${environment.baseURL}${environment.payroll.GetDdlList}`, {
      params: {
        fieldName,
        referenceId: referenceId ?? '',
        extraColumnNeed: extraColumnNeed ?? false,
        isEditMode: isEditMode ?? false,
        selectedIds: selectedIds ?? ''
      }
    });
  }


  // https://localhost:7142/api/v1/General/IsValueAvailableInLSPGeneral/sdfdfsdf?codeTypeId=20&codeId=5
  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string, referenceId?: string, organizationId?: number): Observable<any> {
    if (referenceId == undefined || referenceId == null) referenceId = '';

    let view_url = `${environment.baseURL}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}&generalId=${generalId}&referenceId=${referenceId}`;
    if (organizationId !== undefined && organizationId !== null && organizationId > 0) {
      view_url += `&organizationId=${organizationId}`;
    }
    return this.http.get(view_url);
  }

  CheckDuplicateValueGeneral(codeDescription: string, codeTypeId: string, codeId: string,): Observable<any> {
    const view_url = `${environment.baseURL}${environment.payroll.IsValueAvailableInLSPGeneral}/${codeDescription}?codeTypeId=${codeTypeId}&codeId=${codeId}`;
    return this.http.get(view_url);
  }




}
