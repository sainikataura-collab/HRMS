import { Injectable,Injector, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AuthService } from './authentication/service/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenManagerService } from './shared/services/token-manager.service';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class IdleService implements OnDestroy {
  private idleSubject = new Subject<boolean>();
  private timeout = 600; // Total idle time in seconds
  private warningTimeout = 10; // Warning time before logout
  private lastActivity?: Date;
  private idleCheckInterval = 10; // Check every 10 seconds
  private idlleSubscription?: Subscription;
  private warningShown = false;
  private isLoggedOut = false;
  

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
    private injector: Injector
  ) 
  
  {
    if (isPlatformBrowser(this.platformId)&& !Capacitor.isNativePlatform()) {
      this.resetTimer(); // Initialize last activity
      this.startWatching(); // Start checking idle status
    }
  }



  get idleState(): Observable<boolean> {
    return this.idleSubject.asObservable();
  }

  private startWatching() {
    if (this.idlleSubscription) {
      return;
    }

    this.idlleSubscription = interval(this.idleCheckInterval * 1000)
      .pipe(throttleTime(this.idleCheckInterval * 1000))
      .subscribe(() => this.checkIdleState());
  }

  private checkIdleState() {
    if (!this.lastActivity) {
      this.resetTimer();
      return;
    }

    const timeSinceLastActivity = this.getTimeSinceLastActivity();

    if (this.authService.loggedIn() &&
        timeSinceLastActivity > (this.timeout - this.warningTimeout) * 1000 &&
        !this.warningShown &&
        !this.isLoggedOut) {
      this.showWarning();
      this.warningShown = true;
    }

    if (timeSinceLastActivity > this.timeout * 1000 && !this.isLoggedOut) {
      this.idleSubject.next(true);
      this.isLoggedOut = true;
      this.onLogout();
    }

    
  }

  private getTimeSinceLastActivity(): number {
    return new Date().getTime() - (this.lastActivity?.getTime() || 0);
  }

  private showWarning() {
    this.toastrService.warning(
      `Your session will expire in ${this.warningTimeout} seconds.`,
      'Session Expiration Warning',
      {
        timeOut: this.warningTimeout * 1000,
        closeButton: true,
        progressBar: true
      }
    );
  }

  onLogout(): void {
    // if (this.isLoggedOut) return;
    this.isLoggedOut = true;
    this.authService.logout().subscribe({
      next: (res) => {    
        if(res.isSuccess){
          sessionStorage.clear();
          const tokenManagerService = this.injector.get(TokenManagerService);
          tokenManagerService.clearTokenRefreshScheduler();
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  resetTimer() {
    this.lastActivity = new Date();
    this.idleSubject.next(false);
    this.warningShown = false;
    this.isLoggedOut = false;
  }

  stopWatching() {
    if (this.idlleSubscription) {
      this.idlleSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.stopWatching();
    // Remove event listeners when the component is destroyed to avoid memory leaks
   
  }
}
