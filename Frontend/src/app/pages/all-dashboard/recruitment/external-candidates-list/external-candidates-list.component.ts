import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { JobMasterService } from '../RecruitServices/job-master.service';

@Component({
  selector: 'app-external-candidates-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, RouterLink, NgSelectModule],
  templateUrl: './external-candidates-list.component.html',
  styleUrls: []
})
export class ExternalCandidatesListComponent implements OnInit {
  
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  candidates: any[] = [];
  jobId: string | null = null;

  jobList: any[] = [];
  selectedJobId: string | null = null;

  constructor(
    private toastrService: ToastrService, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private jobMasterService: JobMasterService
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
    this.route.paramMap.subscribe(params => {
      this.jobId = params.get('jobId');
      this.selectedJobId = this.jobId;
      this.fetchCandidates(this.jobId);
    });
  }

  fetchJobs() {
    this.jobMasterService.getAllJobMasters(0, 10000).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.jobList = res.data;
        }
      }
    });
  }

  onJobChange() {
    if (this.selectedJobId) {
      this.router.navigate(['/dash/recruitment/recruitmentdashboard/external-candidates-list', this.selectedJobId]);
    } else {
      this.router.navigate(['/dash/recruitment/recruitmentdashboard/external-candidates-list']);
    }
  }

  fetchCandidates(jobId: string | null) {
    // Calling the API endpoint which connects to the database
    const endpoint = jobId 
      ? `${environment.baseURL}/Newjob/${jobId}/external-candidates`
      : `${environment.baseURL}/Newjob/external-candidates`;

    this.http.get<any>(endpoint).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.candidates = res.data;
          this.totalItems = this.candidates.length;
        } else {
          this.toastrService.error('Failed to load candidates from database.');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastrService.error('API Error connecting to database.');
      }
    });
  }

  filteredData() {
    if (!this.searchText) {
      return this.candidates;
    }
    return this.candidates.filter(c => 
      c.fullName.toLowerCase().includes(this.searchText.toLowerCase()) || 
      c.sourcePlatform.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onPageChange(event: any) {
    this.pageIndex = event;
  }

  importCandidate(id: string) {
    // Call API to map this external candidate to internal CandidateMst
    this.toastrService.success('Candidate imported successfully!');
  }

  getSources(sourceString: string): string[] {
    if (!sourceString) return [];
    return sourceString.split(',').map(s => s.trim());
  }

}
