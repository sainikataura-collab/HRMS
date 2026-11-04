import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RoleMasterService } from '../../services/role-master.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './role-master-list.component.html',
  styleUrl: './role-master-list.component.scss'
})
export class RoleMasterListComponent {


  searchText: string = '';
  list: any[] = [];
  Isedit = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  ngxUILoaderService = inject(NgxUiLoaderService);


  constructor(private Service: RoleMasterService, private toastrService: ToastrService, private route: ActivatedRoute, private router: Router, public encryption: EncryptionService) { }
  ngOnInit(): void {
    this.getList();


    // Fetch all data on load

  }

  onPageChange(event: number) {
    this.pageIndex = event;
    this.getList();

  }
  //for filter the data 
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(res =>
      //    res.data.rolename.toLowerCase().includes(searchTextLower)||
      //    res.data.rolelevel.toLowerCase().includes(searchTextLower)


      //  );
      (res.rolename && res.rolename.toLowerCase().includes(searchTextLower)) ||
      (res.rolelevel !== null && res.rolelevel.toString().toLowerCase().includes(searchTextLower))
    );
  }
  getList() {
    this.ngxUILoaderService.start();
    this.Service.get_RoleMaster(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) { // Ensure `res` is not undefined or null
          console.log('Data retrieved successfully:', res.data);
          this.list = res.data;
          this.totalItems = res.totalCount;
        } else {
          console.error('Failed to retrieve data:', res.message);
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      }
    });
  }

  //download excel
  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = [
          // From saL_Company_Config
          'remarks',
          'pk_roleId',


        ];
        const columnMappings: Record<string, string> = {
          CID: 'Sr. no.',
          rolename: 'Role',
          mappedalias: 'Alias',
          rolelevel: 'Level',

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
        const fileName = 'Role list.xlsx';
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

  // Navigate to Edit Page
  edit(pk_roleId: string) {
    this.router.navigate(["/dash/user/userdashboard/roleMaster", pk_roleId]);
  }

  delete(pk_roleId: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.Service.delete_RoleMaster(pk_roleId).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');

            // Remove deleted item from list
            this.list = this.list.filter(item => item.pk_roleId !== pk_roleId);

            // Decrease total count
            this.totalItems--;

            // ✅ If no items are left on the current page, refresh the list
            if (this.list.length === 0) {
              this.getList();
            }

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

}
