import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { LocationMasterService } from '../../services/location-master.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-location-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './location-master-list.component.html',
  styleUrl: './location-master-list.component.scss'
})
export class LocationMasterListComponent {

  searchText: string = '';
  searchTerm: string = '';
  list: any[] = [];
  Isedit = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  ngxUILoaderService = inject(NgxUiLoaderService);

  // fk_empid: string | null = null;
  // EmployeeList: { name: string; value: string }[] = [];

  constructor(private Service: LocationMasterService, private toastrService: ToastrService, private route: ActivatedRoute, private router: Router, public encryption: EncryptionService) { }
  ngOnInit(): void {
    //   this.getEmployeeList('Employee'); // Load employee list
    //  this.fk_empid = null;  // Ensure fk_empid is initially null
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
    const local = this.list.filter(res =>
      res.locname?.toLowerCase().includes(searchTextLower) ||
      res.loginallowAlias?.toLowerCase().includes(searchTextLower) ||
      res.cityname?.toLowerCase().includes(searchTextLower) ||
      res.office?.toLowerCase().includes(searchTextLower) ||
      res.location?.toLowerCase().includes(searchTextLower) ||
      res.locationAlias?.toLowerCase().includes(searchTextLower)
    );
    return local;
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.pageIndex = 1;
      this.getList();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getList();
    }
  }
  //  getEmployeeList(fieldName: string) {
  //   this.ngxUILoaderService.start();
  //    this.Service.getEmployee(fieldName).subscribe({
  //      next: (res) => {
  //        if (res?.isSuccess && res.data?.length) {
  //          console.log(res.data);
  //          this.EmployeeList = res.data.map((emp: any) => ({
  //            name: emp.name,
  //            value: emp.value
  //          }));
  //        } else {
  //          this.toastrService.error('Failed to load employee list.');
  //        }
  //        this.ngxUILoaderService.stop();
  //      },
  //      error: (err) => {
  //        console.error('Error fetching employee list:', err);
  //        this.toastrService.error('Error fetching employee list. Please try again.');
  //        this.ngxUILoaderService.stop();
  //      }
  //    });
  //  }

  // Handle Employee ID Change
  //  onEmpidChange(fk_empid: string | null): void {
  //    this.fk_empid = fk_empid;
  //    console.log('Employee selected:', this.fk_empid ?? 'All Employees');
  //    this.list = [];
  //    this.getList();
  //  }  

  // Fetch Perquisite Details
  getList() {
    this.ngxUILoaderService.start();
    //      // If fk_empid is null or empty, do not filter by employee
    //    const employeeId = this.fk_empid ?? null; // Send null if no employee is selected
    this.Service.get_location(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe({
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
          'pk_locid',
          'address',
          'fk_officeid',
          'fk_locid',
          'fk_cityid',
          'email',
          'phone',
          'fax',
          'remarks',
          'dailyAttAllow',
          'dailyAttAllowEmp',
          'bonusbasedon',
          'fk_ContactempId',
          'fk_insUserID',
          'fk_updUserID',
          'fk_insDateID',
          'fk_updDateID',
          'fk_UserId',
          'timestamp',
          'fk_companyId',
          'location',
          'attendanceSource',
          'isActive',
          'erpCode',
          'latitude',
          'longitude',
          'locationType',
          'fk_areaId',
          'fk_zoneId',
          'machineID',
          'distance',
          'createdAt',
          'loginallow',

        ];
        const columnMappings: Record<string, string> = {
          cid: 'Sr. no.',
          locname: 'location',
          code: 'Location Code',
          office: 'Office',
          cityname: 'City',
          locationAlias: 'Location Alias',
          loginallowAlias: 'IS loginAllow'
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
        const fileName = 'Location list.xlsx';
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
  edit(pk_locid: string) {
    this.router.navigate(["/dash/user/userdashboard/locationMaster", pk_locid]);
  }

  delete(pk_locid: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.Service.delete_location(pk_locid).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');

            // Remove deleted item from list
            this.list = this.list.filter(item => item.pk_locid !== pk_locid);

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
