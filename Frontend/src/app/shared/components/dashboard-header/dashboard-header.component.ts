
import { Component, HostListener, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../authentication/service/auth.service';
import { Router } from '@angular/router';
import { SearchService } from '../search.service';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { MenuService } from '../../services/menu.service';
import { SignalRService } from '../../services/signalr.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { DropdownService } from '../../services/dropdown.service';
import { response } from 'express';
import { TokenManagerService } from '../../services/token-manager.service';
@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  usertype: string = '';
  empName: string = '';
  recentMessages: any[] = [];
  unreadCount: number = 0;

  private messageSubscription?: Subscription;
  private connectionSubscription?: Subscription;

  searchQuery: string = '';
  auth = inject(AuthService);
  UserName: string = '';
  UserId: string = '';
  companyName: string = '';
  financialYear: string = '';
  suggestions: any[] = [];

  showAdminSwitch = false;
  isVendor: boolean = false;
  // private apiUrl = 'https://localhost:7142/api/v1/HRchat'; // Update with your API URL

  constructor(
    private router: Router,
    private signalRService: SignalRService,
    private searchService: SearchService,
    private menuService: MenuService,
    private http: HttpClient,
    private dropdownService: DropdownService,
    private toastr: ToastrService,
    private tokenManagerService: TokenManagerService,
    private cdr: ChangeDetectorRef,

  ) { }

  ngOnInit() {


    this.UserName = sessionStorage.getItem('username') || '';
    this.UserId = sessionStorage.getItem('UserId') || '';
    this.usertype = sessionStorage.getItem('usertype') || '';
    this.isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
    this.companyName = sessionStorage.getItem('companyName') || '';
    this.financialYear = sessionStorage.getItem('financialYear') || '';
    //  this.showAdminSwitch =   sessionStorage.getItem('showAdminSwitch')=="false" ? false:true || false;
    this.showAdminSwitch = sessionStorage.getItem('showAdminSwitch') === 'true';

    // console.log('👤 User Info:', { UserName: this.UserName, USERID: this.UserId, usertype: this.usertype });


       // Collapse sidebar by default on desktop
    if (window.innerWidth > 768) {
      document.body.classList.add('sidebar-mini');
      this.isMiniSidebarActive = true;
    }
    if (this.UserId) {
      // Load unread messages from database on page load
      this.loadUnreadMessages();

      // Initialize SignalR for real-time updates
      this.initializeSignalR(this.UserId);
    } else {
      console.warn(' No userId found in session storage');
    }
  }
  // `${environment.baseURL1}${environment.Authentication.getallMenubasedonUser}`;
  // Load unread messages from database - SHOW ALL MESSAGES
  private loadUnreadMessages(): void {
    //  this.http.get<any>(`${this.apiUrl}/unreads`).subscribe(
    // const headers = new HttpHeaders({
    //   'X-User-Role': this.usertype === 'Employee' ? 'EMP' : 'HR'
    // });
     const isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
    const roleHeader = isVendor ? 'Vendor' : (this.usertype === 'Employee' ? 'EMP' : 'HR');
    const headers = new HttpHeaders({
      'X-User-Role': roleHeader
      });
    this.http.get<any>(`${environment.baseURL1}${environment.Authentication.HRChatNotification}/unreads`, { headers }).subscribe(
      (response) => {
        if (response.success && response.data) {
          // Display ALL messages, not just grouped by sender
          this.recentMessages = response.data
            .map((msg: any) => ({
              chatId: msg.chatId,
              senderId: msg.senderUserId,
              senderName: msg.senderName,
              senderRole: msg.senderRole,
              notificationType: msg.notificationType,
              redirectUrl: msg.redirectUrl,
              message: msg.messageText,
              time: msg.sentAt,
              messageId: msg.chatId // Use chatId as unique identifier
            }))
            .slice(0, 5); // Show up to 5s messages (most recent)

          this.unreadCount = response.count;
          console.log(`📨 Loaded ${response.count} unread messages from database`);
          console.log('📋 Recent messages:', this.recentMessages);
        }
      },
      (error) => {
        console.error('❌ Error loading unread messages:', error);
      }
    );
  }



  // OLD METHOD - Kept for reference (groups by sender)
  private groupMessagesBySender(messages: any[]): any[] {
    const grouped: { [key: string]: any } = {};

    messages.forEach((msg) => {
      if (!grouped[msg.senderId]) {
        grouped[msg.senderId] = {
          senderId: msg.senderId,
          senderName: msg.senderName,
          message: msg.messageText,
          time: msg.sentAt,
          chatId: msg.chatId
        };
      }
    });

    return Object.values(grouped).slice(0, 5); // Only last 5 senders
  }

  private initializeSignalR(userId: string) {
    // this.signalRService.startConnection(userId)
        const isVendor = sessionStorage.getItem('isVendor') === 'true' || localStorage.getItem('isVendor') === 'true';
    const activeRole = isVendor ? 'Vendor' : (this.usertype === 'Employee' ? 'EMP' : 'HR');
    this.signalRService.startConnection(userId, activeRole)

      .then(() => {
        console.log('✅ SignalR initialized for user:');

        this.connectionSubscription = this.signalRService.connectionStatus$.subscribe(
          (isConnected) => {
            console.log('🔌 Connection Status:', isConnected ? 'Connected' : 'Disconnected');
          }
        );

        this.messageSubscription = this.signalRService.messageReceived$.subscribe(
          (data) => {
            console.log(' New message received:');
            this.handleNewMessage(data);
          },
          (error) => {
            console.error(' Error in message subscription:', error);
          }
        );
      })
      .catch((err) => {
        console.error(' Failed to initialize SignalR:', err);
      });
  }

  private handleNewMessage(data: any) {
    // Add new message to the top of the list (instead of grouping by sender)
    this.recentMessages.unshift({
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      notificationType: data.notificationType,
      redirectUrl: data.redirectUrl,
      message: data.message,
      time: data.timestamp || new Date(),
      chatId: data.chatId,
      messageId: data.chatId
    });

    // Keep only last 5 messages (not 5 senders, but 5 messages)
    if (this.recentMessages.length > 5) {
      this.recentMessages.pop();
    }

    this.unreadCount++;
    console.log(`📬 Unread count increased to: ${this.unreadCount}`);
    console.log(`📋 Total notifications: ${this.recentMessages.length}`);

    this.playNotificationSound();
    this.showBrowserNotification(data);
  }


  playNotificationSound() {
    const audio = new Audio();
    audio.src = 'assets/sounds/notification.wav';
    audio.load();
    audio.play().catch((err) => {
      console.warn('⚠️ Could not play notification sound:', err);
    });
  }

  private showBrowserNotification(data: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', {
        body: `${data.senderName}: ${data.message}`,
        icon: 'assets/Image/profile_images.png'
      });
    }
  }


  //Open chat window and mark messages as read By senderId
  // openChat(senderId: string, notificationType: string, senderRole: string) {
  //   console.log('💬 Opening chat with:', senderId);

  // this.http.post(
  //   `${environment.baseURL1}${environment.Authentication.HRChatNotification}/mark-reads`,
  //   {
  //     senderUserId: senderId,
  //     senderRole: senderRole   // 🔑 HR / EMP
  //   }
  // ).subscribe(
  //   () => console.log('✅ Messages marked as read'),
  //   (error) => console.error('❌ Error marking messages as read:', error)
  // );

  //   var usertype = sessionStorage.getItem('usertype');

  //   if (usertype === 'Employee') {
  //     this.router.navigate(
  //       ['/dash/event/eventdashboard/emp-chatboat'],
  //       {
  //         queryParams: { empId: senderId, role: senderRole } 
  //       }
  //     );
  //   } else {
  //     this.router.navigate(
  //       ['/dash/hr/hrdashboard/hr-chatboat'],
  //       {
  //         queryParams: {
  //           empId: senderId,
  //           role: senderRole,

  //         }

  //       }
  //     );
  //   }




  //   // Remove ALL messages from this sender from the notification list
  //   const messagesFromSender = this.recentMessages.filter(m => m.senderId === senderId).length;
  //   this.unreadCount = Math.max(0, this.unreadCount - messagesFromSender);
  //   this.recentMessages = this.recentMessages.filter(m => m.senderId !== senderId);

  //   console.log(`✅ Removed ${messagesFromSender} messages from ${senderId}`);
  // }

  openChat(senderId: string, notificationType: string, senderRole: string) {

    console.log('💬 Opening chat with:', senderId, senderRole);


    // 🔹 1. Mark messages as read (backend)
    this.http.post(
      `${environment.baseURL1}${environment.Authentication.HRChatNotification}/mark-reads`,
      {
        senderUserId: senderId,
        senderRole: senderRole
      }
    ).subscribe(
      () => console.log('✅ Messages marked as read'),
      (error) => console.error('❌ Error marking messages as read:', error)
    );

    // 🔹 2. Force route reload (even if already on chat page)
    const usertype = sessionStorage.getItem('usertype');

    // ✅ Check for Redirect URL
    const notification = this.recentMessages.find(m => m.senderId === senderId && m.senderRole === senderRole && m.notificationType === notificationType);

    if (notification && notification.redirectUrl) {
      // this.router.navigate([notification.redirectUrl]);
            this.router.navigateByUrl(notification.redirectUrl);

    } else {
      const targetRoute =
        usertype === 'Employee'
          ? '/dash/event/eventdashboard/emp-chatboat'
          : '/dash/hr/hrdashboard/hr-chatboat';

      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([targetRoute], {
          queryParams: { empId: senderId, role: senderRole }
        });
      });
    }

    // 🔹 3. Clear ONLY clicked sender notifications (sender + role)
    const messagesFromSender = this.recentMessages.filter(
      m => m.senderId === senderId && m.senderRole == senderRole
    ).length;

    this.unreadCount = Math.max(0, this.unreadCount - messagesFromSender);

    this.recentMessages = this.recentMessages.filter(
      m => !(m.senderId === senderId && m.senderRole == senderRole)
    );


  }




  //Open chat window and mark messages as read By chatId
  // openChat(ChatId: number) {
  //   console.log('💬 Opening chat with:', ChatId);
  //   // Mark messages as read
  //   this.http.post(`${environment.baseURL1}${environment.Authentication.HRChatNotification}/mark-reads`, { ChatId: ChatId }).subscribe(
  //     (response) => {
  //       console.log(' Messages marked as read');
  //     },
  //     (error) => {
  //       console.error('❌ Error marking messages as read:', error);
  //     }
  //   );
  //   var usertype = sessionStorage.getItem('usertype');
  //   if (usertype == 'Employee') {
  //     this.router.navigate(['/dash/event/eventdashboard/emp-chatboat']);
  //   }
  //   else {
  //     this.router.navigate(['/dash/hr/hrdashboard/hr-chatboat']);
  //   }
  //   // Remove ALL messages from this sender from the notification list
  //   const messagesFromSender = this.recentMessages.filter(m => m.chatId === ChatId).length;
  //   this.unreadCount = Math.max(0, this.unreadCount - messagesFromSender);
  //   this.recentMessages = this.recentMessages.filter(m => m.chatId !== ChatId);

  //   console.log(`✅ Removed ${messagesFromSender} messages from ${ChatId}`);
  // }
  clearAllNotifications() {
    this.recentMessages = [];
    this.unreadCount = 0;
    console.log('🧹 All notifications cleared');
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  // Sidebar toggle methods
  isMiniSidebarActive: boolean = true;
  private sidebarHovered: boolean = false;

  onToggleBodyClass(): void {
    const isMobileView = window.innerWidth <= 768;
    const body = document.body;

    if (isMobileView) {
      const isGone = body.classList.contains('sidebar-gone');
      if (isGone) {
        body.classList.remove('sidebar-gone');
      } else {
        body.classList.add('sidebar-gone');
      }
    } else {
      if (this.isMiniSidebarActive) {
        body.classList.remove('sidebar-mini');
      } else {
        body.classList.add('sidebar-mini');
      }
      this.isMiniSidebarActive = !this.isMiniSidebarActive;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onUserInteract(event: Event): void {
    const isMobileView = window.innerWidth <= 768;
    const target = event.target as HTMLElement;
    const insideSidebar = target.closest('.main-sidebar');

    if (isMobileView) {
      this.sidebarHovered = !!insideSidebar;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const isMobileView = window.innerWidth <= 768;
    const target = event.target as HTMLElement;

    const clickedInsideSidebar = target.closest('.main-sidebar');
    const clickedOnToggleButton = target.closest('.collapse-btn');
    const clickedSidebarAnchor = target.closest('.main-sidebar a');
    const isWithoutAnchorSidebar = clickedSidebarAnchor?.classList.contains('without-anchor-sidebar');

    if (isMobileView) {
      if (!clickedInsideSidebar && !clickedOnToggleButton) {
        document.body.classList.add('sidebar-gone');
      } else if (clickedSidebarAnchor && !isWithoutAnchorSidebar) {
        setTimeout(() => {
          document.body.classList.add('sidebar-gone');
        }, 150);
      }
    }
  }

  async onLogout(): Promise<void> {
    sessionStorage.clear();
    this.menuService.clearMenu();

    if (Capacitor.isNativePlatform()) {
      const keysToRemove = ['accessToken', 'refreshToken', 'username', 'UserId', 'Otp', 'usertype'];
      for (const key of keysToRemove) {
        await Preferences.remove({ key });
      }
    }
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.searchService.updateSearchQuery(this.searchQuery);

    this.searchService.currentSuggestions.subscribe((suggestions: any[]) => {
      this.suggestions = suggestions;
    });
  }

  onSelectSuggestion(suggestion: any) {
    let path = suggestion.pagepath.startsWith('/')
      ? suggestion.pagepath
      : '/dash/' + suggestion.pagepath;
    this.router.navigate([path]).then((success) => {
      console.log('Navigation success:', success);
    }).catch((err) => {
      console.error('Navigation error:', err);
    });
    this.searchQuery = '';
    this.suggestions = [];
  }

  // User steps (existing code)
  steps_company = [
    { title: 'Payroll Process', description: 'Access your account with secure credentials.', progress: 20, link: 'payroll/payrolldashboard/payroll-workflow' },
    { title: 'HR Process', description: 'Use the left sidebar to open the services section.', progress: 80, link: 'hr/hrdashboard' },
    { title: 'User Process', description: 'Fill out the form and click submit to process.', progress: 50, link: 'user/userdashboard' },
    { title: 'Recruitment Process', description: 'Use the dashboard to monitor the progress.', progress: 30, link: 'recruitment/recruitmentdashboard' },
    { title: 'Appraisal Process', description: 'Use the dashboard to monitor the progress.', progress: 30, link: 'appraisal/appraisaldashboard' },
    { title: 'Training Process', description: 'Use the dashboard to monitor the progress.', progress: 30, link: 'training/trainingdashboard' }
  ];

  steps_employee = [
    { title: 'Task Box Process', description: 'Access your account with secure credentials.', progress: 20, link: 'taskbox/taskboxdashboard' },
    { title: 'Attendance Process', description: 'Use the left sidebar to open the services section.', progress: 80, link: 'attendance/attendancedashboard' },
    { title: 'Performance Process', description: 'Fill out the form and click submit to process.', progress: 50, link: 'performance/performancedashboard' },
    { title: 'Leaves Process', description: 'Fill out the form and click submit to process.', progress: 60, link: 'leaves/leavesdashboard' },
    { title: 'Reimbursement Process', description: 'Fill out the form and click submit to process.', progress: 30, link: 'reimbursement/reimbursementdashboard' },
    { title: 'Feedback Process', description: 'Fill out the form and click submit to process.', progress: 30, link: 'feedback/feedbackdashboard' },
    { title: 'HR Document Process', description: 'Fill out the form and click submit to process.', progress: 30, link: 'hrdocument/hrdocumentdashboard' },
    { title: 'HR Policies Process', description: 'Fill out the form and click submit to process.', progress: 30, link: 'hrpolicies/hrpoliciesdashboard' },
    { title: 'Recruitment Process', description: 'Fill out the form and click submit to process.', progress: 30, link: 'reimbursement/reimbursementdashboard' }
  ];

  get userSteps() {
    if (this.usertype === 'User') {
      return this.steps_company;
    } else if (this.usertype === 'Employee') {
      return this.steps_employee;
    }
    return [];
  }

  increaseProgress(index: number): void {
    const steps = this.userSteps;
    if (steps && steps[index]?.progress < 100) {
      steps[index].progress += 25;
    }
  }

  decreaseProgress(index: number): void {
    const steps = this.userSteps;
    if (steps && steps[index]?.progress > 0) {
      steps[index].progress -= 25;
    }
  }

  get userRoute(): string {
    if (this.usertype === 'User') {
      return 'payroll/payrolldashboard/payroll-organization';
    } else if (this.usertype === 'Employee') {
      return 'attendance/attendancedashboard/emporganization';
    }
    return '';
  }






  switchToAdmin() {

    const payload = {

      empCode: sessionStorage.getItem('UserId'),
      compCode: sessionStorage.getItem('companyCode')
    };

    this.menuService.switchToAdmin(payload).subscribe(async response => {

      if (!response.isSuccess) {
        this.toastr.error(response.message);
        return;
      }


      sessionStorage.clear();


      sessionStorage.removeItem('loginId');
      const accessToken = response.data.accessToken;
      const fk_CompanyCode = response.data.fk_CompanyCode;
      const companyCode = response.data.fk_CompanyCode;
      const refreshToken = response.data.refreshToken;
      const username = response.data.userName || '';
      const UserId = response.data.userId || '';
      const documentNo = response.data.otp || '';
      const usertype = response.data.loginType || '';
      const showAdminSwitch = response.data.showAdminSwitch;
      const contractorApplicable = response.data.contractorApplicable;
      const Vendor_Applicable = response.data.vendor_Applicable;
        const isAutoEmpcode = response.data.isAutoEmpcode;
;
      const contractorLabelName = response.data.contractor_LabelName;
      const financialDate1 = response.data.financialDate1 || '';
      const financialDate2 = response.data.financialDate2 || '';
      const showclientdetails = response.data.showclientdetails;

      sessionStorage.setItem('showclientdetails', showclientdetails);


      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('UserId', UserId);
      sessionStorage.setItem('companyCode', companyCode);
      sessionStorage.setItem('Otp', documentNo);
      sessionStorage.setItem('usertype', usertype);
      sessionStorage.setItem('showAdminSwitch', showAdminSwitch);

      sessionStorage.setItem('fk_CompanyCode', fk_CompanyCode);
      const companyName = response.data.compname || response.data.CompanyName || response.data.companyName || '';
      sessionStorage.setItem('companyName', companyName);
      // Hardcoded financial years (optional)
      sessionStorage.setItem('financialDate1', financialDate1);
      sessionStorage.setItem('financialDate2', financialDate2);

      if (financialDate1 && financialDate2) {
        const date1 = new Date(financialDate1);
        const date2 = new Date(financialDate2);
        if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
          const year1 = date1.getFullYear();
          const year2 = date2.getFullYear() % 100;
          sessionStorage.setItem('financialYear', `FY ${year1}-${year2}`);
        }
      }

      sessionStorage.setItem('ContractApplicable', contractorApplicable);
       sessionStorage.setItem('Vendor_Applicable', Vendor_Applicable);
      sessionStorage.setItem('contractor_LabelName', contractorLabelName);
       sessionStorage.setItem('isAutoEmpcode', isAutoEmpcode);
      usertype: sessionStorage.getItem('usertype');

      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key: 'accessToken', value: accessToken });
        await Preferences.set({ key: 'refreshToken', value: refreshToken });
        await Preferences.set({ key: 'username', value: username });
        await Preferences.set({ key: 'UserId', value: UserId });
        await Preferences.set({ key: 'Otp', value: documentNo });

        // Optional — store flags if needed for restoring sessions
        await Preferences.set({ key: 'usertype', value: usertype || '' });
      }
      this.dropdownService.clearCache();


      sessionStorage.removeItem('OTP');
      //this.dropdownService.clearCache();
      this.getMenu();
      // this.router.navigate(['/dash']);
      sessionStorage.setItem('usertype', usertype);
      localStorage.setItem('usertype', usertype);
      this.usertype = usertype;
      this.UserName = username;
      this.UserId = UserId;
      this.companyName = sessionStorage.getItem('companyName') || '';
      this.financialYear = sessionStorage.getItem('financialYear') || '';
      this.showAdminSwitch = showAdminSwitch

      this.cdr.detectChanges();
      this.router.navigate(['/dash/dashboard']);
      this.tokenManagerService.startTokenRefreshScheduler();


    })
  }



  switchToEmployee() {

    const payload = {

      // empCode: ,
      empcode: sessionStorage.getItem('UserId'),
      compCode: sessionStorage.getItem('companyCode')

    };

    this.menuService.switchToEmployee(payload).subscribe(async response => {

      if (!response.isSuccess) {
        this.toastr.error(response.message);
        return;
      }


      sessionStorage.clear();


      sessionStorage.removeItem('loginId');
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      const username = response.data.userName || '';
      const UserId = response.data.userId || '';
      const usertype = response.data.loginType || '';
      const companyCode = response.data.compcode || '';
      const showAdminSwitch = response.data.showAdminSwitch || false;
      const financialDate1 = response.data.financialDate1 || '';
      const financialDate2 = response.data.financialDate2 || '';
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('UserId', UserId);
      sessionStorage.setItem('usertype', usertype);
      sessionStorage.setItem('showAdminSwitch', showAdminSwitch);
      sessionStorage.setItem('financialDate1', financialDate1);
      sessionStorage.setItem('financialDate2', financialDate2);
      const companyName = response.data.compname || response.data.CompanyName || response.data.companyName || response.data.compcode || '';
      sessionStorage.setItem('companyName', companyName);

      if (financialDate1 && financialDate2) {
        const date1 = new Date(financialDate1);
        const date2 = new Date(financialDate2);
        if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
          const year1 = date1.getFullYear();
          const year2 = date2.getFullYear() % 100;
          sessionStorage.setItem('financialYear', `FY ${year1}-${year2}`);
        }
      }

      sessionStorage.setItem('companyCode', companyCode);

      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key: 'accessToken', value: accessToken });
        await Preferences.set({ key: 'refreshToken', value: refreshToken });
        await Preferences.set({ key: 'username', value: username });
        await Preferences.set({ key: 'UserId', value: UserId });


        // Optional — store flags if needed for restoring sessions
        await Preferences.set({ key: 'usertype', value: usertype || '' });
      }
      this.dropdownService.clearCache();
      sessionStorage.setItem('usertype', usertype);
      localStorage.setItem('usertype', usertype);
      this.usertype = usertype;
      this.UserName = username;
      this.UserId = UserId;
      this.companyName = sessionStorage.getItem('companyName') || '';
      this.financialYear = sessionStorage.getItem('financialYear') || '';
      this.showAdminSwitch = showAdminSwitch

      this.cdr.detectChanges();
      this.router.navigate(['/dash/employee-dashboard']);
      this.tokenManagerService.startTokenRefreshScheduler();


    })
  }
  getMenu() {

    this.menuService.getallMenubasedonUser().subscribe({
      next: (menuResponse) => {

        this.menuService.setMenu(menuResponse.data); //  Set menu here
      },
      error: (err) => {
        console.error('Error loading menu', err);
      }
    });
  }
}


