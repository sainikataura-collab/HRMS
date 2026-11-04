import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { CategoryMasterServiceService } from '../../../services/category-master-service.service';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,NgxPaginationModule,CommonModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss'
})
export class CategoryDetailsComponent {
 ngxUILoaderService = inject(NgxUiLoaderService);
   searchText: string = '';
   categoryMasterList: any[] = [];
   pageIndex: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   
   constructor(private CategoryMasterService:CategoryMasterServiceService, private fb: FormBuilder, public router: Router,private toastrService: ToastrService,public encryptionService:EncryptionService) { }
   ngOnInit(): void {
     this. get_categoryMaster();
 
   }
 
   get_categoryMaster(): void {
    this.CategoryMasterService.get_categoryMaster(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.categoryMasterList = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
}

 
  
  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.get_categoryMaster(); // Fetch data for the selected page
  }
 
  
  filteredData() {
    if (!this.searchText) {
      return this.categoryMasterList;
    }
 
    const searchTextLower = this.searchText.toLowerCase();
    return this.categoryMasterList.filter(categoryMasterList =>
      (categoryMasterList.Category?.toLowerCase().includes(searchTextLower))  
    );
  }
 
 
   
   isUpdate(pk_Catid: string) {
     // console.log(addressId);
     this.router.navigateByUrl("/dash/user/userdashboard/categoryMaster/" +pk_Catid);
   }
 
  deleteCategory(pk_Catid: string): void {
    if (confirm('Are you sure you want to delete this Category record?')) {
      this.CategoryMasterService.delete_categoryMaster(pk_Catid).subscribe({
        next: (response) => {
          console.log("API Response:", response);
  
          const success = response?.modelResponse?.isSuccess || response?.isSuccess;
  
          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            
            this.get_categoryMaster();  // 👈 Corrected
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
  exportToExcel(): void {
    this.CategoryMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_Catid','fk_LocID', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];
  
        const columnMappings: Record<string, string> = {
          category: 'Category Name'
         
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
  
        // *Direct Download (Without FileSaver)*
        const fileName = 'CategoryMasterList.xlsx';
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
 

