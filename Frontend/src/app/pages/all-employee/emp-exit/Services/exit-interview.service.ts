import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ExitInterviewService {

    constructor(private http: HttpClient) { }

    insertExitInterview(data: any): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewInsert}`;

        return this.http.post<any>(apiUrl, data);
    }

    getAllExitInterviews(
        pageIndex: number,
        pageSize: number
    ): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getExitInterviewById(
        pk_exitInterviewId: number
    ): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewGetById}/${pk_exitInterviewId}`;

        return this.http.get<any>(apiUrl);
    }

    updateExitInterview(
        data: any
    ): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewUpdate}`;

        return this.http.put<any>(apiUrl, data);
    }

    deleteExitInterview(
        pk_exitInterviewId: number
    ): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewDelete}/${pk_exitInterviewId}`;

        return this.http.delete<any>(apiUrl);
    }

    downloadExcel(): Observable<any> {
        const pageIndex = 0;
        const pageSize = 100000;

        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getAllAdminHodExitInterviews(
        pageIndex: number,
        pageSize: number
    ): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewAdminHodGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getAdminHodExitInterviewByEmpId(
        empId: string
    ): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.ExitInterviewAdminHodView}/${empId}`;

        return this.http.get<any>(apiUrl);
    }
    downloadExitInterviewReportPdf(exitInterviewId: number) {
        return this.http.get(
            `${environment.baseURL1}${environment.Exit.ExitInterviewReportPdf}/${exitInterviewId}`,
            { responseType: 'blob' }
        );
    }
}