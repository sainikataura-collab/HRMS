import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyConfigService } from '../../../on_boarding/services/company-config.service';
import { CandidateExperienceDetailService } from '../../../on_boarding/services/candidate-experience-details.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-on-boarding-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './on-boarding-header.component.html',
  styleUrl: './on-boarding-header.component.scss'
})
export class OnBoardingHeaderComponent implements OnInit, OnDestroy {
  candidateName: string = 'Rahul Kumar';
  userInitials: string = 'RK';
  lastOpenedDate: string = '';
  currentDate: string = '';
  currentTime: string = '';
  
  // Company Branding
  companyName: string = '';
  companyLogoUrl: string = '';

  private timer: any;

  isMiniSidebarActive: boolean = false; // Track desktop mini sidebar toggle state
  private sidebarHovered: boolean = false; // Track whether the sidebar is being hovered/touched

  constructor(
    private configService: CompanyConfigService,
    private kycService: CandidateExperienceDetailService
  ) {}

  ngOnInit(): void {
    this.loadCandidateInfo();
    this.loadCompanyInfo();
    this.initLastOpened();
    this.updateDateTime();

    // Live update every second
    this.timer = setInterval(() => {
      this.updateDateTime();
      this.loadCandidateInfo(); // Sync name if set asynchronously by guard/api
      this.checkCompanyInfoSync();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  loadCompanyInfo(): void {
    const storedName = sessionStorage.getItem('companyName');
    if (storedName && storedName.trim()) {
      this.companyName = storedName.trim();
    }

    const storedLogo = sessionStorage.getItem('companyLogo');
    if (storedLogo && storedLogo.trim()) {
      this.setCompanyLogo(storedLogo.trim());
    }

    // Subscribe to CompanyConfigService for reactive updates
    this.configService.config$.subscribe(config => {
      debugger;
      if (config) {
        if (config.companyName && !this.companyName) {
          this.companyName = config.companyName;
        }
        if (config.companyLogo && !this.companyLogoUrl) {
          this.setCompanyLogo(config.companyLogo);
        }
      }
    });

    // If not yet available in storage or service, fetch via getMandatoryDetails
    if (!this.companyName || !this.companyLogoUrl) {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res?.isSuccess && res?.data) {
            if (res.data.companyName) {
              this.companyName = res.data.companyName;
              sessionStorage.setItem('companyName', res.data.companyName);
            }
            if (res.data.companyLogo) {
              this.setCompanyLogo(res.data.companyLogo);
              sessionStorage.setItem('companyLogo', res.data.companyLogo);
            }
          }
        },
        error: () => {}
      });
    }
  }

  checkCompanyInfoSync(): void {
    const storedName = sessionStorage.getItem('companyName');
    if (storedName && storedName.trim() && storedName.trim() !== this.companyName) {
      this.companyName = storedName.trim();
    }
    const storedLogo = sessionStorage.getItem('companyLogo');
    if (storedLogo && storedLogo.trim() && !this.companyLogoUrl) {
      this.setCompanyLogo(storedLogo.trim());
    }
  }

  setCompanyLogo(logoFileName: string): void {
    if (logoFileName && logoFileName.trim()) {
      const key = sessionStorage.getItem('candidateKey') || '';
      const keyParam = key ? `?key=${encodeURIComponent(key)}` : '';
      this.companyLogoUrl = `${environment.baseURL1}/CandidateExperienceDetails/logoimages/${logoFileName.trim()}${keyParam}`;
    }
  }

  onLogoError(event: any): void {
    // Fallback to default logo
    event.target.src = 'assets/Image/Logo/logo.png';
  }

  loadCandidateInfo(): void {
    const storedName = sessionStorage.getItem('candidateName') || localStorage.getItem('candidateName');
    if (storedName && storedName.trim() && storedName.trim() !== this.candidateName) {
      this.candidateName = storedName.trim();
      this.computeInitials();
    } else if (!storedName && !this.userInitials) {
      this.computeInitials();
    }
    const dbLastOpened = sessionStorage.getItem('lastOpenedDate');
    if (dbLastOpened) {
      const parsedDate = new Date(dbLastOpened);
      if (!isNaN(parsedDate.getTime())) {
        this.lastOpenedDate = this.formatLastOpened(parsedDate);
      }
    }
  }

  computeInitials(): void {
    if (!this.candidateName) {
      this.userInitials = 'RK';
      return;
    }
    const parts = this.candidateName.trim().split(/\s+/);
    if (parts.length >= 2) {
      this.userInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
      this.userInitials = parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    } else {
      this.userInitials = 'RK';
    }
  }

  initLastOpened(): void {
    const dbLastOpened = sessionStorage.getItem('lastOpenedDate');
    if (dbLastOpened) {
      const parsedDate = new Date(dbLastOpened);
      if (!isNaN(parsedDate.getTime())) {
        this.lastOpenedDate = this.formatLastOpened(parsedDate);
        return;
      }
    }

    const key = 'onboard_last_opened_at';
    const previous = localStorage.getItem(key);
    const now = new Date();

    if (previous) {
      const prevDate = new Date(previous);
      if (!isNaN(prevDate.getTime())) {
        this.lastOpenedDate = this.formatLastOpened(prevDate);
      } else {
        // Fallback realistic recent time
        const fallback = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        this.lastOpenedDate = this.formatLastOpened(fallback);
      }
    } else {
      // First visit - default to 1 day ago or realistic time as demonstrated
      const fallback = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      this.lastOpenedDate = this.formatLastOpened(fallback);
    }

    // Save current session timestamp for next visit
    localStorage.setItem(key, now.toISOString());
  }

  formatLastOpened(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month}, ${hours}:${minutes} ${ampm}`;
  }

  updateDateTime(): void {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    this.currentDate = `${day} ${month} ${year}`;

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    this.currentTime = `${hours}:${minutes} ${ampm}`;
  }

  // Toggle sidebar on toggle button click
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
      if (insideSidebar) {
        this.sidebarHovered = true;
      } else {
        this.sidebarHovered = false;
      }
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
}
