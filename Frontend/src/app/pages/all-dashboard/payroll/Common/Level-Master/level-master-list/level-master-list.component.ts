import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LevelMasterService } from '../../../services/level-master.service'; // Assuming this service exists
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-level-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './level-master-list.component.html',
  styleUrl: './level-master-list.component.scss'
})
export class LevelMasterListComponent {

  levelList: any[] = [];
  searchText: string = '';

constructor(
    private levelmasterService: LevelMasterService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,public encryptionService : EncryptionService
  ) {}

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllLevelDetails();
    this.loaderService.stop();
  }

  getAllLevelDetails(): void {
    this.levelmasterService.getAllLevels(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.levelList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to retrieve level data');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching level data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllLevelDetails();
  }

  deleteLevelDetail(id: string): void {
    if (confirm('Are you sure you want to delete this level record?')) {
      this.levelmasterService.deleteLevel(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Level deleted successfully');
            this.getAllLevelDetails();
          } else {
            this.toastrService.error(response.message || 'Failed to delete level');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete level record');
        }
      });
    }
  }

  editLevelDetail(id: any) {
    this.router.navigate(['/dash/user/userdashboard/level-master', id]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.levelList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.levelList.filter(level =>
      level.description?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.levelmasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        //for exclude the column
        const excludedColumns = ['pk_levelid','fk_companyId','fk_locid','timestamp','reimbHeads'];
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Level');
  
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
        // **Direct Download (Without FileSaver)**
        const fileName = 'LevelMasterList.xlsx';
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
