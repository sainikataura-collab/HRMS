import { Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FNFserviceService {

   private baseUrl = `${environment.baseURL1}`;
  constructor(private http:HttpClient) { }
 getFnfList(requestBody: any) {
    const url = `${this.baseUrl}${environment.payroll.fnflist}`;
    return this.http.post<any>(url, requestBody);
  }


  downloadPdf(empId: string): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/FNF/download-pdf/${empId}`, {
    responseType: 'blob'
  });
}


 getFnfSettlementDetail(pk_empid: string) {
        return this.http.get<any>(
            environment.baseURL + environment.Exit.FnfSettlementGetDetail + '/' + pk_empid
        );
    }

    insertFnfSettlement(payload: any) {
        return this.http.post<any>(
            environment.baseURL + environment.Exit.FnfSettlementInsert,
            payload
        );
    }

    getFnfSettlementView(fk_empid: string) {
        return this.http.get<any>(
            environment.baseURL + environment.Exit.FnfSettlementView + '/' + fk_empid
        );
    }
}
