import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

 
   constructor(private http: HttpClient) {}
 
   insert_TNI(data: any): Observable<any> {
     const apiUrl = `${environment.baseURL1}${environment.Requitment.insert_TNI}`;
     return this.http.post<any>(apiUrl, data);
   }
 
   getAllManpower(pageIndex: number , pageSize: number): Observable<any> {
     const apiUrl = `${environment.baseURL1}${environment.Requitment.getAll_TNI}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     return this.http.get<any>(apiUrl);
   }
 


}
