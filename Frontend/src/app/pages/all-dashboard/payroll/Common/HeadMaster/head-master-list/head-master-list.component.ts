import { Component, inject, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HeadMasterService } from '../../../services/headmaster.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-head-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,NgxPaginationModule,CommonModule],
  templateUrl: './head-master-list.component.html',
  styleUrl: './head-master-list.component.scss'
})
export class HeadMasterListComponent {
ngxUILoaderService = inject(NgxUiLoaderService);
   searchText: string = '';
   searchTerm: string = '';
   headMasterList: any[] = [];
   pageIndex: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   
   constructor(private headMasterService:HeadMasterService, private fb: FormBuilder, public router: Router,private toastrService: ToastrService,public encryptionService : EncryptionService) { }
   ngOnInit(): void {
     this. get_headMaster();
 
   }
 
   get_headMaster(): void {
    this.headMasterService.get_headMaster(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.headMasterList = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
        }
    });
}


 
  
  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.get_headMaster(); // Fetch data for the selected page
  }
 
  
  filteredData() {
    if (!this.searchText) {
      return this.headMasterList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.headMasterList.filter(item =>
      (item.description?.toLowerCase().includes(searchTextLower)) ||
      (item.shortdesc?.toLowerCase().includes(searchTextLower)) ||
      (item.headtype?.toLowerCase().includes(searchTextLower)) ||
      (item.mapping?.toString().toLowerCase().includes(searchTextLower)) ||
      (item.orderlevel?.toString().toLowerCase().includes(searchTextLower)) ||
      (item.rounding?.toString().toLowerCase().includes(searchTextLower))
    );
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.pageIndex = 1;
      this.get_headMaster();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.get_headMaster();
    }
  }
  
 
   
   isUpdate(pk_headid: string) {
     // console.log(addressId);
     this.router.navigateByUrl("/dash/user/userdashboard/head-master/" +pk_headid);
   }
 
  deleteHead(pk_headid: string): void {
    if (confirm('Are you sure you want to delete this Head record?')) {
      this.headMasterService.delete_headMaster(pk_headid).subscribe({
        next: (response) => {
          console.log("API Response:", response);
  
          const success = response?.modelResponse?.isSuccess || response?.isSuccess;
  
          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            
            this.get_headMaster();  // 👈 Corrected
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
    this.headMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['taxablesubbill','displayorder','esi_Rate_Part','orderlevel_ctc','fk_headid','fk_headfixedid','chapVItype','non_taxable_limit','pf_gross_part','esi_groos_part','prsence_dep','gross_Part','effecttype','blocksummation','active','interestper','undersection','calcinterest','salRegShow_Flag','taxable','deductiontype','salaryorder','importdesc','pf_rate_part','Esi_Rate_Part','amount','fk_formulaid','rounding','pk_headid','fk_LocID', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_CompanyId','remarks'];
       
        const columnMappings: Record<string, string> = {
         
          description : 'Description',
          shortdesc: 'Short Description',
          headtype : 'Head Type',
          mapping: 'Mapping',
          orderlevel : 'Order Level',
         
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Heads');
  
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
        // *Direct Download (Without FileSaver)*
        const fileName = 'HeadMasterList.xlsx';
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
 

