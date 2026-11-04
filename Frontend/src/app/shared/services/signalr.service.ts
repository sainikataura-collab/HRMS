
// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import * as signalR from '@microsoft/signalr';
// import { Subject, BehaviorSubject } from 'rxjs';
// import { environment } from '../../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class SignalRService {
//   private hubConnection!: signalR.HubConnection;

//   // Observable for new messages
//   private messageReceivedSubject = new Subject<any>();
//   public messageReceived$ = this.messageReceivedSubject.asObservable();

//    // ✅ NEW: Observable for typing indicators
//   private typingIndicatorSubject = new Subject<any>();
//   public typingIndicator$ = this.typingIndicatorSubject.asObservable();

//   // ✅ NEW: Observable for read receipts
//   private readReceiptSubject = new Subject<any>();
//   public readReceipt$ = this.readReceiptSubject.asObservable();

//   // Track connection status
//   private connectionStatus = new BehaviorSubject<boolean>(false);
//   public connectionStatus$ = this.connectionStatus.asObservable();


//   constructor(private http: HttpClient) { }

//   public startConnection(userId: string): Promise<void> {
//     // Prevent multiple connections
//     if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
//       console.log('Already connected to SignalR');
//       return Promise.resolve();
//     }

//     // Build the connection with proper configuration
//     this.hubConnection = new signalR.HubConnectionBuilder()
//       // .withUrl('https://localhost:7142/ChatHub', { // Replace with your actual port
//       .withUrl(`${environment.chatHub}`, {
//         skipNegotiation: false,
//         transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents
//       })
//       .withAutomaticReconnect([0, 2000, 5000, 10000]) // Retry intervals
//       .configureLogging(signalR.LogLevel.Information)
//       .build();

//     // Set up event handlers BEFORE starting connection
//     this.setupEventHandlers(userId);

//     // Start the connection
//     return this.hubConnection
//       .start()
//       .then(() => {
//         console.log('✅ SignalR Connection Started');
//         this.connectionStatus.next(true);

//         // Join the user's group
//         return this.hubConnection.invoke('JoinChat', userId);
//       })
//       .then(() => {
//         console.log(`✅ Joined chat group for user: ${userId}`);
//       })
//       .catch(err => {
//         console.error('❌ Error starting SignalR connection:', err);
//         this.connectionStatus.next(false);
//         throw err;
//       });
//   }

//   private setupEventHandlers(userId: string): void {
//     // Handle incoming notifications
//     this.hubConnection.on('ReceiveNotification', (data: any) => {
//       console.log('📩 Notification received:', data);
//       this.messageReceivedSubject.next(data);
//     });

//     // ✅ NEW: Handle typing indicators
//     this.hubConnection.on('ReceiveTypingIndicator', (data: any) => {
//       console.log('⌨️ Typing indicator received:', data);
//       this.typingIndicatorSubject.next(data);
//     });

//     // ✅ NEW: Handle read receipts
//     this.hubConnection.on('ReceiveReadReceipt', (data: any) => {
//       console.log('✓✓ Read receipt received:', data);
//       this.readReceiptSubject.next(data);
//     });

//     // Handle reconnection
//     this.hubConnection.onreconnecting((error) => {
//       console.warn('⚠️ SignalR reconnecting...', error);
//       this.connectionStatus.next(false);
//     });

//     this.hubConnection.onreconnected((connectionId) => {
//       console.log('✅ SignalR reconnected:', connectionId);
//       this.connectionStatus.next(true);
//       // Rejoin the group after reconnection
//       this.hubConnection.invoke('JoinChat', userId);
//     });

//     this.hubConnection.onclose((error) => {
//       console.error('❌ SignalR connection closed:', error);
//       this.connectionStatus.next(false);
//     });
//   }

//   public stopConnection(): Promise<void> {
//     if (this.hubConnection) {
//       return this.hubConnection.stop().then(() => {
//         console.log('🛑 SignalR connection stopped');
//         this.connectionStatus.next(false);
//       });
//     }
//     return Promise.resolve();
//   }


//   // ✅ NEW: Send typing indicator
//   public sendTypingIndicator(receiverUserId: string, senderUserId: string, senderName: string, isTyping: boolean): Promise<any> {
//     if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
//       return this.hubConnection.invoke('SendTypingIndicator', receiverUserId, senderUserId, senderName, isTyping);
//     }
//     return Promise.reject('Not connected to SignalR');
//   }

//   // ✅ NEW: Send read receipt
//   public sendReadReceipt(senderUserId: string, receiverUserId: string, chatId: number): Promise<any> {
//     if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
//       return this.hubConnection.invoke('SendReadReceipt', senderUserId, receiverUserId, chatId);
//     }
//     return Promise.reject('Not connected to SignalR');
//   }



