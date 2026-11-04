import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LevelMasterService {

  constructor(private http: HttpClient) { }

 // Add Level Master
addLevelMaster(data: any): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.Level_insert}`;
  return this.http.post<any>(apiUrl, data);
}

// Get All Levels with pagination
getAllLevels(pageIndex: number, pageSize: number): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.Level_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  return this.http.get<any>(apiUrl);
}

// Update Level
updateLevel(levelData: any): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.Level_update}`;
  return this.http.put<any>(apiUrl, levelData);
}

// Get Level by ID
getLevelById(levelId: string): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.Level_getbyId}/${levelId}`;
  return this.http.get<any>(apiUrl);
}

// Delete Level
deleteLevel(levelId: string): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.Level_delete}/${levelId}`;
  return this.http.delete<any>(apiUrl);
}

// Check for duplicate values
checkDuplicateValue(fieldName: string, fieldValue: string, levelId?: string): Observable<any> {
  let viewUrl = `${environment.baseURL1}${environment.payroll.IsValueAvailable}/${fieldName}?fieldValue=${fieldValue}`;
  if (levelId) {
    viewUrl += `&generalId=${levelId}`;
  }
  return this.http.get(viewUrl);
}

DownloadExcel():Observable<any> {
  var pageIndex =0;
  var pageSize=100000;
  const view_url = `${environment.baseURL1}${environment.payroll.Level_getall}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  return this.http.get<any>(view_url);  // Returning any type

}


getReimbHeads(): Observable<any> {
  const apiUrl = `${environment.baseURL1}${environment.payroll.reimb_heads}`;
  return this.http.get<any>(apiUrl);
}

}