import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HrmanagementService {

  constructor(private http: HttpClient) { }
  ConfirmationEmailinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/ConfirmationEmailinsert`;
    return this.http.post<any>(insert_url, data).pipe(
      map((ConfirmationEmail_insert: any) => {
        return ConfirmationEmail_insert;
      })
    );
  }

  Appreciatorinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Appreciator`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Appreciator_insert: any) => {
        return Appreciator_insert;
      })
    );
  }

  Budgetissuemasterinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Budgetissuemaster`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Budgetissuemaster_insert: any) => {
        return Budgetissuemaster_insert;
      })
    );
  }

  Dueclearencemasterinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Dueclearencemaster`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Dueclearencemaster_insert: any) => {
        return Dueclearencemaster_insert;
      })
    );
  }

  Userparametermasterinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Userparametermaster`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Userparametermaster_insert: any) => {
        return Userparametermaster_insert;
      })
    );
  }

  //

 Skiplevelinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Skiplevel`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Skiplevel_insert: any) => {
        return Skiplevel_insert;
      })
    );
  }

  //
 complaintlinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/complaintl`;
    return this.http.post<any>(insert_url, data).pipe(
      map((complaintl_insert: any) => {
        return complaintl_insert;
      })
    );
  }
confirmationinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/confirmation`;
    return this.http.post<any>(insert_url, data).pipe(
      map((confirmation_insert: any) => {
        return confirmation_insert;
      })
    );
  }

  Appreciationinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Appreciation`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Appreciation_insert: any) => {
        return Appreciation_insert;
      })
    );
  }
}
