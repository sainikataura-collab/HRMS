import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-masterlist',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,NgxPaginationModule,CommonModule],
  templateUrl: './masterlist.component.html',
  styleUrl: './masterlist.component.scss'
})
export class MasterlistComponent {
  departmentForm!:FormGroup;
  router=inject(Router)
  weekOffData = [
    {srNo: 1, location: 'Ahemdabad', sun: false, mon: true,tue: true, wed: true,thu: true, fri: true,sat: true,action: 'Edit'},
    {srNo: 2, location: 'Alwar', sun: false, mon: true,tue: true, wed: false,thu: true, fri: true,sat:false,action: 'Edit'}

  ]
  totalItems = this.weekOffData.length;
  pageSize = 1; // Default 3 items per page
  page = 1; // Default page number
  constructor(private  fb:FormBuilder,private http:HttpClient){}

  ngOnInit():void{

  }

  deleteWeekOff(id: number) {
   const index = this.weekOffData.findIndex(item => item.srNo === id);
   if (index !== -1) {
     this.weekOffData.splice(index, 1);
     this.totalItems = this.weekOffData.length; // Update totalItems for pagination
   }
 }
  // for pagination
onPageChange(event: number): void {
 this.page = event;
  }

}
