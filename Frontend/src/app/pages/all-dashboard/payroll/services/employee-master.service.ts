import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeMasterService {

  constructor(private http: HttpClient) { }


  CityByState(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.CitybyStateList}/${fieldName}`;
    return this.http.get(view_url);
  }

  add_employee(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_employee}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }
  add_employee_Shift(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_employee_Shift}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }
  update_employeeattendance(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_employeeAttendance}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }
  update_employeeOtherDetails(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_employeeOtherDetails}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }

  update_employeeHeadDetails(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_employeeheadDetails}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }

  // get_employee(pageIndex: number, pageSize: number, filters: any = {}): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.Get_employee}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  //    // Construct request body based on filters
  //    const requestBody = {
  //      empCode: filters.empCode || "",
  //      empCodeManual: filters.empCodeManual || "",
  //      empName: filters.empName || "",
  //      selectedDepartments: filters.selectedDepartments || [],
  //      selectedDesignation: filters.selectedDesignation || "",
  //      selectedLocations: filters.selectedLocations || [],
  //      selectedNature: filters.selectedNature || "",
  //      selectedCity: filters.selectedCity || "",
  //      sortBy: filters.sortBy || "empcode",
  //     // userId: filters.userId || "",
  //      empStatus: filters.empStatus || "B",
  //      fk_costcentreid:filters.fk_costcentreid || ""
  //    };

  //    return this.http.post<any>(view_url, requestBody);
  //  }

  //      get_employee(pageIndex: number, pageSize: number, searchTerm: string | null, filters: any = {}): Observable<any> {
  //   let view_url = `${environment.baseURL1}${environment.payroll.Get_employee}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  //   // Append searchTerm if provided
  //   if (searchTerm !== null && searchTerm.trim() !== '') {
  //     view_url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
  //   }
  //   // Construct request body based on filters
  //   const requestBody = {
  //     empCode: filters.empCode || "",
  //     empCodeManual: filters.empCodeManual || "",
  //     empName: filters.empName || "",
  //     selectedDepartments: filters.selectedDepartments || [],
  //     selectedDesignation: filters.selectedDesignation || "",
  //     selectedLocations: filters.selectedLocations || [],
  //     selectedNature: filters.selectedNature || "",
  //     selectedCity: filters.selectedCity || "",
  //     sortBy: filters.sortBy || "empcode",
  //     // userId: filters.userId || "",
  //     empStatus: filters.empStatus || "B",
  //     fk_costcentreid: filters.fk_costcentreid || ""
  //   };
  //   return this.http.post<any>(view_url, requestBody);
  // }

  //replace this  
  get_employee(pageIndex: number, pageSize: number, searchTerm: string | null, filters: any = {}): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.Get_employee}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    // Append searchTerm if provided
    if (searchTerm !== null && searchTerm.trim() !== '') {
      view_url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
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
      sortBy: filters.sortBy || "empcode",
      // userId: filters.userId || "",
      empStatus: filters.empStatus || "B",
      fk_costcentreid: filters.fk_costcentreid || "",
      statFilter: filters.statFilter || ""
    };
    return this.http.post<any>(view_url, requestBody);
  }



  update_employee(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_employee}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }
  update_employee_Shift(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Update_employee_Shift}`;
    return this.http.put<any>(view_url, data);  // Returning any type
  }

  getById_employee(pk_empid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_employee}/${pk_empid}`;
    return this.http.get<any[]>(view_url);
  }

  getSubDepById_Dropdown(fk_deptid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.get_SubDepartment_DropDown}/${fk_deptid}`;
    return this.http.get<any[]>(view_url);
  }

  getDdlListBasedOnCodeType(codeTypeId: string | number, organizationId: string = ''): Observable<any> {
    const endpoint = environment.payroll.GetDdlListBasedOnCodeType || '/General/GetDdlListBasedOnCodeType';
    return this.http.get<any>(`${environment.baseURL1}${endpoint}?codeTypeId=${codeTypeId}&organizationId=${organizationId}`);
  }




  getById_employeeattendance(pk_empid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_employeeAttendance}${pk_empid}`;
    return this.http.get<any[]>(view_url);
  }
  getById_employeeOtherDetails(pk_empid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_employeeOtherDetails}${pk_empid}`;
    return this.http.get<any[]>(view_url);
  }
  getById_employeeHeadDetails(pk_empid: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.GetById_employeeheadDetails}${pk_empid}`;
    return this.http.get<any[]>(view_url);
  }

  // delete_employee(pk_empid: string): Observable<any> {
  //   const view_url = `${environment.baseURL1}${environment.payroll.Delete_employee}/${pk_empid}`;
  //   return this.http.delete<any>(view_url);
  // }
  get_DropdownList(fieldName: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.DropdownList}/${fieldName}`;
    return this.http.get(view_url);
  }

  DownloadExcel(filters: any): Observable<any> {
    var pageIndex = 0;
    var pageSize = 100000;
    // var filters: any = {};
    const view_url = `${environment.baseURL1}${environment.payroll.Get_employee}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    const requestBody = {
      empCode: filters.empCode || "",
      empCodeManual: filters.empCodeManual || "",
      empName: filters.empName || "",
      selectedDepartments: filters.selectedDepartments || [],
      selectedDesignation: filters.selectedDesignation || "",
      selectedLocations: filters.selectedLocations || [],
      selectedNature: filters.selectedNature || "",
      selectedCity: filters.selectedCity || "",
      sortBy: filters.sortBy || "empcode",
      // userId: filters.userId || "",
      empStatus: filters.empStatus || "B",
      fk_costcentreid: filters.fk_costcentreid || ""
    };

    return this.http.post<any>(view_url, requestBody)
  }


  getEmployeeProfileView(empId: string): Observable<any> {
    const view_url = `${environment.baseURL1}/Employee/GetEmployeeProfileView?empId=${encodeURIComponent(empId)}`;
    return this.http.get<any>(view_url);
  }




  add_employeeHead(data: any): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.payroll.Insert_employeeHead}`;
    return this.http.post<any>(view_url, data);  // Returning any type
  }
  CheckDuplicateValue(fieldName: string, fieldValue: string, generalId?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
    if (generalId) {
      view_url += `&generalId=${generalId}`;
    }

    return this.http.get(view_url);
  }
    getTabAuditLogs(documentId: string, documentName: string, pageIndex: number = 1, pageSize: number = 10, entryBy?: string, fieldName?: string): Observable<any> {
    let view_url = `${environment.baseURL1}${environment.payroll.Get_tabAuditLogs}?documentId=${encodeURIComponent(documentId)}&documentName=${encodeURIComponent(documentName)}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (entryBy) {
      view_url += `&entryBy=${encodeURIComponent(entryBy)}`;
    }
    if (fieldName) {
      view_url += `&fieldName=${encodeURIComponent(fieldName)}`;
    }
    return this.http.get<any>(view_url);
  }

}