//   // Optional: Method to send test notification
//   public sendTestNotification(userId: string, message: string): Promise<any> {
//     if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
//       return this.hubConnection.invoke('SendNotificationToUser', userId, message);
//     }
//     return Promise.reject('Not connected to SignalR');
//   }
// }


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  // Observable for new messages
  private messageReceivedSubject = new Subject<any>();
  public messageReceived$ = this.messageReceivedSubject.asObservable();

  // Observable for typing indicators
  private typingIndicatorSubject = new Subject<any>();
  public typingIndicator$ = this.typingIndicatorSubject.asObservable();

  // Observable for read receipts
  private readReceiptSubject = new Subject<any>();
  public readReceipt$ = this.readReceiptSubject.asObservable();

  // Track connection status
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * ✅ FIXED: Start connection with role information
   */
  public startConnection(userId: string, userRole: string = ''): Promise<void> {
    // Prevent multiple connections
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('Already connected to SignalR');
      return Promise.resolve();
    }

    // Get user role from session if not provided
    if (!userRole) {

      // const userType = sessionStorage.getItem('usertype');
      // userRole = userType === 'User' ? 'HR' : 'EMP';
       const isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
      if (isVendor) {
        userRole = 'Vendor';
      } else {
        const userType = sessionStorage.getItem('usertype');
        userRole = userType === 'User' ? 'HR' : 'EMP';
      }
    }

    // Build the connection with proper configuration
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.chatHub}`, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers BEFORE starting connection
    this.setupEventHandlers(userId, userRole);

    // Start the connection
    return this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR Connection Started');
        this.connectionStatus.next(true);

        // ✅ Join the user's role-specific group
        return this.hubConnection.invoke('JoinChat', userId, userRole);
      })
      .then(() => {
        console.log(`✅ Joined chat group for user: ${userId} (${userRole})`);
      })
      .catch(err => {
        console.error('❌ Error starting SignalR connection:', err);
        this.connectionStatus.next(false);
        throw err;
      });
  }

  private setupEventHandlers(userId: string, userRole: string): void {
    // Handle incoming notifications
    this.hubConnection.on('ReceiveNotification', (data: any) => {
      console.log('📩 Notification received:', data);
      
      // ✅ IMPORTANT: Filter out messages sent by yourself
      if (data.senderId === userId && data.senderRole === userRole) {
        console.log('⚠️ Ignoring own message');
        return;
      }
      
      this.messageReceivedSubject.next(data);
    });

    // Handle typing indicators
    this.hubConnection.on('ReceiveTypingIndicator', (data: any) => {
      console.log('⌨️ Typing indicator received:', data);
      
      // ✅ Filter out own typing
      if (data.senderId === userId && data.senderRole === userRole) {
        console.log('⚠️ Ignoring own typing indicator');
        return;
      }
      
      this.typingIndicatorSubject.next(data);
    });

    // Handle read receipts
    this.hubConnection.on('ReceiveReadReceipt', (data: any) => {
      console.log('✓✓ Read receipt received:', data);
      this.readReceiptSubject.next(data);
    });

    // Handle reconnection
    this.hubConnection.onreconnecting((error) => {
      console.warn('⚠️ SignalR reconnecting...', error);
      this.connectionStatus.next(false);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconnected:', connectionId);
      this.connectionStatus.next(true);
      // Rejoin the group after reconnection
      this.hubConnection.invoke('JoinChat', userId, userRole);
    });

    this.hubConnection.onclose((error) => {
      console.error('❌ SignalR connection closed:', error);
      this.connectionStatus.next(false);
    });
  }

  public stopConnection(): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.stop().then(() => {
        console.log('🛑 SignalR connection stopped');
        this.connectionStatus.next(false);
      });
    }
    return Promise.resolve();
  }  

  /**
   * ✅ FIXED: Send typing indicator with receiver role
   */
  public sendTypingIndicator(
    receiverUserId: string, 
    receiverRole: string,
    senderUserId: string, 
    senderName: string, 
    isTyping: boolean
  ): Promise<any> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke(
        'SendTypingIndicator', 
        receiverUserId, 
        receiverRole,
        senderUserId, 
        senderName, 
        isTyping
      );
    }
    return Promise.reject('Not connected to SignalR');
  }

  /**
   * ✅ FIXED: Send read receipt with sender role
   */
  public sendReadReceipt(
    senderUserId: string, 
    senderRole: string,
    receiverUserId: string, 
    chatId: number
  ): Promise<any> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke(
        'SendReadReceipt', 
        senderUserId, 
        senderRole,
        receiverUserId, 
        chatId
      );
    }
    return Promise.reject('Not connected to SignalR');
  }

  // Optional: Method to send test notification
  public sendTestNotification(userId: string, userRole: string, message: string): Promise<any> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.invoke('SendNotificationToUser', userId, userRole, message);
    }
    return Promise.reject('Not connected to SignalR');
  }
}