import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { OfficeTypeMasterService } from '../../services/office-type-master.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX  from 'xlsx'


@Component({
  selector: 'app-office-type-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,NgxPaginationModule,CommonModule],
  templateUrl: './office-type-master-list.component.html',
  styleUrl: './office-type-master-list.component.scss'
})

export class OfficeTypeMasterListComponent {
ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  officeTypeMasterList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;

 

     constructor(private OfficeTypeMasterService:OfficeTypeMasterService, private fb: FormBuilder, public router: Router,private toastrService: ToastrService,public encryptionService:EncryptionService) { }
       ngOnInit(): void {
         this.get_officeTypeMaster();
       }

       get_officeTypeMaster(): void {
        this.OfficeTypeMasterService.get_OfficeTypeMaster(this.pageIndex-1,this.pageSize).subscribe(res => {
            if (res.isSuccess) {
                console.log('Data retrieved successfully:', res.data);
                this.officeTypeMasterList = res.data;
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
      this.get_officeTypeMaster(); // Fetch data for the selected page
    }

    filteredData() {
      if (!this.searchText) {
        return this.officeTypeMasterList;
      }
   
      const searchTextLower = this.searchText.toLowerCase();
      return this.officeTypeMasterList.filter(officeTypeMasterList =>
        (officeTypeMasterList.code?.toLowerCase().includes(searchTextLower))||
        (officeTypeMasterList.officeName?.toLowerCase().includes(searchTextLower)),
      );
    }

    
    // update functional master
  isUpdate(officeTypeID: string) {
    this.router.navigateByUrl("/dash/user/userdashboard/officeTypeMaster/"+officeTypeID);
    
  }

  exportToExcel(): void {
    this.OfficeTypeMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['fk_companyId','emailhr','emailhod','Timestamp','timestamp','officeTypeID','officename','pk_offtypeid','description'];
  
        const columnMappings: Record<string, string> = {
         
          code: 'code',
          // description:'officename'
       
  
         
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
        const fileName = 'OfficeTypeMasterList.xlsx';
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


    // delete

deleteOfficeTypeMaster(pk_offtypeid:number): void {
  if (confirm('Are you sure you want to delete this Office Type Master record?')) {
    console.log("Deleting Office TypeRecord with ID:", pk_offtypeid); // Debugging log

    this.OfficeTypeMasterService.delete_OfficeTypeMaster(pk_offtypeid).subscribe({
      next: (response) => {
        console.log("API Response:", response); // Log full response

        const success = response?.modelResponse?.isSuccess ?? response?.isSuccess; // Ensure it checks both cases
        const message = response?.modelResponse?.message || response?.message || "Delete failed!";

        if (success) {
          this.toastrService.success(message || "Successfully deleted");
          this.get_officeTypeMaster();  // Refresh table
        } else {
          this.toastrService.error(message); // Show API message
        }
      },
      error: (error) => {
        console.error('Error deleting Office Type Master record:', error);
        this.toastrService.error('Failed to delete account.');
      }
    });
  }
}


    

}
