import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NoDueDeclarationService {

    constructor(private http: HttpClient) { }

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

    getNoDueDeclarationById(id: number): Observable<any> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationAdminHodView}/${id}`;

        return this.http.get<any>(apiUrl);
    }

    downloadNoDueDeclarationReportPdf(id: number): Observable<Blob> {
        const apiUrl =
            `${environment.baseURL1}${environment.Exit.NoDueDeclarationDownloadPdf}/${id}`;

        return this.http.get(apiUrl, {
            responseType: 'blob'
        });
    }
}