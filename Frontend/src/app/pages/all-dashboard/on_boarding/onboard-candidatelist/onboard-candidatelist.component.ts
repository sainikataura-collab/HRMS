import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { OnboardingService } from '../Onboarding.service';


@Component({
  selector: 'app-onboard-candidatelist',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './onboard-candidatelist.component.html',
  styleUrl: './onboard-candidatelist.component.scss'
})
export class OnboardCandidatelistComponent {

  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  onboardingList: any[] = [];

  constructor(
    private onboardingService: OnboardingService,
    private toastr: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.getOnBoardingList();
  }

  onPageChange(event: number) {
    this.pageIndex = event;
    this.getOnBoardingList();
  }

  /** API Call */
  getOnBoardingList(): void {
    this.onboardingService.getOnboardingCandidatelist(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.onboardingList = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.toastr.warning("No onboarding records found");
          this.onboardingList = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Error loading onboarding list");
      }
    });
  }

  /** Search */
  filteredData() {
    if (!this.searchText) return this.onboardingList;

    const s = this.searchText.toLowerCase();
    return this.onboardingList.filter(user =>
      user.candidate_name?.toLowerCase().includes(s) ||
      user.department?.toLowerCase().includes(s) ||
      user.designation?.toLowerCase().includes(s) ||
      user.onboardFormStatus?.toLowerCase().includes(s)
    );
  }



  /** View Onboarding */
  viewOnboarding(pk_recId: string) {

    this.router.navigate(['dash/on_boarding/on_boardingdashboard/OnboardCandidateView', pk_recId]);
  }


 
}
