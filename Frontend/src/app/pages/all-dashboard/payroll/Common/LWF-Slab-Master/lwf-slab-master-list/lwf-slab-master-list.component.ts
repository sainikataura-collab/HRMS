import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { LWFSlabMasterService } from '../../../services/lwf-slab-master.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-lwf-slab-master-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule, NgSelectModule],
  templateUrl: './lwf-slab-master-list.component.html',
  styleUrl: './lwf-slab-master-list.component.scss'
})
export class LwfSlabMasterListComponent {

  pageIndex: number = 1;
  pageSize: number = 10;//Defoult item per page
  totalItems: number = 0;// Default page number

  LWFList: any[] = [];
  searchText: string = '';


  Isedit: boolean = false;
  fk_stateid!: number | null;
  states: { name: string, value: string }[] = [];
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(private lwfSlabService: LWFSlabMasterService, private route: ActivatedRoute, private router: Router, private toastrService: ToastrService, public encryptionService: EncryptionService) { }

  ngOnInit() {
    this.getAll(this.fk_stateid);
    this.getStateList('State');
    this.route.queryParams.subscribe(params => {
      if (params['fk_stateid']) {
        this.fk_stateid = params['fk_stateid'];
        this.getAll(this.fk_stateid);
      }
    });
  }

  getStateList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.lwfSlabService.getStateList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.states = res.data.map((fk_stateid: any) => ({
            name: fk_stateid.name,
            value: fk_stateid.value
          }));
        } else {
          this.toastrService.error("Failed to load State list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching State list:", err);
        this.toastrService.error("Error fetching State list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  onStateChange(fk_stateid: number | null) {
    this.fk_stateid = fk_stateid;
    this.getAll(fk_stateid);
  }


  getAll(fk_stateid: number | null = null): void {
    const StateIdToSend = fk_stateid ?? null;
    this.lwfSlabService.get_LwfSalb(StateIdToSend, this.pageIndex - 1, this.pageSize, this.searchText).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.LWFList = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        this.LWFList = [];
        this.totalItems = 0;
        // this.toastrService.error(res.message, 'Error'); // Optional: comment out if it gets annoying on every empty search
      }
    });
  }

  deleteLWF(pk_slabId: number) {
    debugger
    if (confirm('Are you sure you want to delete this record?')) {
      this.lwfSlabService.delete_LwfSalb(pk_slabId).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');

            //alert('Record deleted successfully');
            this.getAll(this.fk_stateid); // Refresh the list
          } else {
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


  isUpdate(pk_slabid: number) {
    // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(pk_slabid.toString());
    this.router.navigate(["/dash/user/userdashboard/Lwf_Slab_Master", encryptedId]);

  }


  filteredData() {
    return this.LWFList;
  }

  onSearch() {
    this.pageIndex = 1;
    this.getAll(this.fk_stateid);
  }

  // for pagination
  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAll(this.fk_stateid);
  }


  exportToExcel(): void {
    this.lwfSlabService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        //for exclude the column
        const excludedColumns = ['fk_LocID', 'isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_locId', 'fk_InsuserId', 'fk_updUserId', 'isCActive', 'fk_stateid', 'pk_stateid'];
        //rename the column
        const columnMappings: Record<string, string> = {
          effectT: 'effectT',
          mmyyyy: 'EffectiveFrom',
          sno: 'SequenceNo',
          emrmultiple: 'Emrmultiple',



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
        const fileName = 'lwfSlabMasterList.xlsx';
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
