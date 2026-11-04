import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeavetransactionService {
 

constructor(private http:HttpClient) { }


getPendingLeave(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Get_PendingLeave}`;
    return this.http.get(view_url);
}




}
