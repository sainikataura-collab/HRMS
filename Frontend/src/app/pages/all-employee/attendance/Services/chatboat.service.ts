import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { map, catchError } from 'rxjs/operators';

export interface ChatboatRequest {
  empId: string;
  query: string;
  timestamp?: Date;
  sessionId?: string;
}

export interface ChatboatResponse {
  isSuccess: boolean;
  result?: any;
  data?: any;
  message?: string;
  error?: string;
  timestamp?: Date;
}

export interface MessageHistory {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  empId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatboatService {
  private messageHistory: BehaviorSubject<MessageHistory[]> = new BehaviorSubject<MessageHistory[]>([]);
  public messageHistory$ = this.messageHistory.asObservable();
  
  private sessionId: string = '';
  private currentEmpId: string = 'E1234'; // Default employee ID

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.initializeSession();
  }

  // --- Main API Methods ---

  /**
   * Sends a general text query. The C# backend expects a { empId, query } payload.
   */
  sendPrompt(prompt: string): Observable<ChatboatResponse> {
    this.addToHistory('user', prompt);
    const endpoint = `${environment.baseURL1}/Chat/query`;
    const payload = { empId: this.currentEmpId, query: prompt };
    return this.makeRequest(endpoint, payload);
  }

  /**
   * Submits letter form details. The C# backend for this endpoint expects the details object directly.
   */
  processLetterRequest(letterDetails: any): Observable<ChatboatResponse> {
    const userMessage = `Submitting letter details...`;
    this.addToHistory('user', userMessage);
    const endpoint = `${environment.baseURL1}/Chat/letter`;
    // We send the letterDetails object directly as the payload.
    return this.makeRequest(endpoint, letterDetails);
  }

  /**
   * Submits reminder form details. The C# backend for this endpoint expects the details object directly.
   */
  processReminderRequest(reminderDetails: any): Observable<ChatboatResponse> {
    const userMessage = `Setting reminder for: ${reminderDetails.emp_code}`;
    this.addToHistory('user', userMessage);
    const endpoint = `${environment.baseURL1}/Chat/reminder`;
    // We send the reminderDetails object directly as the payload.
    return this.makeRequest(endpoint, reminderDetails);
  }

  /**
   * Centralized function to make the HTTP POST call and handle the response.
   * It now sends whatever payload it is given directly.
   */
  private makeRequest(endpoint: string, payload: any): Observable<ChatboatResponse> {
    console.log(`🚀 Sending to C# Endpoint: ${endpoint}`, payload);

    return this.http.post<ChatboatResponse>(endpoint, payload, this.httpOptions).pipe(
      map((response: any) => {
        const chatResponse: ChatboatResponse = {
          isSuccess: response.isSuccess || false,
          result: response.result || response.data || response.message,
          data: response.data,
          message: response.message,
          timestamp: new Date(response.timestamp) || new Date()
        };
        if (chatResponse.isSuccess && chatResponse.data) {
          const content = typeof chatResponse.data === 'string' ? chatResponse.data : JSON.stringify(chatResponse.data);
          this.addToHistory('bot', content);
        } else if (chatResponse.isSuccess) {
           this.addToHistory('bot', chatResponse.message || 'Success');
        }
        return chatResponse;
      }),
      catchError((error) => {
        const errorResult = 'Something went wrong. Please try again.';
        this.addToHistory('bot', errorResult);
        return of({
          isSuccess: false,
          result: errorResult,
          error: error.message || 'Unknown error occurred',
          timestamp: new Date()
        });
      })
    );
  }

  // --- History and Session Management ---

  private addToHistory(type: 'user' | 'bot', content: string): void {
    const currentHistory = this.messageHistory.value;
    const newMessage: MessageHistory = {
      id: this.generateMessageId(),
      type,
      content,
      timestamp: new Date(),
      empId: this.currentEmpId
    };
    this.messageHistory.next([...currentHistory, newMessage]);
  }
  
  private initializeSession(): void {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  formatBotMessage(message: string): string {
    if (typeof message !== 'string') return '';
    return message.replace(/\n/g, '<br>');
  }

  clearMessageHistory(): void {
    this.messageHistory.next([]);
  }

  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.clearMessageHistory();
  }
}
