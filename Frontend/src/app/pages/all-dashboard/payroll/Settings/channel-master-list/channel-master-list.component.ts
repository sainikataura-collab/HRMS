// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-channel-master-list',
//   standalone: true,
//   imports: [],
//   templateUrl: './channel-master-list.component.html',
//   styleUrl: './channel-master-list.component.scss'
// })
// export class ChannelMasterListComponent {

// }



import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ChannelMasterService } from '../../services/channel-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-channel-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './channel-master-list.component.html',
  styleUrl: './channel-master-list.component.scss'
})
export class ChannelMasterListComponent {
  
  ngxUILoaderService = inject(NgxUiLoaderService);
  searchText: string = '';
  channelMasterList: any[] = [];
  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private channelMasterService: ChannelMasterService,
    private fb: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    private cdRef: ChangeDetectorRef,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
        this.ngxUILoaderService.start();

    this.get_ChannelMaster();
            this.ngxUILoaderService.stop();

  }

  get_ChannelMaster(): void {
        this.ngxUILoaderService.start();

    this.channelMasterService.get_ChannelMaster().subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.channelMasterList = res.data;
        this.totalItems = res.totalCount || res.data.length;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        this.toastrService.error(res.message);
      }
          this.ngxUILoaderService.stop();

    });
  }

  onPageChange(event: number): void {
    this.page = event; // Update current page
  }

  filteredData() {
    if (!this.searchText) {
      return this.channelMasterList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.channelMasterList.filter(channelMasterList =>
      (channelMasterList.channelName?.toLowerCase().includes(searchTextLower)) ||
      (channelMasterList.channelCode?.toLowerCase().includes(searchTextLower)) ||
      (channelMasterList.companyName?.toLowerCase().includes(searchTextLower)) ||
      (channelMasterList.contactPerson?.toLowerCase().includes(searchTextLower)) ||
      (channelMasterList.contactNo?.toLowerCase().includes(searchTextLower)) ||
      (channelMasterList.emailId?.toLowerCase().includes(searchTextLower))||
            (channelMasterList.userId?.toLowerCase().includes(searchTextLower))||
            (channelMasterList.officeType?.toLowerCase().includes(searchTextLower))||
            (channelMasterList.location?.toLowerCase().includes(searchTextLower))||
            (channelMasterList.city?.toLowerCase().includes(searchTextLower))
    );
  }

  Isedit(pk_ChannelId: string) {
    this.router.navigate(["/dash/payroll/payrolldashboard/channelMaster", pk_ChannelId]);
  }

  deleteChannel(pk_ChannelId: string): void {
    if (confirm('Are you sure you want to delete this channel record?')) {
      this.channelMasterService.delete_ChannelMaster(pk_ChannelId).subscribe({
        next: (response) => {
          console.log("API Response:", response);

          const success = response?.modelResponse?.isSuccess || response?.isSuccess;

          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            
            // ✅ Data list ko update karein
            this.get_ChannelMaster();
          } else {
            this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
          }
        },
        error: (error) => {
          console.error('Error deleting channel record:', error);
          this.toastrService.error('Failed to delete channel.');
        }
      });
    }
  }

  exportToExcel(): void {
    this.channelMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = [
          'pk_ChannelId',
          'fk_LocID',
          'fk_UserID'
        ];

        const columnMappings: Record<string, string> = {
          channelCode: 'Channel Code',
          channelName: 'Channel Name',
          companyName: 'Company Name',
          contactPerson: 'Contact Person',
          contactNo: 'Contact Number',
          emailId: 'Email',
          address: 'Address',
          isActive: 'Status'
        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              const mappedKey = columnMappings[key] || key;
              let value = item[key];
              
              // Convert boolean isActive to text
              if (key === 'isActive') {
                value = value ? 'Active' : 'Inactive';
              }
              
              obj[mappedKey] = value;
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Channels');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // *Direct Download (Without FileSaver)*
        const fileName = 'ChannelMasterList.xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(data);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.toastrService.success('Excel file downloaded successfully');
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }
}