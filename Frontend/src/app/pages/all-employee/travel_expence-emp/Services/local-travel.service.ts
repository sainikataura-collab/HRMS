// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class LocalTravelService {

//   constructor() { }
// }


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalTravelService {
  
  constructor(private http: HttpClient) { }

  // Insert/Create Local Travel Request
  insertLocalTravel(payload: FormData): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Travel_expense.insertLocalTravel}`;
    return this.http.post<any>(apiUrl, payload);
  }

  // Get All Local Travel Requests
  getAllLocalTravel(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Travel_expense.getAllLocalTravels}`;
    return this.http.get<any>(apiUrl);
  }

  // Get Local Travel by ID
  getLocalTravelById(pk_localTravelId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Travel_expense.getLocalTravelById}/${pk_localTravelId}`;
    return this.http.get<any>(view_url);
  }

    
   printPdf(pk_localtravelId: number): Observable<Blob> {
  const view_url = `${environment.baseURL1}${environment.Travel_expense.downloadPrint}/${pk_localtravelId}`;
  return this.http.post(view_url, pk_localtravelId, { responseType: 'blob' });
}

  // Delete Local Travel
  deleteLocalTravel(pk_localTravelId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Travel_expense.deleteLocalTravel}/${pk_localTravelId}`;
    return this.http.delete<any>(apiUrl);
  }

  // Update Local Travel
  updateLocalTravel( payload: FormData): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.Travel_expense.updateLocalTravel}`;
  return this.http.put<any>(apiUrl, payload);
}
  // Get Travel Mode Dropdown
  getTravelMode(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  // Get City Dropdown
  getCity(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  // Get Local Travel Details View (if needed)
  localTravelDetailsView(pk_localTravelId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Travel_expense.localTravelDetailsView}?pk_localTravelId=${pk_localTravelId}`;
    return this.http.get(view_url);
  }
getImage(imageName: string): Observable<Blob> {
           const view_url = `${environment.baseURL1}${environment.HR.User_image }/${imageName}`;
            return this.http.get(view_url, { responseType: 'blob' });
            }

            // In local-travel.service.ts

/**
 * ✅ NEW: Submit local travel for approval
 */
submitLocalTravel(fk_empid: string): Observable<any> {
  // return this.http.post(`${this.apiUrl}/SubmitLocalTravel`, { fk_empid });
   const apiUrl = `${environment.baseURL1}${environment.Travel_expense.finalSubmit}`;
    return this.http.post<any>(apiUrl,{ fk_empid });
}

}