import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';
import { EventService } from '../../HRservices/event.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-event-master-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxPaginationModule, FormsModule],

  templateUrl: './event-master-list.component.html',
  styleUrl: './event-master-list.component.scss'
})
export class EventMasterListComponent {

  searchText: string = '';
  EventData: any[] = [];

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  Isedit: boolean = false;

  constructor(private Service: EventService, private toastrService: ToastrService, private route: ActivatedRoute, private router: Router, public encryptionService: EncryptionService) { }

  ngOnInit(): void {

    this.getall();

  }


  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getall();
  }



  getall(): void {

    this.Service.getEvent(this.pageIndex - 1, this.pageSize).subscribe(res => {
      if (res.isSuccess) {
        this.EventData = res.data;
        this.totalItems = res.totalCount;
      } else {
        console.error('Failed to retrieve data:', res.message);
        // alert(res.message);
      }
    });
  }


  filteredData() {
    if (!this.searchText) {
      return this.EventData;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.EventData.filter(event =>
      event.eventName?.toLowerCase().includes(searchTextLower)
    );
  }

  delete(eventId: Number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.Service.deleteEvent(eventId).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message);
            this.getall();
          } else {
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



  isUpdate(pk_eventId: number) {
    // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(pk_eventId.toString());
    this.router.navigate(["/dash/hr/hrdashboard/event", encryptedId]);

  }


  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
      const excludedColumns = ['fk_LocID', 'fk_UserID', 'Active', 'fk_locId', 'locationName', 'pk_eventId', 'Venue', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_CompanyId', 'remarks'];




        const columnMappings: Record<string, string> = {

          eventName: 'Event',
          eventDate: 'Date',
          isActiveAlias: 'Active'


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

        // *Direct Download (Without FileSaver)*
        const fileName = 'EventMasterList.xlsx';
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
