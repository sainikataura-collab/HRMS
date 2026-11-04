import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../../../payroll/Employee/common-search/common-search.component';
import { EmployeeService } from '../../../../payroll/services/employee.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-employee-image-upload-list',
  standalone: true,
  imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './employee-image-upload-list.component.html',
  styleUrl: './employee-image-upload-list.component.scss'
})
export class EmployeeImageUploadListComponent {

    ngxUILoaderService = inject(NgxUiLoaderService);
  
    pageIndex: number = 1;
    pageSize: number = 5;
    totalCount: number = 0;
  
    employeeList: any[] = [];
    searchText: string = '';
      // Default filter structure
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
      private employeeMasterService: EmployeeService,
      private router: Router,
      private toastrService: ToastrService,
      public encryptionService: EncryptionService
    ) {}
  
    ngOnInit() {
      //this.getEmployee();
    }

    getEmployee(): void {
      debugger
      // this.ngxUILoaderService.start(); 
      this.employeeMasterService.Get_Employee_Image(this.pageIndex - 1, this.pageSize).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.ngxUILoaderService.stop(); 
            this.employeeList = res.data;
            this.totalCount = res.totalCount;
                     //for teh image
                     this.employeeList.forEach(item => {
                      if (item.filename) {
                       this.loadImage(item.filename);
                           }
                           });
   
          } else {
            this.employeeList = [];
            this.totalCount = 0;
            this.toastrService.error(res.message, 'Error');
            // this.ngxUILoaderService.stop(); 
  
          }
        },
        error: (error) => {
          this.employeeList = [];
            this.totalCount = 0;
          this.toastrService.error('Failed to retrieve employees', 'Error');
        }
      });
    }
    
    // Handle filter updates from common search
    handleFilters(filters: any) {
      this.employeeFilters = filters;
      this.getEmployee(); // Refresh list with new filters
    }
  
    
  
    
    // Filter displayed data based on search
    filteredData() {
      if (!this.searchText) {
        return this.employeeList;
      }
      const searchTextLower = this.searchText.toLowerCase();
      return this.employeeList.filter(emp =>
        emp.description?.toLowerCase().includes(searchTextLower)
        
      );
    }
  
    // Handle pagination change
    onPageChange(event: number): void {
      this.pageIndex = event;
      this.getEmployee();
    }

    
    isDelete(pk_imageid: string){
      if (!confirm("Do you want to remove?")) {
    return; // This will stop the function if user clicks "Cancel"
}

      this.employeeMasterService.Delete_Employee_Image(pk_imageid).subscribe(res=>{
     
        if(res.isSuccess){
        this.toastrService.success("Record remove successfully.");
         this.getEmployee();
        }
        else{
          this.toastrService.info(res.message);
        }
      })
    }
    imageMap: { [filename: string]: string } = {}; // filename -> base64 URL

    loadImage(filename: string) {
      if (this.imageMap[filename]) return; // Don't reload if already loaded
    
      this.employeeMasterService.getImage(filename).subscribe({
        next: (blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imageMap[filename] = reader.result as string;

          };
          reader.readAsDataURL(blob); // Convert blob to base64 image URL
        },
        error: (err) => {
          console.error('Failed to load image:', err);
        }
      });
    }

    selectedImage: string | null = null;
showModal: boolean = false;

openImageModal(filename: string) {
  this.selectedImage = this.imageMap[filename];
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
  this.selectedImage = null;
}
  
}
