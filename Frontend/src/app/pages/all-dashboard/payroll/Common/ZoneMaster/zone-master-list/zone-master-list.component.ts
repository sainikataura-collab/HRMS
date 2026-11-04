import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ZoneMasterService } from '../../../services/zone.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-zone-master-list',
  standalone: true,
  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule],
  templateUrl: './zone-master-list.component.html',
  styleUrl: './zone-master-list.component.scss'
})
export class ZoneMasterListComponent {
  // zones = [
  //   { id: 1, ZoneCode: 'Uttar Pradesh', ZoneDescription: 'Lucknow' },
  //   { id: 2, ZoneCode: 'Maharashtra', ZoneDescription: 'Mumbai'},
  //   { id: 3, ZoneCode: 'Karnataka', ZoneDescription: 'Bangalore' },
  //   { id: 4, ZoneCode: 'Tamil Nadu', ZoneDescription: 'Chennai'}
  // ]; 


  searchText:string='';
  zones: any[] = [];
  Isedit:boolean=false;
  

  // pageIndex:number=1;
  // pageSize:number=;
  // totalItems :number= 0;
  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;
 

constructor(private zonemasterService:ZoneMasterService,private toastrService:ToastrService,private route: ActivatedRoute,
  private router: Router,public encryptionService:EncryptionService) {}
  
  ngOnInit(): void {
   this.getZoneDetails();
  }


  encodeID(id: any): string {
    return btoa(id.toString()); // Convert to string before encoding
  }
  
  decodeID(id: string): string {
    return atob(id);
  }
  

  onPageChange(event: number) {
    this.pageIndex = event;
    this.getZoneDetails();
  }

  getZoneDetails(): void {
    this.zonemasterService.get_Zone(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.zones = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
}


filteredData() {
  if (!this.searchText) {
    return this.zones;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.zones.filter(zone =>
    zone.zoneDescription?.toLowerCase().includes(searchTextLower) ||
    zone.zoneCode?.toLowerCase().includes(searchTextLower)

  );
}

 deleteZone(pk_zoneId: string) {
    if (confirm('Are you sure you want to delete this record?')) {
        this.zonemasterService.delete_Zone(pk_zoneId).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');
                    //alert('Record deleted successfully');
                    this.getZoneDetails(); // Refresh the list
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
  

  isUpdate(pk_zoneId: string){
    // console.log(addressId);
    this.router.navigate(["/dash/user/userdashboard/zonemaster",pk_zoneId]);
  
  }


     exportToExcel(): void {
          this.zonemasterService.DownloadExcel().subscribe(res => {
            if (res.isSuccess && res.data.length > 0) {
              //for exclude the column
              const excludedColumns = ['fk_LocID','isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_locId',	'fk_InsuserId',	'fk_updUserId','isCActive','fk_stateid',	'pk_stateid'];
        //rename the column
              const columnMappings: Record<string, string> = {
                zoneCode: 'ZoneCode',
                zoneDescription: 'zoneDescription',
                
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
              const fileName = 'ZoneMasterList.xlsx';
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
