import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeavereqService {

  constructor(private http: HttpClient) { }

  getCommonDropdown(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.Emp_DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }


  add_LeaveReq(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.Ins_LeaveRequest}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }



  // get_LeaveReqList(pageIndex: number, pageSize: number, fk_empid: string, fk_finid: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.Leave.get_LeaveRequest_list}?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_empid=${fk_empid}&fk_finid=${fk_finid}`;
  //   return this.http.get<any>(view_url);
  // }

  get_LeaveReqList(
  pageIndex: number,
  pageSize: number,
  fk_empid: string,
  fk_finid: string,
  status: string | null,
  month: number | null,
  year: number | null
) {
  const url = `${environment.baseURL1}${environment.Leave.get_LeaveRequest_list}`
    + `?pageIndex=${pageIndex}`
    + `&pageSize=${pageSize}`
    + `&fk_empid=${fk_empid}`
    + `&fk_finid=${fk_finid}`
    + `&status=${status ?? ''}`
    + `&month=${month ?? ''}`
    + `&year=${year ?? ''}`;

  return this.http.get<any>(url);
}





  get_LeaveDetailsList(pageIndex: number, pageSize: number, fk_empid: string, fk_finid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.get_LeaveRequest_Detail}?pageIndex=${pageIndex}&pageSize=${pageSize}&fk_empid=${fk_empid}&fk_finid=${fk_finid}`;
    return this.http.get<any>(view_url);
  }

  getLeaveBalance(fk_leaveId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.Get_LeaveBalance}?fk_leaveId=${fk_leaveId}`;
    return this.http.get(view_url);
  }
  getViewLeaveBalance(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Leave.Emp_ViewLeaveBalance}`;
    return this.http.get(view_url);
  }


  geEmpLeavesOnDatest(leaveTypeId: number, datefrom: string, dateto: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.Emp_generateLeaveTakenbyDate}?fk_leaveId=${leaveTypeId}&datefrom=${datefrom}&dateto=${dateto}`;
    return this.http.get(url);
  }


  
