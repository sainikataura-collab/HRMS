import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoUrlUploadService {

  constructor( private http:HttpClient) { }


   Insert_VideoURLUploads(data: any): Observable<any> {
      const apiUrl = `${environment.baseURL1}${environment.Training.Insert_videoUrlUpld}`;
      return this.http.post<any>(apiUrl, data);
    }
  

    get_All(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.getAll_videoUrlUpld}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }



   delete(pk_TrainingId : string): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.Training.delete_videoUrlUpld }/${pk_TrainingId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getById(pk_TrainingId: Number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.get_videoUrlUpldById }/${pk_TrainingId}`;
    return this.http.get(view_url);
  }

  update_VideoURLUploads(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.Update_videoUrlUpld}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }
}
