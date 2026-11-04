import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { KraService } from '../../recruitment/RecruitServices/kra.service';

@Component({
  selector: 'app-rolewise-list',
  standalone: true,
   imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './rolewise-list.component.html',
  styleUrl: './rolewise-list.component.scss'
})
export class RolewiseListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  RolewiseList: any[] = [];
  searchText: string = '';
  
   employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    userId: '',
    empStatus: ''
  };
  constructor(
    private kraService: KraService,
    private router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}

    ngOnInit() {
    this.getlistrolewise();
  }
    filteredData() {
    if (!this.searchText) {
      return this.RolewiseList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.RolewiseList.filter(emp =>
      emp.empname?.toLowerCase().includes(searchTextLower)
    );
  }
    // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getlistrolewise(); // Refresh list with new filters
  }

  getlistrolewise() {
    this.ngxUILoaderService.start(); 
    this.kraService.getAllrolewiseKRA().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop(); 
          this.RolewiseList = res.data;
         console.log("hii", this.RolewiseList)
        } else {
          this.RolewiseList = [];
       
          this.toastrService.error(res.message, 'Error');
          this.ngxUILoaderService.stop(); 
        }
      },
      error: (error) => {
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }

  update(roleid:string,srno: number){
 this.router.navigate(['/dash/appraisal/appraisaldashboard/Rolewise-KRA', roleid, srno]);
  }



  delete(roleId:number,srno: number) {
  if (confirm('Are you sure you want to delete this record?')) {
      this.kraService.deleterolewiseKRA(roleId,srno).subscribe(
          (response: any) => {
              if (response.isSuccess) {

                this.toastrService.success(response.message );
                this.getlistrolewise();
              } 
              else {
                this.toastrService.error(response.message, 'Error');
              }
          },
          (errorMessage) => {
           
              this.toastrService.error(errorMessage, 'Error');
          }
      );
  }
}
}
