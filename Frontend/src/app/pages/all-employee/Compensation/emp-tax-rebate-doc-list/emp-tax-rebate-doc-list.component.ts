import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { CompensationService } from '../Service/compensation.service';

@Component({
  selector: 'app-emp-tax-rebate-doc-list',
  standalone: true,
     imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],

  templateUrl: './emp-tax-rebate-doc-list.component.html',
  styleUrl: './emp-tax-rebate-doc-list.component.scss'
})


export class EmpTaxRebateDocListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  rebateDocList: any[] = [];
  searchText: string = '';
  fk_empid:string='GU-1';
  constructor(
   public compensationService:CompensationService,public encryptionService:EncryptionService,  private router: Router, private toastrService: ToastrService,
  ) {}

    ngOnInit() {
    this.getrebateDocdata();
  }
   
  
  download(filename: string) {
    this.compensationService.getrebateDoc(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/[\s()]/g, '_'); // Clean filename
        a.click();
        window.URL.revokeObjectURL(url); // Clean up
      },
      error: (err) => {
        console.error('Failed to load image:', err);
      }
    });
  }
  

  update(pk_docid: string) {
 const encryptedId = this.encryptionService.encryptText(pk_docid.toString());
  this.router.navigateByUrl("/dash/reimbursement/reimbursementdashboard/RebateDocument/"+encryptedId);
  }
  getrebateDocdata(): void {
    this.ngxUILoaderService.start(); 
    this.compensationService.get_RebateDocList().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop(); 
          this.rebateDocList = res.data;
        } else {
          this.rebateDocList = [];
          this.toastrService.error(res.message, 'Error');
          this.ngxUILoaderService.stop(); 

        }
      },
      error: (error) => {
        this.rebateDocList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }
    filteredData(): any[] {
    if (!this.searchText) return this.rebateDocList;
    const search = this.searchText.toLowerCase();
    return this.rebateDocList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }

}