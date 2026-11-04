import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleMastersService } from '../../payroll/services/role-masters.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../shared/services/encryption.service';

import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination'; // ✅ import this
import { TravelClassMasterService } from '../TravelService/travel-class-master.service';


@Component({
  selector: 'app-travel-class-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './travel-class-master-list.component.html',
  styleUrl: './travel-class-master-list.component.scss'
})
export class TravelClassMasterListComponent {

  searchText: string = '';
  list: any[] = [];
  Isedit: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;



  constructor(private Service: TravelClassMasterService, private toastrService: ToastrService,
    private route: ActivatedRoute, private router: Router, public encryption: EncryptionService) { }

  ngOnInit(): void {
    this.getlist();


  }


  //for paginatiion
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getlist();
  }


  getlist() {
    this.Service.travelMasterList().subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.list = res.data;
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }

  //for search  data in table
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(res =>
      res.classname?.toLowerCase().includes(searchTextLower) ||
      res.remarks?.toLowerCase().includes(searchTextLower) ||
      res.isActive?.toLowerCase().includes(searchTextLower)
    );
  }



// for delete 
  delete(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.Service.travelMasterDelete(id).subscribe({
        next: (res) => {
          this.toastrService.success('Deleted successfully');
          this.getlist(); // Refresh the list
        },
        error: (err) => {
          this.toastrService.error('Delete failed');
          console.error(err);
        }
      });
    }
  }


  //for update 
  isUpdate(pk_classTvlId: number) {
    const encryptedId = this.encryption.encryptText(pk_classTvlId.toString());
    this.router.navigate(["/dash/travel_expense/travel_expensedashboard/travelClassMaster", encryptedId]);

  }

  exportToExcel(): void {
    this.Service.travelMasterDownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_classTvlId'];

        const columnMappings: Record<string, string> = {
          classname: 'Class Name',
          remarks: 'Remarks',
          isActive: 'Active Status'
        };

        // Step 1: Filter and remap data
        const filteredData = res.data.map((row: any) => {
          const newRow: any = {};
          Object.keys(columnMappings).forEach((key) => {
            if (!excludedColumns.includes(key)) {
              newRow[columnMappings[key]] = row[key];
            }
          });
          return newRow;
        });

        // Step 2: Create worksheet and workbook
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TravelClass');

        // Step 3: Save to file
        XLSX.writeFile(workbook, 'TravelClassData.xlsx');
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }

}

