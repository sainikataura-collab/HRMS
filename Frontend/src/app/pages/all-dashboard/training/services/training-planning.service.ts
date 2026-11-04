import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingPlanningService {


  constructor(private http: HttpClient) { }
  
  //insert 
  add_TrainingPlanning(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.add_TrainingPlanning}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }
  //getall
  get_trainingPlanning(pageIndex: number, pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.getAll_TrainingPlanning}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

    get_Subprogrambyid(SubProgramId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.TNI_subprogram }/${SubProgramId}`;
    return this.http.get(view_url);
  }
 
  getTni_Subprogram(ProgramId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.TNI_subprogramForPlanning }/${ProgramId}`;
    return this.http.get(view_url);
  }

  getPlanned_Employee(ProgramId: number,SubprogramId:number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.TNI_PlannedEmployee }?programid=${ProgramId}&subprogramid=${SubprogramId}`;
    return this.http.get(view_url);
  }

  getApprovedTNI(subProgramId?: number,tniId?:number): Observable<any> {
  let view_url = `${environment.baseURL1}${environment.Training.TNI_GetAll}`;

 
  if (subProgramId) {
    view_url += `?subProgramId=${subProgramId}&TNIId=${tniId}`;
  }

  return this.http.get<any>(view_url);
}


  delete_trainingPlanning(planningId : number): Observable<any> {
    const delete_url = `${environment.baseURL1}${environment.Training.delete_TrainingPlanning }/${planningId }`;
    return this.http.delete<any>(delete_url);  // Sending pk_id in URL
  }

  getByid_trainingPlanning(planningId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.GetById_TrainingPlanning }/${planningId}`;
    return this.http.get(view_url);
  }



  update_trainingPlanning(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Training.update_TrainingPlanning}`;
    return this.http.put<any>(url, data); 
  }


    DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.Training.getAll_TrainingPlanning}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url);  // Returning any type

    }


//TNI SErvice


 getList(params: any): Observable<any[]> {
    const url = `${environment.baseURL1}${environment.Training.AdminList_TNI}`;
    return this.http.get<any[]>(url, { params });
  }

  getTNI_View(programId:number,subprogram:number):Observable<any>{
        const view_url = `${environment.baseURL1}${environment.Training.TNI_View}?pk_programId=${programId}&pk_subprogramId=${subprogram}`;
        return  this.http.get<any[]>(view_url);
  }

  getAttendance(pk_empId:String, programId?: number | null, subProgramId?: number | null):Observable<any>{
        const view_url = `${environment.baseURL1}${environment.Training.Attenadance_TraininigForadmin}?pk_empid=${pk_empId}&programid=${programId}&subprogramid=${subProgramId}`;
        return  this.http.get<any[]>(view_url);
  }


// ?pk_empid=GU-41&programid=20011&subprogramid=20010



takeAction(body: { 
  pk_TNIId: number; 
  TNILineId: number;      // ✅ new
  action: string; 
  adminComments?: string;
}): Observable<any> {
  const url = `${environment.baseURL1}${environment.Training.AdminAction_TNI}`;
  return this.http.post<any>(url, body);
}


  get_CompletedProgramsbyid(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Training.GetFeedBack_Training }`;
    return this.http.get(view_url);
  }

}
