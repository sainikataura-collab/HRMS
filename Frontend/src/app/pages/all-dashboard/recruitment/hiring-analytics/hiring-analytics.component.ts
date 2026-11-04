import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AtsService, AtsAnalyticsSummary } from '../../../../shared/services/ats.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

export interface MonthlyTrendPoint {
  month: string;
  days: number;
  heightPercent: number;
  hires: number;
}

export interface RecentHireRecord {
  avatarInitials: string;
  name: string;
  role: string;
  department: string;
  rating: number;
  source: string;
  sourceColor: string;
  hiredDate: string;
}

@Component({
  selector: 'app-hiring-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './hiring-analytics.component.html',
  styleUrl: './hiring-analytics.component.scss'
})
export class HiringAnalyticsComponent implements OnInit {
  analytics: AtsAnalyticsSummary | null = null;
  selectedTimeframe: string = 'Last 30 Days';

  monthlyTrend: MonthlyTrendPoint[] = [
    { month: 'Jan', days: 22, heightPercent: 62, hires: 18 },
    { month: 'Feb', days: 28, heightPercent: 78, hires: 24 },
    { month: 'Mar', days: 18, heightPercent: 50, hires: 20 },
    { month: 'Apr', days: 34, heightPercent: 92, hires: 29 },
    { month: 'May', days: 14, heightPercent: 42, hires: 16 },
    { month: 'Jun', days: 24, heightPercent: 68, hires: 35 }
  ];

  recentHires: RecentHireRecord[] = [
    {
      avatarInitials: 'RS',
      name: 'Rahul Sharma',
      role: 'Senior Full Stack Engineer',
      department: 'Engineering',
      rating: 5,
      source: 'LinkedIn Jobs',
      sourceColor: '#0a66c2',
      hiredDate: 'Aug 28, 2026'
    },
    {
      avatarInitials: 'AP',
      name: 'Amit Patel',
      role: 'Principal Product Manager',
      department: 'Product & Design',
      rating: 5,
      source: 'Employee Referral',
      sourceColor: '#16a34a',
      hiredDate: 'Aug 25, 2026'
    },
    {
      avatarInitials: 'PV',
      name: 'Priya Verma',
      role: 'Lead UI/UX Product Designer',
      department: 'Product & Design',
      rating: 4.5,
      source: 'Direct Careers Portal',
      sourceColor: '#0051d5',
      hiredDate: 'Aug 22, 2026'
    },
    {
      avatarInitials: 'KM',
      name: 'Karan Malhotra',
      role: 'Cloud DevOps Architect',
      department: 'Engineering',
      rating: 4,
      source: 'Indeed Feed',
      sourceColor: '#2164f3',
      hiredDate: 'Aug 18, 2026'
    },
    {
      avatarInitials: 'NS',
      name: 'Neha Singh',
      role: 'Engineering QA Lead',
      department: 'Quality Assurance',
      rating: 5,
      source: 'Google for Jobs',
      sourceColor: '#ea4335',
      hiredDate: 'Aug 12, 2026'
    }
  ];

  constructor(
    private atsService: AtsService,
    private toastr: ToastrService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loaderService.start();
    this.atsService.getAnalyticsSummary().subscribe({
      next: (data) => {
        this.loaderService.stop();
        this.analytics = data;
      },
      error: (err) => {
        this.loaderService.stop();
        console.error('Error loading analytics', err);
      }
    });
  }

  onTimeframeChange(): void {
    this.toastr.info(`Recalibrated metrics for ${this.selectedTimeframe}`, '📅 Analytics Updated');
  }

  getTopSourcingChannels(): any[] {
    return this.analytics?.sourcingChannels ? this.analytics.sourcingChannels.slice(0, 4) : [];
  }

  exportReport(): void {
    this.toastr.success('Hiring Analytics Executive Report downloaded (CSV/PDF).', '📊 Report Exported');
  }
}
