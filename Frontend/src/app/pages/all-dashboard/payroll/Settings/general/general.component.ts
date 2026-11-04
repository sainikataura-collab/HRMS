import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule, RouterOutlet],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent {
  isInsertRoute = false;
  GeneralMaster: any[] = [];
  searchText: string = '';
  pageSize: number = 10;
  pageNumber: number = 1;
  totalItems: number = 0;
  permissions: any;
  pageSizeOptions = [5, 10, 20, 50]; //Add Anj

  route = inject(ActivatedRoute);

  constructor(private router: Router, private generalService: GeneralService
  ) { }

  ngOnInit(): void {


    this.getAllGeneral()


  }




  isChildRouteActive(): boolean {
    return this.route.children.length > 0;
  }

  //Add Anj
  filteredMaster: any[] = [];

  onPageSizeChange() {                 // ✅ ADD THIS
    this.pageNumber = 1;
    this.getAllGeneral();
  }

  onPageChange(pageNumber: number) {
    this.pageNumber = pageNumber;

    this.getAllGeneral()
  }

  getAllGeneral() {
    this.generalService.getAllGeneral(this.pageNumber, this.pageSize).subscribe(res => {
      if (res.isSuccess) {
        this.GeneralMaster = res.data;
        this.totalItems = res.totalCount;
        this.applyFilter();
      }
    });
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredMaster = this.GeneralMaster;
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredMaster = this.GeneralMaster.filter(req =>
      req.codeDescription?.toLowerCase().includes(searchLower) ||
      req.codeType?.toLowerCase().includes(searchLower) ||
      req.usedIn?.toLowerCase().includes(searchLower)
    );
  }


  // filteredData() {
  //   if (!this.searchText) {
  //     return this.GeneralMaster;
  //   }
  //   const searchTextLower = this.searchText.toLowerCase();
  //   return this.GeneralMaster.filter(g =>
  //     g.codeDescription.toLowerCase().includes(searchTextLower) ||
  //     g.codeType.toLowerCase().includes(searchTextLower) ||
  //     g.usedIn.toLowerCase().includes(searchTextLower) 
  //   );
  // }


  filteredData() {
    if (!this.searchText) return this.GeneralMaster;

    const searchLower = this.searchText.toLowerCase();
    return this.GeneralMaster.filter(req =>
      req.codeDescription?.toLowerCase().includes(searchLower) ||
      req.codeType?.toLowerCase().includes(searchLower) ||
      req.usedIn?.toLowerCase().includes(searchLower)
    );
  }

  Inert(codeTypeId: string, codeType: string, isCodeRequired: boolean) {

    this.router.navigate(['dash/user/userdashboard/insert'], {
      queryParams: { codeTypeId: codeTypeId, codeType: codeType, isCodeRequired: isCodeRequired }
    });
  }

  viewDetails(codeTypeId: string, codeType: string) {
    this.router.navigate(['dash/user/userdashboard/general/list/', codeTypeId], { queryParams: { codeType: codeType } });
  }

}
