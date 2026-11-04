import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChangeWebUser{
    
  constructor(private http: HttpClient, private router: Router, public ngZone: NgZone) {

  }

  inert(data: any) {
    const url = "https://uers/copponwallet";
   return this.http.post<any>(url, data);
  }
}