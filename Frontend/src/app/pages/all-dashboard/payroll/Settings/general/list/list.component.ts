import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { GeneralService } from '../../../../payroll/services/general.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgxPaginationModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  CodeTypeId: string = '';
  dataList: any[] = [];
  pageIndex: number = 1;  // Current Page Number
  pageSize: number = 10;   // Default Page Size
  totalItems: number = 0;  // Total Items
  codeType = '';
  searchText: string = '';
  organizationName?: string;
  isCodeRequired: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private generalService: GeneralService) { }

  ngOnInit(): void {
    this.CodeTypeId = this.route.snapshot.paramMap.get('id') || '';
    this.route.queryParams.subscribe(params => {
      this.codeType = params['codeType'];
    });
    this.loadData();
  }

  filteredDataList: any[] = [];

  loadData(): void {
    if (!this.CodeTypeId) {
      return;
    }

    this.generalService.GetListBasedOnCodeType(this.CodeTypeId, this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataList = response.data || [];
        this.totalItems = response.totalCount || 0;
        if (this.dataList && this.dataList.length > 0) {
          this.isCodeRequired = this.dataList[0].isCodeRequired;
        }
        this.applyFilter();
        console.log('Data loaded successfully:', response);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        console.log('API call completed.');
      }
    });
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredDataList = this.dataList;
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredDataList = this.dataList.filter(req =>
      req.name?.toLowerCase().includes(searchLower) ||
      req.code?.toLowerCase().includes(searchLower) ||
      req.codeDescription?.toLowerCase().includes(searchLower) ||
      (req.active != null ? String(req.active).toLowerCase().includes(searchLower) : false)
    );
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadData();
  }

  edit(codeTypeId: string, codeId: string, codeType: string) {
    this.router.navigate(['dash/user/userdashboard/insert/', codeId], {
      queryParams: {
        codeTypeId: codeTypeId,
        codeType: codeType
      }
    });
  }

  viewDetails(codeId: string, codeTypeId: string) {
    this.router.navigate(['dash/user/userdashboard/view/', codeId], { queryParams: { codeTypeId: codeTypeId } });
  }
}
