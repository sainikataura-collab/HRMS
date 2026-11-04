import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TrainingTypeService  {

 constructor(private http:HttpClient) { }

 add_trainingType(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Training.Insert_Training_Type }`;
      return this.http.post<any>(view_url,data);  // Returning any type
  }

  get_trainingType(pageindex:number,pagesize:number):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Training.GetAll_Training_Type}?pageIndex=${pageindex}&pageSize=${pagesize}`;
      return this.http.get(view_url);  // Returning any type
    }

     // update Travel Mode Master

    update_trainingType(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Training.Update_Training_Type}`;
      return this.http.put<any>(view_url,data);  // Returning any type
    }


    // get by id or edit in Travel Mode Master

    getById_trainingType(pk_typeId:number):Observable<any>{
      const view_url = `${environment.baseURL1}${environment.Training.GetById_Training_Type}/${pk_typeId}`;
      return  this.http.get<any[]>(view_url);
      }

      // delete in Travel Mode Master


    delete_trainingType(pk_typeId: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Training.Delete_Training_Type}/${pk_typeId}`;
      return this.http.delete<any>(view_url);
    }



       DownloadExcel():Observable<any> {
        var pageIndex =0;
        var pageSize=100000;
        const view_url = `${environment.baseURL1}${environment.Training.GetAll_Training_Type}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        return this.http.get<any>(view_url);  // Returning any type

        }

    CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }

      return this.http.get(view_url);
    }


}
