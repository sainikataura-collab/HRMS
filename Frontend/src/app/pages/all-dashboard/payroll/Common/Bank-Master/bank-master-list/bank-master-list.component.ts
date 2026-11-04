import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { BankMasterService } from '../../../services/bank-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-bank-master-list',
  standalone: true,
  imports: [RouterLink,CommonModule, ReactiveFormsModule, FormsModule,NgxPaginationModule],
  templateUrl: './bank-master-list.component.html',
  styleUrl: './bank-master-list.component.scss'
})

export class BankMasterListComponent {
  
 
  ngxUILoaderService = inject(NgxUiLoaderService);
  searchText: string = '';
  searchTerm: string = '';
  bankMasterList: any[] = [];
  page: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;

  constructor(private bankMasterService:BankMasterService, private fb: FormBuilder, public router: Router,private toastrService: ToastrService,private cdRef: ChangeDetectorRef,public encryptionService:EncryptionService) { }
  ngOnInit(): void {
    //this.ngxUILoaderService.start();
    this.get_BankMaster();
    //this.ngxUILoaderService.stop(); 

  }

  // get_BankMaster(): void {
  

  //   this.bankMasterService.get_BankMaster(this.page - 1, this.pageSize, this.searchTerm).subscribe(res => {
  //       if (res.isSuccess) {
  //           console.log('Data retrieved successfully:', res.data);
  //           this.bankMasterList = res.data;
  //           this.totalItems = res.totalCount;

  //           console.log(this.totalItems, 'this is total items retrieved');
  //       } else {
  //           console.error('Failed to retrieve data:', res.message);
  //           alert(res.message);
  //       }
  //   });
  // }

    get_BankMaster(): void {
    this.bankMasterService.get_BankMaster(this.page - 1, this.pageSize, this.searchTerm).subscribe(res => {
      if (res.isSuccess) {
        this.bankMasterList = res.data;
        this.totalItems = res.totalCount;
      } else {
        this.toastrService.info(res.message);
      }
    });
  }

  onPageChange(event: number): void {
    this.page = event; // Update current page
    this.get_BankMaster(); // Fetch data for the selected page
  }

  

  filteredData() {
    if (!this.searchText) {
      return this.bankMasterList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    const local = this.bankMasterList.filter(b =>
      b.bankname?.toLowerCase().includes(searchTextLower) ||
      b.bankName?.toLowerCase().includes(searchTextLower) ||
      b.accountNo?.toLowerCase().includes(searchTextLower) ||
      b.contactperson1?.toLowerCase().includes(searchTextLower) ||
      b.contactno1?.toLowerCase().includes(searchTextLower) ||
      b.contactperson2?.toLowerCase().includes(searchTextLower) ||
      b.contactno2?.toLowerCase().includes(searchTextLower) ||
      b.bankAccount_Max?.toString().toLowerCase().includes(searchTextLower) ||
      b.bankAccount_Min?.toString().toLowerCase().includes(searchTextLower) ||
      b.ifsC_Prefix?.toLowerCase().includes(searchTextLower) ||
      b.iFSC_Prefix?.toLowerCase().includes(searchTextLower)
    );
    return local;
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.page = 1;
      this.get_BankMaster();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.get_BankMaster();
    }
  }


  
  
  // Isedit(pk_BankId: string) {
  //   // console.log(addressId);
  //   this.router.navigateByUrl("/dash/payroll/payrolldashboard/bankMaster",pk_BankId);
  // }

  Isedit(pk_BankId: string){
    // console.log(addressId);
    this.router.navigate(["/dash/user/userdashboard/bankMaster",pk_BankId]);
  
  }

 
  deleteBank(pk_BankId: string): void {
    if (confirm('Are you sure you want to delete this bank record?')) {
      this.bankMasterService.delete_BankMaster(pk_BankId).subscribe({
        next: (response) => {
          console.log("API Response:", response);
  
          const success = response?.modelResponse?.isSuccess || response?.isSuccess;
  
          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            
            // ✅ Data list ko update karein
            this.get_BankMaster();  // 👈 Corrected
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
    this.bankMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_BankId','fk_LocID', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_CompanyId','remarks'];

        const columnMappings: Record<string, string> = {
          bankname: 'Bank Name',
         
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
        const fileName = 'BankMasterList.xlsx';
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
  
  

 



