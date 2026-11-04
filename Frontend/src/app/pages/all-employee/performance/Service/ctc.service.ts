import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CTCService {

  constructor(private http: HttpClient) { }

    getAllCTC(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.GetAll_CTC}`;
    return this.http.get<any>(url);
  }

  getAllCTCforAdmin(filters: any, pageNo: number = 1, pageSize: number = 10): Observable<any> {
    const requestBody = {
      empCode: filters.empCode || "",
      empCodeManual: filters.empCodeManual || "",
      empName: filters.empName || "",
      selectedDepartments: filters.selectedDepartments || [],
      selectedDesignation: filters.selectedDesignation || "",
      selectedLocations: filters.selectedLocations || [],
      selectedNature: filters.selectedNature || "",
      selectedCity: filters.selectedCity || "",
      sortBy: filters.sortBy || "empcode",
      empStatus: filters.empStatus || "B",
      fk_costcentreid: filters.fk_costcentreid || "",
      pageNo: pageNo,
      pageSize: pageSize
    };

    const url = `${environment.baseURL1}${environment.Compensation.GetAll_CTCforAdmin}`;

    return this.http.post<any>(url, requestBody);
  }

  
}
