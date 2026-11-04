import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { TrainingRatingService } from '../services/training-rating.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';


@Component({
  selector: 'app-training-rating-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxPaginationModule,
  ],
  templateUrl: './training-rating-list.component.html',
  styleUrl: './training-rating-list.component.scss',
})
export class TrainingRatingListComponent {
  searchText: string = '';
  list: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private service: TrainingRatingService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public encryption: EncryptionService
  ) {}

  ngOnInit(): void {
    this.getList();
  }

  // pagination change
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getList();
  }

  // fetch list
  getList(): void {
    this.service
      .getAll_Training(this.pageIndex - 1, this.pageSize)
      .subscribe((res) => {
        if (res.isSuccess) {
          this.list = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.toastrService.warning(res.message);
        }
      });
  }

  // filter list
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter((item) =>
      item.description?.toLowerCase().includes(searchTextLower) ||
      item.remarks?.toLowerCase().includes(searchTextLower) 
    );
  }

  // delete training
  delete(pk_ratingId: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.service.delete_Training(pk_ratingId).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Deleted successfully');
            this.getList();
          } else {
            this.toastrService.error(response.message, 'Error');
          }
        },
        (error) => {
          console.error('Delete failed', error);
          this.toastrService.error(error, 'Error');
        }
      );
    }
  }
  

  // navigate to update
  edit(pk_ratingId: number) {
    const encryptedId = this.encryption.encryptText(pk_ratingId.toString());
    this.router.navigate(['/dash/training/trainingdashboard/TrainingRating', encryptedId]);
  }

  // export to excel
  exportToExcel(): void {
    this.service.downloadExcel().subscribe((res) => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_ratingId', 'Timestamp'];
        const columnMappings: Record<string, string> = {
          description: 'Description',
          active: 'Active',
          remarks: 'Remarks',
        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter((key) => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Training Ratings');

        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        const data: Blob = new Blob([excelBuffer], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const fileName = 'Training_Rating_List.xlsx';
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
