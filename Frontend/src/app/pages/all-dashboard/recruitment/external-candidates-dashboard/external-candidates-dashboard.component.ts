import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-external-candidates-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './external-candidates-dashboard.component.html',
  styleUrls: []
})
export class ExternalCandidatesDashboardComponent implements OnInit {
  
  totalNaukriJobs = 0;
  totalIndeedJobs = 0;
  totalNaukriCandidates = 0;
  totalIndeedCandidates = 0;
  shortlistedCandidates = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardStats();
  }

  fetchDashboardStats() {
    this.http.get<any>(`${environment.baseURL}/Newjob/external-stats`).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.totalNaukriJobs = res.data.totalNaukriJobs;
          this.totalIndeedJobs = res.data.totalIndeedJobs;
          this.totalNaukriCandidates = res.data.totalNaukriCandidates;
          this.totalIndeedCandidates = res.data.totalIndeedCandidates;
          this.shortlistedCandidates = res.data.shortlistedCandidates;
        }
      },
      error: (err) => {
        console.error('Error fetching external stats', err);
      }
    });
  }
}
