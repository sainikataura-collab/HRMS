import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface LocationRecord {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  clientTimestamp: string;
  serverReceivedAt: string;
  isBackground: boolean;
  batteryLevel?: number;
  deviceInfo?: string;
}

export interface UserTrackingStatus {
  userId: string;
  isTrackingEnabled: boolean;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationTrackerService {

  constructor(private http: HttpClient) { }

  /**
   * Fetches employee dropdown list using existing HrBook API
   */
  getEmployeeDropdown(): Observable<any> {
    const url = `${environment.baseURL}/Employee/GetEmployeesForDropdown`;
    return this.http.post<any>(url, {});
  }

  /**
   * GET /api/v1/LocationTracker/status?userId={userId}
   * Checks whether tracking is enabled (ON) or disabled (OFF) for user
   */
  getUserTrackingStatus(userId: string): Observable<any> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<any>(`${environment.baseURL}/LocationTracker/status`, { params });
  }

  /**
   * POST /api/v1/LocationTracker/toggle-status
   * Toggles tracking ON (true) or OFF (false) for user
   */
  toggleUserTrackingStatus(userId: string, isEnabled: boolean): Observable<any> {
    const url = `${environment.baseURL}/LocationTracker/toggle-status`;
    return this.http.post<any>(url, { userId, isEnabled });
  }

  /**
   * GET /api/v1/LocationTracker/live?userId={userId}
   * Fetches top 1 most recent location ping for a given user
   */
  getLiveLocation(userId: string): Observable<any> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<any>(`${environment.baseURL}/LocationTracker/live`, { params });
  }

  /**
   * GET /api/v1/LocationTracker/history?userId={userId}&date={yyyy-MM-dd}
   * Fetches all location entries for a specific user and date
   */
  getLocationHistory(userId: string, date: string): Observable<any> {
    let params = new HttpParams().set('userId', userId);
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<any>(`${environment.baseURL}/LocationTracker/history`, { params });
  }
}
