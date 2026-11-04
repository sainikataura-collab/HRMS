import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingCalendarService {

   constructor(private http:HttpClient) { }
    
       //insert 
        // add_TrainingCalendar( data:any):Observable<any> {
        //   const view_url = `${environment.baseURL1}${environment.Training.TrainingCalendar_Insert}`;
        //   return this.http.post<any>(view_url,data);  // Returning any type
        // }
       //insert 
        // Update_TrainingCalendar( data:any):Observable<any> {
        //   const view_url = `${environment.baseURL1}${environment.Training.TrainingCalendar_Insert}`;
        //   return this.http.post<any>(view_url,data);  // Returning any type
        // }

         //
        // getAdminCalendar_list(): Observable<any> {
        //   const view_url = `${environment.baseURL1}${environment.Training.TrainingCalendar_getAllForAdmin}`;
        //   return this.http.get(view_url);
        // }
         getCalenderById(planningId: number): Observable<any> {
            const view_url = `${environment.baseURL1}${environment.Training.TrainingCalendar_getbyid }/${planningId}`;
            return this.http.get(view_url);
          }


 



     getforemployee(): Observable<any> {
       const apiUrl = `${environment.baseURL1}${environment.Training.TrainingCalendar_getAllForEmployee}`;
       return this.http.get<any>(apiUrl);
     }
     CheckAttndforemployee(calendarId:number): Observable<any> {
       const apiUrl = `${environment.baseURL1}${environment.Training.CheckEmpAttenadance_Traininig}?calendarId=${calendarId}`;
       return this.http.get<any>(apiUrl);
     }
     ViewAttndforemployee(pk_attId:number): Observable<any> {
       const apiUrl = `${environment.baseURL1}${environment.Training.ViewEmpAttenadance_Traininig}/${pk_attId}`;
       return this.http.get<any>(apiUrl);
     }


       //Material Data
        Attendance_TrainingCalendar( data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Training.EmpAttenadanceFor_Traininig}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }
        givefeedback( data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Training.Give_Feedback}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }

        Attendance_ByAdmin( data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Training.Training_EmpAttenadanceByAdmin}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }

         MeterialUpload( data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Training.TrainingMeterial}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }

          UpdateMaterial( data:any):Observable<any>
           {
          const view_url = `${environment.baseURL1}${environment.Training.UpdateTrainingMeterial}`;
          return this.http.post<any>(view_url,data);  // Returning any type
         }

  //       get_Material(pageIndex: number,pageSize: number): Observable<any> {
  //       const view_url = `${environment.baseURL1}${environment.Training.GetAll_TrainingUMeterial}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  //       return this.http.get(view_url);
  // }

  get_Material(
  pageIndex: number,
  pageSize: number,
  materialType?: string,
  fk_planningId?: number
): Observable<any> {
  let view_url = `${environment.baseURL1}${environment.Training.GetAll_TrainingUMeterial}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  if (materialType) {
    view_url += `&materialType=${materialType}`;
  }

  if (fk_planningId) {
    view_url += `&fk_planningId=${fk_planningId}`;
  }

  return this.http.get(view_url);
}


 get_MeterialById(materialId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.GetById_TrainingMeterial }/${materialId}`;
    return this.http.get(view_url);
  }

}

