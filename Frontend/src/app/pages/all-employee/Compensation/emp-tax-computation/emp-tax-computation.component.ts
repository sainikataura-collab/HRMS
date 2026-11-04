import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { CompensationService } from '../Service/compensation.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-emp-tax-computation',
  standalone: true,
    imports: [RouterLink, CommonModule,CommonSearchComponent,FormsModule],
  templateUrl: './emp-tax-computation.component.html',
  styleUrl: './emp-tax-computation.component.scss'
})
export class EmpTaxComputationComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
 TaxcomputationList: any[] = [];
 Finyearlist:any[]=[];
Financialyear: string = '';
  searchText: string = '';
  HeadNameDetailsList:any[]=[];
  Head2List: any[] = [];
   constructor(
    public compensationService:CompensationService,
     private toastrService: ToastrService,
   ) {}
 
     ngOnInit() {
     this.getlistdata();
     this.getFinYear();
   }
getFinYear() {
  this.compensationService.get_finyear().subscribe(res=>{   
     if (res.isSuccess) {
      this.Finyearlist = res.data;
      this.Financialyear = res.data[0].FinancialYear;
    //     console.log('Set Financialyear:', this.Financialyear);  // <- add this
    } else {
      this.toastrService.warning(res.message);
    } 
  })
}
     getlistdata(): void {
    this.ngxUILoaderService.start(); 
    this.compensationService.get_TaxDocList().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop(); 
          this.TaxcomputationList = res.data;

        } else {
          this.TaxcomputationList = [];
          this.toastrService.error(res.message);
          this.ngxUILoaderService.stop(); 

        }
      },
      error: (error) => {
        this.TaxcomputationList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }
    filteredData(): any[] {
    if (!this.searchText) return this.TaxcomputationList;
    const search = this.searchText.toLowerCase();
    return this.TaxcomputationList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }
  openModal(pk_headId: string) {
this.compensationService.getHeadNameDetails(pk_headId).subscribe(res=>{
if(res.isSuccess){
  this.HeadNameDetailsList=res.data.head1
 this.Head2List = res.data.head2; 
}
})
}
}
