import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';

import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { DemographicService } from '../../../payroll/services/demographic.service';


@Component({
  selector: 'app-demographi-details-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './demographi-details-list.component.html',
  styleUrl: './demographi-details-list.component.scss'
})
export class DemographiDetailsListComponent {
  employeeList: any[] = [];
  searchText: string = '';
  searchTerm: string = '';
  //isEditMode: boolean = false;

  constructor(
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService: EncryptionService,
    private demographicService : DemographicService,
    private route: ActivatedRoute,
    private fb: FormsModule,
    
  ) {}

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllDemographicList();
    this.loaderService.stop();
  }

  getAllDemographicList(): void {
    this.demographicService.getAllDemographicList(this.pageIndex - 1, this.pageSize, {}, this.searchTerm).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.employeeList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to retrieve employee data');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching employee data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllDemographicList();
  }

  editDemographicDetail(fk_empid: string) {
    console.log("Navigating with Employee ID:", fk_empid);
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails/${fk_empid}`], {
      queryParams: { from: 'demographic_list' }
    });
  }


// const encryptedId = this.encryptionService.encryptText(fk_empid); // Encrypt if necessary
// this.router.navigate(['/dash/payroll/payrolldashboard/DemographicDetails', encryptedId]);



  filteredData() {
    if (!this.searchText) {
      return this.employeeList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.employeeList.filter(employee =>
      employee.empcode?.toLowerCase().includes(searchTextLower) ||
      employee.empname?.toLowerCase().includes(searchTextLower) ||
      employee.depart?.toLowerCase().includes(searchTextLower) ||
      employee.desig?.toLowerCase().includes(searchTextLower)
    );
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.pageIndex = 1;
      this.getAllDemographicList();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getAllDemographicList();
    }
  }

  exportToExcel(): void {
    this.demographicService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        // Exclude unnecessary columns
        const excludedColumns = ['cid','pk_empid','manualempcode']; // Add more if needed
        // Rename columns if necessary
        const columnMappings: Record<string, string> = {
          empcode: 'empcode',
          empname: 'empname',
          depart: 'department',
          desig: 'designation'
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Demographic Data');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Direct Download
        const fileName = 'EmployeeDemographicList.xlsx';
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
