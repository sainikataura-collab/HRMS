import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MonthlyRentDetailService {

  constructor(private http:HttpClient) { }
  //get employee
    getEmployee(fieldName: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
        return this.http.get(view_url);
      }
      
     //get employee details
  getEmployeeDetails(empCode: string): Observable<any> {
        const view_url = `${environment.baseURL1}${environment.payroll.getEmployeeDetails}/${empCode}`;
       
        return this.http.get<any>(view_url);
      }
     
      //get employee for filter'
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
  
       //inset leave
  add_Rent( data:any):Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.add_Rent}`;
    return this.http.post<any>(view_url,data);  // Returning any type
  }
  //get All
  get_All_Rent(fk_empid: string | null,pageIndex: number,pageSize: number): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.get_All_Rent}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (fk_empid!== null) {
      view_url += `&fk_empid=${fk_empid}`;
      console.log('API URL:', view_url); // Debugging the URL
    }
    return this.http.get(view_url);
  }
  
  // getById_Rent(pk_perktrnId:string):Observable<any>{
  //   const view_url = `${environment.baseURL1}${environment.payroll.getById_Rent}/${pk_perktrnId}`;
  //   return  this.http.get<any[]>(view_url);
  //   }

    getById_Rent(fk_empid: string): Observable<any> {
      const view_url = `${environment.baseURL1}${environment.payroll.getById_Rent}/${fk_empid}`;
      console.log('API URL:', view_url); // ✅ API URL: https://.../EmployeeRentDetail/GU-3
      return this.http.get(view_url);
    }
    
  //update leave
  update_Rent(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.payroll.update_Rent}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }
  //delete  leave 
  // delete_Rent(fk_empid: string, fk_finid: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.delete_Rent}`;
  //   const params = {
  //     fk_empid: fk_empid,
  //     fk_finid: fk_finid
  //   };
  
  //   return this.http.delete<any[]>(view_url, { params });
  // }

  delete_Rent(fk_empid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll. delete_Rent}/${fk_empid}`;
    console.log('API URL:', view_url); // ✅ API URL: https://.../EmployeeRentDetail/GU-3
    return this.http.delete(view_url);
  }
  

  
  
   //download the excel
   DownloadExcel():Observable<any> {
    var pageIndex =0;
    var pageSize=100000;
    const view_url = `${environment.baseURL1}${environment.payroll.get_All_Rent}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
    return this.http.get<any>(view_url);  // Returning any type
  
    }

    //subsection list
getMonthlist(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetMonthDropdown}/${fieldName}`;
  return this.http.get(view_url);
}


//monthly-attendance
getCommanList(fieldName: string): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
  return this.http.get(view_url);
}


getAttendance(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetAttendanceList}`;
  return this.http.post<any>(view_url, body);
}
postAttendance(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.EmployeeAttendance}`;
  return this.http.post<any>(view_url, body);
}
DeleteAttendance(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DeleteEmployeeAttendance}`;
  return this.http.post<any>(view_url, body);
}
//auto salary process

getSalaryProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetSalaryProcessList}`;
  return this.http.post<any>(view_url, body);
}
postSalaryProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.PostSalaryProcess}`;
  return this.http.post<any>(view_url, body);
}
DeleteSalaryProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteSalaryProcess}`;
  return this.http.post<any>(view_url, body);
}

//Reim
getSalaryProcessReim(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetSalaryProcessListReim}`;
  return this.http.post<any>(view_url, body);
}
postSalaryProcessReim(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.PostSalaryProcessReim}`;
  return this.http.post<any>(view_url, body);
}
DeleteSalaryProcessReim(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteSalaryProcessReim}`;
  return this.http.post<any>(view_url, body);
}

//auto Bonus process

getBonusProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetBonusProcessList}`;
  return this.http.post<any>(view_url, body);
}
postBonusProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.PostBonusProcess}`;
  return this.http.post<any>(view_url, body);
}
DeleteBonusProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteBonusProcess}`;
  return this.http.post<any>(view_url, body);
}

getArrearProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetArrearProcessList}`;
  return this.http.post<any>(view_url, body);
}
PostArrearProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.PostArrearProcess}`;
  return this.http.post<any>(view_url, body);
}
DeleteArrearProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteArrearProcess}`;
  return this.http.post<any>(view_url, body);
}

//ITProcess
getITProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetITProcessList}`;
  return this.http.post<any>(view_url, body);
}
PostITProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.InserITProcess}`;
  return this.http.post<any>(view_url, body);
}
DeleteITProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteITProcess}`;
  return this.http.post<any>(view_url, body);
}


//LockIT
getLockIT(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetLockITList}`;
  return this.http.post<any>(view_url, body);
}
LockIT(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.InserLockITProcess}`;
  return this.http.post<any>(view_url, body);
}
Un_LockIT(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.DeleteITLock}`;
  return this.http.post<any>(view_url, body);
}


// For 

AttendanceDetailsinoutForAll(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetAllEmpDetailsinoutForAll}`;
  return this.http.post<any>(view_url, body);
}


AttendanceStatusList(): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.AttendanceStatusList}`;
  return this.http.get(view_url);
}
shiftDatabyName(pk_shiftId: number): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.ShiftMstGetByName}?pk_shiftId=${pk_shiftId}`;
  return this.http.get(view_url);
}

UpdateAttendanceInOut(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.UpdateAttendanceInOut}`;
  return this.http.put<any>(view_url, body);
}


getLTAProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetLTAProcessList}`;
  return this.http.post<any>(view_url, body);
}
postLTAProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.PostLTAProcess}`;
  return this.http.post<any>(view_url, body);
}
DeleteLTAProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteLTAProcess}`;
  return this.http.post<any>(view_url, body);
}
getIncentiveProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.GetIncentiveProcessList}`;
  return this.http.post<any>(view_url, body);
}
postIncentiveProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.PostIncentiveProcess}`;
  return this.http.post<any>(view_url, body);
}
DeleteIncentiveProcess(body: any): Observable<any> {
  const view_url = `${environment.baseURL1}${environment.payroll.deleteIncentiveProcess}`;
  return this.http.post<any>(view_url, body);
}


}
