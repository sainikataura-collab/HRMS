

// hrchatting-system.service.ts - HTTP Only (No SignalR)
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { By } from '@angular/platform-browser';
import { AnyAaaaRecord } from 'dns';

export interface ChatMessage {
  chatId?: number;
  conversationId: string;
  senderUserId: string;
  receiverUserId: string;
  senderRole: string;
  receiverRole: string;
  messageText: string;
  attachmentPath?: string;
  notificationType?: string;
  senderName?: string;
  sentAt?: string;
  isRead?: boolean;
}

export interface SendMessageResponse {
  success: boolean;
  chatId?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HRchattingSystemService {
  private apiUrl = environment.baseURL + environment.chatAPI;

  constructor(private http: HttpClient) {
    
  }

  // ✅ Send message via HTTP POST
  sendMessage(message: ChatMessage): Observable<SendMessageResponse> {
   
    return this.http.post<SendMessageResponse>(`${this.apiUrl}/send`, message);
  }

// getChatHistory(otherUserId: string): Observable<any> {
//   const url = `${this.apiUrl}/Getconversation?otherUserId=${otherUserId}`;
//   return this.http.get<any>(url);
// }

  // ✅ UPDATED: Include roles in chat history request
  getChatHistory(otherUserId: string, otherUserRole: string = 'EMP', myRole: string = 'HR'): Observable<any> {
    const url = `${this.apiUrl}/Getconversation?otherUserId=${otherUserId}&otherUserRole=${otherUserRole}&myRole=${myRole}`;
    return this.http.get<any>(url);
  }
          
// getChatSenderEmployeeList(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/GetChatSenderEmployeeList`);
//   }

// // ✅ UPDATED: Pass current user's role in headers
//   getChatSenderEmployeeList(currentUserRole: string): Observable<any> {
//     // ✅ Send role in custom header
//     const headers = new HttpHeaders({
//       'X-User-Role': currentUserRole
//     });

//     console.log('📋 Frontend: getChatSenderEmployeeList');
//     console.log('   Role:', currentUserRole);

//     return this.http.get(`${this.apiUrl}/GetChatSenderEmployeeList`, { headers });
//   }


// ✅ UPDATED: Service method in hrchatting-system.service.ts

// ✅ Get chat sender employee list with optional search
getChatSenderEmployeeList(currentUserRole: string = 'EMP', searchQuery: string = ''): Observable<any> {
  let params = new HttpParams();
  
  // ✅ Add search query if provided
  if (searchQuery && searchQuery.trim().length > 0) {
    params = params.set('searchQuery', searchQuery.trim());
  }
  
  console.log('📡 Fetching sender list with params:', {
    searchQuery: searchQuery || 'None',
    currentUserRole: currentUserRole
  });
  
  // ✅ Set role in header (as your controller expects it)
  const headers = new HttpHeaders({
    'X-User-Role': currentUserRole
  });
  
  return this.http.get<any>(`${this.apiUrl}/GetChatSenderEmployeeList`, { 
    params: params,
    headers: headers 
  });
}

// Don't forget to import HttpParams and HttpHeaders at the top:
// import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';


// Add these methods to your service

// Mark messages as read
// ✅ NEW: Mark messages as read
markMessagesAsRead(senderUserId: string): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/MarkAsRead?senderUserId=${encodeURIComponent(senderUserId)}`,
    {}  // empty body required
  );
}


// ✅ NEW: Get unread count
getUnreadCount(): Observable<any> {
  return this.http.get(`${this.apiUrl}/UnreadCount`);
}


  //not in used

  // ✅ Get conversation messages
  getConversationMessages(conversationId: string): Observable<ChatMessage[]> {
    console.log('📡 Fetching conversation messages:', conversationId);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${conversationId}`);
  }

  // ✅ Mark messages as read
  markAsRead(conversationId: number, userId: number): Observable<any> {
    console.log('👁️ Marking messages as read:');
    console.log('   ConversationId:', conversationId);
    console.log('   UserId:', userId);

    return this.http.post(`${this.apiUrl}/mark-read`, {
      conversationId,
      userId
    });
  }

  // ✅ Get unread messages count
  getUnreadMessages(userId: number): Observable<ChatMessage[]> {
    console.log('📡 Fetching unread messages for user:', userId);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/unread/${userId}`);
  }

  // ✅ Get all conversations for a user
  getUserConversations(userId: number): Observable<any[]> {
    console.log('📡 Fetching conversations for user:', userId);
    return this.http.get<any[]>(`${this.apiUrl}/user-conversations/${userId}`);
  }
}