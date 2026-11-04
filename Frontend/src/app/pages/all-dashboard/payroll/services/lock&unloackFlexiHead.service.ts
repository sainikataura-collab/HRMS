import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  constructor(private http: HttpClient) { }
  add_LoanAttotment(data: any) {
        
    const insert_url = `https://your-api-url.com/assing`;
    return this.http.post<any>(insert_url, data).pipe(
      map((LoanAttotment: any) => {
        return LoanAttotment;
      })
    );
  }

  update_LoanAttotment(data:any,id:number){

  }
  Dedutorinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/Dedutor`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Dedutor_insert: any) => {
        return Dedutor_insert;
      })
    );
  }
 perquisiteinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/perquisite`;
    return this.http.post<any>(insert_url, data).pipe(
      map((perquisite_insert: any) => {
        return perquisite_insert;
      })
    );
  }
  taxDeductorinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/taxDeductor`;
    return this.http.post<any>(insert_url, data).pipe(
      map((Deductor_insert: any) => {
        return Deductor_insert;
      })
    );
  }

  professionalinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/professional`;
    return this.http.post<any>(insert_url, data).pipe(
      map((professional_insert: any) => {
        return professional_insert;
      })
    );
  }
 sectioninsert(data: any) {
        
    const insert_url = `https://your-api-url.com/section`;
    return this.http.post<any>(insert_url, data).pipe(
      map((section_insert: any) => {
        return section_insert;
      })
    );
  }
  subsectioninsert(data: any) {
        
    const insert_url = `https://your-api-url.com/section`;
    return this.http.post<any>(insert_url, data).pipe(
      map((subsection_insert: any) => {
        return subsection_insert;
      })
    );
  }

 previousinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/previous`;
    return this.http.post<any>(insert_url, data).pipe(
      map((previous_insert: any) => {
        return previous_insert;
      })
    );
  }

//setting

 lockunlockinsert(data: any) {
        
    const insert_url = `https://your-api-url.com/lockunlock`;
    return this.http.post<any>(insert_url, data).pipe(
      map((lockunlock_insert: any) => {
        return lockunlock_insert;
      })
    );
  }
}
