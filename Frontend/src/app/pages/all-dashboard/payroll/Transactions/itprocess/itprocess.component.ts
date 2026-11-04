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
  selector: 'app-itprocess',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './itprocess.component.html',
  styleUrl: './itprocess.component.scss'
})
export class ITProcessComponent {
  ITProcessForm!: FormGroup;
  submitted = false;
  showError = false;
  selectedempcodeUnProcessed:string[] = [];
  selectedempcodeProcessed:string[] = [];
  pageIndex1: number = 1;
  pageSize1: number = 10;
  
  // For table 2
  pageIndex2: number = 1;
  pageSize2: number = 10;
  
  // For table 3
  pageIndex3: number = 1;
  pageSize3: number = 10;

  natureOptions: any[] = [];
  
  
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
    private Loader:NgxUiLoaderService,
    private loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private httpservice :MonthlyRentDetailService,
  ) {}

  ngOnInit(): void {

    this.filteredUnprocessedList = this.processData.unProcessedList || [];
    this.filteredProcessList = this.processData.processedList || [];
    this.filteredLockedList = this.processData.lockedList || [];
    this.ITProcessForm = this.fb.group({
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
      Fk_CompanyId: [''],
      DocStatus: [null],
    });

 this.Loader.start();
       forkJoin([
       this.httpservice.getCommanList('Month'),
       this.httpservice.getCommanList('Year')
     ]).subscribe({
       next: ([monthsRes, yearsRes]) => {
         this.months = monthsRes.data;
         this.years = yearsRes.data;
         this.Loader.stop(); 
       },
       error: () => {
         this.toastr.error("Failed to load data");
         this.Loader.stop();
       }
     });
  }

  handleFilters(filters: any) {
    this.ITProcessForm.patchValue(filters);
  }


  EmpUnProcessed(empCode: string, event: any) {

    if (event.target.checked) {
      if (!this.selectedempcodeUnProcessed.includes(empCode)) {
        this.selectedempcodeUnProcessed.push(empCode);
      }
    } else {
      this.selectedempcodeUnProcessed = this.selectedempcodeUnProcessed.filter(code => code !== empCode);
      console.log('thisemcpdode',this.selectedempcodeUnProcessed )
    }
  }

  EmpProcessed(empCode: string, event: any) {
    debugger
    if (event.target.checked) {
      if (!this.selectedempcodeProcessed.includes(empCode)) {
        this.selectedempcodeProcessed.push(empCode);
      }
    } else {
      this.selectedempcodeProcessed = this.selectedempcodeProcessed.filter(code => code !== empCode);
    }
  }
  


  onSubmit(): void {
    this.submitted = true;
    this.showError = true;

    if (this.ITProcessForm.invalid) return;

    const sortBy = this.ITProcessForm.get('sortBy')?.value;
    const departments = this.ITProcessForm.get('selectedDepartments')?.value;
    const locations = this.ITProcessForm.get('selectedLocations')?.value;

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

    this.selectedempcodeProcessed=[];
    this.selectedempcodeUnProcessed=[];
    this.getITProcessData();
  }

  getITProcessData(): void {

    this.loader.start();
  
    const formData = { ...this.ITProcessForm.value };
    Object.keys(formData).forEach(key => formData[key] = formData[key] ?? '');

    const payload = {
      pageIndex1: this.pageIndex1 - 1,
      pageSize1: this.pageSize1,
      pageIndex2: this.pageIndex2 - 1,
      pageSize2: this.pageSize2,
      pageIndex3: this.pageIndex3 - 1,
      pageSize3: this.pageSize3,
      ...formData // spread form values into the request body
    };

    this.httpservice.getITProcess(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.processData = res.data;
          this.filteredLockedList=[];
          this.filteredProcessList=[];
          this.filteredUnprocessedList=[];
          this.searchTextProcessed = '';
          this.searchTextUnprocessed = '';
          this.searchTextUnprocessed = '';
          this.UnprocessedCount = res.data.unProcessedCount;
          this.processedCount = res.data.processedCount;
          this.lockedCount = res.data.lockedCount;
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
        this.toastr.error(err.message || 'Failed to load IT Process Data');
      }
    });
  }

  clearData(): void {
    this.filteredLockedList = [];
    this.filteredProcessList = [];
    this.filteredUnprocessedList = [];
    this.processData={}
    this.lockedCount=0;
    this.processedCount=0;
    this.UnprocessedCount=0;
  }

  postProcessData(): void {
    debugger

    if (!this.filteredUnprocessedList || this.filteredUnprocessedList.length === 0) {
      this.toastr.warning('You have not selected employee to process IT!.');
      return;
    }
    
      const selectedempcode=this.selectedempcodeProcessed.join(',');
    const payload = { ...this.ITProcessForm.value,empcode:selectedempcode};

    Object.keys(payload).forEach(key => payload[key] = payload[key] ?? '');

    this.httpservice.PostITProcess(payload).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toastr.success('IT Processed successfully!');
          this. onSubmit();
        } else {
          this.toastr.error(res.message || 'Failed to submit IT process');
        }
      },
      error: err => this.toastr.error(err.message || 'Server error')
    });
  }

  deleteProcessData(): void {

    if (!this.filteredProcessList || this.filteredProcessList.length === 0) {
      this.toastr.warning('You have not selected employee to un-process IT!.');
      return;
    }
    const selectedempcode=this.selectedempcodeUnProcessed.join(',');
    const payload = { ...this.ITProcessForm.value,empcode:selectedempcode};
    Object.keys(payload).forEach(key => payload[key] = payload[key] ?? '');

    this.httpservice.DeleteITProcess(payload).subscribe({
      next: res => {
        if (res.isSuccess) {
          this.toastr.success('IT Un-processed successfully');
          this.onSubmit();
        } else {
          this.toastr.error(res.message || 'Failed to delete IT process');
        }
      },
      error: err => this.toastr.error(err.message || 'Server error')
    });
  }


   UnprocessedPageChange(page: number): void {
    this.pageIndex1 = page;
    this.getITProcessData();
  }
  ProcessedPageChange(page: number): void {
    this.pageIndex2 = page;
    this.getITProcessData();
  }
  LockedPageChange(page: number): void {
    this.pageIndex3 = page;
    this.getITProcessData();
  }

  filterData(type: 'unprocessed'| 'processed' |  'Locked'): void {
    let list: any[] = [];
    let searchText = '';
    switch (type) {
      case 'unprocessed':
        list = this.processData.unProcessedList || [];
        searchText = this.searchTextUnprocessed;
        this.filteredUnprocessedList = this.applySearch(list, searchText);
        break;
        case 'processed':
        list = this.processData.processedList || [];
        searchText = this.searchTextProcessed;
        this.filteredProcessList = this.applySearch(list, searchText);
        break;
      case 'Locked':
        list = this.processData.lockedList || [];
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
}
