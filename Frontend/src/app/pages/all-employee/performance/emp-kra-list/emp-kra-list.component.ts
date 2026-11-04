import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { KraService } from '../Service/kra.service';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';


@Component({
  selector: 'app-emp-kra-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent],

  templateUrl: './emp-kra-list.component.html',
  styleUrl: './emp-kra-list.component.scss'
})
export class EmpKraListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  EmpwiseList: any[] = [];
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
  ) { }

  ngOnInit() {
    this.getlistEmpwise();
  }


  filteredData() {
    if (!this.searchText) {
      return this.EmpwiseList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.EmpwiseList.filter(emp =>
      emp.empname?.toLowerCase().includes(searchTextLower)
    );
  }
  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getlistEmpwise(); // Refresh list with new filters
  }






  getlistEmpwise() {
    this.ngxUILoaderService.start();
    this.kraService.getAllEmpwiseKRA().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop();
          this.EmpwiseList = res.data;

        } else {
          this.EmpwiseList = [];
          this.toastrService.error(res.message, 'Error');
          this.ngxUILoaderService.stop();
        }
      },
      error: (error) => {
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }


  update(fk_empid: string, srno: number) {
    const encryptedEmpId = this.encryptionService.encryptText(fk_empid);
    const encryptedSrno = this.encryptionService.encryptText(srno.toString());

    this.router.navigate(['/dash/appraisal/appraisaldashboard/Empwise-KRA', encryptedEmpId, encryptedSrno]);
  }



  delete(fk_empid: string, srno: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.kraService.deleteEmpwiseKRA(fk_empid, srno).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message);
            this.getlistEmpwise();
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

