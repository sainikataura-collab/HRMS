import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface OnboardingUser {
  empId: string;
  name: string;
  dept: string;
  type: string;
  status: 'Completed' | 'In Progress' | 'Initiated';
}

export interface OnboardingStats {
  completed: number;
  inProgress: number;
  initiated: number;
  total: number;
}

export interface WeeklySummary {
  thisWeek: number;
  lastWeek: number;
  pendingApprovals: number;
}

export interface MonthlySummary {
  new: number;
  total: number;
  cancelled: number;
}

export interface TimelineItem {
  empId: string;
  name: string;
  status: string;
  details: string;
  email:string;
  mobile:string;
}

export interface DashboardData {
  totalUsers: number;
  stats: OnboardingStats;
  weeklySummary: WeeklySummary;
  monthlySummary: MonthlySummary;
  recentOnboardings: OnboardingUser[];
  timeline: TimelineItem[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  
  constructor(private http: HttpClient, private router: Router, public ngZone: NgZone) {}

  getDashboardData(): Observable<any> {
    const view_url = `${environment.baseURL}${environment.Setting.getOnboardingDashboard}`;
   return this.http.get<any>(view_url);
  }

  // getRecentOnboardings(): Observable<OnboardingUser[]> {
  //   const view_url = `${environment.baseURL}${environment.Setting.getRecentOnboardings}`;
  //   return this.http.get<any>(view_url).pipe(
  //     map(response => response.data)
  //   );
  // }

  // getOnboardingById(empId: string): Observable<any> {
  //   const view_url = `${environment.baseURL}${environment.Setting.getOnboardingDetails}/${empId}`;
  //   return this.http.get<any>(view_url).pipe(
  //     map(response => response.data)
  //   );
  // }

  // exportData(format: string): Observable<Blob> {
  //   const view_url = `${environment.baseURL}${environment.Setting.exportOnboardingDashboard}?format=${format}`;
  //   return this.http.get(view_url, {
  //     responseType: 'blob'
  //   });
  // }

  getCandidateFinalSummary(candidateId: string): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Setting.getCandidatefinalsummary}/${candidateId}`;
    return this.http.get<any>(view_url);
  }

  getOnboardingMandatoryDetails(candidateId: string): Observable<any> {
     const view_url = `${environment.baseURL1}${environment.Setting.getOnboardingMandatoryDetails}/${candidateId}`;
    
    return this.http.get<any>(view_url);
  }

  getOnboardingCandidatelist(pageIndex: number, pageSize: number): Observable<any> {
    const view_url = `${environment.baseURL1}${environment.Setting.GetOnboardingCandidatelist}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(view_url);
  }

  downloadDocument(fileName: string) {
  return this.http.get(
    `${environment.baseURL1}${environment.Setting.documentfile}/${fileName}`,
    {
      responseType: 'blob', // Important!
    }
  );
}

  updateVendorStatus(pkRecId: string, statusId: number, approvedByName?: string, approverRemarks?: string, signatureFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('PkRecId', pkRecId);
    formData.append('StatusId', statusId.toString());
    
    if (approvedByName) formData.append('ApprovedByName', approvedByName);
    if (approverRemarks) formData.append('ApproverRemarks', approverRemarks);
    if (signatureFile) formData.append('SignatureFile', signatureFile);

    return this.http.post(`${environment.baseURL1}/Vendor/UpdateVendorStatus`, formData);
  }

  reInitiateVendorStatus(pkRecId: string): Observable<any> {
    const payload = { PkRecId: pkRecId };
    return this.http.post(`${environment.baseURL1}/Vendor/ReInitiateVendor`, payload);
  }
}

