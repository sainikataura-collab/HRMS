import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfessionalTaxService } from '../../services/professional-tax.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-professional-tax-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './professional-tax-list.component.html',
  styleUrl: './professional-tax-list.component.scss'
})
export class ProfessionalTaxListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  searchText: string = '';
  professionalTaxList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  fk_stateid!: number | null;

  states: { label: string, value: string }[] = [];

  constructor(private ProfessionalTaxService: ProfessionalTaxService, private route: ActivatedRoute, public router: Router, private toastrService: ToastrService, public encryptionService: EncryptionService) { }
  ngOnInit(): void {
    this.get_professionalTax(this.fk_stateid);
    this.getStateList('State');
    this.route.queryParams.subscribe(params => {
      if (params['fk_stateid']) {
        this.fk_stateid = params['fk_stateid'];
        this.get_professionalTax(this.fk_stateid);
      }
    });
  }
  getStateList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call

    this.ProfessionalTaxService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.states = res.data.map((fk_stateid: any) => ({
            name: fk_stateid.name,
            value: fk_stateid.value
          }));
        } else {
          this.toastrService.error("Failed to load HOD list.");
        }
        this.ngxUILoaderService.stop();

      },
      error: (err) => {
        console.error("Error fetching HOD list:", err);
        this.toastrService.error("Error fetching level list.");

      }
    });
  }
  get_professionalTax(fk_stateid: number | null): void {
    const StateIdToSend = fk_stateid ?? null;

    this.ProfessionalTaxService.get_professionalTaxSlab(StateIdToSend, this.pageIndex - 1, this.pageSize, this.searchText).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.professionalTaxList = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        this.professionalTaxList = [];   // Hard reset to an empty array so .length works
        this.totalItems = 0; // Hard reset the count
      }

    });
  }

  onStateChange(fk_stateid: number | null) {
    this.fk_stateid = fk_stateid;  // Selected Year ko store karein
    this.get_professionalTax(fk_stateid);  // Year change hote hi data fetch karein
  }

  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.get_professionalTax(this.fk_stateid); // Fetch data for the selected page
  }

  filteredData() {
    return this.professionalTaxList;
  }

  onSearch() {
    this.pageIndex = 1;
    this.get_professionalTax(this.fk_stateid);
  }




  isUpdate(pk_slabid: string) {
    this.router.navigateByUrl("/dash/user/userdashboard/professionalTax/" + pk_slabid);
  }

  deleteProfessional(pk_slabid: string): void {
    if (confirm('Are you sure you want to delete this Professional record?')) {
      this.ProfessionalTaxService.delete_professionalTaxSlab(pk_slabid).subscribe({
        next: (response) => {
          console.log("API Response:", response);

          const success = response?.modelResponse?.isSuccess || response?.isSuccess;

          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");

            this.get_professionalTax(this.fk_stateid);  // 👈 Corrected
          } else {
            this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
          }
        },
        error: (error) => {
          console.error('Error deleting bank record:', error);
          this.toastrService.error('Failed to delete account.');
        }
      });
    }
  }
  exportToExcel(): void {
    this.ProfessionalTaxService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_slabid', 'fk_stateid', 'fk_LocID', 'fk_companyId', 'fk_UserID', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];

        const columnMappings: Record<string, string> = {
          sno: 'Sequence',
          lowerlimit: 'Lower Limit',
          upperlimit: 'Upper Limit',
          tax_percent: 'Tax Percentage'


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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ProfessionalTax');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // *Direct Download (Without FileSaver)*
        const fileName = 'ProfessionalTaxSlabList.xlsx';
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


