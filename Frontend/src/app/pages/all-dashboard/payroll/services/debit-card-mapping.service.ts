import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DebitCardMappingService {
constructor(private http:HttpClient) { }
 
 get_debitCard(  filters: any = {}):Observable<any> {
    
  const view_url = `${environment.baseURL1}${environment.payroll.Get_debitCard}`;
  const requestBody = {
   empCode: filters.empCode || "",
   empCodeManual: filters.empCodeManual || "",
   empName: filters.empName || "",
   selectedDepartments: filters.selectedDepartments || [],
   selectedDesignation: filters.selectedDesignation || "",
   selectedLocations: filters.selectedLocations || [],
   selectedNature: filters.selectedNature || "",
   selectedCity: filters.selectedCity || "",
   sortBy: filters.sortBy || "empCode",
  // userId: filters.userId || "",
   empStatus: filters.empStatus || ""
 };


  return this.http.post<any>(view_url,requestBody);  // Returning any type
}

update_debitCard(data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Update_debitCard}`;
  return this.http.put<any>(view_url,data);  // Returning any type
}
}

