import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccidentDetailService {

  constructor(private http:HttpClient) { }

  //insert 
       add_accidentDetail( data:any):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.add_accidentDetail}`;
        return this.http.post<any>(view_url,data);  // Returning any type
      }
      get_accidentDetail(fk_empid: string | null, pageIndex: number, pageSize: number): Observable<any> {
        let view_url = `${environment.baseURL1}${environment.HR.get_accidentDetail}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        
        if (fk_empid !== null && fk_empid !== '') {
          view_url += `&fk_empid=${fk_empid}`;
        }
      
        console.log('API URL:', view_url); // For debugging
      
        return this.http.get<any>(view_url); // Assuming you're using HttpClient
      }
      

      
      
      
     //delete the section 
      delete_accidentDetail(pk_accidentId : string): Observable<any> {
        const delete_url = `${environment.baseURL1}${environment.HR.delete_accidentDetail}/${pk_accidentId }`;
        return this.http.delete<any>(delete_url);  // Sending pk_id in URL
      }
    //get  the section  by id
      get_accidentDetailByid(pk_accidentId: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.HR.get_accidentDetailByid}/${pk_accidentId}`;
        return this.http.get(view_url);
      }
    //update the section
      update_accidentDetail(data: any): Observable<any> {
        const url = `${environment.baseURL1}${environment.HR.update_accidentDetail}`;
        return this.http.put<any>(url, data);  // UPDATE operation
      }
       //download the excel
       DownloadExcel():Observable<any> {
         var pageIndex =0;
         var pageSize=100000;
         const view_url = `${environment.baseURL1}${environment.HR.get_accidentDetail}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
     
         return this.http.get<any>(view_url);  // Returning any type
     
         }

         get_Employees_Ddl(filters: any = {}): Observable<any> {
          const url = `${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
           
           // Construct request body based on filters
           const requestBody = {
             empCode: filters.empCode || "",
             empCodeManual: filters.empCodeManual || "",
             empName: filters.empName || "",
             selectedDepartments: filters.selectedDepartments || [],
             selectedDesignation: filters.selectedDesignation || "",
             selectedLocations: filters.selectedLocations || [],
             selectedNature: filters.selectedNature || "",
             selectedCity: filters.selectedCity || "",
             sortBy: filters.sortBy || "",
            // userId: filters.userId || "",
             empStatus: filters.empStatus || "B"
           };
           return this.http.post<any>(url, requestBody);
         }
        

         CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
               let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
               if (generalId) {
                 view_url += `&generalId=${generalId}`;
               }
             
               return this.http.get(view_url);
             }
  
            //  getImage(imageName: string): Observable<Blob> {
            //   const view_url = ${environment.baseURL1}${environment.payroll.user_image}/${imageName};
            //   return this.http.get(view_url, { responseType: 'blob' });
            // }
            getImage(imageName: string): Observable<Blob> {
              const view_url = `${environment.baseURL1}${environment.HR.User_image}/${imageName}`;
              return this.http.get(view_url, { responseType: 'blob' });
            }

             getMeterial(imageName: string): Observable<Blob> {
              const view_url = `${environment.baseURL1}${environment.HR.User_image}/${imageName}`;
              return this.http.get(view_url, { responseType: 'blob' });
            }
            

} 
