import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(private http: HttpClient) { }
  submitMasterData(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL}${environment.payroll.Department}`; 
    return this.http.post(apiUrl, data);
}
}