validate_leavebalance(fk_leaveId: string, tobeapply: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.validate_leaveblance}?fk_leaveId=${fk_leaveId}&tobeapply=${tobeapply}`;
    return this.http.get(url);
  }

  ///Restriction

  get_HolidayRestricted(fk_yearid: number | null): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.Leave.get_restrictedHolidays}?fk_yearid=${fk_yearid}`;
    return this.http.get<any>(view_url);
  }

  //Gazetted

  get_HolidayGazetted(fk_yearid: number | null): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.Leave.get_GazettedHolidays}?fk_yearid=${fk_yearid}`;
    return this.http.get<any>(view_url);
  }

//sunny
  //compoff

  // Insert CompOff Approval
  insertCompOffApproval(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.insert_CompOffRequestApproval}`;
    return this.http.post<any>(url, data);
  }

  // Get All CompOff Approvals
  getAllCompOffApprovals(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.getAll_CompOffRequestApproval}`;
    return this.http.get<any>(url);
  }

  // Get CompOff Approval By ID
  getCompOffApprovalById(pk_applycompoffId: number): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.getById_CompOffRequestApproval}/${pk_applycompoffId}`;
    return this.http.get<any>(url);
  }

  insertCompOffRequest(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.insert_CompOffRequest}`;
    return this.http.post<any>(url, data);
  }

  getAllCompOffRequests(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.getAll_CompOffRequest}`;
    return this.http.get<any>(url);
  }


  getCompOffRequestById(pk_applycompoffId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Leave.getById_CompOffRequest}?pk_applycompoffId=${pk_applycompoffId}`;
    return this.http.get<any>(url);
  }

  getCompOffAttendanceByDate(date: string): Observable<any> {
    const encodedDate = encodeURIComponent(date); // converts "2025/01/05" -> "2025%2F01%2F05"
    const url = `${environment.baseURL1}${environment.Leave.getTotalDays_CompOffRequest}?dated=${encodedDate}`;
    return this.http.get<any>(url);
  }




  DownloadExcel(): Observable<any> {
    var pageIndex = 0;
    var pageSize = 100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_City}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<any>(view_url); // Returning any type
  }

//shiv
// approvalshortLeave
     GetallApprovalShortLeaveList(): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Leave.ApproveshortLeaveList}`;
      return  this.http.get<any>(view_url);
    }

      Isnert_ApprovalShortLeaveRequest(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.Leave.ApproveshortLeave_Insert}`;
      return this.http.post<any>(url, data);  // UPDATE operation
    }
  
// approvalodleave
     GetallApprovalOdLeaveList(): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Leave.get_ApprovalLeaveOd_list}`;
      return  this.http.get<any>(view_url);
    }

    Isnert_ApprovalOdLeaveRequest(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.Leave.Ins_ApprovalLeaveOd}`;
      return this.http.post<any>(url, data);  // UPDATE operation
    }

// GetallShortLeaveList(): Observable<any> {
//       const view_url =  `${environment.baseURL1}${environment.Leave.shortLeaveList}`;
//       return  this.http.get<any>(view_url);
//     }


// GetallShortLeaveList(month?: number | null, year?: number | null): Observable<any> {
//   const view_url = `${environment.baseURL1}${environment.Leave.shortLeaveList}`;

//   let params: any = {};

//   if (month !== null && month !== undefined) {
//     params.month = month;
//   } else {
//     params.month = null;
//   }

//   if (year !== null && year !== undefined) {
//     params.year = year;
//   } else {
//     params.year = null;
//   }

//   return this.http.get<any>(view_url, { params });
// }

    
//  GetallShortLeaveList(
  
//   month: number | null,
//   year: number | null
// ) {
 
//   const url = `${environment.baseURL1}${environment.Leave.shortLeaveList}`
   
//     + `&month=${month ?? ''}`
//     + `&year=${year ?? ''}`;

//   return this.http.get<any>(url);
// }
GetallShortLeaveList(month: number | null, year: number | null) {
  let params: any = {};

  if (month !== null) params.month = month;
  if (year !== null) params.year = year;

  return this.http.get<any>(
    `${environment.baseURL1}${environment.Leave.shortLeaveList}`,
    { params }
  );
}

    Isnert_ShortLeaveRequest(data: any): Observable<any> {
      const url = `${environment.baseURL1}${environment.Leave.InsertshortLeave}`;
      return this.http.post<any>(url, data);  // UPDATE operation
    }
    getShortLeaveById(pk_shortLeaveId: number): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.Leave.getShortLeaveById}/${pk_shortLeaveId}`;    
      return this.http.get(view_url);

      
    }

GetallApprovedDisapporvedLeaveList(): Observable<any> {
      const view_url =` ${environment.baseURL1}${environment.Leave.ApprovedDisapprovedList}`;
      return  this.http.get<any>(view_url);
    }


 getleavelist(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.LeaveList}`;
    return this.http.get(view_url);
  }


   LeaveDash(month: number, year: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Leave.LeaveDash}?month=${month}&year=${year}`;
  return this.http.get<any>(view_url);
}

DeleteLeave(pk_leaveappid: string):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Leave.DeleteLeave}/${pk_leaveappid}`;
  return this.http.delete<any>(view_url);  // Returning any type
}

  DeleteShortLeave(pk_shortLeaveId: string):Observable<any> {
  const view_url =  `${environment.baseURL1}${environment.Leave.DeleteShortLeave}/${pk_shortLeaveId}` ;
  return this.http.delete<any>(view_url);  // Returning any type
}

DeleteCompoffLeave(pk_applycompoffId: string):Observable<any> {
  const view_url = `${environment.baseURL1}${environment.Leave.DeleteCompoffLeave}/${pk_applycompoffId}` ;
  return this.http.delete<any>(view_url);  // Returning any type
}


}






