

import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { HrChatService } from '../../HRservices/hr-chat.service';
import { ToastrService } from 'ngx-toastr';
import { HRchattingSystemService, ChatMessage } from '../../HRservices/hrchatting-system.service';
import { SignalRService } from '../../../../../shared/services/signalr.service';
import { Subscription } from 'rxjs';

interface Employee {
  pk_empid?: string;
  EmpRole?: string;
  name: string;
  dept: string;
  img: string;
  type?: string;
  date?: string;
}

interface Message {
  sender: string;
  text?: string;
  time: string;
  type?: string;
  imageUrl?: string;
  chatId?: number;
  isRead?: boolean;
}

@Component({
  selector: 'app-hr-chatboat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-chatboat.component.html',
  styleUrl: './hr-chatboat.component.scss',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ]),
    trigger('messageAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class HrChatboatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  selectedEmployee: Employee | null = null;
  messages: Message[] = [];
  newMessage: string = '';
  showQuickActions: boolean = false;
  showTemplateModal: boolean = false;
  selectedTemplateType: string = '';
  isTyping: boolean = false;
  showEmojiPicker: boolean = false;
  searchQuery: string = '';
  showHeaderMenu: boolean = false;
  isMobileView: boolean = false;
  private shouldScrollToBottom = false;
  currentUserIdString: string = '';
  currentUserName: string = '';
  
  // ✅ CRITICAL: Define current user role
  private currentUserRole: string = 'HR';
  private conversationId: string = '';
  private conversationIdd: number = 0;

   // ✅ NEW: Search properties
  private searchDebounceTimer: any;
  private readonly MIN_SEARCH_LENGTH = 3;
  isSearching: boolean = false;
  
  private signalRSubscription?: Subscription;
  private typingSubscription?: Subscription;
  private readReceiptSubscription?: Subscription;
  
  private typingTimeout: any;
  
  private activeTabType: 'chats' | 'today' | 'upcoming' | 'anniversary' | 'event' = 'chats';

  todayBirthdays: Employee[] = [];
  upcomingBirthdays: Employee[] = [];
  anniversaries: Employee[] = [];
  upcomingEvents: Employee[] = [];
  senderList: Employee[] = [];
  
  filteredSenderList: Employee[] = [];
  filteredTodayBirthdays: Employee[] = [];
  filteredUpcomingBirthdays: Employee[] = [];
  filteredAnniversaries: Employee[] = [];
  filteredEvents: Employee[] = [];

  emojis = [
    '😊', '😂', '🤣', '❤️', '😍', '😘', '🥰', '😎', 
    '🤗', '🤔', '😅', '😆', '😉', '😋', '😜', '🤪',
    '🥳', '🤩', '😇', '🙂', '😌', '😏', '😶', '😐',
    '🎉', '🎊', '🎈', '🎁', '🎂', '🎆', '🎇', '✨',
    '🌟', '⭐', '💫', '🌈', '🌸', '🌺', '🌻', '🌹',
    '💐', '🌷', '🏵️', '🥀', '🌼', '🌵', '🌴', '🌳',
    '👍', '👏', '🙌', '👌', '✌️', '🤞', '🤝', '🙏',
    '💪', '🤟', '👊', '✊', '🤛', '🤜', '👋', '🤚',
    '🔥', '💯', '⚡', '💥', '💢', '💫', '💨', '💦',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💖', '💕', '💗', '💓', '💞', '💝', '💘', '💌'
  ];

  birthdayTemplates = [
    {
      id: 1,
      title: '🎂 Warm Birthday Wishes',
      preview: 'Happy Birthday with love and joy',
      extraImg: 'assets/Image/employee/template/birthday_1.jpg',
      message: `🎂 Happy Birthday! 🎉\n\nWishing you a day filled with joy, laughter, and wonderful memories. May this year bring you success, happiness, and all that your heart desires!\n\nHave a fantastic celebration! 🥳🎈`
    },
    {
      id: 2,
      title: '🎁 Professional Birthday',
      preview: 'Formal birthday greetings',
      extraImg: 'assets/Image/employee/template/birthday_2.jpg',
      message: `Dear Colleague,\n\nWarmest birthday wishes to you! 🎂\n\nYour dedication and hard work inspire us all. May this special day bring you joy and the year ahead bring you continued success.\n\nBest regards,\nHR Team`
    },
    {
      id: 3,
      title: '🌟 Special Birthday Celebration',
      preview: 'Celebrate their special day',
      extraImg: 'assets/Image/employee/template/birthday_3.gif',
      message: `✨ Happy Birthday! ✨\n\n🎉 Today is all about YOU! May your day be as amazing as you are, filled with love, laughter, and lots of cake! 🍰\n\nHere's to another year of wonderful achievements! 🌟\n\nCheers! 🥳`
    }
  ];

  anniversaryTemplates = [
    {
      id: 1,
      title: '💼 Work Anniversary',
      preview: 'Congratulations on milestone',
      extraImg: 'assets/Image/employee/template/anniversary_1.jpg',
      message: `🎊 Congratulations on your Work Anniversary! 🎊\n\nThank you for your dedication and commitment to our organization. Your contributions have been invaluable!\n\nHere's to many more successful years together! 💼✨`
    },
    {
      id: 2,
      title: '🌟 Milestone Celebration',
      preview: 'Celebrating your journey',
      extraImg: 'assets/Image/employee/template/anniversary_2.jpg',
      message: `🌟 Happy Work Anniversary! 🌟\n\nCelebrating your incredible journey with MoveExpress! Your hard work, creativity, and positive spirit make our workplace better every day.\n\nThank you for being an essential part of our team! 🎯`
    },
    {
      id: 3,
      title: '🏆 Achievement Recognition',
      preview: 'Recognizing excellence',
      extraImg: 'assets/Image/employee/template/anniversary_3.jpg',
      message: `🏆 Congratulations! 🏆\n\nYour commitment and excellence over the years have been truly remarkable. You've been a valuable asset to our team.\n\nWishing you continued success! 💪✨`
    }
  ];

  eventTemplates = [
    {
      id: 1,
      title: '🎉 Event Invitation',
      preview: 'Join us for celebration',
      extraImg: 'assets/Image/employee/template/event_1.jpg',
      message: `🎉 You're Invited! 🎉\n\nWe're excited to invite you to our upcoming event! Join us for a day filled with fun, activities, and great company.\n\nLooking forward to seeing you there! 🎊`
    },
    {
      id: 2,
      title: '📅 Event Reminder',
      preview: 'Don\'t forget the event',
      extraImg: 'assets/Image/employee/template/event_2.jpg',
      message: `📅 Reminder: Upcoming Event! 📅\n\nJust a friendly reminder about our event coming up soon. Mark your calendars and get ready for an amazing time!\n\nSee you there! 🎯`
    },
    {
      id: 3,
      title: '🌟 Special Celebration',
      preview: 'Special event ahead',
      extraImg: 'assets/Image/employee/template/event_3.jpg',
      message: `🌟 Special Event Alert! 🌟\n\nSomething exciting is coming up! Join us for this special celebration and make wonderful memories with your colleagues.\n\nDon't miss out! 🎊✨`
    }
  ];

  gifTemplates = [
    {
      id: 1,
      title: '',
      preview: '',
      extraImg: 'assets/Image/Gif/200.gif',
      message: `GIF`
    },
    {
      id: 2,
      title: '',
      preview: '',
      extraImg: 'assets/Image/Gif/dj-babu.gif',
      message: `GIF`
    },
    {
      id: 3,
      title: '',
      preview: '',
      extraImg: 'assets/Image/Gif/cat.gif',
      message: `GIF`
    },
    {
      id: 4,
      title: '',
      preview: '',
      extraImg: 'assets/Image/Gif/giphy.gif',
      message: `GIF`
    },
    {
      id: 5,
      title: '',
      preview: '',
      extraImg: 'assets/Image/Gif/giphy-girl.gif',
      message: `GIF`
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private service: HrChatService,
    private toastr: ToastrService,
    private chatService: HRchattingSystemService,
    private signalRService: SignalRService
  ) {}

  ngOnInit() {
    this.currentUserIdString = sessionStorage.getItem('UserId') || 'GU-1';
    this.currentUserName = sessionStorage.getItem('username') || 'HR Team';
    
    // ✅ CRITICAL: Set role as HR
    const userType = sessionStorage.getItem('usertype') || '';
    this.currentUserRole = 'HR'; // Always HR for this component
    
    console.log('🔑 Current User Info:', {
      userId: this.currentUserIdString,
      userName: this.currentUserName,
      role: this.currentUserRole
    });
    
    if (!this.currentUserIdString) {
      console.error('User ID not found in session');
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    this.resetFilters();
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
    this.setupScrollMonitoring();
    
    this.initializeSignalR();
    
    Promise.all([
      this.loadTodayBirthdays(),
      this.loadUpcomingBirthdays(),
      this.loadAniversary(),
      this.loadEvents(),
      this.loadChatSenderList()
    ]).then(() => {
      this.route.queryParams.subscribe(params => {
        const empId = params['empId'];
        const type = params['type'] as 'today' | 'upcoming' | 'anniversary' | 'event' | 'chats';
        
        if (empId && type) {
          this.activeTabType = type;
          if (type !== 'chats') {
            this.switchToTab(type);
          }
          
          setTimeout(() => {
            if (type === 'chats') {
              this.selectedEmployee = this.senderList.find(e => e.pk_empid === empId) || null;
            } else {
              this.selectedEmployee = this.findEmployeeById(empId, type);
            }

            if (empId || this.selectedEmployee) {
              this.loadInitialMessages();
              this.loadChatHistory();
            } else {
              this.toastr.warning('Employee not found');
              this.selectDefaultEmployee();
            }
          }, 200);
        } else {
          this.selectDefaultEmployee();
        }
      });
    });
  }

  // ✅ FIXED: Initialize SignalR with HR role
  private initializeSignalR(): void {
    const userId = this.currentUserIdString;
    const userRole = 'HR';
    
    if (!userId) {
      console.error('❌ No user ID found for SignalR connection');
      return;
    }

    console.log('🔄 Starting SignalR connection for HR user:', userId, 'Role:', userRole);

    this.signalRService.startConnection(userId, userRole)
      .then(() => {
        console.log('✅ SignalR connected successfully for HR');
        
        this.signalRSubscription = this.signalRService.messageReceived$.subscribe(
          (notification: any) => {
            console.log('📩 Real-time message received by HR:', notification);
            this.handleIncomingMessage(notification);
          }
        );

        this.typingSubscription = this.signalRService.typingIndicator$.subscribe(
          (data: any) => {
            this.handleTypingIndicator(data);
          }
        );

        this.readReceiptSubscription = this.signalRService.readReceipt$.subscribe(
          (data: any) => {
            this.handleReadReceipt(data);
          }
        );
      })
      .catch(err => {
        console.error('❌ SignalR connection failed:', err);
        this.toastr.error('Real-time chat unavailable');
      });
  }

  // ✅ FIXED: Handle typing indicator with role checking
  private handleTypingIndicator(data: any): void {
    console.log('⌨️ Typing indicator received:', data);
    
    // ✅ Only show typing if message is from selected employee AND they are EMP role
    if (!this.selectedEmployee || 
        this.selectedEmployee.pk_empid !== data.senderId ||
        data.senderRole === this.currentUserRole) {
      console.log('⚠️ Ignoring typing indicator - not from current conversation or same role');
      return;
    }

    this.isTyping = data.isTyping;
    this.cdr.detectChanges();

    if (data.isTyping) {
      setTimeout(() => {
        if (this.isTyping) {
          this.isTyping = false;
          this.cdr.detectChanges();
        }
      }, 3000);
    }
  }

  // ✅ Handle read receipt
  private handleReadReceipt(data: any): void {
    console.log('✓✓ Read receipt received:', data);
    const message = this.messages.find(m => m.chatId === data.chatId);
    if (message) {
      message.isRead = true;
      this.cdr.detectChanges();
      console.log(`✓✓ Message ${data.chatId} marked as read`);
    }
  }

  // ✅ Send typing indicator with receiver role
  onMessageInput(): void {
    if (!this.selectedEmployee?.pk_empid) return;

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // ✅ Pass receiver role (EMP)
    this.signalRService.sendTypingIndicator(
      this.selectedEmployee.pk_empid,
      this.selectedEmployee.EmpRole || 'EMP', // ✅ Receiver role
      this.currentUserIdString,
      this.currentUserName,
      true
    ).catch(err => console.error('Failed to send typing indicator:', err));

    this.typingTimeout = setTimeout(() => {
      if (this.selectedEmployee?.pk_empid) {
        this.signalRService.sendTypingIndicator(
          this.selectedEmployee.pk_empid,
          this.selectedEmployee.EmpRole || 'EMP',
          this.currentUserIdString,
          this.currentUserName,
          false
        ).catch(err => console.error('Failed to send typing indicator:', err));
      }
    }, 2000);
  }

  // ✅ CRITICAL FIX: Handle incoming real-time messages with role checking
  // private handleIncomingMessage(notification: any): void {
  //   console.log('📩 Processing incoming message:', notification);
  //   console.log('   From:', notification.senderId, '(', notification.senderRole, ')');
  //   console.log('   Current conversation with:', this.selectedEmployee?.pk_empid, '(', this.selectedEmployee?.EmpRole, ')');
    
  //   // ✅ CRITICAL: Only show message if:
  //   // 1. Chat is open with the sender
  //   // 2. Sender role is EMP (not HR)
  //   // 3. We are in the HR role
  //   if (!this.selectedEmployee || 
  //       this.selectedEmployee.pk_empid !== notification.senderId ||
  //       notification.senderRole === this.currentUserRole ||
  //       notification.senderRole !== (this.selectedEmployee.EmpRole || 'EMP')) {
  //     console.log('📭 Message ignored - wrong conversation or same role');
  //     console.log('   Reasons:');
  //     console.log('   - No employee selected:', !this.selectedEmployee);
  //     console.log('   - Wrong sender:', this.selectedEmployee?.pk_empid !== notification.senderId);
  //     console.log('   - Same role:', notification.senderRole === this.currentUserRole);
  //     console.log('   - Wrong employee role:', notification.senderRole !== (this.selectedEmployee?.EmpRole || 'EMP'));
  //     return;
  //   }

  //   // Check if message already exists
  //   const exists = this.messages.some(m => m.chatId === notification.chatId);
  //   if (exists) {
  //     console.log('⚠️ Message already exists, skipping');
  //     return;
  //   }

  //   // Add message to UI
  //   const newMessage: Message = {
  //     sender: 'employee',
  //     text: notification.message,
  //     time: this.formatChatTime(notification.timestamp),
  //     chatId: notification.chatId,
  //     type: notification.attachmentPath ? 'image' : 'text',
  //     imageUrl: notification.attachmentPath,
  //     isRead: false
  //   };

  //   this.messages.push(newMessage);
  //   this.triggerScroll();

  //   // ✅ Mark as read and send receipt
  //   setTimeout(() => {
  //     if (notification.chatId) {
  //       newMessage.isRead = true;
  //       this.cdr.detectChanges();
  //       this.sendReadReceipt(notification.chatId);
  //       this.chatService.markMessagesAsRead(this.selectedEmployee!.pk_empid!).subscribe({
  //         next: () => console.log('✅ Message marked as read in backend'),
  //         error: (err) => console.error('❌ Error:', err)
  //       });
  //     }
  //   }, 500);

  //   console.log('✅ Real-time message added to UI');
  // }


  // ✅ FIXED: Handle incoming messages with ID + ROLE check
private handleIncomingMessage(notification: any): void {
  console.log('📩 Processing incoming message:', notification);
  console.log('   From:', notification.senderId, '(Role:', notification.senderRole, ')');
  console.log('   To (me):', this.currentUserIdString, '(Role:', this.currentUserRole, ')');
  console.log('   Conversation:', this.selectedEmployee?.pk_empid, '(Role:', this.selectedEmployee?.EmpRole, ')');
  
  // ✅ Check 1: Is this from the selected employee?
  if (!this.selectedEmployee || this.selectedEmployee.pk_empid !== notification.senderId) {
    console.log('📭 Ignored - not from selected employee');
    return;
  }

  // ✅ Check 2: Ignore ONLY if BOTH ID and ROLE match (your own message)
  if (notification.senderId === this.currentUserIdString && 
      notification.senderRole === this.currentUserRole) {
    console.log('📭 Ignored - your own message (ID: same, Role: same)');
    return;
  }

  // ✅ Check 3: Verify sender's role matches expected role
  if (notification.senderRole !== (this.selectedEmployee.EmpRole || 'EMP')) {
    console.log('📭 Ignored - role mismatch');
    return;
  }

  // Check for duplicates
  const exists = this.messages.some(m => m.chatId === notification.chatId);
  if (exists) {
    console.log('⚠️ Duplicate message, skipping');
    return;
  }

  // Add to UI
  const newMessage: Message = {
    sender: 'employee',
    text: notification.message,
    time: this.formatChatTime(notification.timestamp),
    chatId: notification.chatId,
    type: notification.attachmentPath ? 'image' : 'text',
    imageUrl: notification.attachmentPath,
    isRead: false
  };

  this.messages.push(newMessage);
  this.triggerScroll();

  // Mark as read
  setTimeout(() => {
    if (notification.chatId) {
      newMessage.isRead = true;
      this.cdr.detectChanges();
      this.sendReadReceipt(notification.chatId);
      this.chatService.markMessagesAsRead(this.selectedEmployee!.pk_empid!).subscribe({
        next: () => console.log('✅ Marked as read'),
        error: (err) => console.error('❌ Error:', err)
      });
    }
  }, 500);

  console.log('✅ Real-time message added');
}


  // ✅ Send read receipt with sender role
  private sendReadReceipt(chatId: number): void {
    if (!this.selectedEmployee?.pk_empid) return;

    this.signalRService.sendReadReceipt(
      this.selectedEmployee.pk_empid,
      this.selectedEmployee.EmpRole || 'EMP', // ✅ Sender role
      this.currentUserIdString,
      chatId
    ).catch(err => console.error('Failed to send read receipt:', err));
  }

  // ✅ FIXED: Load chat history with proper role parameters
  private loadChatHistory(): void {
    if (!this.selectedEmployee?.pk_empid) return;

    const otherUserId = this.selectedEmployee.pk_empid;
    const otherUserRole = this.selectedEmployee.EmpRole || 'EMP';
    const myRole = 'HR';

    console.log("📥 Loading chat history:");
    console.log("   Other user:", otherUserId, "Role:", otherUserRole);
    console.log("   My role:", myRole);

    this.chatService.getChatHistory(otherUserId, otherUserRole, myRole).subscribe({
      next: (response) => {
        console.log('✅ Chat history received:', response);
        const chatMessages = response.messages || [];

        // Clear existing messages except system message
        this.messages = this.messages.filter(m => m.sender === 'system');

        // ✅ Filter and load messages
        chatMessages.forEach((chatMsg: any) => {
          // Only show messages where:
          // - I sent it (senderRole = HR, senderUserId = me)
          // - OR employee sent it (senderRole = EMP, senderUserId = selected employee)
          const isSentByMe = chatMsg.senderUserId === this.currentUserIdString && 
                             chatMsg.senderRole === 'HR';
          const isSentByEmployee = chatMsg.senderUserId === otherUserId && 
                                   chatMsg.senderRole === otherUserRole;
          
          if (isSentByMe || isSentByEmployee) {
            this.addChatMessageToUI(chatMsg, false);
          } else {
            console.log('⚠️ Skipping message from wrong role/user:', chatMsg);
          }
        });

        this.triggerScroll();
        setTimeout(() => {
          this.markMessagesAsRead();
        }, 500);
      },
      error: (err) => {
        console.error("❌ Error loading chat history:", err);
        this.toastr.error("Failed to load chat history");
      }
    });
  }

  private addChatMessageToUI(chatMsg: ChatMessage, scroll: boolean = true): void {
    const isSentByMe = chatMsg.senderUserId === this.currentUserIdString && 
                       chatMsg.senderRole === this.currentUserRole;
    
    const uiMessage: Message = {
      sender: isSentByMe ? 'you' : 'employee',
      text: chatMsg.messageText || undefined,
      time: this.formatChatTime(chatMsg.sentAt),
      chatId: chatMsg.chatId,
      isRead: chatMsg.isRead,
      imageUrl: chatMsg.attachmentPath || undefined,
      type: chatMsg.attachmentPath ? 'image' : undefined
    };

    const exists = this.messages.some(m => m.chatId === chatMsg.chatId);
    if (!exists) {
      this.messages.push(uiMessage);
      if (scroll) {
        this.triggerScroll();
      }
    }
  }

  private formatChatTime(sentAt?: string): string {
    if (!sentAt) return this.getCurrentTime();
    
    const date = new Date(sentAt);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  private setupScrollMonitoring(): void {
    if (typeof MutationObserver !== 'undefined') {
      setTimeout(() => {
        if (this.messagesContainer?.nativeElement) {
          const observer = new MutationObserver(() => {
            this.triggerScroll();
          });
          
          observer.observe(this.messagesContainer.nativeElement, {
            childList: true,
            subtree: true
          });
        }
      }, 500);
    }
  }

  private switchToTab(type: 'today' | 'upcoming' | 'anniversary' | 'event' | 'chats'): void {
    const tabMap: { [key: string]: string } = {
      'chats': 'chat-list',
      'today': 'today-list',
      'upcoming': 'upcoming-list',
      'anniversary': 'anniversary-list',
      'event': 'events-list'
    };

    const targetTabId = tabMap[type];
    if (!targetTabId) return;

    setTimeout(() => {
      const tabTrigger = document.querySelector(`[data-bs-target="#${targetTabId}"]`);
      if (tabTrigger) {
        const tab = new (window as any).bootstrap.Tab(tabTrigger);
        tab.show();
      }
    }, 100);
  }

  private findEmployeeById(empId: string, type: string): Employee | null {
    let employee: Employee | undefined;
    
    switch(type) {
      case 'chats':
        employee = this.senderList.find(e => e.pk_empid === empId);
        break;
      case 'today':
        employee = this.todayBirthdays.find(e => e.pk_empid === empId);
        break;
      case 'upcoming':
        employee = this.upcomingBirthdays.find(e => e.pk_empid === empId);
        break;
      case 'anniversary':
        employee = this.anniversaries.find(e => e.pk_empid === empId);
        break;
      case 'event':
        employee = this.upcomingEvents.find(e => e.pk_empid === empId);
        break;
    }
    
    return employee || null;
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch(err) {
      console.error('Scroll error:', err);
    }
  }

  private triggerScroll(): void {
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();
    
    setTimeout(() => this.scrollToBottom(), 0);
    setTimeout(() => this.scrollToBottom(), 50);
    setTimeout(() => this.scrollToBottom(), 100);
    setTimeout(() => this.scrollToBottom(), 200);
    setTimeout(() => this.scrollToBottom(), 300);
  }

  resetFilters() {
    this.filteredTodayBirthdays = [...this.todayBirthdays];
    this.filteredUpcomingBirthdays = [...this.upcomingBirthdays];
    this.filteredAnniversaries = [...this.anniversaries];
    this.filteredEvents = [...this.upcomingEvents];
    this.filteredSenderList = [...this.senderList];
  }

  filterEmployees() {
    // const query = this.searchQuery.toLowerCase().trim();
    
    // if (!query) {
    //   this.resetFilters();
    //   return;
    // }

    // this.filteredTodayBirthdays = this.todayBirthdays.filter(emp => 
    //   emp.name.toLowerCase().includes(query) || 
    //   emp.dept.toLowerCase().includes(query)
    // );

    const query = this.searchQuery.toLowerCase().trim();

    // ✅ Clear existing timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // ✅ If search is cleared, reset to original data
    if (!query) {
      this.resetFilters();
      return;
    }



  
    this.filteredTodayBirthdays = this.todayBirthdays.filter(emp => 
      emp.name.toLowerCase().includes(query) || 
      emp.dept.toLowerCase().includes(query)
    );

    this.filteredUpcomingBirthdays = this.upcomingBirthdays.filter(emp => 
      emp.name.toLowerCase().includes(query) || 
      emp.dept.toLowerCase().includes(query)
    );

    this.filteredAnniversaries = this.anniversaries.filter(emp => 
      emp.name.toLowerCase().includes(query) || 
      emp.dept.toLowerCase().includes(query)
    );

    this.filteredEvents = this.upcomingEvents.filter(event => 
      event.name.toLowerCase().includes(query) 
    );

    // ✅ For Chat tab with 3+ characters, call backend with debounce
    if (this.activeTabType === 'chats') {
      if (query.length >= this.MIN_SEARCH_LENGTH) {
        // ✅ Debounce: Wait 500ms after user stops typing
        this.searchDebounceTimer = setTimeout(() => {
          console.log(`🔍 Searching with: "${query}" (${query.length} chars)`);
          this.searchEmployeesFromBackend(query);
        }, 500);
      } else {
        // ✅ Show message: Need 3+ characters
        console.log(`⚠️ Need ${this.MIN_SEARCH_LENGTH - query.length} more character(s)`);
        this.filteredSenderList = [];
      }
      return;
    }



    this.filteredSenderList = this.senderList.filter(emp => 
      emp.name.toLowerCase().includes(query) || 
      (emp.dept && emp.dept.toLowerCase().includes(query))
    );
  }

  loadInitialMessages() {
    this.messages = [
      {
        sender: 'system',
        time: this.getCurrentTime()
      }
    ];
    this.triggerScroll();
  }

  selectEmployee(emp: Employee) {
    this.selectedEmployee = emp;
    console.log('✅ Selected employee:', emp.name, 'Role:', emp.EmpRole);
    
    this.messages = [
      {
        sender: 'system',
        time: this.getCurrentTime()
      }
    ];
    this.closeAllMenus();
    this.loadChatHistory();
    this.triggerScroll();
    
    if (this.isMobileView) {
      // Close sidebar on mobile
    }
  }
  
  backToContacts(): void {
    this.selectedEmployee = null;
    this.messages = [];
    this.closeAllMenus();
  }
  
  toggleQuickActions(): void {
    this.showQuickActions = !this.showQuickActions;
    this.showEmojiPicker = false;
    this.showHeaderMenu = false;
  }
  
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.showQuickActions = false;
    this.showHeaderMenu = false;
  }
  
  closeAllMenus(): void {
    this.showQuickActions = false;
    this.showEmojiPicker = false;
    this.showHeaderMenu = false;
  }
  
  clearChat(): void {
    if (confirm('Are you sure you want to clear this chat?')) {
      this.messages = [
        {
          sender: 'system',
          text: `Chat cleared`,
          time: this.getCurrentTime()
        }
      ];
      this.showHeaderMenu = false;
      this.triggerScroll();
    }
  }
  
  exportChat(): void {
    const chatText = this.messages
      .filter(msg => msg.sender !== 'system')
      .map(msg => `[${msg.time}] ${msg.sender === 'you' ? 'You' : this.selectedEmployee?.name}: ${msg.text || ''}`)
      .join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${this.selectedEmployee?.name}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showHeaderMenu = false;
  }

  // ✅ Send message via HTTP with proper roles
  sendMessage() {
    const senderName = sessionStorage.getItem('username') ?? 'HR Team';
    const notificationType = this.activeTabType;

    if (this.newMessage.trim() && this.selectedEmployee?.pk_empid) {
      
      const chatMessage: ChatMessage = {
        conversationId: this.conversationId,
        senderUserId: this.currentUserIdString,
        receiverUserId: this.selectedEmployee.pk_empid,
        senderRole: 'HR', // ✅ Always HR
        receiverRole: this.selectedEmployee.EmpRole || 'EMP',
        messageText: this.newMessage.trim(),
        attachmentPath: '',
        notificationType: notificationType,
        senderName: senderName
      };

      console.log('📤 Sending message:', chatMessage);

      const tempMessage: Message = {
        sender: 'you',
        text: this.newMessage.trim(),
        time: this.getCurrentTime()
      };
      this.messages.push(tempMessage);
      this.newMessage = '';
      this.triggerScroll();

      this.chatService.sendMessage(chatMessage).subscribe({
        next: (response) => {
          console.log('✅ Message sent successfully:', response);
          if (response.chatId) {
            tempMessage.chatId = response.chatId;
          }
        },
        error: (err) => {
          console.error('❌ Error sending message:', err);
          this.toastr.error('Failed to send message');
          this.messages = this.messages.filter(m => m !== tempMessage);
        }
      });
      
      this.closeAllMenus();
    }
  }



  // ✅ NEW: Search employees from backend with loading state
  private searchEmployeesFromBackend(query: string): void {
    this.isSearching = true; // ✅ Show loading
    this.filteredSenderList = [];
    
    this.chatService.getChatSenderEmployeeList('HR', query).subscribe({
      next: (res) => {
        this.isSearching = false; // ✅ Hide loading
        
        if (res.isSuccess && res.data) {
          this.filteredSenderList = res.data.map((emp: any) => ({
            pk_empid: emp.pk_empid,
            name: emp.EmpName,
            EmpRole: emp.EmpRole || 'EMP',
            dept: emp.Department || 'Unknown Department',
            img: emp.ProfileImage || 'assets/Image/profile_images.png',
            type: 'chat'
          }));
          console.log('✅ Search results:', this.filteredSenderList.length, 'employees');
        } else {
          this.filteredSenderList = [];
          console.log('📭 No results found');
        }
      },
      error: (err) => {
        this.isSearching = false; // ✅ Hide loading
        console.error("❌ Error searching employees:", err);
        this.filteredSenderList = [];
        this.toastr.error("Failed to search employees.");
      }
    });
  }

  // ✅ Send template with roles
  sendTemplate(template: any) {
    if (!this.selectedEmployee?.pk_empid) return;

    const message = template.message.replace(/\[Name\]/g, this.selectedEmployee?.name || '');
    const senderName = sessionStorage.getItem('username') ?? 'HR Team';
    const notificationType = this.activeTabType;

    const chatMessage: ChatMessage = {
      conversationId: this.conversationId,
      senderUserId: this.currentUserIdString,
      receiverUserId: this.selectedEmployee.pk_empid,
      senderRole: 'HR',
      receiverRole: this.selectedEmployee.EmpRole || 'EMP',
      messageText: message,
      attachmentPath: template.extraImg || undefined,
      notificationType: notificationType,
      senderName: senderName
    };

    const tempMessage: Message = {
      sender: 'you',
      text: message,
      time: this.getCurrentTime(),
      type: 'image',
      imageUrl: template.extraImg
    };
    this.messages.push(tempMessage);
    this.triggerScroll();
    
    this.chatService.sendMessage(chatMessage).subscribe({
      next: (response) => {
        console.log('✅ Template sent:', response);
        if (response.chatId) {
          tempMessage.chatId = response.chatId;
        }
      },
      error: (err) => {
        console.error('Error sending template:', err);
        this.toastr.error('Failed to send message');
        this.messages = this.messages.filter(m => m !== tempMessage);
      }
    });
    
    this.showTemplateModal = false;
  }

  // ✅ Send quick reply with roles
  sendQuickReply(message: string) {
    if (!this.selectedEmployee?.pk_empid) return;

    const senderName = sessionStorage.getItem('username') ?? 'HR Team';
    const notificationType = this.activeTabType;

    const chatMessage: ChatMessage = {
      conversationId: this.conversationId,
      senderUserId: this.currentUserIdString,
      receiverUserId: this.selectedEmployee.pk_empid,
      senderRole: 'HR',
      receiverRole: this.selectedEmployee.EmpRole || 'EMP',
      messageText: message,
      attachmentPath: '',
      notificationType: notificationType,
      senderName: senderName
    };

    const tempMessage: Message = {
      sender: 'you',
      text: message,
      time: this.getCurrentTime()
    };
    this.messages.push(tempMessage);
    this.triggerScroll();

    this.chatService.sendMessage(chatMessage).subscribe({
      next: (response) => {
        console.log('✅ Quick reply sent:', response);
        if (response.chatId) {
          tempMessage.chatId = response.chatId;
        }
      },
      error: (err) => {
        console.error('Error sending quick reply:', err);
        this.toastr.error('Failed to send message');
        this.messages = this.messages.filter(m => m !== tempMessage);
      }
    });
    
    this.showQuickActions = false;
  }

  insertEmoji(emoji: string) {
    this.newMessage += emoji;
    const inputElement = document.querySelector('.message-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  attachFile() {
    this.messages.push({
      sender: 'you',
      text: '',
      time: this.getCurrentTime(),
      type: 'file'
    });
    this.showQuickActions = false;
    this.triggerScroll();
  }

  sendVoiceMessage() {
    this.messages.push({
      sender: 'you',
      text: '',
      time: this.getCurrentTime(),
      type: 'voice'
    });
    this.showQuickActions = false;
    this.triggerScroll();
  }

  openTemplateModal(type: string) {
    this.selectedTemplateType = type;
    this.showTemplateModal = true;
    this.showQuickActions = false;
  }

  closeTemplateModal() {
    this.showTemplateModal = false;
  }

  getTemplates() {
    switch(this.selectedTemplateType) {
      case 'birthday': return this.birthdayTemplates;
      case 'anniversary': return this.anniversaryTemplates;
      case 'event': return this.eventTemplates;
      case 'gif': return this.gifTemplates;
      default: return [];
    }
  }

  formatText(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  closeChatbot() {
    this.router.navigate(['/hr/hrdashboard']);
  }

  loadTodayBirthdays(): Promise<void> {
    return new Promise((resolve) => {
      this.service.GetTodayBirthday().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data && res.data.length > 0) {
            this.todayBirthdays = res.data.map((emp: any) => ({
              pk_empid: emp.pk_empid,
              name: emp.EmpName,
              dept: emp.Department || 'Unknown Department',
              date: emp.DOB || emp.DateOfBirth || 'Today',
              type: 'birthday',
              img: emp.ProfileImage || 'assets/Image/profile_images.png',
              EmpRole: emp.EmpRole || 'EMP',
            }));
            this.filteredTodayBirthdays = [...this.todayBirthdays];
          } else {
            this.todayBirthdays = [];
            this.filteredTodayBirthdays = [];
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading birthdays:', err);
          this.toastr.error('Failed to load birthday data');
          resolve();
        }
      });
    });
  }

  loadUpcomingBirthdays(): Promise<void> {
    return new Promise((resolve) => {
      this.service.GetUpcomingBirthday().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.upcomingBirthdays = res.data.map((emp: any) => ({
              pk_empid: emp.pk_empid || emp.EmpId,
              name: emp.EmpName,
              dept: emp.Department || 'Unknown Department',
              img: emp.ProfileImage || 'assets/Image/profile_images.png',
              date: this.formatDate(emp.ThisYearBirthday),
              type: 'birthday',
              EmpRole: emp.EmpRole || 'EMP',
            }));
            this.filteredUpcomingBirthdays = [...this.upcomingBirthdays];
          } else {
            this.upcomingBirthdays = [];
            this.filteredUpcomingBirthdays = [];
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading upcoming birthdays:', err);
          this.toastr.error('Failed to load birthday data');
          resolve();
        }
      });
    });
  }

  loadEvents(): Promise<void> {
    return new Promise((resolve) => {
      this.service.GetEvents().subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.upcomingEvents = res.data.map((emp: any) => ({
              pk_empid: String(emp.pk_eventId || emp.pk_eventId),
              name: emp.eventName,
              date: emp.eventDateDisplay || 'Unknown',
              eventVenue: emp.eventVenue || 'Unknown',
              img: 'assets/Image/event.jpeg',
              type: 'event',
              dept: emp.eventVenue,
              EmpRole: emp.EmpRole || 'EMP',
            }));
            this.filteredEvents = [...this.upcomingEvents];
          } else {
            this.upcomingEvents = [];
          }
          resolve();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load events');
          resolve();
        }
      });
    });
  }

  loadAniversary(): Promise<void> {
    return new Promise((resolve) => {
      this.service.GetAniversary().subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.anniversaries = res.data.map((emp: any) => ({
              pk_empid: emp.pk_empid || emp.EmpId,
              name: emp.empname,
              dept: emp.Department || 'Unknown Department',
              years: emp.AnniversaryLabel || 'NA',
              date: emp.AnniversaryDisplay || 'NA',
              img: emp.ProfileImage || 'assets/Image/profile_images.png',
              type: 'anniversary',
              EmpRole: emp.EmpRole || 'EMP',
            }));
            this.filteredAnniversaries = [...this.anniversaries];
          } else {
            this.anniversaries = [];
          }
          resolve();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load anniversary');
          resolve();
        }
      });
    });
  }

  // loadChatSenderList() {
  //   this.chatService.getChatSenderEmployeeList().subscribe({
  //     next: (res) => {
  //       if (res.isSuccess && res.data) {
  //         this.senderList = res.data.map((emp: any) => ({
  //           pk_empid: emp.pk_empid,
  //           name: emp.EmpName,
  //           EmpRole: emp.EmpRole || 'EMP',
  //           dept: emp.Department || 'Unknown Department',
  //           img: emp.ProfileImage || 'assets/Image/profile_images.png',
  //           type: 'chat'
  //         }));
  //         this.filteredSenderList = [...this.senderList];
  //         console.log('✅ Loaded sender list:', this.senderList);
  //       } else {
  //         this.senderList = [];
  //         this.filteredSenderList = [];
  //       }
  //     },
  //     error: (err) => {
  //       console.error("Error loading sender list:", err);
  //       this.senderList = [];
  //       this.filteredSenderList = [];
  //       this.toastr.error("Failed to load sender list.");
  //     }
  //   });
  // }


  // Update in the component class:

