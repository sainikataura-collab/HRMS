
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { NgxUiLoaderService } from 'ngx-ui-loader'; // Ensure you have this service installed and imported
import { PrograssionDetailService } from '../Service/prograssion-detail.service';
@Component({
  selector: 'app-appraisal-approval-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
   templateUrl: './appraisal-approval-list.component.html',
  styleUrl: './appraisal-approval-list.component.scss'
})
export class AppraisalApprovalListComponent implements OnInit {
  appraisalList: any[] = [];
  searchText: string = '';

  constructor(private appraisalService: PrograssionDetailService,
              private router: Router,
               private loader: NgxUiLoaderService
  ) {}    
  ngOnInit(): void {
    this.loader.start(); // Start the loader
    this.getAppraisalList(); // Fetch data on init
    this.loader.stop(); // Stop the loader after data is fetched
  }

 getAppraisalList() {
  this.appraisalService.getAppraisalListHod().subscribe({
    next: (res) => {
      if (res.isSuccess) {
        console.log('Appraisal List:', res.data);
        this.appraisalList = res.data; // Assuming res.data is the array of appraisals
      } else {
        console.error('Failed to fetch appraisal list');
      }
    },
    error: (err) => {
      console.error('Error fetching appraisal list:', err);
    }
  });
}


 
 filteredData() {
  if (!this.searchText) {
    return this.appraisalList;
  }
  const searchTextLower = this.searchText.toLowerCase();
  return this.appraisalList.filter(item =>
    item.employeeName?.toLowerCase().includes(searchTextLower) ||
    item.appraisalYear?.toLowerCase().includes(searchTextLower) ||
    item.finalKRAScore?.toLowerCase().includes(searchTextLower) ||
     item.behavioralScore?.toLowerCase().includes(searchTextLower) ||
      item.finalWeightedScore?.toLowerCase().includes(searchTextLower) ||
       item.dated?.toLowerCase().includes(searchTextLower) 
  );
}

viewAppraisal(empId: string, yearId: number): void {
  this.router.navigate([
    '/dash/performance/performancedashboard/AppraisalApprovalDetails',
    empId,
    yearId
  ]);
}

update(empId: string, yearId: number): void {
  this.router.navigate([
    'dash/performance/performancedashboard/AppraisalApproval',
    empId,
    yearId
  ]);
}
}

