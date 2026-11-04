
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class BranchMstService {
 constructor(private http: HttpClient) { }

  getcommondropdown(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

 // ===================== INSERT =====================
insertBranch(data: any) {
  const view_url = `${environment.baseURL1}${environment.BranchMst}`;
  return this.http.post<any>(view_url, data);
}

// ===================== UPDATE =====================
updateBranch(data: any) {
  const view_url = `${environment.baseURL1}${environment.BranchMst}`;
  return this.http.put<any>(view_url, data);
}

// ===================== GET ALL =====================
get_All(pageIndex: number, pageSize: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.BranchMst}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get(view_url);
}

// ===================== DOWNLOAD EXCEL =====================
downloadExcel(): Observable<any> {
  const pageIndex = 0;
  const pageSize = 100000;

  const view_url = `${environment.baseURL1}${environment.BranchMst}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get(view_url);
}

// ===================== DELETE =====================
delete(pk_branchId: number): Observable<any> {
  const delete_url = `${environment.baseURL1}${environment.BranchMst}/${pk_branchId}`;
  return this.http.delete<any>(delete_url);
}

// ===================== GET BY ID =====================
getById(pk_branchId: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.BranchMst}/${pk_branchId}`;
  return this.http.get(view_url);
}


    GetDdlListBasedOnCodeType(codeTypeId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetDdlListBasedOnCodeType}?codeTypeId=${codeTypeId}`;
    return this.http.get<any>(view_url);
  }

   
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
}
