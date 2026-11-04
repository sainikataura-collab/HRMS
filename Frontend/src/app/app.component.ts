

import { Component, HostListener, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Router, RouterOutlet } from '@angular/router';
import { IdleService } from './idle.service';
import { Subscription } from 'rxjs';
import { AuthService } from './authentication/service/auth.service';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxUiLoaderModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  idleService = inject(IdleService);
  authService = inject(AuthService);
  router = inject(Router);
  private idleSubscription?: Subscription;
  title = 'hrms-app';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      // ✅ StatusBar Setup - STRICTLY DO THIS FIRST
      try {
        // 🔥 IMPORTANT: Ye order CRITICAL hai
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // Blue background with white text
        await StatusBar.setBackgroundColor({ color: '#3080e8' });
        await StatusBar.setStyle({ style: Style.Light }); // Light = WHITE text
        
        console.log('✅ StatusBar configured successfully');
      } catch (error) {
        console.error('❌ StatusBar error:', error);
      }

      // Login logic
      try {
        const { value: accessToken } = await Preferences.get({ key: 'accessToken' });
        if (accessToken && !sessionStorage.getItem('accessToken')) {
          const keys = ['accessToken', 'refreshToken', 'username', 'UserId', 'Otp', 'usertype'];
          for (const key of keys) {
            const { value } = await Preferences.get({ key });
            if (value) sessionStorage.setItem(key, value);
          }
          const usertype = sessionStorage.getItem('usertype');
          if (usertype === 'User') {
            this.router.navigate(['/dash']);
          } else {
            this.router.navigate(['/dash/employee-dashboard']);
          }
        }
      } catch (error) {
        console.error('Login logic error:', error);
      }
    }

    if (!Capacitor.isNativePlatform()) {
      this.idleService.idleState.subscribe((isIdle) => {
        if (isIdle) {
          this.idleService.onLogout();
        }
      });
    }
  // Global Label Replacer (Zero Touch to Master Components)
    this.setupGlobalLabelObserver();
  }

  private labelObserver?: MutationObserver;

  setupGlobalLabelObserver() {
    // We only want to run this in the browser, not during SSR if SSR is enabled
    if (typeof document !== 'undefined') {
      this.labelObserver = new MutationObserver((mutations) => {
        // ✅ FIX: Disconnect observer BEFORE making any DOM changes
        // This prevents the infinite loop where innerText changes trigger more mutations
        this.labelObserver!.disconnect();

        mutations.forEach((mutation) => {
          // ✅ FIX: Only watch childList (new elements added), NOT characterData
          // characterData fires on every text change including our own innerText assignments
          if (mutation.type === 'childList') {
            Array.from(mutation.addedNodes).forEach((node: any) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (['LABEL', 'TH', 'SPAN', 'MAT-LABEL'].includes(element.tagName)) {
                  this.checkAndReplaceText(element);
                }
                const children = element.querySelectorAll('label, th, span, mat-label');
                children.forEach(child => this.checkAndReplaceText(child as HTMLElement));
              }
            });
          }
        });

        // ✅ FIX: Reconnect observer AFTER all DOM changes are done
        this.labelObserver!.observe(document.body, { childList: true, subtree: true });
      });

      // ✅ FIX: Removed 'characterData: true' — this was causing the infinite loop
      this.labelObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  private checkAndReplaceText(element: HTMLElement) {
    // ✅ FIX: Skip already-processed elements to prevent reprocessing
    if (element.dataset['labelReplaced']) return;

    if (element && element.innerText && element.innerText.trim() === 'Contractor Name') {
      const companyCode = sessionStorage.getItem('companyCode');
      const companyId = sessionStorage.getItem('companyId');

      if (companyCode || companyId) {
        const customLabel = sessionStorage.getItem('contractor_LabelName');
        if (customLabel && customLabel !== 'Contractor Name') {
          element.innerText = customLabel;
          // Mark element so we don't process it again
          element.dataset['labelReplaced'] = 'true';
        }
      }
    }
  }




  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])
  @HostListener('document:click', ['$event'])
  @HostListener('document:scroll', ['$event'])
  handleUserActivity() {
    this.idleService.resetTimer();
  }
}


