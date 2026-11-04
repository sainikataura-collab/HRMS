// import { CommonModule } from '@angular/common';
// import { Component, inject } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { NgxUiLoaderService } from 'ngx-ui-loader';
// import { DeductionSlabService } from '../../services/deduction-slab.service';
// import { ToastrService } from 'ngx-toastr';
// import { EncryptionService } from '../../../../../shared/services/encryption.service';
// import * as XLSX from 'xlsx';
// import { NgxPaginationModule } from 'ngx-pagination';
// import { NgSelectModule } from '@ng-select/ng-select';

// @Component({
//   selector: 'app-deduction-list',
//   standalone: true,
//   imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
//   templateUrl: './deduction-list.component.html',
//   styleUrl: './deduction-list.component.scss'
// })
// export class DeductionListComponent {
//  ngxUILoaderService = inject(NgxUiLoaderService);
//  searchText: string = '';
//     deductionList: any[] = [];
//     pageIndex: number = 0;
//     pageSize: number = 10;
//     totalItems: number = 0;
//     personType!: number|null;
//     types=[
//       { name: 'select Type', value: '' },
//       { name: 'Male', value: 'M' },
//       { name: 'Female', value: 'F' },
//       { name: 'Senior Sitizion', value: 'S' }
//      ]
//     states: { label: string, value: string }[]  = []; 

//     constructor(private DeductionSlabService:DeductionSlabService,private route: ActivatedRoute, public router: Router,private toastrService: ToastrService,public encryptionService:EncryptionService) { }
//     ngOnInit(): void {
//       this. get_deductionSlab(this.personType);
//       this.route.queryParams.subscribe(params => {
//        if (params['personType']) {
//          this.personType = params['personType'];
//          this.get_deductionSlab(this.personType);
//         }
//       });


      
//      }
     
   
//     get_deductionSlab(personType: number | null): void {
//       const StateIdToSend = personType ; 

//      this.DeductionSlabService.get_deductionSlab(StateIdToSend,this.pageIndex,this.pageSize).subscribe(res => {
//          if (res.isSuccess) {
//              console.log('Data retrieved successfully:', res.data);
//              this.deductionList = res.data;
//              this.totalItems = res.totalCount;
//              console.log(this.totalItems, 'this is total items retrieved');
//          } else {
//              console.error('Failed to retrieve data:', res.message);
//          }
//      });
//     }
 
//     onPersonTypeChange(personType: number | null) {
//       this.personType = personType;  // Selected Year ko store karein
//       this.get_deductionSlab(personType);  // Year change hote hi data fetch karein
//     }
   
//    onPageChange(event: number): void {
//      this.pageIndex = event; // Update current page
//      this.get_deductionSlab(this.personType); // Fetch data for the selected page
//    }
  
//    filteredData() {
//     if (!this.searchText) {
//       return this.deductionList;
//     }
//     return this.deductionList.filter(item =>
//       item.lowerLimit.toString().includes(this.searchText) ||
//       item.upperLimit.toString().includes(this.searchText) ||
//       item.tax_Percent.toString().includes(this.searchText)
//     );
//   }
  
  
  
    
//     isUpdate(pk_slabid: string) {
//       this.router.navigateByUrl("/dash/payroll/payrolldashboard/deductionSlab/" +pk_slabid);
//     }
  
//     deleteDeduction(pk_slabid: string): void {
//      if (confirm('Are you sure you want to delete this Deduction Slab record?')) {
//        this.DeductionSlabService.delete_deductionSlab(pk_slabid).subscribe({
//          next: (response) => {
//            console.log("API Response:", response);
   
//            const success = response?.modelResponse?.isSuccess || response?.isSuccess;
   
//            if (success) {
//              this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
             
//              this.get_deductionSlab(this.personType);  // 👈 Corrected
//            } else {
//              this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
//            }
//          },
//          error: (error) => {
//            console.error('Error deleting bank record:', error);
//            this.toastrService.error('Failed to delete account.');
//          }
//        });
//      }
//    }
//    exportToExcel(): void {
//      this.DeductionSlabService.DownloadExcel().subscribe(res => {
//        if (res.isSuccess && res.data.length > 0) {
//          const excludedColumns = ['pk_slabid','personType','fk_LocID', 'fk_companyId', 'fk_UserID',  'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];
   
//          const columnMappings: Record<string, string> = {
//           sno: 'Sequence',
//           lowerLimit: 'Lower Limit',
//           upperLimit: 'Upper Limit',
//           tax_Percent: 'Tax Percentage'

          
//          };
   
//          const filteredData = res.data.map((item: Record<string, any>) => {
//            return Object.keys(item)
//              .filter(key => !excludedColumns.includes(key))
//              .reduce((obj: Record<string, any>, key: string) => {
//                obj[columnMappings[key] || key] = item[key];
//                return obj;
//              }, {});
//          });
   
//          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
//          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
//          XLSX.utils.book_append_sheet(workbook, worksheet, 'DeductionSlab');
   
//          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   
//          // *Direct Download (Without FileSaver)*
//          const fileName = 'DeductionSlabList.xlsx';
//          const link = document.createElement('a');
//          link.href = URL.createObjectURL(data);
//          link.setAttribute('download', fileName);
//          document.body.appendChild(link);
//          link.click();
//          document.body.removeChild(link);
//        } else {
//          this.toastrService.warning('No data available to export');
//        }
//      });
//    }
//   }
  
 
 









