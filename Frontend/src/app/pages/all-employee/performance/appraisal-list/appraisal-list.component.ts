import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { NgxUiLoaderService } from 'ngx-ui-loader'; // Ensure you have this service installed and imported
import { PrograssionDetailService } from '../Service/prograssion-detail.service';
@Component({
  selector: 'app-appraisal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appraisal-list.component.html',
  styleUrl: './appraisal-list.component.scss'
})
export class AppraisalListComponent implements OnInit {
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
  this.appraisalService.getAppraisalList().subscribe({
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
    '/dash/performance/performancedashboard/AppraisalDetails',
    empId,
    yearId
  ]);
}

update(empId: string, yearId: number): void {
  this.router.navigate([
    'dash/performance/performancedashboard/Appraisalupdate',
    empId,
    yearId
  ]);
}


downloadExcel(): void {
      // this.geoService.getAllGeos(this.pageNumber, 100000).subscribe(res => {
      //   if (res.isSuccess) {
      //     const data = res.data;
    
      //     const filteredData = data.map((item: any) => ({
      //       Country: item.countryName,
      //       State: item.stateName,
      //       City: item.cityName,
      //       Zone: item.zoneName,
      //       SubZone:item.subZone,
      //       Region:item.region,
      //       PostalCode:item.postalCode,
      //       EntryBy: item.entryByName,
      //       UpdateBy: item.updateByName,
      //       ActiveStatus: item.active,
      //       EntryDate: item.entryDate,
      //       UpdateDate: item.updateDate
      //     }));
    
      //     const ws = XLSX.utils.json_to_sheet(filteredData);
      //     const wb = XLSX.utils.book_new();
      //     XLSX.utils.book_append_sheet(wb, ws, 'GeoList');
      //     XLSX.writeFile(wb, 'GeoList.xlsx');
      //   }
      // });
    }
}

