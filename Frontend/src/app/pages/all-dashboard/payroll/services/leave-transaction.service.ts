import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveTransactionService {

  constructor(private http:HttpClient) { }
      
  getApprovedList(leaveType: number, empId: string, fromDate?: string, toDate?: string): Observable<any> {
  let url = `${environment.baseURL1}${environment.payroll.getApprovedList}?fk_leaveId=${leaveType}&fk_empid=${empId}`;

  if (fromDate) {
    url += `&fromDate=${fromDate}`;
  }
  if (toDate) {
    url += `&toDate=${toDate}`;
  }

  return this.http.get<any>(url); // GET with query params
}


 getEmployee(fieldName: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
          return this.http.get(view_url);
        }



RejectLeave(requestType: string, requestId: string): Observable<any> {
  const url = `${environment.baseURL1}${environment.payroll.LeaveReject}?requestType=${requestType}&requestId=${requestId}`;
  return this.http.delete<any>(url); // DELETE does not need a body
}



   approveOrRejectShortLeave(pk_shortLeaveId: string, approvalOrder: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.ApproveOrRejectShortLeave}?pk_shortLeaveId=${pk_shortLeaveId}&approvalOrder=${approvalOrder}` ;
      return this.http.post<any>(url, {}); // empty body since params are in query string
    }
//newly added pp 16-09-2025
approveOrReject(pk_inoutid: number, approvalOrder: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.ApproveOrRejectAttendance}?pk_inoutid=${pk_inoutid}&approvalOrder=${approvalOrder}` ;
      return this.http.post<any>(url, {}); // empty body since params are in query string
    }



    approveOrRejectCompOff(pk_applycompoffId: number, approvalOrder: number): Observable<any> {
      const url = `${environment.baseURL1}${environment.payroll.approveOrRejectCompOff}?pk_applycompoffId=${pk_applycompoffId}&approvalOrder=${approvalOrder}`;
      return this.http.post<any>(url, {}); // empty body since params are in query string
    }


        add_LeaveTransaction( data:any):Observable<any> {
           const view_url = `${environment.baseURL1}${environment.payroll.Insert_Leave_Transaction}`;
           return this.http.post<any>(view_url,data);  // Returning any type
         }



         get_LeaveTransaction(pageIndex: number,pageSize: number,fk_empid:string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.get_LeaveTaken_Details}/${fk_empid}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
          return  this.http.get<any>(view_url);
        }
     
         update_LeaveTransaction(data:any):Observable<any> {
           const view_url = `${environment.baseURL1}${environment.payroll.Update_LeaveTaken_Details}`;
           return this.http.put<any>(view_url,data);  // Returning any type
         }


        ApprovePendingLeave(data:any):Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.Approve_PendingLeave}`;
          return this.http.post<any>(view_url,data);  // Returning any type
        }

        getLeaveTakenDetailsById(fk_empid: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.GetEmpDetailsandListById}/${fk_empid}`;
          return this.http.get(view_url);
        }
        
        getById(pk_leavestakenid: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.getById_LeaveTaken_Details}/${pk_leavestakenid}`;
          return this.http.get(view_url);
        }


        getPendingLeave(): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.Get_PendingLeave}`;
          return this.http.get(view_url);
      }


      

        getCommonDropdown(fieldName: string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.Leave.Emp_DropdownList}/${fieldName}`;
          return this.http.get(view_url);
        }


        getLeaveBalance(fk_empid: string,fk_leaveId:string): Observable<any> {
          const view_url = `${environment.baseURL1}${environment.payroll.GetLeaveBalance}?fk_empid=${fk_empid}&fk_leaveId=${fk_leaveId}`;
          return this.http.get(view_url);
        }

       

        geEmpLeavesOnDatest(empId: string, leaveTypeId: number, fromDate: string, toDate: string): Observable<any> {
          const url = `${environment.baseURL1}${environment.payroll.generateLeaveTakenbyDate}?fk_empid=${empId}&fk_leaveId=${leaveTypeId}&datefrom=${fromDate}&dateto=${toDate}`;
          return this.http.get(url);
        }

        delete_LeaveTransaction(pk_leavetakenid : string): Observable<any> {
          const delete_url = `${environment.baseURL1}${environment.payroll.Delete_LeaveTaken_Details}/${pk_leavetakenid }`;
          return this.http.delete<any>(delete_url);  // Sending pk_id in URL
        }
        delete_PendingLeave(pk_leaveappid : string): Observable<any> {
          const delete_url = `${environment.baseURL1}${environment.payroll.Delete_PendingLeave}/${pk_leaveappid} `;
          return this.http.delete<any>(delete_url);  // Sending pk_id in URL
        }
      

    

         getEmpList (filters: any = {}): Observable<any> {
    const url = ` ${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddlfor100}`;
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
      empStatus: filters.empStatus || "B",
      search: filters.search || "",
      pageNo: filters.pageNo || 1,
      pageSize: filters.pageSize || 100
    };
    return this.http.post<any>(url, requestBody);
  }

         getCompoffPendingLeave(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetCompoffPendingLeave}`;
    return this.http.get(view_url);
  }

  getShortLeavePendingLeave(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetShortLeavePendingLeave}`;
    return this.http.get(view_url);
  }

    getregulization(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetAllAdminApprovalList}`;
    return this.http.get(view_url);
  }
   update(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.updateattendance}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }
}
