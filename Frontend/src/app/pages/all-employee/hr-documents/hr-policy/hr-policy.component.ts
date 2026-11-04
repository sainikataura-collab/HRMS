import { Component, inject } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HrPolicyService } from '../hrdocumentService/hr-policy.service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';

@Component({
  selector: 'app-hr-policy',
  standalone: true,
  imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './hr-policy.component.html',
  styleUrl: './hr-policy.component.scss'
})
export class HrPolicyComponent {

  ngxUILoaderService = inject(NgxUiLoaderService);
    List: any[] = [];
    searchText: string = '';
    pageIndex: number = 1;
    pageSize: number = 10;
    totalItems: number = 0;
   
    constructor(
     public Service: HrPolicyService,
      private router: Router,
      private toastrService: ToastrService,
      public encryptionService: EncryptionService
    ) {}
  
      ngOnInit() {
      this.getdata();
    }
      
  
    getdata(): void {
      this.ngxUILoaderService.start(); 
      this.Service.get_List().subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.ngxUILoaderService.stop(); 
            this.List = res.data;
            this.totalItems = res.totalCount;
          } else {
            this.List = [];
            this.totalItems = 0;
            this.toastrService.error(res.message);
            this.ngxUILoaderService.stop(); 
  
          }
        },
        error: (error) => {
          this.List = [];
            this.totalItems = 0;
          this.toastrService.error('Failed to retrieve employees', 'Error');
        }
      });
    }
      filteredData(): any[] {
      if (!this.searchText) return this.List;
      const search = this.searchText.toLowerCase();
      return this.List.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(search)
        )
      );
    }
  
      onPageChange(event: number): void {
      this.pageIndex = event;
      this.getdata();
    }
  
  

  download(filename: string) {
  this.Service.getrebateDoc(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);

      const cleanedDownloadName = filename.replace(/\s+/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanedDownloadName;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Failed to load image:', err);
    }
  });
}


}

