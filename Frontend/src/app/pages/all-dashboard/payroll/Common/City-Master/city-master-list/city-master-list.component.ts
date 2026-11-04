import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CityMasterService } from '../../../services/city-master.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-city-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent],
  templateUrl: './city-master-list.component.html',
  styleUrl: './city-master-list.component.scss'
})
export class CityMasterListComponent {
  // cities = [
  //   { id: 1, state: 'Uttar Pradesh', city: 'Lucknow', metro: true },
  //   { id: 2, state: 'Maharashtra', city: 'Mumbai', metro: true },
  //   { id: 3, state: 'Karnataka', city: 'Bangalore', metro: false },
  //   { id: 4, state: 'Tamil Nadu', city: 'Chennai', metro: true }
  // ]; 
  
  cities:any[]=[];

  searchText: string = '';
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  

   States:any[]=[];

  //fk_stateid:number=0;
  fk_stateid: number | null = null;
  
  // fk_stateId: string | null = null;

 
  constructor(private fb: FormBuilder,private citymasterService:CityMasterService,private toastrService:ToastrService,private router:Router,private route:ActivatedRoute,public encryptionService:EncryptionService) {}

  ngOnInit(): void {


    this.getStateList('State');
   // this.getCity() ;
   this.getCityDetails(null); // Load all cities initially (if applicable)

//this.getCityDetails(this.fk_stateid);
  }

  onPageChange(event: number) {
    this.pageIndex = event;
    this.getCityDetails(this.fk_stateid);

  }

  getCityDetails(fk_stateid: number | null): void {

    this.fk_stateid = fk_stateid; 
    
    this.citymasterService.get_CityListByStateId(this.pageIndex - 1, this.pageSize, this.fk_stateid, this.searchTerm).subscribe(res => {
      if (res.isSuccess) {
        this.cities = res.data;
        this.totalItems = res.totalCount;
      } else {
        this.toastrService.error(res.message, 'Error');
      }
    });
  }



 // Fetch city list based on state ID

//  onStateChange(stateId: number) {
//   this.fk_stateid = stateId;
//   this.getCityDetails(stateId);
// }

 // Event when state changes
 onStateChange(stateId: number | null): void {
  this.getCityDetails(stateId);
}

 getStateList(fieldName: string) {

  // this.ngxUILoaderService.start(); // Start loader before API call

  this.citymasterService.getStateList(fieldName).subscribe({
      next: (res) => {
          if (res.isSuccess && res.data) {
              this.States = res.data.map((fk_stateid: any) => ({
                  name: fk_stateid.name,
                  value: fk_stateid.value
              }));
          } else {
              this.toastrService.error("Failed to load State list.");
          }
          // Stop loader after response

      },
      error: (err) => {
          console.error("Error fetching HOD list:", err);
          this.toastrService.error("Error fetching state list.");
          
      }
  });
}


filteredData() {
  if (!this.searchText) {
    return this.cities;
  }
  const searchTextLower = this.searchText.toLowerCase();
  const local = this.cities.filter(c =>
    c.cityname?.toLowerCase().includes(searchTextLower) ||
    c.description?.toLowerCase().includes(searchTextLower) ||
    c.metroName?.toLowerCase().includes(searchTextLower) ||
    c.pt_applicable?.toLowerCase().includes(searchTextLower) ||
    c.lwf_applicable?.toLowerCase().includes(searchTextLower) ||
    c.isActive?.toString().toLowerCase().includes(searchTextLower)
  );
  return local;
}

onSearchTextChanged(): void {
  const local = this.filteredData();
  if (local.length === 0 && this.searchText.trim()) {
    this.searchTerm = this.searchText.trim();
    this.pageIndex = 1;
    this.getCityDetails(this.fk_stateid);
  } else if (!this.searchText.trim()) {
    this.searchTerm = '';
    this.getCityDetails(this.fk_stateid);
  }
}

 deletecity(pk_cityid: string) {
  debugger
    if (confirm('Are you sure you want to delete this record?')) {
        this.citymasterService.delete_City(pk_cityid).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');
                    //alert('Record deleted successfully');
                    this.getCityDetails(this.fk_stateid);
                  } 
                else {
                  this.toastrService.error(response.message, 'Error');
                }
            },
            (errorMessage) => {
                console.error('Error deleting record', errorMessage);
                this.toastrService.error(errorMessage, 'Error');
               
            }
        );
    }
}
  

  isUpdate(pk_cityid: string){
    // console.log(addressId);
    this.router.navigate(["/dash/user/userdashboard/city-master",pk_cityid]);
  
  }


  exportToExcel(): void {
    this.citymasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        //for exclude the column
        const excludedColumns = ['fk_LocID','isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_locId',	'fk_InsuserId',	'fk_updUserId','isCActive','fk_stateid',	'pk_stateid'];
  //rename the column
        const columnMappings: Record<string, string> = {
          description: 'State',
          cityname: 'City',
          metro: 'metroName'
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
  
        // **Direct Download (Without FileSaver)**
        const fileName = 'DowmloadCityExcelSheet.xlsx';
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
