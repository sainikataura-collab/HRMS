

// emp-chat.service.ts - With SignalR for Real-Time Chat
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  chatId?: number;
  conversationId: string;
  senderUserId: string;
  receiverUserId: string;
  senderRole: string;
  receiverRole: string;
  messageText: string;
  attachmentPath?: string;
  sentAt?: string;
  isRead?: boolean;
  notificationType?: string;
  senderName?: string;
}

export interface SendMessageResponse {
  success: boolean;
  chatId?: number;
  message?: string;
  timestamp?: string;
}

export interface ChatHistoryResponse {
  currentUserId: string;
  conversationId: string;
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class EMPChatService {
  private apiUrl = environment.baseURL + environment.chatAPI;
  
  // ✅ Subject for real-time chat messages (received via SignalR)
  private newChatMessageSubject = new Subject<any>();
  public newChatMessage$ = this.newChatMessageSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('💬 Chat Service initialized');
    console.log('   API URL:', this.apiUrl);
  }

  // ✅ Method to emit received messages from SignalR
  public emitNewChatMessage(message: any): void {
    this.newChatMessageSubject.next(message);
  }

  // ✅ Send message via HTTP POST
  sendMessage(message: ChatMessage): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.apiUrl}/send`, message);
  }

  // ✅ Get conversation messages
  getConversationMessages(conversationId: string): Observable<ChatHistoryResponse> {
    console.log('📡 Fetching conversation messages:', conversationId);
    return this.http.get<ChatHistoryResponse>(`${this.apiUrl}/conversation?otherUserId=${conversationId}`);
  }

  // getConversationMessagesbyuser(conversationId: string): Observable<ChatHistoryResponse> {
  //   console.log('📡 Fetching conversation messages:', conversationId);
  //   return this.http.get<ChatHistoryResponse>(`${this.apiUrl}/Getconversation?otherUserId=${conversationId}`);
  // }

  // ✅ UPDATED: Include roles in chat history request
  getConversationMessagesbyuser(
    otherUserId: string, 
    otherUserRole: string = 'HR', 
    myRole: string = 'EMP'
  ): Observable<ChatHistoryResponse> {
    console.log('📡 Fetching conversation messages:', otherUserId);
    const url = `${this.apiUrl}/Getconversation?otherUserId=${otherUserId}&otherUserRole=${otherUserRole}&myRole=${myRole}`;
    return this.http.get<ChatHistoryResponse>(url);
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