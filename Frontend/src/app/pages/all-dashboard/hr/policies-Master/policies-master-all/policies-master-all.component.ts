import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-policies-master-all',
  standalone: true,
  imports: [RouterLink,NgxPaginationModule,CommonModule],
  templateUrl: './policies-master-all.component.html',
  styleUrl: './policies-master-all.component.scss'
})
export class PoliciesMasterAllComponent {

  router=Inject(Router)
    
  
  ProgramDetails =[
        { id: 1, srNo: 1, cp: 'HR', active: true },
        { id: 2, srNo: 2, cp: 'IT', active: false },
        { id: 3, srNo: 3, cp: 'Sales', active: true },
        { id: 4, srNo: 4, cp: 'Marketing', active: true },
        { id: 5, srNo: 5, cp: 'Finance', active: false },
        { id: 6, srNo: 6, cp: 'Admin', active: true }
      ];
  
      totalItems = this.ProgramDetails.length;
      pageSize = 3; // Default 3 items per page
      page = 1; // Default page number
    
     // for pagination
     onPageChange(event: number): void {
      this.page = event;
    }
}
