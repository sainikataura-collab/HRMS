import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CandidateMasterService } from '../../recruitment/RecruitServices/candidate-master.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-ob-candidate-master-list',

  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
  ],

  templateUrl: './ob-candidate-master-list.component.html',
  styleUrl: './ob-candidate-master-list.component.scss',
})
export class ObCandidateMasterListComponent {
  searchText: string = '';
  list: any[] = [];
  Isedit: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isSendingEmail: boolean = false;
  sendingEmailForId: string = '';

  constructor(
    private Service: CandidateMasterService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public encryption: EncryptionService
  ) {}

  ngOnInit(): void {
    this.getlist();
  }
  //for paginatiion
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getlist();
  }

  getlist(): void {
    this.Service.get_candidateMaster(
      this.pageIndex - 1,
      this.pageSize
    ).subscribe((res) => {
      if (res.isSuccess) {
        this.list = res.data;
        this.totalItems = res.totalCount;
        //for teh image
        this.list.forEach((item) => {
          if (item.picturename) {
            this.loadImage(item.picturename);
          }
        });
      } else {
        alert(res.message);
      }
    });
  }

  //for filter the data
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter((res) =>
      res.candidate_name?.toLowerCase().includes(searchTextLower)
    );
  }

  // for the image show

  imageMap: { [filename: string]: string } = {}; // filename -> base64 URL

  loadImage(filename: string) {
    if (this.imageMap[filename]) return; // Don't reload if already loaded

    this.Service.getImage(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageMap[filename] = reader.result as string;
        };
        reader.readAsDataURL(blob); // Convert blob to base64 image URL
      },
      error: (err) => {},
    });
  }
  //for delete
  delete(pk_recId: string) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.Service.delete_candidateMaster(pk_recId).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(
              response.message || 'Record deleted successfully'
            );
            //alert('Record deleted successfully');
            this.getlist(); // Refresh the list
          } else {
            this.toastrService.error(response.message, 'Error');
          }
        },
        (errorMessage) => {
          this.toastrService.error(errorMessage, 'Error');
        }
      );
    }
  }
  // for download the image
  download(filename: string) {
    this.Service.getImage(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Set the filename for download
        a.click();
        window.URL.revokeObjectURL(url); // Clean up
      },
      error: (err) => {},
    });
  }

  //for update
  isUpdate(pk_recId: string) {
    this.router.navigate([
      '/dash/on_boarding/on_boardingdashboard/onboardCandidateMaster',
      pk_recId,
    ]);
  }
  //download excel
  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe((res) => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = [
          'pk_recId',
          'fk_UserID',
          'fk_LocID',
          'fk_empid',
          'fk_committeId',
          'isShabash',
          'designation',
          'fk_insDateID',
          'fk_insDateID',
          'fk_updDateID',
          'timestamp',
          'fk_companyId',
          'phone',
          'filename',
          'picturename',
        ];
        const columnMappings: Record<string, string> = {
          cid: 'Sr no.',
          candidate_name: 'Name',
          mobile: 'Contact Number',
          dob: 'Dob',
          onboardFormStatus: 'Onboard Form Status',
        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter((key) => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet =
          XLSX.utils.json_to_sheet(filteredData);

        // 👇 ADD THIS BLOCK - START
        const columnWidths: any[] = [];
        const headers = Object.keys(filteredData[0] || {});

        headers.forEach((header, index) => {
          let maxLength = header.length;

          filteredData.forEach((row: any) => {
            const cellValue = row[header] ? row[header].toString() : '';
            maxLength = Math.max(maxLength, cellValue.length);
          });

          columnWidths.push({ wch: maxLength + 2 }); // +2 for padding
        });

        worksheet['!cols'] = columnWidths;

        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');

        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // **Direct Download (Without FileSaver)**
        const fileName = 'Candidate Master list.xlsx';
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

  // Send onboarding email
  sendOnboardingEmail(pk_recId: string, candidateName: string): void {
    if (confirm(`Send onboarding email to ${candidateName}?`)) {
      // Set loading state
      this.isSendingEmail = true;
      this.sendingEmailForId = pk_recId;

      this.Service.sendOnboardingEmail(pk_recId).subscribe({
        next: (response) => {
          // Clear loading state
          this.isSendingEmail = false;
          this.sendingEmailForId = '';

          if (response.isSuccess) {
            this.toastrService.success(response.message, 'Success');

            //  Refresh the list to show updated status
            this.getlist();
          } else {
            this.toastrService.error(response.message, 'Error');
          }
        },
        error: (error) => {
          //  Clear loading state on error
          this.isSendingEmail = false;
          this.sendingEmailForId = '';

          this.toastrService.error('Failed to send email', 'Error');
        },
      });
    }
  }
}
