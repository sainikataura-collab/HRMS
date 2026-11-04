import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

import * as XLSX from 'xlsx';
import { ShiftMasterService } from '../../../payroll/services/shift-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-shift-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './shift-master-list.component.html',
  styleUrl: './shift-master-list.component.scss'
})
export class ShiftMasterListComponent {
  shiftlist: any[] = [];
  searchText: string = '';
  Isedit: boolean = false;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private shiftmasterService: ShiftMasterService,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.getShiftDetails();
  }

  getShiftDetails(): void {
    this.shiftmasterService.getAll_Shift(this.pageIndex - 1, this.pageSize).subscribe((res: any) => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.shiftlist = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }

  formatTime(val: any): string {
    if (!val) return '';
    return val.toString().replace(/\s*(AM|PM|am|pm)/gi, '').trim();
  }

  filteredData() {
    if (!this.searchText) {
      return this.shiftlist;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.shiftlist.filter((shift: any) =>
      shift.shiftName?.toLowerCase().includes(searchTextLower) ||
      shift.startTime?.toLowerCase().includes(searchTextLower) ||
      shift.endTime?.toLowerCase().includes(searchTextLower) ||
      shift.graceTime?.toLowerCase().includes(searchTextLower) ||
      shift.duration?.toLowerCase().includes(searchTextLower) ||
      shift.compenstationTime?.toLowerCase().includes(searchTextLower) ||
      shift.fk_shifttype?.toString().toLowerCase().includes(searchTextLower)
    );
  }



  deleteZone(pk_shiftId: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.shiftmasterService.delete_Shift(pk_shiftId).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');
            //alert('Record deleted successfully');
            this.getShiftDetails(); // Refresh the list
          }
          else {
            this.toastrService.error(response.message, 'Error');
          }
        },
        (errorMessage: any) => {
          console.error('Error deleting record', errorMessage);
          this.toastrService.error(errorMessage, 'Error');
        }
      );
    }
  }


  isUpdate(pk_shiftId: number) {
    // Encrypt the ID before navigating
    const encryptedId = this.encryptionService.encryptText(pk_shiftId.toString());
    this.router.navigate(["/dash/adminAttendance/adminAttendancedashboard/shiftmaster", encryptedId]);
  }

  exportToExcel(): void {
    this.shiftmasterService.DownloadExcel().subscribe((res: any) => {
      if (res.isSuccess && res.data.length > 0) {
        //for exclude the column
        const excludedColumns = ['fk_LocID', 'isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_locId', 'fk_InsuserId', 'fk_updUserId', 'isCActive', 'fk_stateid', 'pk_stateid'];
        //rename the column
        const columnMappings: Record<string, string> = {
          shiftName: 'shiftName',
          startHrs: 'startHrs',
          endHrs: 'endHrs',
          graceTime: 'graceTime',

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
        const fileName = 'ShiftMasterList.xlsx';
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
