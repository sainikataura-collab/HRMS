import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateRefAndMedService {

  constructor(private http: HttpClient) { }

  // ===================== CANDIDATE =====================
    getAllCandidatesByid(id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.candidate_GetAll}/${id}`;
    return this.http.get<any>(apiUrl);
  }

  // ===================== MEDICAL =====================
  getAllMedical(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.CandidateMedical_GetAll}`;
    return this.http.get<any>(apiUrl);
  }

  getMedicalById(id: string): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.CandidateMedical_GetById}/${id}`;
    return this.http.get<any>(apiUrl);
  }
 
  insertMedical(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.CandidateMedical_Insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  updateMedical(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.CandidateMedical_Update}`;
    return this.http.put<any>(apiUrl, data);
  }

  deleteMedical(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.CandidateMedical_Delete}/${id}`;
    return this.http.delete<any>(apiUrl);
  }

  // ===================== REFERENCE =====================
  getAllReferences(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.candidateRefrence_GetAll}`;
    return this.http.get<any>(apiUrl);
  }

  getReferenceById(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.candidateRefrence_GetById}/${id}`;
    return this.http.get<any>(apiUrl);
  }

  insertReference(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.candidateRefrence_Insert}`;
    return this.http.post<any>(apiUrl, data);
  }

  updateReference(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.candidateRefrence_Update}`;
    return this.http.post<any>(apiUrl, data);
  }

  deleteReference(id: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.candidateRefrence_Delete}/${id}`;
    return this.http.delete<any>(apiUrl);
  }


     getdropDawn(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.HR.Image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
}

   DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Requitment.candidateRefrence_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        return this.http.get<any>(view_url);  // Returning any type
    
        }

}
