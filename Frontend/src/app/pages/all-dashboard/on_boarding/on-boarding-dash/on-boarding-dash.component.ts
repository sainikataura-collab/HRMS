import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardData, OnboardingService } from '../Onboarding.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-on-boarding-dash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './on-boarding-dash.component.html',
  styleUrl: './on-boarding-dash.component.scss'
})
export class OnBoardingDashComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  selectedDepartment = 'Department';
  selectedRole = 'Role';

  constructor(
    private onboardingService: OnboardingService,
    private router: Router,
      public encryptionService:EncryptionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

 this.onboardingService.getDashboardData().subscribe({
  next: (res) => {
    this.loading = false;

    // Check isSuccess first
    if (!res || res.isSuccess !== true) {
      this.error = res?.message || "Failed to load dashboard data";
      this.dashboardData = null;
      return;
    }

    // Assign API data safely
    this.dashboardData = res.data ?? null;
  },

  error: (err) => {
    this.error = "Failed to load dashboard data";
    this.loading = false;
    console.error("Error loading dashboard:", err);
  }
});

  }



  viewOnboarding(pk_recId: string) {
    this.router.navigate(['dash/on_boarding/on_boardingdashboard/OnboardCandidateView', pk_recId]);
  }
  

  // onDepartmentChange(event: Event): void {
  //   const target = event.target as HTMLSelectElement;
  //   this.selectedDepartment = target.value;
  //   console.log('Department changed to:', this.selectedDepartment);
  //   // Add filtering logic here if needed
  // }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRole = target.value;
    console.log('Role changed to:', this.selectedRole);
    // Add filtering logic here if needed
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-success';
      case 'In Progress':
        return 'bg-warning';
      case 'Initiated':
        return 'bg-primary';
      default:
        return 'bg-info';
    }
  }

  newOnboarding(): void {
    console.log('Creating new onboarding');
    // Uncomment when routing is set up
    // this.router.navigate(['/onboarding/new']);
  }

  // exportReport(): void {
  //   this.onboardingService.exportData('pdf').subscribe({
  //     next: (blob) => {
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'onboarding-report.pdf';
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     },
  //     error: (err) => console.error('Export failed:', err)
  //   });
  // }

  openSettings(): void {
    console.log('Opening settings');
    // Uncomment when routing is set up
    // this.router.navigate(['/settings']);
  }
}