import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
      providedIn: 'root'
})
export class TravelClassMasterService {


      constructor(private http: HttpClient) {

      }

      travelMasterInsert(data: any): Observable<any> {
            const apiUrl = `${environment.baseURL1}${environment.Travel_expense.insertTravelExpence}`;
            return this.http.post<any>(apiUrl, data);

      }

      travelMasterList(): Observable<any> {
            const apiUrl = `${environment.baseURL1}${environment.Travel_expense.listTravelExpence}`;
            return this.http.get<any>(apiUrl);

      }
      travelMasterDelete(pk_classTvlId: number): Observable<any> {
            const apiUrl = `${environment.baseURL1}${environment.Travel_expense.deleteTravelExpence}/${pk_classTvlId}`;
            return this.http.delete<any>(apiUrl);

      }
      travelMasterUpdate(data: any): Observable<any> {
            const apiUrl = `${environment.baseURL1}${environment.Travel_expense.updateTravelExpence}`;
            return this.http.put<any>(apiUrl, data);

      }

      travelMasterGetById(pk_classTvlId: number): Observable<any> {
            const view_url = `${environment.baseURL1}${environment.Travel_expense.getByIdTravelExpence}/${pk_classTvlId}`;
            return this.http.get<any[]>(view_url);
      }


      travelMasterDownloadExcel(): Observable<any> {
            var pageIndex = 0;
            var pageSize = 100000;
            const view_url = `${environment.baseURL1}${environment.Travel_expense.listTravelExpence}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

            return this.http.get<any>(view_url);  // Returning any type

      }

      CheckDuplicateValue(fieldName: string, fieldValue: string, pk_classTvlId: number): Observable<any> {
            let view_url = `${environment.baseURL1}${environment.Travel_expense.IsValueAvailableTravelExpence}/${fieldName}?fieldValue=${fieldValue}`;
            if (pk_classTvlId) {
                  view_url += `&pk_classTvlId=${pk_classTvlId}`;
            }

            return this.http.get(view_url);
      }

}
