import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeeklyOffService {

  constructor(private http: HttpClient) { }


saveWeeklyOff(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.WeeklyOff_insert}`;
    return this.http.post<any>(view_url,data);  // Returning any type  }

}


// Get All Weekly Offs with pagination
getAllWeeklyOff(pageIndex: number, pageSize: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.WeeklyOff_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get<any>(view_url);
}

// Update Weekly Off
updateWeeklyOff(data: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.WeeklyOff_update}`;
  return this.http.put<any>(view_url, data);
}

getWeeklyOffById(woffId: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.WeeklyOff_getbyId}/${woffId}`;
  return this.http.get<any>(view_url);
}

// Delete Weekly Off
deleteWeeklyOff(woffId: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.WeeklyOff_delete}/${woffId}`;
  return this.http.delete<any>(view_url);
}

getLocation(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}

}
