import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  EmployeeServiceTypeMappingService,
  ServiceTypeMappingModel
} from '../service/employee-servicetype-mapping.service';

@Component({
  selector: 'app-employee-servicetype-mapping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './employee-servicetype-mapping-list.component.html',
  styleUrls: ['./employee-servicetype-mapping-list.component.scss']
})
export class EmployeeServiceTypeMappingListComponent implements OnInit {
  mappingList: any[] = [];
  isLoading: boolean = false;

  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private mappingService: EmployeeServiceTypeMappingService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.loadMappings();
    });

    this.loadMappings();
  }

  loadMappings(): void {
    this.isLoading = true;
    const filter = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      searchTerm: (this.searchTerm || '').trim()
    };

    this.mappingService.getAll(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const resData = res?.data ?? res;
        const list = resData?.list ?? (Array.isArray(resData) ? resData : []);
        this.mappingList = list;
        this.totalItems = resData?.totalCount ?? list.length;
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error(err);
        this.toastr.error('Failed to load mappings from server.');
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadMappings();
  }

  editRecord(item: any): void {
    const id = item.pk_servicetypeid;
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/servicetype_mapping_form', id]);
  }

  isFlagTrue(val: any): boolean {
    return val === true || val === 1 || val === 'true' || val === '1';
  }

  exportToExcel(): void {
    if (!this.mappingList || this.mappingList.length === 0) {
      this.toastr.warning('No data available to export.');
      return;
    }

    const exportFilter = {
      pageIndex: 1,
      pageSize: 100000,
      searchTerm: (this.searchTerm || '').trim()
    };

    this.mappingService.getAll(exportFilter).subscribe({
      next: (res: any) => {
        const list = res?.data?.list || this.mappingList;
        const dataToExport = list.map((item: any, index: number) => ({
          'Sr.': index + 1,
          'Service Type': item.serviceTypeName || item.serviceType || '',
          'ESI': this.isFlagTrue(item.esi ?? item.ESI) ? 'Yes' : 'No',
          'PF': this.isFlagTrue(item.pf ?? item.PF) ? 'Yes' : 'No',
          'LWF': this.isFlagTrue(item.lwf ?? item.LWF) ? 'Yes' : 'No',
          'PT': this.isFlagTrue(item.pt ?? item.PT) ? 'Yes' : 'No',
          'Created By': item.createdBy || '-',
          'Created Date': item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : '-',
          'Modified Date': item.modifiedDate ? new Date(item.modifiedDate).toLocaleDateString('en-GB') : '-'
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook: XLSX.WorkBook = {
          Sheets: { 'ServiceType_Mapping': worksheet },
          SheetNames: ['ServiceType_Mapping']
        };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        const fileName = `Employee_ServiceType_Mapping_${new Date().toISOString().slice(0, 10)}.xlsx`;
        FileSaver.saveAs(data, fileName);
        this.toastr.success('Excel exported successfully.');
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Failed to export Excel.');
      }
    });
  }
}
