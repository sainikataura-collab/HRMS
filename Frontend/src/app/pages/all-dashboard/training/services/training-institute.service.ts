import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingInstituteService {

  constructor(private http:HttpClient) { }
   //insert 
      add_TrainingInstitute( data:any):Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Training.add_TrainingInstitute}`;
        return this.http.post<any>(view_url,data);  // Returning any type
      }
    //get the section 
     get_TrainingInstitute(pageindex: number,pagesize: number): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Training.get_TrainingInstitute}?pageindex=${pageindex}&pagesize=${pagesize}`;
        return this.http.get(view_url);
      }
      
     //delete the section 
      delete_TrainingInstitute(pk_instituteId : number): Observable<any> {
        const delete_url = `${environment.baseURL1}${environment.Training.delete_TrainingInstitute}/${pk_instituteId }`;
        return this.http.delete<any>(delete_url);  // Sending pk_id in URL
      }
    //get  the section  by id
      getTrainingInstituteById(pk_instituteId: number): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Training.getTrainingInstituteById}/${pk_instituteId}`;
        return this.http.get(view_url);
      }
    //update the section
      update_TrainingInstitute(data: any): Observable<any> {
        const url = `${environment.baseURL1}${environment.Training.update_TrainingInstitute}`;
        return this.http.put<any>(url, data);  // UPDATE operation
      }
      
 
  
          // check dublicate data entry in descrption
    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }

 
  
        
        //download the excel
        DownloadExcel():Observable<any> {
            var pageindex =0;
            var pagesize=100000;
            const view_url = `${environment.baseURL1}${environment.Training.get_TrainingInstitute}?pageindex=${pageindex}&pagesize=${pagesize}`;
        
            return this.http.get<any>(view_url);  // Returning any type
        
            }
    
  
}
