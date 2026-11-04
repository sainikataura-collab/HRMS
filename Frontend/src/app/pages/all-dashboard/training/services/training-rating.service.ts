import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingRatingService {

  constructor(private http: HttpClient) {}

  // ➕ Insert Training Rating
  insert_Training(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.insert_Training}`;
    return this.http.post<any>(url, data);
  }

  // 📋 Get All Training Ratings (paginated)
  getAll_Training(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.getAll_Training}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  // ✏️ Update Training Rating
  update_Training(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.update_Training}`;
    return this.http.put<any>(url, data);
  }

  // 🔍 Get Training Rating by ID
  getById_Training(pk_ratingId: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.getById_Training}/${pk_ratingId}`;
    return this.http.get<any>(url);
  }

  // ❌ Delete Training Rating
  delete_Training(pk_ratingId: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.delete_Training}/${pk_ratingId}`;
    return this.http.delete<any>(url);
  }

    // check dublicate data entry in descrption
       CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: number): Observable<any> {
         let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
         if (generalId) {
           view_url += `&generalId=${generalId}`;
         }
       
         return this.http.get(view_url);
       }
  // 📥 Download All Records as Excel (Optional)
  downloadExcel(): Observable<any> {
    const pageIndex = 0;
    const pageSize = 100000;
    const url = `${environment.baseURL1}${environment.Training.getAll_Training}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }
}
