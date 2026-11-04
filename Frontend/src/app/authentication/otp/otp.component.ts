import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { TokenManagerService } from '../../shared/services/token-manager.service';
import { DropdownService } from '../../shared/services/dropdown.service';

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuService } from '../../shared/services/menu.service';
@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit, OnDestroy {
  otp: string[] = Array(6).fill(''); // Array to hold the OTP digits
  countdown: number = 60; // Countdown timer (in seconds)
  isTimerRunning: boolean = true; // To track the state of the timer
  isValidateDisabled: boolean = false; // To track whether the validate button is disabled
  countdownSubscription: Subscription = new Subscription();
   menuList: any[] = []; // To store menu items based on user type
  authType: string = ''; // To store whether it's login or registration OTP
  isVerifying: boolean = false;
  ngxUILoaderService = inject(NgxUiLoaderService);
  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private tokenManagerService: TokenManagerService,
    private dropdownService: DropdownService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    this.ngxUILoaderService.start();

    this.authType = this.route.snapshot.paramMap.get('login') || '';

    const storedOtp = sessionStorage.getItem('OTP') || '';
    if (storedOtp && storedOtp.length === 6) {
      this.otp = storedOtp.split('');
    }

    this.ngxUILoaderService.stop();
  }

  startTimer() {
    this.isTimerRunning = true;
    this.isValidateDisabled = false;
    this.countdown = 60; // Set the timer to 60 seconds

    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.isTimerRunning = false;
        this.isValidateDisabled = true; // Disable the "Validate" button when OTP expires
        this.countdownSubscription.unsubscribe();
      }
    });
  }

  moveFocus(currentInputIndex: number, event: KeyboardEvent) {
    if (/\d/.test(event.key) || event.key === 'Backspace') {
      if (
        event.key !== 'Backspace' &&
        currentInputIndex < this.otp.length - 1
      ) {
        const inputs = document.querySelectorAll('#otp input');
        (inputs[currentInputIndex + 1] as HTMLInputElement).focus();
      } else if (event.key === 'Backspace' && currentInputIndex > 0) {
        const inputs = document.querySelectorAll('#otp input');
        (inputs[currentInputIndex - 1] as HTMLInputElement).focus();
      }
    }
  }

  handlePaste(event: ClipboardEvent, inputIndex: number) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const otpDigits = pastedData.split('').slice(0, 6);
    for (let i = 0; i < otpDigits.length; i++) {
      if (inputIndex + i < this.otp.length) {
        this.otp[inputIndex + i] = otpDigits[i];
      }
    }

    // Move focus to the next empty input
    for (let i = inputIndex; i < this.otp.length; i++) {
      if (!this.otp[i]) {
        const inputs = document.querySelectorAll('#otp input');
        (inputs[i] as HTMLInputElement).focus(); // Focus the next empty input
        break;
      }
    }
  }

  resendOtp() {
    const id =
      this.authType === 'register'
        ? sessionStorage.getItem('registerId') || ''
        : sessionStorage.getItem('loginId') || '';

    const requestPathId = this.authType === 'register' ? 2 : 1; // Differentiate based on authType

    const resendOtpData = {
      id: id,
      requestPathId: requestPathId,
    };

    this.authService.resend_otp(resendOtpData).subscribe({
      next: (response) => {
        alert(
          `Message: ${response.message}, DocumentNo: ${response.documentNo}`
        );
        if (response.isSuccess) {
          this.otp = Array(6).fill(''); // Reset OTP fields
          this.toastrService.success('OTP resent successfully!');
          this.startTimer(); // Restart the timer when OTP is resent
        } else {
          this.toastrService.error('Failed to resend OTP');
        }
      },
      error: (error) => {
        this.toastrService.error('Error resending OTP');
      },
    });
  }

  validate() {
   
     this.isVerifying = true;
    const otpCode = this.otp.join('');
    const loginId = sessionStorage.getItem('loginId') || '';

    var usertype = sessionStorage.getItem('usertype');

    const loginotpData = {
      userId: loginId,
      otp: otpCode,
      usertype: sessionStorage.getItem('usertype'),
    };
    const otpService =
      usertype == 'User'
        ? this.authService.verify_otp_login(loginotpData)
        : this.authService.verifyEmployeeOtp(loginotpData);
    otpService.subscribe({
      next: async (response) => {
     
        this.isVerifying = false;
        if (response.isSuccess) {
          sessionStorage.removeItem('loginId');
            
      


          const accessToken = response.data.accessToken;
          const refreshToken = response.data.refreshToken;
          const username = response.data.userName || '';
          const userId = response.data.userId || '';
          const documentNo = response.documentNo || '';
          const contractorApplicable = response.data.contractorApplicable;
          // Role Details
const roleId = response.data.pk_roleId || '';
const roleName = response.data.rolename || '';
          sessionStorage.setItem('accessToken', accessToken);
          sessionStorage.setItem('refreshToken', refreshToken);
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('userId', userId);
          sessionStorage.setItem('Otp', documentNo);
          sessionStorage.setItem('roleId', roleId.toString());
sessionStorage.setItem('roleName', roleName);

          const companyName = response.data.companyName || response.data.CompanyName || response.data.compname || '';
          sessionStorage.setItem('companyName', companyName);
          sessionStorage.setItem('financialDate1', response.data.financialDate1 || response.data.finStartDate || response.data.date1 || '01 Apr 2025');
          sessionStorage.setItem('financialDate2', response.data.financialDate2 || response.data.finEndDate || response.data.date2 || '31 Mar 2026');
          
          // Generate Financial Year string (e.g., FY 2025-26)
          const f1 = sessionStorage.getItem('financialDate1');
          const f2 = sessionStorage.getItem('financialDate2');
          if (f1 && f2) {
            const date1 = new Date(f1);
            const date2 = new Date(f2);
            if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
              const year1 = date1.getFullYear();
              const year2 = date2.getFullYear() % 100;
              sessionStorage.setItem('financialYear', `FY ${year1}-${year2}`);
            } else {
               sessionStorage.setItem('financialYear', 'FY 2025-26');
            }
          }
          
          sessionStorage.setItem('ContractApplicable', contractorApplicable);

          if (Capacitor.isNativePlatform()) {
            await Preferences.set({ key: 'accessToken', value: accessToken });
            await Preferences.set({ key: 'refreshToken', value: refreshToken });
            await Preferences.set({ key: 'username', value: username });
            await Preferences.set({ key: 'UserId', value: userId });
            await Preferences.set({ key: 'Otp', value: documentNo });
            await Preferences.set({ key: 'roleId', value: roleId.toString() });
await Preferences.set({ key: 'roleName', value: roleName });

            // Optional — store flags if needed for restoring sessions
            await Preferences.set({ key: 'usertype', value: usertype || '' });
          }

          this.dropdownService.clearCache();

          if (usertype == 'User') {
            sessionStorage.removeItem('OTP');
            this.dropdownService.clearCache();
            this.getMenu();
            this.router.navigate(['/dash']);

            
          } else {
            sessionStorage.removeItem('OTP');
            this.dropdownService.clearCache();
            this.router.navigate(['/dash/employee-dashboard']); // 👈 Employee route
          }

          this.tokenManagerService.startTokenRefreshScheduler();
          this.toastrService.success(response.message);
        } else {
          this.isVerifying = false;
          this.toastrService.error(response.message);
          this.router.navigate(['/auth/otp']);
          this.dropdownService.clearCache();
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.toastrService.error(error.message || 'OTP verification failed');
      },
    });
  }



ngOnDestroy() {
    // Cleanup to prevent memory leaks
    this.countdownSubscription.unsubscribe();
  }

     getMenu() {

      this.menuService.getallMenubasedonUser().subscribe({
        next: (menuResponse) => {
        
          this.menuService.setMenu(menuResponse.data); // ✅ Set menu here
        },
        error: (err) => {
          console.error('Error loading menu', err);
        }
      });
    }
}



