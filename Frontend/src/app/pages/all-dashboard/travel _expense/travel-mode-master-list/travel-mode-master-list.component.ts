import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';

import { ToastrService } from 'ngx-toastr';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { TravelExpenceServicesService } from '../TravelService/travel-expence-services.service';


@Component({
  selector: 'app-travel-mode-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './travel-mode-master-list.component.html',
  styleUrl: './travel-mode-master-list.component.scss'
})
export class TravelModeMasterListComponent {




  ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  travelModeMasterList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  dwnbutton = false; // Initially enabled



  constructor(private travelExpenceServicesService: TravelExpenceServicesService, private fb: FormBuilder, public router: Router, private toastrService: ToastrService, public encryptionService: EncryptionService) { }
  ngOnInit(): void {
    this.get_travelModeMaster();

  }



  // Get list code here

  get_travelModeMaster(): void {
    this.travelExpenceServicesService.get_travelModeMaster().subscribe(res => {
      if (res.isSuccess) {
        this.travelModeMasterList = res.data;
      } else {
        console.error('Failed to retrieve data:', res.message);
      }
    });
  }

  // Pagination Section

  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.get_travelModeMaster(); // Fetch data for the selected page
  }



  filteredData() {
    if (!this.searchText) {
      return this.travelModeMasterList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.travelModeMasterList.filter(travelModeMasterList =>
      (travelModeMasterList.isActive?.toLowerCase().includes(searchTextLower)) ||
      (travelModeMasterList.remarks?.toLowerCase().includes(searchTextLower)) ||
      (travelModeMasterList.description?.toLowerCase().includes(searchTextLower)),
    );
  }

  // update Travel Mode Master master
  isUpdate(pk_travelmodeID: string) {
     
    this.router.navigateByUrl("/dash/travel_expense/travel_expensedashboard/travel_mode_master/" + pk_travelmodeID);

  }


  // Delete code section here

  deleteFunctional(pk_travelmodeID: string): void {
    if (confirm('Are you sure you want to delete this ?')) {

      this.travelExpenceServicesService.delete_travelModeMaster(pk_travelmodeID).subscribe({
        next: (response) => {
          console.log("API Response:", response); // Log full response

          const success = response?.modelResponse?.isSuccess ?? response?.isSuccess; // Ensure it checks both cases
          const message = response?.modelResponse?.message || response?.message || "Delete failed!";

          if (success) {
            this.toastrService.success(message || "Successfully deleted");
            this.get_travelModeMaster();  // Refresh table
          } else {
            this.toastrService.error(message); // Show API message
          }
        },
        error: (error) => {
          this.toastrService.error('Failed to delete account.');
        }
      });
    }
  }





  exportToExcel(): void {
    this.dwnbutton = true; // Disable button on click

    this.travelExpenceServicesService.DownloadExcel().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data.length > 0) {
          const excludedColumns = ['pk_travelmodeID'];

          const columnMappings: Record<string, string> = {
            description: 'Travel Mode Name',
            remarks: 'Remark',
            isActive: 'isActive',
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
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorys');

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          const fileName = 'TravelModeMasterList.xlsx';
          const link = document.createElement('a');
          link.href = URL.createObjectURL(data);
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.toastrService.warning('No data available to export');
        }
      },
      error: (err) => {
        console.error('Download failed', err);
        this.toastrService.error('Error occurred during download');
      },
      complete: () => {
        this.dwnbutton = false; // Re-enable button after complete
      }
    });
  }




}
