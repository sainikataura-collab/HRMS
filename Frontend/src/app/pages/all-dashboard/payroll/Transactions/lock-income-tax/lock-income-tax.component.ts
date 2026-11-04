import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';

@Component({
  selector: 'app-lock-income-tax',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectComponent, CommonSearchComponent],
 templateUrl: './lock-income-tax.component.html',
  styleUrl: './lock-income-tax.component.scss'
})
export class LockIncomeTaxComponent {

  lockITForm!: FormGroup;
  submitted = false;
  showError = false;

  pageIndex1: number = 1;
  pageSize1: number = 10;

  pageIndex2: number = 1;
  pageSize2: number = 10;

  pageIndex3: number = 1;
  pageSize3: number = 10;

  searchTextProcessed = '';
  searchTextLocked = '';
  searchTextUnprocessed = '';

  filteredProcessList: any[] = [];
  filteredLockedList: any[] = [];
  filteredUnprocessedList: any[] = [];

  lockedCount: number = 0;
  UnprocessedCount: number = 0;
  processedCount: number = 0;

  months: any[] = [];
  years: any[] = [];
  DocStatusList = [
    { name: 'Under Tracking', value: 'U' },
    { name: 'Submitted', value: 'S' }
  ];
  
  processData: any = {};

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private httpservice: MonthlyRentDetailService
  ) {}

  ngOnInit(): void {
    this.filteredUnprocessedList = this.processData.itNotLockList || [];
    this.filteredProcessList = this.processData.itLockList || [];
    this.filteredLockedList = this.processData.itLocked_NotProcessedList || [];

    this.lockITForm = this.fb.group({
      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
      empCode: [''],
      empName: [''],
      selectedLocations: [[]],
      selectedDepartments: [[]],
      selectedStatus: [''],
      selectedCity: [''],
      sortBy: [''],
      empStatus: [''],
      Fk_FinId: [''],
      Fk_CompanyId: ['']
    });

    this.loader.start();
    forkJoin([
      this.httpservice.getCommanList('Month'),
      this.httpservice.getCommanList('Year')
    ]).subscribe({
      next: ([monthsRes, yearsRes]) => {
        this.months = monthsRes.data;
        this.years = yearsRes.data;
        this.loader.stop();
      },
      error: () => {
        this.toastr.error("Failed to load data");
        this.loader.stop();
      }
    });
  }


  handleFilters(filters: any) {
    this.lockITForm.patchValue(filters);
  }
  onSubmit(): void {
    debugger
    this.submitted = true;
    this.showError = true;

    if (this.lockITForm.invalid) return;

    const sortBy = this.lockITForm.get('sortBy')?.value;
    const departments = this.lockITForm.get('selectedDepartments')?.value;
    const locations = this.lockITForm.get('selectedLocations')?.value;

    if (!sortBy || sortBy.trim() === '') {
      this.toastr.warning('Please select sortBy');
      return;
    }

    if (!departments?.length) {
      this.toastr.warning('Please select at least one Department');
      return;
    }

    if (!locations?.length) {
      this.toastr.warning('Please select at least one Location');
      return;
    }

    this.getLockITData();
  }


  Lock(): void {

    if (!this.filteredUnprocessedList || this.filteredUnprocessedList.length === 0) {
      this.toastr.warning('You have not selected employee to IT Un-Locked!.');
      return;
    }

    const payload = { ...this.lockITForm.value };
    Object.keys(payload).forEach(key => payload[key] = payload[key] ?? '');

    this.httpservice.LockIT(payload).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toastr.success('IT Processed successfully!');
          this.getLockITData();
        } else {
          this.toastr.error(res.message || 'Failed to submit IT process');
        }
      },
      error: err => this.toastr.error(err.message || 'Server error')
    });
  }

  Unlock(): void {

    if (!this.filteredProcessList || this.filteredProcessList.length === 0) {
      this.toastr.warning('You have not selected employee to IT Lock !.');
      return;
    }

    const payload = { ...this.lockITForm.value };
    Object.keys(payload).forEach(key => payload[key] = payload[key] ?? '');

    this.httpservice.Un_LockIT(payload).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toastr.success('IT Un-processed successfully');
          this.getLockITData();
        } else {
          this.toastr.error(res.message || 'Failed to delete IT process');
        }
      },
      error: err => this.toastr.error(err.message || 'Server error')
    });
  }
  getLockITData(): void {
    this.loader.start();

    const formData = { ...this.lockITForm.value };
    Object.keys(formData).forEach(key => formData[key] = formData[key] ?? '');

    const payload = {
      pageIndex1: this.pageIndex1 - 1,
      pageSize1: this.pageSize1,
      pageIndex2: this.pageIndex2 - 1,
      pageSize2: this.pageSize2,
      pageIndex3: this.pageIndex3 - 1,
      pageSize3: this.pageSize3,
      ...formData
    };

    this.httpservice.getLockIT(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.processData = res.data;
          this.filteredLockedList = [];
          this.filteredProcessList = [];
          this.filteredUnprocessedList = [];

          this.searchTextProcessed = '';
          this.searchTextUnprocessed = '';
          this.searchTextUnprocessed = '';
          this.UnprocessedCount = res.data.itNotLockCount;
          this.processedCount = res.data.itLockCount;
          this.lockedCount = res.data.itLocked_NotProcessedCount;
          this.filterData('processed');
          this.filterData('Locked');
          this.filterData('unprocessed');
        } else {
          this.toastr.info(res.message || 'No data found');
          this.clearData();
        }
      },
      error: err => {
        this.loader.stop();
        this.toastr.error(err.message || 'Failed to load Lock IT Data');
      }
    });
  }

  clearData(): void {
    this.filteredLockedList = [];
    this.filteredProcessList = [];
    this.filteredUnprocessedList = [];
    this.processData = {};
    this.lockedCount = 0;
    this.processedCount = 0;
    this.UnprocessedCount = 0;
  }

  filterData(type: 'unprocessed' | 'processed' | 'Locked'): void {
    let list: any[] = [];
    let searchText = '';
    switch (type) {
      case 'unprocessed':
        list = this.processData.itNotLockList || [];
        searchText = this.searchTextUnprocessed;
        this.filteredUnprocessedList = this.applySearch(list, searchText);
        break;
      case 'processed':
        list = this.processData.itLockList || [];
        searchText = this.searchTextProcessed;
        this.filteredProcessList = this.applySearch(list, searchText);
        break;
      case 'Locked':
        list = this.processData.itLocked_NotProcessedList || [];
        searchText = this.searchTextLocked;
        this.filteredLockedList = this.applySearch(list, searchText);
        break;
    }
  }

  applySearch(list: any[], searchText: string): any[] {
    if (!searchText) return list;
    const search = searchText.toLowerCase();
    return list.filter(item =>
      (item.empName?.toLowerCase().includes(search) || '') ||
      (item.empCode?.toLowerCase().includes(search) || '') ||
      (item.department?.toLowerCase().includes(search) || '') ||
      (item.status?.toLowerCase().includes(search) || '')
    );
  }


  UnprocessedPageChange(page: number): void {
    this.pageIndex1 = page;
    this.getLockITData();
  }

  ProcessedPageChange(page: number): void {
    this.pageIndex2 = page;
    this.getLockITData();
  }

  LockedPageChange(page: number): void {
    this.pageIndex3 = page;
    this.getLockITData();
  }
}
