import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NoDueDeclarationService {

    constructor(private http: HttpClient) { }

    getAllNoDueDeclarations(pageIndex: number, pageSize: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getEmpDetails(): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationGetEmpDetails}`;

        return this.http.get<any>(apiUrl);
    }

    insertNoDueDeclaration(data: any): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationInsert}`;

        return this.http.post<any>(apiUrl, data);
    }

    updateNoDueDeclaration(data: any): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationUpdate}`;

        return this.http.put<any>(apiUrl, data);
    }

    deleteNoDueDeclaration(id: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationDelete}/${id}`;

        return this.http.delete<any>(apiUrl);
    }

    getNoDueDeclarationById(id: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationGetById}/${id}`;

        return this.http.get<any>(apiUrl);
    }

    getAllAdminHodNoDueDeclarations(pageIndex: number, pageSize: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationAdminHodGetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        return this.http.get<any>(apiUrl);
    }

    getAdminHodNoDueDeclarationById(id: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationAdminHodView}/${id}`;

        return this.http.get<any>(apiUrl);
    }

    downloadNoDueDeclarationReportPdf(id: number): Observable<Blob> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationDownloadPdf}/${id}`;

        return this.http.get(apiUrl, { responseType: 'blob' });
    }
}