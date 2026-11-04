import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CandidateValidationResult {
  isValid: boolean;
  isCompleted: boolean;
  message?: string;
  candidateId?: string;
  candidateName?: string;
  lastOpenedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateValidationService {

  constructor(private http: HttpClient) {}

  validateCandidateKey(candidateKey: string): Observable<CandidateValidationResult> {
    const headers = new HttpHeaders({ 'X-Candidate-Key': candidateKey });
    
    return this.http.get<any>(
      `${environment.baseURL1}/CandidateExperienceDetails/validate`, 
      { headers }
    ).pipe(
      map(response => {
        //  200 OK - Valid and not completed
        return {
          isValid: true,
          isCompleted: false,
          candidateId: response.candidateId,
          candidateName: response.candidateName,
          lastOpenedDate: response.lastOpenedDate,
          message: response.message
        };
      }),
      catchError(error => {
        if (error.status === 403) {
          //  403 - Onboarding completed
          return of({
            isValid: true,
            isCompleted: true,
            message: error.error?.message || 'Onboarding already completed'
          });
        } else if (error.status === 401) {
          //  401 - Invalid key
          return of({
            isValid: false,
            isCompleted: false,
            message: error.error?.message || 'Invalid or expired link'
          });
        } else {
          //  Other error
          return of({
            isValid: false,
            isCompleted: false,
            message: 'An error occurred during validation'
          });
        }
      })
    );
  }
}