import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class TravelExpenceServicesService {

 constructor(private http:HttpClient) { }

 add_travelModeMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Travel_expense.TravelExpence_Insert }`;
      return this.http.post<any>(view_url,data);  // Returning any type
  }

  get_travelModeMaster():Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Travel_expense.TravelExpence_GetAll}`;
      return this.http.get(view_url);  // Returning any type
    }

     // update Travel Mode Master

    update_travelModeMaster(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Travel_expense.TravelExpence_Upd}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }


    // get by id or edit in Travel Mode Master

    getById_travelModeMaster(pk_travelmodeID:string):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.Travel_expense.TravelExpence_GetById}/${pk_travelmodeID}`;
      return  this.http.get<any[]>(view_url);
      }

      // delete in Travel Mode Master


    delete_travelModeMaster(pk_travelmodeID: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Travel_expense.TravelExpence_Delete}/${pk_travelmodeID}`;
      return this.http.delete<any>(view_url);
    }



       DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Travel_expense.TravelExpence_GetAll}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        return this.http.get<any>(view_url);  // Returning any type

        }


}
