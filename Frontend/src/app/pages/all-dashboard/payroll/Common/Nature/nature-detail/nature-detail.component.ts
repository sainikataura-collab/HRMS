import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NatureMasterServiceService } from '../../../services/nature-master-service.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-nature-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,NgxPaginationModule,CommonModule],
  templateUrl: './nature-detail.component.html',
  styleUrl: './nature-detail.component.scss'
})
export class NatureDetailComponent {
 
   ngxUILoaderService = inject(NgxUiLoaderService);
   searchText: string = '';
   natureMasterList: any[] = [];
   page: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   constructor(private NatureMasterService:NatureMasterServiceService, private fb: FormBuilder, public router: Router,private toastrService: ToastrService,public encryptionService:EncryptionService) { }
   ngOnInit(): void {
     this. get_NatureMaster();
 
   }
 
   get_NatureMaster(): void {
    
    this.NatureMasterService.get_NatureMaster(this.page-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.natureMasterList = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
  }
  

  onPageChange(event: number): void {
    this.page = event; 
    this.get_NatureMaster();// Sirf page update karein, API call mat karein
  }
 

  filteredData() {
    if (!this.searchText) {
      return this.natureMasterList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    
    const filteredList = this.natureMasterList.filter(item =>
      item.nature?.toLowerCase().includes(searchTextLower)
    );

    this.totalItems = filteredList.length; // Update total items after filtering

    const startIndex = (this.page - 1) * this.pageSize;
    return filteredList.slice(startIndex, startIndex + this.pageSize);
  }

   
   isUpdate(pk_natureid: string) {
     // console.log(addressId);
     this.router.navigateByUrl("/dash/user/userdashboard/natureMaster/" + pk_natureid);
   }

  deleteNature(pk_natureid: string): void {
    if (confirm('Are you sure you want to delete this nature record?')) {
      this.NatureMasterService.delete_NatureMaster(pk_natureid).subscribe({
        next: (response) => {
          console.log("API Response:", response);
  
          const success = response?.modelResponse?.isSuccess || response?.isSuccess;
  
          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            
            this.get_NatureMaster();  // 👈 Corrected
          } else {
            this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
          }
        },
        error: (error) => {
          console.error('Error deleting bank record:', error);
          this.toastrService.error('Failed to delete account.');
        }
      });
    }
  }
  
  downloadExcel(): void {

    const tableElement = document.getElementById('exportTable');
  
    if (!tableElement) {
      console.error('Table element not found!');
      return;
    }
  
    try {
      // Convert the HTML table to a worksheet
      const worksheet = (window as any).XLSX.utils.table_to_sheet(tableElement);
  
      // Create a new workbook and append the worksheet
      const workbook = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
      // Write the workbook to an Excel file buffer
      const excelBuffer: any = (window as any).XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
  
      // Create a blob from the buffer
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
      // Save the Excel file with a custom name
      (window as any).saveAs(blob, 'ExportedData.xlsx');
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  }
}
