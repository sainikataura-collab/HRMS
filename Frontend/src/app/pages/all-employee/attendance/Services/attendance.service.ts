import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

   constructor(private http:HttpClient) { }


//
insertcdo(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Attendace.insert_cdo}`;
    return this.http.post<any>(url, data);
  }

      //     get_LeaveDetailsList(pageIndex: number,pageSize: number,fk_empid:string,fk_finid:string): Observable<any> {
      //   const view_url = `${environment.baseURL1}${environment.Leave.get_LeaveRequest_Detail}?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_empid=${fk_empid}&fk_finid=${fk_finid}`;
      //   return  this.http.get<any>(view_url);
      // }

      get_LeaveDetailsList(
  pageIndex: number,
  pageSize: number,
  fk_empid: string,
  fk_finid: string,
  month?: number | null,
  year?: number | null
): Observable<any> {

  let params: any = {
    pageIndex,
    pageSize,
    fk_empid,
    fk_finid
  };

  if (month !== null && month !== undefined) params.month = month;
  if (year !== null && year !== undefined) params.year = year;

  return this.http.get<any>(
    `${environment.baseURL1}${environment.Leave.get_LeaveRequest_Detail}`,
    { params }
  );
}

     add_ODReq(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Attendace.Emp_ODApply}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }
      //Approve Regularization

    get_ApproveRegularizationList(): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Attendace.Emp_ApproveRegularization}`;
        return  this.http.get<any>(view_url);
      }

    getById_ApproveRegularization(pk_inoutid:number): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.Attendace.Emp_GetByIdApproveRegularization}?pk_inoutid=${pk_inoutid}`;
        return  this.http.get<any>(view_url);
      }

      Update_ApproveRegularization(data:any):Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Attendace.Emp_UpdateApproveRegularization}`;
      return this.http.post<any>(view_url,data);  // Returning any type
    }

    
  insertRegulariseAttendance(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Attendace.insert_RegulariseAttendance}`;
    return this.http.post<any>(url, data);
  }


  // getAllRegulariseAttendance(): Observable<any> {
  //   const url = `${environment.baseURL1}${environment.Attendace.getAll_RegulariseAttendance}`;
  //   return this.http.get<any>(url);
  // }

//   getAllRegulariseAttendance(month: number | null, year: number | null) {
//   let params: any = {};

//   if (month !== null) params.month = month;
//   if (year !== null) params.year = year;

//   return this.http.get<any>(
//     `${environment.baseURL1}${environment.Attendace.getAll_RegulariseAttendance}`,
//     { params }
//   );
// }

getAllRegulariseAttendance(month?: number | null, year?: number | null) {
  let params: any = {};

  if (month != null) params.month = month;
  if (year != null) params.year = year;

  return this.http.get<any>(
    `${environment.baseURL1}${environment.Attendace.getAll_RegulariseAttendance}`,
    { params }
  );
}

    RegulariseAttendanceddl(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Attendace.DdlRegulariseAttendance}`;
    return this.http.get(view_url);
  }

 getInOutTimeByInOutId(pk_inoutid: string): Observable<any> {
  const url = `${environment.baseURL1}${environment.Attendace.getInOutTime}?pk_inoutid=${pk_inoutid}`;
  return this.http.get<any>(url);
}

//Shiv

//view team attendance
  viewTeamAttendanceDettails(month: number, yearId: number, empId:string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Attendace.ViewTeamAttendance}?&month=${month}&year=${yearId}&empId=${empId}`;

  return this.http.get(view_url);
}
  getEmployeeNameList(): Observable<any> {
  const url = `${environment.baseURL1}${environment.Attendace.EmployeeNameList}`;
  return this.http.get(url);
}

EmpAttendanceDetails(month: number, yearId: number): Observable<any> {
  const view_url =` ${environment.baseURL1}${environment.Attendace.Emp_AttendanceList}?&month=${month}&year=${yearId}`;
  return this.http.get(view_url);
}

GetallShortLeaveList(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.shortLeaveList}`;
    return this.http.get<any>(view_url);
  }

  //Gazetted

  get_HolidayGazetted(fk_yearid: number | null): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.Leave.get_GazettedHolidays}?fk_yearid=${fk_yearid}`;
    return this.http.get<any>(view_url);
  }

  //EMPAttendanceDashDetails

  EMPAttendanceDash(month: number, yearId: number): Observable<any> {
    const view_url = ` ${environment.baseURL1}${environment.Attendace.EMPAttendanceDashNew}?&month=${month}&year=${yearId}`;
    return this.http.get(view_url);
  }

  // added 
  Delete(pk_inoutid: number):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Attendace.DeleteAttendanceRegularisation}/${pk_inoutid}` ;
  return this.http.delete<any>(view_url);  // Returning any type
}

}
