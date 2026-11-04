import { Component, inject } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { LanguageMasterService } from '../../HRservices/language-master.service';


@Component({
    selector: 'app-language-master-list',
     standalone: true,
    imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule],
    templateUrl: './language-master-list.component.html',
    styleUrl: './language-master-list.component.scss'
})

export class LanguageMasterListComponent {
ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  languageMasterList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;

  constructor(private languageMasterService:LanguageMasterService, private fb: FormBuilder, public router: Router,private toastrService: ToastrService,public encryptionService:EncryptionService) { }
 

  ngOnInit(): void {
    this.get_languageMaster();
  }



  // get all 
  get_languageMaster(): void {
    this.languageMasterService.get_languageMaster(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.languageMasterList = res.data;
            this.totalItems = res.totalCount;
        } else {
           alert(res.message);
        }
    });
  }


    // update functional master
  isUpdate(pk_langid: number) {
    const encryptionid=this.encryptionService.encryptText(pk_langid.toString())
    this.router.navigateByUrl("/dash/hr/hrdashboard/LanguageMaster/"+encryptionid);
    
  }




  // Delete 

deleteLanguageMaster(pk_langid:number): void {
  if (confirm('Are you sure you want to delete this Language Master record?')) {
    console.log("Deleting Language Master with ID:", pk_langid); // Debugging log

    this.languageMasterService.delete_languageMaster(pk_langid).subscribe({
      next: (response) => {
        console.log("API Response:", response); // Log full response
        const success = response?.modelResponse?.isSuccess ?? response?.isSuccess; // Ensure it checks both cases
        const message = response?.modelResponse?.message || response?.message || "Delete failed!";

        if (success) {
          this.toastrService.success(message || "Successfully deleted");
          this.get_languageMaster();  // Refresh table
        } else {
          this.toastrService.error(message); // Show API message
        }
      },

      error: (error) => {
        console.error('Error deleting Language  Master record:', error);
        this.toastrService.error('Failed to delete account.');
      }
    });
  }
}



// Filter header search

filteredData() {
  if (!this.searchText) {
    return this.languageMasterList;
  }
  const searchTextLower = this.searchText.toLowerCase();
  return this.languageMasterList.filter(languageMasterList =>
    (languageMasterList.description?.toLowerCase().includes(searchTextLower)),
  );
}

// Pagination Add 

onPageChange(event: number): void {
  this.pageIndex = event; // Update current page
  this.get_languageMaster(); // Fetch data for the selected page
}



// download excel


 
  exportToExcel(): void {
    this.languageMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_langid','fk_companyId','fk_LocID','fk_UserID','timestamp'];
 
        const columnMappings: Record<string, string> = {
          description:'description'
         
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
        const fileName = 'LanguageMasterList.xlsx';
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
