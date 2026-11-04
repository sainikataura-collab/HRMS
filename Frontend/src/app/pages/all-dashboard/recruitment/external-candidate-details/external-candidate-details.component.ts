import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-external-candidate-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './external-candidate-details.component.html',
  styleUrls: []
})
export class ExternalCandidateDetailsComponent implements OnInit {
  
  candidateId: string | null = null;
  candidateDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    // private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.candidateId = this.route.snapshot.paramMap.get('id');
    if (this.candidateId) {
      this.fetchCandidateDetails(this.candidateId);
    }
  }

  fetchCandidateDetails(id: string) {
    // For now we will mock the single candidate detail fetch.
    // In reality this would be: this.http.get(`${environment.api}/Newjob/external-candidate/${id}`)
    this.candidateDetails = {
      externalId: id,
      sourcePlatform: 'Naukri',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+91-9876543210',
      location: 'Mumbai, Maharashtra',
      yearsOfExperience: 5.5,
      currentCompany: 'Tech Corp India',
      currentDesignation: 'Senior Developer',
      applicationDate: '2026-05-23T10:00:00Z',
      status: 'Applied',
      resumeUrl: 'https://example.com/resume.pdf',
      linkedInProfileUrl: 'https://linkedin.com/in/johndoe'
    };
  }

  importCandidate() {
    this.toastrService.success('Candidate profile has been imported to the main database successfully.');
  }

  getSources(sourceString: string): string[] {
    if (!sourceString) return [];
    return sourceString.split(',').map(s => s.trim());
  }

}
