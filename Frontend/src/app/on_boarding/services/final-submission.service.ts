import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinalSubmissionService {

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const candidateKey = sessionStorage.getItem('candidateKey') || '';
    return new HttpHeaders({ 'X-Candidate-Key': candidateKey });
  }

  // Short-lived cache so sidebar + final-submission component share one HTTP call
  private _summaryCache$: Observable<any> | null = null;
  private _summaryCacheTime: number = 0;
  private readonly CACHE_TTL_MS = 10000; // 10 seconds

  // ✅ Get candidate final summary
  getCandidateFinalSummary(): Observable<any> {
    const now = Date.now();
    // Return cached observable if within TTL (prevents double API call from sidebar + component)
    if (this._summaryCache$ && (now - this._summaryCacheTime) < this.CACHE_TTL_MS) {
      return this._summaryCache$;
    }
    this._summaryCacheTime = now;
    this._summaryCache$ = this.http.get<any>(
      `${environment.baseURL1}/CandidateExperienceDetails/final-summary`,
      { headers: this.getHeaders() }
    ).pipe(shareReplay(1));
    return this._summaryCache$;
  }

  // Call this after submit to force fresh data next time
  clearSummaryCache(): void {
    this._summaryCache$ = null;
    this._summaryCacheTime = 0;
  }

  // Submit onboarding
  submitOnboarding(): Observable<any> {
    return this.http.post<any>(
      `${environment.baseURL1}/CandidateExperienceDetails/submit-onboarding`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getImageOnboard(filename: string): Observable<Blob> {
    const candidateKey = sessionStorage.getItem('candidateKey') || '';
    const url = `${environment.baseURL1}/CandidateExperienceDetails/images/${filename}`;
    return this.http.get(url, { 
      headers: this.getHeaders(),
      responseType: 'blob' 
    });
  }

   sendOtp(mobileNo: string, userName: string = ''): Observable<any> {
    const baseUrl = environment.baseURL1.replace('/v1', '');
    const url = `${baseUrl}/Otp/SendOtp`;
    return this.http.post<any>(url, { mobileNo, userName });
  }

  // ✅ Verify OTP
  verifyOtp(mobileNo: string, otp: string): Observable<any> {
    const baseUrl = environment.baseURL1.replace('/v1', '');
    const url = `${baseUrl}/Otp/VerifyOtp`;
    return this.http.post<any>(url, { mobileNo, otp });
  }
}
