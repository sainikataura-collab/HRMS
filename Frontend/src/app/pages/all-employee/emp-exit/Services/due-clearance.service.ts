import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DueClearanceService {

    constructor(private http: HttpClient) { }

    getHODClearanceList(pageIndex: number, pageSize: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.DueClearanceHODList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getHODClearanceByEmp(empId: string): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.DueClearanceHODByEmp}/${empId}`;

        return this.http.get<any>(apiUrl);
    }

    updateHODClearance(data: any): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.DueClearanceHODUpdate}`;

        return this.http.put<any>(apiUrl, data);
    }
    getDueClearanceList(pageIndex: number, pageSize: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.DueClearanceList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getDueClearance(empId?: string): Observable<any> {
        let apiUrl =
            `${environment.baseURL1}${environment.Exit.DueClearance}`;

        if (empId) {
            apiUrl =
                `${environment.baseURL1}${environment.Exit.GetClearanceByEmp}/${empId}`;
        }

        return this.http.get<any>(apiUrl);
    }

    getAdminClearanceStatusList(pageIndex: number, pageSize: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.AdminClearanceStatusList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    skipClearance(pk_seprequestId: number): Observable<any> {
        const apiUrl = `${environment.baseURL1}/DueClearance/SkipClearance/${pk_seprequestId}`;
        return this.http.post<any>(apiUrl, {});
    }

    downloadDueClearanceReportPdf(empId: string, isHOD: boolean = false): Observable<Blob> {
        let apiUrl = `${environment.baseURL1}/DueClearance/ReportPdf/${empId}`;
        if (isHOD) {
            apiUrl += '?isHOD=true';
        }
        return this.http.get(apiUrl, { responseType: 'blob' });
    }
}