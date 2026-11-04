import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class KraService {

constructor(private http:HttpClient) { }

  getAllrolewiseKRA(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Rolewise_KRA_getList}`;
    return this.http.get(apiUrl);
  }

  updaterolewiseKRA(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Rolewise_KRA_Ins}`;
    return this.http.post<any>(apiUrl, data);
  }

  deleterolewiseKRA(RoleId: number,SrNo:number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Rolewise_KRA_Delete}?RoleId=${RoleId}&SrNo=${SrNo}`;
    return this.http.delete<any>(apiUrl);
  }

  GetByIdrolewiseKRA(RoleId: string,SrNo:number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Rolewise_KRA_GetById}?roleId=${RoleId}&SrNo=${SrNo}`;
    return this.http.get<any>(apiUrl);
  }

  //  Empwise KRA

  updateEmployeewiseKRA(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Employeewise_KRA_Ins}`;
    return this.http.post<any>(apiUrl, data);
  }

  getAllEmpwiseKRA(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Employeewise_KRA_GetALL}`;
    return this.http.get(apiUrl);
  }


  GetByIdEmpwiseKRA(fk_empId: string,SrNo:number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Employeewise_KRA_GetById}?fk_empId=${fk_empId}&SrNo=${SrNo}`;
    return this.http.get<any>(apiUrl);
  }

 
  deleteEmpwiseKRA(fk_empId: string,SrNo:number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Employeewise_KRA_Delete}?fk_empId=${fk_empId}&SrNo=${SrNo}`;
    return this.http.delete<any>(apiUrl);
  }


   getEmpList(filters: any = {}): Observable<any> {
    const url =` ${environment.baseURL1}${environment.payroll.Employee_GetAll_Ddl}`;
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


   // Get Data  for baseon empid for self assessment
   GetById_Self_KRA(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Emp_Self_getByempId}`;
    return this.http.get<any>(apiUrl);
  }


  Insert_Add_Self_Emp_Kra(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Emp_Self_Assessment_KRA}`;
    return this.http.post<any>(apiUrl, data);
  }

    update_SelfAssessment(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.Emp_Self_Assessment_KRA_Upd}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }
    update_RMAssessment(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.RM_Assessment_Upd}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }

    update_HODAssessment(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Requitment.HOD_Assessment_Upd}`;
    return this.http.put<any>(url, data);  // UPDATE operation
  }


   // Get Data  for baseon empid for self assessment
    GetById_Assessment_KRA(pk_kraassId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Emp_Assessment_getById}?kraId=${pk_kraassId}`;
    return this.http.get<any>(apiUrl);
  }
   
  GetById_RMAssessment_KRA(fk_empid: string,fk_kraperiodId:number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.RM_getByempId}?empid=${fk_empid}&fk_kraperiodId=${fk_kraperiodId}`;
    return this.http.get<any>(apiUrl);


  }
  GetById_HODAssessment_KRA(fk_empid: string,fk_kraperiodId:number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.HOD_getByempId}?empid=${fk_empid}&fk_kraperiodId=${fk_kraperiodId}`;
    return this.http.get<any>(apiUrl);
  }


  //   GetById_RMAssessment_KRA(kraAssid: number): Observable<any> {
  //   const apiUrl = `${environment.baseURL1}${environment.Requitment.RM_getByempId}?kraAssid=${kraAssid}`;
  //   return this.http.get<any>(apiUrl);
  // }


 Employeewise_KRAGetEmployeeKRAIdAsync(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Employeewise_KRAGetEmployeeKRAIdAsync}`;
    return this.http.get<any>(apiUrl);
  }


  getAllSelfAssess(page: number, pageSize: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Emp_SelfAssessment_getAll}`;
    return this.http.get(apiUrl);
  }


  KraPeriodList(): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Kra_Period_DropDown}`;
    return this.http.get(apiUrl);
  }


  getAllRMAssess(page: number, pageSize: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Emp_RMAssessment_getAll}`;
    return this.http.get(apiUrl);
  }
  
  getAllHODAssess(page: number, pageSize: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Emp_HODAssessment_getAll}`;
    return this.http.get(apiUrl);
  }

  getAll_role_Assess(page: number, pageSize: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.RoleWise_Assessment_getAll}`;
    return this.http.get(apiUrl);
  }

  Insert_Role_Assessment_Kra(data: any): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.RoleWise_Assessment_Insert}`;
    return this.http.post<any>(apiUrl, data);
  }
   GetById_Role_Assessment(RoleId: number): Observable<any> {
    const apiUrl = `${environment.baseURL1}${environment.Requitment.Role_Assessment_getByempId}?RoleId=${RoleId}`;
    return this.http.get<any>(apiUrl);
  }


  // period validate

validatePeriod(kraperiodId: number): Observable<any> {
       const apiUrl = `${environment.baseURL1}${environment.Requitment.validatePeriod}/${kraperiodId}`;
  return this.http.get<any>(apiUrl);}



}
