import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateMasterService {

  constructor(private http:HttpClient) { }
                   
                     add_candidateMaster( data:any):Observable<any> {
                      const view_url = `${environment.baseURL1}${environment.Requitment.add_candidateMaster}`;
                      return this.http.post<any>(view_url,data);  // Returning any type
                    }
                    get_candidateMaster(page: number, pageSize: number, searchTerm: string = ''):Observable<any> {
                      const view_url = `${environment.baseURL1}${environment.Requitment.get_candidateMaster}?pageIndex=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}`;
                      return this.http.get<any>(view_url);  // Returning any type
                    }
                    update_candidateMaster(data:any):Observable<any> {
                      const view_url = `${environment.baseURL1}${environment.Requitment.update_candidateMaster}`;
                      return this.http.put<any>(view_url,data);  // Returning any type
                    }
                    delete_candidateMaster(pk_recId:string):Observable<any> {
                      const view_url = `${environment.baseURL1}${environment.Requitment.delete_candidateMaster}/${pk_recId}`;
                      return this.http.delete<any>(view_url);  // Returning any type
                    }


                    get_candidateMasterByid(pk_recId:string):Observable<any> {
                      const view_url = `${environment.baseURL1}${environment.Requitment.get_candidateMasterByid}/${pk_recId}`;
                      return this.http.get<any>(view_url);  // Returning any type
                    }


                       get_candidateByemailmobile(EmailOrMobile:string):Observable<any> {
                      const view_url = `${environment.baseURL1}${environment.Requitment.get_candidateByemailmobile}/${EmailOrMobile}`;
                      return this.http.get<any>(view_url);  // Returning any type
                    }

                     // check dublicate data entry in descrption
     CheckDuplicateValue(fieldName: string, fieldValue: string, generalId: string): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }

        DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Requitment.get_candidateMaster}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
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

        getImage(imageName: string): Observable<Blob> {
           const view_url = `${environment.baseURL1}${environment.HR.User_image }/${imageName}`;
            return this.http.get(view_url, { responseType: 'blob' });
            }


            getEmployee(fieldName: string): Observable<any> {
              const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
               return this.http.get(view_url);
             }

             // Send onboarding email
            sendOnboardingEmail(pk_recId: string): Observable<any> {
              const url = `${environment.baseURL1}${environment.Requitment.send_onboarding_email}/${pk_recId}`;
              return this.http.post<any>(url, {});
            }
                                
}
