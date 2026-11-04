import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class MenuService {
  private menuSubject = new BehaviorSubject<any[]>(this.loadMenuFromStorage()); //  load from session
  public menu$ = this.menuSubject.asObservable();

  constructor(private http: HttpClient) {}
// for issue in terminal .....
  // private loadMenuFromStorage(): any[] {
  //   const stored = sessionStorage.getItem('userMenu');
  //   return stored ? JSON.parse(stored) : [];
  // }

  private loadMenuFromStorage(): any[] {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem('userMenu');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }
  // for issue in terminal start.....
  // setMenu(menu: any[]): void {
  //   sessionStorage.setItem('userMenu', JSON.stringify(menu));
  //   this.menuSubject.next(menu);
  // }

 
  // clearMenu(): void {
  //   sessionStorage.removeItem('userMenu');
  //   this.menuSubject.next([]);
  // }


   // for issue in terminal end .....

  setMenu(menu: any[]): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('userMenu', JSON.stringify(menu));
    }
    this.menuSubject.next(menu);
  }

  clearMenu(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('userMenu');
    }
    this.menuSubject.next([]);
  }

  getCurrentMenu(): any[] {
    return this.menuSubject.value;
  }

  getallMenubasedonUser(): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Authentication.getallMenubasedonUser}`;
    return this.http.get(view_url);
  }

 switchToAdmin(payload: any) {
  return this.http.post<any>(
    `${environment.baseURL1}/User/switch-employee-to-admin`,
    payload
  );
}
switchToEmployee(payload: any) {
  return this.http.post<any>(
    `${environment.baseURL1}/User/SwitchAdmintoEmployeeAsync`,
    payload
  );
}


}
