import { CommonModule } from '@angular/common';
import { Component, inject,  } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CompanyParameterService } from '../../services/company-parameter.service';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-company-parameter-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './company-parameter-list.component.html',
  styleUrl: './company-parameter-list.component.scss'
})
export class CompanyParameterListComponent {

  searchText: string = '';
  list: any[] = [];
  Isedit = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  ngxUILoaderService = inject(NgxUiLoaderService);
  selectedCompanyId: string = '';
  selectedLogoFile: File | null = null;
  previewLogo: string = 'assets/Image/Logo/empower.jpeg';



  constructor(private Service: CompanyParameterService, private toastrService: ToastrService, private route: ActivatedRoute, private router: Router, public encryption: EncryptionService) { }
  ngOnInit(): void {

    this.getList();

    // Fetch all data on load

  }

  onPageChange(event: number) {
    this.pageIndex = event;
    this.getList();

  }
  //for filter the data 
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(res =>
      res.compcode?.toLowerCase().includes(searchTextLower) ||
      res.compname?.toLowerCase().includes(searchTextLower)


    );
  }


  // Fetch Perquisite Details
  getList() {
    this.ngxUILoaderService.start();
    this.Service.get_All_companyparameter(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) { // Ensure `res` is not undefined or null
          console.log('Data retrieved successfully:', res.data);
          this.list = res.data;
          this.totalItems = res.totalCount;

          // Load logos from backend for each company that has a logo
          this.list.forEach(item => {
            if (item.company_LogoPath) {
              this.loadImage(item.company_LogoPath);
            }
          });
        } else {
          console.error('Failed to retrieve data:', res.message);
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      }

    });
  }

  //download excel
  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = [
          // From saL_Company_Config
          'pk_companyId',
          'pf_percent',
          'pfmax_limit',
          'pension_limit',
          'ac1_percent',
          'ac10_percent',
          'ac2_percent',
          'ac21_percent',
          'ac22_percent',
          'esi_percent',
          'esi_emr_percent',
          'esimax_limit',
          'pf_applicable',
          'pfno',
          'dbfFile_Code',
          'dbfFile_Extn',
          'volpf_applicable',
          'esi_applicable',
          'esino',
          'esilocal_office',
          'pt_applicable',
          'pt_certno',
          'pto_circleno',
          'tds_applicable',
          'gratuity_applicable',
          'esi_roundoff',
          'bonuspercent',
          'bonusmaxlimit',
          'pf_roundoff',
          'lettersno',
          'isAutoEmpcode',
          'maxEmpcode',
          'prefixEmpcode',
          'fk_empid',
          'timestamp',

          // From common_Client_Details (everything except compcode, compname, address1, contactperson)
          'fk_companyId',
          'fk_softwareid',
          'fk_versionid',
          'fk_userpricerangeid',
          'fk_locpricerangeid',
          'fk_clientid',
          'creationdate',
          'email',
          'website',
          'faxno',
          'phone',
          'mobile',
          'regno',
          'staxno',
          'tanno',
          'address2',
          'noofUsers',
          'noofLocations',
          'validityfrom',
          'validityto',
          'complogo',
          'complogobyte',
          'active',
          'remarks',
          'pk_clientdetailid',
          'clientstatus',
          'payby',
          'userid',
          'password',
          'dbIP',
          'dbName',
          'dbUid',
          'dbPwd'
        ];
        const columnMappings: Record<string, string> = {
          cid: 'Sr. no.',
          compcode: 'Code.',
          compname: 'Company Name',
          address1: 'Address',
          contactperson: 'Contact Person',
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
        const fileName = 'Company_list.xlsx';
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

  // Navigate to Edit Page
  edit(pk_companyId: string) {
    this.router.navigate(["/dash/user/userdashboard/Compony-Parameter", pk_companyId]);
  }

  openLogoModal(item: any) {

    this.selectedCompanyId = item.pk_companyId;

    this.previewLogo =
      item.company_LogoPath && this.imageMap[item.company_LogoPath]
        ? this.imageMap[item.company_LogoPath]
        : 'assets/Image/Logo/empower.jpeg';

    this.selectedLogoFile = null;
  }

  onLogoSelected(event: any) {

    if (event.target.files.length > 0) {

      this.selectedLogoFile =
        event.target.files[0];

      const reader = new FileReader();

      reader.onload = (e: any) => {

        this.previewLogo =
          e.target.result;
      };

      reader.readAsDataURL(
        this.selectedLogoFile!
      );
    }
  }
  uploadLogo() {


    const formData = new FormData();

    formData.append(
      'CompanyId',
      this.selectedCompanyId
    );

    if (this.selectedLogoFile) {

      formData.append(
        'Logo',
        this.selectedLogoFile
      );
    }

    this.Service
      .uploadCompanyLogo(formData)
      .subscribe({
        next: (res) => {

          if (res.isSuccess) {

            this.toastrService.success(
              res.message
            );

            // Clear cached images so fresh logos are fetched
            this.imageMap = {};
            this.getList();

          }
          else {

            this.toastrService.error(
              res.message
            );
          }
        }
      });
  }




  imageMap: { [filename: string]: string } = {}; // filename -> base64 URL

  loadImage(filename: string) {
    if (this.imageMap[filename]) return; // Don't reload if already loaded

    this.Service.getImage(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageMap[filename] = reader.result as string;
        };
        reader.readAsDataURL(blob); // Convert blob to base64 image URL
      },
      error: (err) => {

      }
    });
  }


  

}