// loadChatSenderList() {
//   // ✅ Pass current user's role
//   this.chatService.getChatSenderEmployeeList('HR').subscribe({
//     next: (res) => {
//       if (res.isSuccess && res.data) {
//         this.senderList = res.data.map((emp: any) => ({
//           pk_empid: emp.pk_empid,
//           name: emp.EmpName,
//           EmpRole: emp.EmpRole || 'EMP',
//           dept: emp.Department || 'Unknown Department',
//           img: emp.ProfileImage || 'assets/Image/profile_images.png',
//           type: 'chat'
//         }));
//         this.filteredSenderList = [...this.senderList];
//         console.log('✅ Loaded sender list:', this.senderList.length, 'senders');
//         console.log('   Filtered to exclude current user (HR role)');
//       } else {
//         this.senderList = [];
//         this.filteredSenderList = [];
//       }
//     },
//     error: (err) => {
//       console.error("Error loading sender list:", err);
//       this.senderList = [];
//       this.filteredSenderList = [];
//       this.toastr.error("Failed to load sender list.");
//     }
//   });
// }


 loadChatSenderList(searchQuery: string = ''): Promise<void> {
    return new Promise((resolve) => {
      this.chatService.getChatSenderEmployeeList('HR', searchQuery).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.senderList = res.data.map((emp: any) => ({
              pk_empid: emp.pk_empid,
              name: emp.EmpName,
              EmpRole: emp.EmpRole || 'EMP',
              dept: emp.Department || 'Unknown Department',
              img: emp.ProfileImage || 'assets/Image/profile_images.png',
              type: 'chat'
            }));
            this.filteredSenderList = [...this.senderList];
            console.log('✅ Loaded sender list:', this.senderList.length, 'senders');
          } else {
            this.senderList = [];
            this.filteredSenderList = [];
          }
          resolve();
        },
        error: (err) => {
          console.error("Error loading sender list:", err);
          this.senderList = [];
          this.filteredSenderList = [];
          this.toastr.error("Failed to load sender list.");
          resolve();
        }
      });
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  selectDefaultEmployee(): void {
    if (!this.selectedEmployee) {
      if (this.senderList.length > 0) {
        this.selectedEmployee = this.senderList[0];
        this.switchToTab('chats');
        this.loadInitialMessages();
        this.loadChatHistory();
      } else if (this.todayBirthdays.length > 0) {
        this.selectedEmployee = this.todayBirthdays[0];
        this.switchToTab('today');
        this.loadInitialMessages();
        this.loadChatHistory();
      } else if (this.upcomingBirthdays.length > 0) {
        this.selectedEmployee = this.upcomingBirthdays[0];
        this.switchToTab('upcoming');
        this.loadInitialMessages();
        this.loadChatHistory();
      } else if (this.anniversaries.length > 0) {
        this.selectedEmployee = this.anniversaries[0];
        this.switchToTab('anniversary');
        this.loadInitialMessages();
        this.loadChatHistory();
      } else if (this.upcomingEvents.length > 0) {
        this.selectedEmployee = this.upcomingEvents[0];
        this.switchToTab('event');
        this.loadInitialMessages();
        this.loadChatHistory();
      }
    }
  }

  ngOnDestroy(): void {

    // ✅ Clear search timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
      console.log('🛑 Unsubscribed from SignalR messages');
    }
    
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    
    if (this.readReceiptSubscription) {
      this.readReceiptSubscription.unsubscribe();
    }
    
    // this.signalRService.stopConnection()
    //   .then(() => console.log('🛑 SignalR connection stopped'))
    //   .catch(err => console.error('Error stopping SignalR:', err));
  }

  // ✅ Mark messages as read and send receipts
  private markMessagesAsRead(): void {
    if (!this.selectedEmployee?.pk_empid) return;

    const senderUserId = this.selectedEmployee.pk_empid;

    const unreadMessages = this.messages.filter(
      m => m.sender === 'employee' && !m.isRead && m.chatId
    );

    if (unreadMessages.length === 0) {
      console.log('No unread messages to mark');
      return;
    }

    this.chatService.markMessagesAsRead(senderUserId).subscribe({
      next: (response) => {
        console.log('✅ Messages marked as read:', response.affectedRows);

        unreadMessages.forEach(msg => {
          if (msg.chatId) {
            this.sendReadReceipt(msg.chatId);
            msg.isRead = true;
          }
        });

        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error marking as read:', err)
    });
  }
}