import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DeductionSlabService } from '../../services/deduction-slab.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-deduction-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './deduction-list.component.html',
  styleUrl: './deduction-list.component.scss'
})
export class DeductionListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  deductionList: any[] = [];
  // ngx-pagination expects 1-based currentPage — set default to 1
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  // personType is string (values are '', 'M', 'F', 'S') or null
  personType: string | null = null;

  types = [
    { name: 'select Type', value: '' },
    { name: 'Male', value: 'M' },
    { name: 'Female', value: 'F' },
    { name: 'Senior Sitizion', value: 'S' }
  ];

  states: { label: string, value: string }[] = [];

  constructor(
    private DeductionSlabService: DeductionSlabService,
    private route: ActivatedRoute,
    public router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    // // Initial load (pageIndex already 1)
    // this.get_deductionSlab(this.personType);

    // If personType comes from query params
    // this.route.queryParams.subscribe(params => {
    //   if (params['personType']) {
    //     this.personType = params['personType'];
    //     this.pageIndex = 1;
    //     this.get_deductionSlab(this.personType);
    //   }
    // });
  }

  get_deductionSlab(personType: string | null): void {
    // convert empty string to null so backend can ignore filter if needed
    const personTypeToSend = (personType && personType !== '') ? personType : null;

    // Optionally show loader: this.ngxUILoaderService.start();
    this.DeductionSlabService.get_deductionSlab(personTypeToSend, this.pageIndex-1, this.pageSize).subscribe(res => {
      // this.ngxUILoaderService.stop();
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.deductionList = res.data || [];
        this.totalItems = res.totalCount || this.deductionList.length;
      } else {
        console.error('Failed to retrieve data:', res.message);
        this.toastrService.error(res.message || 'Failed to retrieve data');
      }
    }, err => {
      // this.ngxUILoaderService.stop();
      console.error('API error', err);
      this.toastrService.error('Error fetching data');
    });
  }

  // called from (ngModelChange) in template
  onPersonTypeChange(value: string | null) {
    this.personType = value;
    this.pageIndex = 1;               // reset to first page on filter change
    this.get_deductionSlab(this.personType);
  }

  onPageChange(event: number): void {
    this.pageIndex = event; // current page (1-based)
    this.get_deductionSlab(this.personType);
  }

  filteredData() {
    if (!this.searchText) {
      return this.deductionList;
    }
    const q = this.searchText.trim();
    return this.deductionList.filter(item =>
      String(item?.lowerLimit ?? '').includes(q) ||
      String(item?.upperLimit ?? '').includes(q) ||
      String(item?.tax_Percent ?? '').includes(q)
    );
  }

  isUpdate(pk_slabid: string) {
    // route expects encrypted id already
    this.router.navigateByUrl("/dash/payroll/payrolldashboard/deductionSlab/" + pk_slabid);
  }

  deleteDeduction(pk_slabid: string): void {
    if (confirm('Are you sure you want to delete this Deduction Slab record?')) {
      this.DeductionSlabService.delete_deductionSlab(pk_slabid).subscribe({
        next: (response) => {
          console.log("API Response:", response);

          const success = response?.modelResponse?.isSuccess || response?.isSuccess;

          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            this.get_deductionSlab(this.personType);
          } else {
            this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete account.');
        }
      });
    }
  }

  // exportToExcel(): void {
  //   this.DeductionSlabService.DownloadExcel().subscribe(res => {
  //     if (res.isSuccess && res.data.length > 0) {
  //       const excludedColumns = ['pk_slabid','personType','fk_LocID', 'fk_companyId', 'fk_UserID',  'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];

  //       const columnMappings: Record<string, string> = {
  //         sno: 'Sequence',
  //         lowerLimit: 'Lower Limit',
  //         upperLimit: 'Upper Limit',
  //         tax_Percent: 'Tax Percentage'
  //       };

  //       const filteredData = res.data.map((item: Record<string, any>) => {
  //         return Object.keys(item)
  //           .filter(key => !excludedColumns.includes(key))
  //           .reduce((obj: Record<string, any>, key: string) => {
  //             obj[columnMappings[key] || key] = item[key];
  //             return obj;
  //           }, {});
  //       });

  //       const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
  //       const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(workbook, worksheet, 'DeductionSlab');

  //       const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  //       const fileName = 'DeductionSlabList.xlsx';
  //       const link = document.createElement('a');
  //       link.href = URL.createObjectURL(data);
  //       link.setAttribute('download', fileName);
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } else {
  //       this.toastrService.warning('No data available to export');
  //     }
  //   });
  
  
  
  // }


  exportToExcel(): void {
  this.DeductionSlabService.DownloadExcel().subscribe(res => {
    if (res.isSuccess && res.data.length > 0) {
      const excludedColumns = [
        'pk_slabid', 'personType', 'fk_LocID', 'fk_companyId',
        'fk_UserID', 'fk_insUserID', 'fk_updUserID',
        'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'
      ];

      const columnMappings: Record<string, string> = {
        sno: 'Sequence',
        lowerLimit: 'Lower Limit',
        upperLimit: 'Upper Limit',
        tax_Percent: 'Tax Percentage'
      };
      

      const filteredData = res.data.map((item: Record<string, any>) => {
        return Object.keys(item)
          .filter(key => !excludedColumns.includes(key))
          .reduce((obj: Record<string, any>, key: string) => {
            obj[columnMappings[key] || key] = item[key];
            return obj;
          }, {});
      });

      // Generate worksheet & workbook
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DeductionSlab');

      // Write buffer
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob(
        [excelBuffer],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      // ✅ Use FileSaver.js for reliable download
      saveAs(blob, 'DeductionSlabList.xlsx');

    } else {
      this.toastrService.warning('No data available to export');
    }
  });
}
}
