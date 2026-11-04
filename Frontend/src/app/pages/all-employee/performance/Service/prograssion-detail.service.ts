import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrograssionDetailService {

  constructor(private http: HttpClient) { }

  getAllPrograssionDetails(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.GetAll_PrograssionDetail}`;
    return this.http.get<any>(url);
  }
  getRentDetailsList(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.get_RentDetailsList}`;
    return this.http.get(url);
  }
  getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL1}${environment.HR.User_image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }
  addRentDetails(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.add_RentDetails}`;
    return this.http.post(url, data);
  }


  
    getALL(
    pageIndex: number,
    pageSize: number,
    searchTerm: string | null
  ): Observable<any> {
    let apiUrl = `${environment.baseURL1}${environment.Compensation.Get_All_RentDetailsList}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    

    // Append searchTerm if provided
    if (searchTerm !== null && searchTerm.trim() !== '') {
      apiUrl += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<any>(apiUrl);
  }

  // Get rent details by ID for edit
  getRentDetailsById(pk_rentId: string): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.RentDetailsById}`;
    return this.http.get(url);
  }

  // Update rent details
  updateRentDetails(data: any): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.update_RentDetails}`;
    return this.http.put(url, data);
  }


  // Get rent details by ID for edit
  FinancialYearMonth(): Observable<any> {
    const url = `${environment.baseURL1}${environment.Compensation.FinancialYearMonth}`;
    return this.http.get(url);
  }






  appraisalDetails(fk_empid: string, year: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Appraisal.AppraisalDetails}?fk_empid=${fk_empid}&year=${year}`;
    return this.http.get(view_url);
  }

  AppraisalYearDdl(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Appraisal.AppraisalYearDdl}`;
    return this.http.get(view_url);
  }
  AppraisalInsert(data: any): Observable<any> {
    const insert_url = `${environment.baseURL1}${environment.Appraisal.AppraisalInsert}`;
    return this.http.post(insert_url, data);
  }

  getAppraisalList(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Appraisal.getappraisalList}`;
    return this.http.get(view_url);
  }
  getAppraisalListHod(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Appraisal.getappraisalListhod}`;
    return this.http.get(view_url);
  }

  appraisaldetailsview(empId: string, yearId: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Appraisal.getappraisalById}?fk_empid=${empId}&fk_yearId=${yearId}`;
    return this.http.get(view_url);
  }
  checkAppraisalExists(fk_empid: string, year: number): Observable<any> {
    const check_url = `${environment.baseURL1}${environment.Appraisal.checkAppraisalExists}?empId=${fk_empid}&appId=${year}`;
    return this.http.get(check_url);
  }

}
