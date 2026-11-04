import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GradeMasterService {

  constructor(private http:HttpClient) { }
    
  //insert
Insert_Grade( data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Insert_Grade}`;
  return this.http.post<any>(view_url,data);  // Returning any type
}
//get grade
get_Grade(pageIndex: number,pageSize: number):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.get_Grade}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get<any>(view_url);  // Returning any type
}
//get by id

get_GradeById(gradeId: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.get_GradeById}/${gradeId}`;
  return this.http.get(view_url);
}
//update grade
Update_Grade(data:any):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.Update_Grade}`;
  return this.http.put<any>(view_url,data);  // Returning any type
}
//delete grade
delete_Grade(gradeId: string):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.delete_Grade}/${gradeId}`;
  return this.http.delete<any>(view_url);  // Returning any type
}
// // API call to fetch levels dynamically
// getLevels(fieldName: string): Observable<any> {
//   const view_url = `${environment.baseURL1}${environment.HRMS.DropdownList}/${fieldName}`;
//   return this.http.get(view_url);
// }

//check  dublicate value
CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
  let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
  if (generalId) {
    view_url += `&generalId=${generalId}`;
  }

  return this.http.get(view_url);
}


get_Grade_Excel():Observable<any> {
  var pageIndex =0;
  var pageSize=100000;
  const view_url = `${environment.baseURL1}${environment.payroll.get_Grade}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get<any>(view_url);  // Returning any type
}

}
