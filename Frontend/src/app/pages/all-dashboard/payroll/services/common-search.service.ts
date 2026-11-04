import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonSearchService {

  constructor(private http: HttpClient, private router: Router, public ngZone: NgZone) { }



  // API call to fetch  dynamically
  //will be using the same for - Designation,Department,Nature,City
  getCommonDdl(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.CommonSearch.DropdownList}/${fieldName}`;
        return this.http.get(view_url);
  }

 
  
  
  // Corrected API call to fetch location
  getLocationdl(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.CommonSearch.LocationDropdownList}`; // No extra `}`
    
    return this.http.get(view_url);
  }



    getEmp_CommonDdl(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.CommonSearch.Emp_DropdownList}/${fieldName}`;
        return this.http.get(view_url);
  }
}