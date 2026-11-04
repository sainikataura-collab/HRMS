import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { StateService } from '../../../services/state.service'; // Assuming this service exists
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-state-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './state-master-list.component.html',
  styleUrl: './state-master-list.component.scss'
})
export class StateMasterListComponent {
  stateList: any[] = [];
  searchText: string = '';
  searchTerm: string = '';

  constructor(
    private stateService: StateService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService:EncryptionService
  ) {}
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllStateDetails();
    this.loaderService.stop();
  }

  getAllStateDetails(): void {
    this.stateService.getAllStates(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.stateList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to retrieve state data');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching state data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllStateDetails();
  }

  deleteStateDetail(id: string): void {
    if (confirm('Are you sure you want to delete this state record?')) {
      this.stateService.deleteState(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'State deleted successfully');
            this.getAllStateDetails();
          } else {
            this.toastrService.error(response.message || 'Failed to delete state');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete state record');
        }
      });
    }
  }

  editStateDetail(id: any) {
    this.router.navigate(['/dash/user/userdashboard/StateMaster', id]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.stateList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    const local = this.stateList.filter(state =>
      state.description?.toLowerCase().includes(searchTextLower) ||
      state.pt_number?.toLowerCase().includes(searchTextLower) ||
      state.lwf_number?.toLowerCase().includes(searchTextLower) ||
      state.lwf_applicable_status?.toLowerCase().includes(searchTextLower) ||
      state.pt_applicable_status?.toLowerCase().includes(searchTextLower) ||
      state.esi_number?.toLowerCase().includes(searchTextLower) ||
      state.pf_number?.toLowerCase().includes(searchTextLower) ||
      state.minimum_wages?.toString().toLowerCase().includes(searchTextLower)
    );
    return local;
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.pageIndex = 1;
      this.getAllStateDetails();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getAllStateDetails();
    }
  }

  exportToExcel(): void {
    this.stateService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        //for exclude the column
        const excludedColumns = ['pk_stateid','code','lwf_applicable','pt_applicable','fk_companyId'];
  //rename the column
        const columnMappings: Record<string, string> = {
         
        };
  
        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });
  
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'State');
  
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
        // **Direct Download (Without FileSaver)**
        const fileName = 'StateMasterList.xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(data);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }


}
