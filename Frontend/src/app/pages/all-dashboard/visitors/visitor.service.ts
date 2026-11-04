import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  constructor(private http: HttpClient) { }

  // Get All Visitors with pagination
  getAllVisitors(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.visitor.GetAll_Visitor}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }
}
