import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { RecruitModeService } from '../RecruitServices/recruit-mode.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
@Component({
  selector: 'app-recruitment-mode-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './recruitment-mode-master-list.component.html',
  styleUrl: './recruitment-mode-master-list.component.scss'
})
export class RecruitmentModeMasterListComponent {
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  searchText: string = '';
  list: any[] = [];
  sedit: boolean = false;





  constructor(private service: RecruitModeService, private fb: FormBuilder, public router: Router, private toastrService: ToastrService, private cdRef: ChangeDetectorRef, public encryption: EncryptionService) { }
  ngOnInit(): void {
    this.getlist();
  }
  //for paginatiion
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getlist();
  }

  getlist(): void {
    this.service.get_recruitmentMaster(this.pageIndex - 1, this.pageSize).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.list = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }

  //for filter the data 
  //for filter the data 
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(res =>
      res.type?.toLowerCase().includes(searchTextLower) ||
      res.name?.toLowerCase().includes(searchTextLower)

    );
  }
  //for delete 
  delete(pk_recmodeid: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.service.delete_recruitmentMaster(pk_recmodeid).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');
            //alert('Record deleted successfully');
            this.getlist(); // Refresh the list
          }
          else {
            this.toastrService.error(response.message, 'Error');
          }
        },
        (errorMessage) => {
          console.error('Error deleting record', errorMessage);
          this.toastrService.error(errorMessage, 'Error');

        }
      );
    }
  }

  //for update 
  isUpdate(pk_recmodeid: string) {
    this.router.navigate(["/dash/recruitment/recruitmentdashboard/recruitmentMode-master", pk_recmodeid]);

  }
  //download excel
  exportToExcel(): void {
    this.service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_recmodeid', 'timestamp', 'fk_companyId', 'fk_locid'];
        const columnMappings: Record<string, string> = {
          type: 'Type',
          name: 'Name',
          isActive: 'Active',
          description: 'Description',




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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // **Direct Download (Without FileSaver)**
        const fileName = 'Recruitment list.xlsx';
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
