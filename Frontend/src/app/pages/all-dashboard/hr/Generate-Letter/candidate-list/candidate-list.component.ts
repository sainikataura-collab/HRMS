import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CandidateService } from '../../HRservices/candidate.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.scss'
})
export class CandidateListComponent {


  searchText: string = '';
  searchTerm: string = '';
  list: any[] = [];
  Isedit: boolean = false;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;


  constructor(private Service: CandidateService, private toastrService: ToastrService, private route: ActivatedRoute, private router: Router, public encryption: EncryptionService) { }

  ngOnInit(): void {
    this.getlist();
  }
  //for paginatiion
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getlist();
  }

  getlist(): void {
    this.Service.get_Candidate(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.list = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }

  //for filter the data 
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }
    const searchTextLower = this.searchText.toLowerCase();
    const local = this.list.filter(res =>
      res.name?.toLowerCase().includes(searchTextLower) ||
      res.designation?.toLowerCase().includes(searchTextLower) ||
      res.location?.toLowerCase().includes(searchTextLower) ||
      res.contactno?.toLowerCase().includes(searchTextLower) ||
      res.joiningdate?.toLowerCase().includes(searchTextLower)
    );
    return local;
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.pageIndex = 1;
      this.getlist();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getlist();
    }
  }
  //for delete 
  delete(pk_formatid: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.Service.delete_Candidate(pk_formatid).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');
            //alert('Record deleted successfully');
            this.getlist(); // Refresh the list
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

  //for update 
  isUpdate(pk_formatid: number) {
    const encryptedId = this.encryption.encryptText(pk_formatid.toString());
    this.router.navigate(["/dash/hr/hrdashboard/Candidate", encryptedId]);

  }
  //download excel
  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['ctcinword', 'ctc', 'address', 'pinno', 'nname', 'fk_emphrid', 'fk_cityid', 'fk_desgid', 'fk_deptid', 'fk_locid', 'pk_formatid', 'fk_companyId', 'fk_empid',];
        const columnMappings: Record<string, string> = {
          name: 'Name',
          designation: 'Designation',
          location: 'Location',
          contactno: 'Contact no',
          joiningdate: 'Joining Date',




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
        const fileName = 'Candidate detail list.xlsx';
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
