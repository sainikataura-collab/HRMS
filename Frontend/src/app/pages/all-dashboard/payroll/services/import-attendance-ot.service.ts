import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImportAttendanceOTService {

   constructor(private http:HttpClient) { }
      
      exportExcel(): Observable<Blob> {
        const view_url = `${environment.baseURL}${environment.payroll.ExportMaster}`;
        return this.http.get(view_url, { responseType: 'blob' });  // Corrected type
      }
}
