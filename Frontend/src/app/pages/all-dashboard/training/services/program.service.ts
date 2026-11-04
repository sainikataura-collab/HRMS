import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  constructor(private http:HttpClient) { }

  
  add_program( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.add_TrainingProgram}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

 
  getprogram_list(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.getAll_TrainingProgram}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }


  DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.Training.getAll_TrainingProgram}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }
  
 
  delete_Program(programid : number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.Training.delete_TrainingProgram }/${programid}`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getProgramById(programid: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.GetById_TrainingProgram }/${programid}`;
    return this.http.get(view_url);
  }

  update_program(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.update_TrainingProgram}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }



  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: number): Observable<any> {
      let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
      if (generalId) {
        view_url += `&generalId=${generalId}`;
      }
    
      return this.http.get(view_url);
    }
  
  // // for sub Department master

  add_subprogram( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.add_TrainingsubProgram}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }

 
  get_subprogram(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.getAll_TrainingsubProgram}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

  DownloadExcelSubprogram():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.Training.getAll_TrainingsubProgram}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get<any>(view_url);  // Returning any type
    }
  
  delete_Subprogram(subprogramId : number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.Training.delete_TrainingsubProgram }/${subprogramId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  get_SubprogramById(programid: Number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.GetById_TrainingsubProgram }/${programid}`;
    return this.http.get(view_url);
  }

  update_Subsubprogram(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.update_TrainingsubProgram}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }
 
  getCommonList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

 getSubprogramById_Dropdown(programId:string):Observable<any>{
        const view_url = `${environment.baseURL1}${environment.Training.TNI_subprogram}/${programId}`;
        return  this.http.get<any[]>(view_url);
      }

 
//
  getTNI_list(pageIndex: number,pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.TNI_EMp_List}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }



  
 


}


