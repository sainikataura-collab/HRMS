import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PageRightsService {

  constructor(private http:HttpClient) { }
   LocationByZone(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.LocationbyZoneList}/${fieldName}`;
    return this.http.get(view_url);
  }

  getUserLocations(fk_userId: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Authentication.getUserLocations}?fk_userId=${fk_userId}`;
      return this.http.get(view_url);
    }

  getLocation(fieldName: string): Observable<any> {
     const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
     return this.http.get(view_url);
   }

   getModuelList(): Observable<any> {
     const view_url = `${environment.baseURL1}${environment.Authentication.ModuleList}`;
     return this.http.get(view_url);
   }

    get_Webpage(fk_userId:string,fk_moduleId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Authentication.get_Webpage}?fk_userId=${fk_userId}&fk_moduleId=${fk_moduleId}`;
    return this.http.get(view_url);
  }
  

    add_pageRight( data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Authentication.add_pageRight}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }

    
    getUserAccessRights(userId: string, moduleId: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Authentication.GetUserAccessRights}?userId=${userId}&moduleId=${moduleId}`;
      return this.http.get<any>(view_url);
    }

}
