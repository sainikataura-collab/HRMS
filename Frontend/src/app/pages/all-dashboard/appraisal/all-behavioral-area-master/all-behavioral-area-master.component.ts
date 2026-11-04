import { data } from 'jquery';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { BehavioralsService } from '../../recruitment/RecruitServices/behaviorals.service';

@Component({
  selector: 'app-all-behavioral-area-master',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './all-behavioral-area-master.component.html',
  styleUrl: './all-behavioral-area-master.component.scss'
})
export class AllBehavioralAreaMasterComponent {
  searchText: string = '';
  behavioralarealist: any[] = []


  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(private httpBehavioralsService: BehavioralsService, private fb: FormBuilder, public router: Router, private toastrService: ToastrService, public encryptionService: EncryptionService) {
  }

  ngOnInit() {
    this.get_behavioralAMaster();
  }


  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.get_behavioralAMaster(); // Fetch data for the selected page
  }


  filteredData() {
    if (!this.searchText) {
      return this.behavioralarealist;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.behavioralarealist.filter(item =>
      (item.description && item.description.toLowerCase().includes(searchTextLower)) ||
      (item.weightage && item.weightage.toLowerCase().includes(searchTextLower)) ||
      (item.orderby && item.orderby.toLowerCase().includes(searchTextLower))
    );
  }


  isUpdate(pk_behaveid: string) {
    // console.log(addressId);
    this.router.navigate(["/dash/appraisal/appraisaldashboard/behavioral-area-master", pk_behaveid]);

  }


  get_behavioralAMaster(): void {
    this.httpBehavioralsService.get_behavioralMaster(this.pageIndex - 1, this.pageSize).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.behavioralarealist = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }





  deleteBehavioralAreaMaster(pk_behaveid: string): void {
    if (confirm('Are you sure you want to delete this functional record?')) {
      console.log("Deleting Functional Record with ID:", pk_behaveid); // Debugging log

      this.httpBehavioralsService.delete_behavioralMaster(pk_behaveid).subscribe({
        next: (response) => {
          console.log("API Response:", response); // Log full response

          const success = response?.modelResponse?.isSuccess ?? response?.isSuccess; // Ensure it checks both cases
          const message = response?.modelResponse?.message || response?.message || "Delete failed!";

          if (success) {
            this.toastrService.success(message || "Successfully deleted");
            this.get_behavioralAMaster();  // Refresh table
          } else {
            this.toastrService.error(message); // Show API message
          }
        },
        error: (error) => {
          console.error('Error deleting functional record:', error);
          this.toastrService.error('Failed to delete account.');
        }
      });
    }
  }




  exportToExcel(): void {
    this.httpBehavioralsService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        // Only include relevant fields, excluding Sr.No.
        const formattedData = res.data.map((item: any) => ({
          'Description': item.description,
          'Weightage': item.weightage,
          'Display Order': item.orderby,
          'Active': item.active
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BehavioralAreaMAsterList');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const fileName = 'BehavioralAreaMAsterList.xlsx';
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
