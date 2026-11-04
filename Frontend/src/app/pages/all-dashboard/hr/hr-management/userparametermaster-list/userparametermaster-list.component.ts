import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-userparametermaster-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './userparametermaster-list.component.html',
  styleUrl: './userparametermaster-list.component.scss'
})
export class UserparametermasterListComponent {
  UserparametermasterList = [
    { id: 1,Department: '	Reporting Manager',EmployeeCode	: '1',EmployeeName:"rojan" ,Remarks:"ok",IsActive	 :"true"},
    { id: 2,Department: '	Reporting Manager',EmployeeCode	: '1',EmployeeName:"rojan" ,Remarks:"ok",IsActive	 :"true"},
    { id: 3,Department: '	Reporting Manager',EmployeeCode	: '1',EmployeeName:"rojan" ,Remarks:"ok",IsActive	 :"true"},
    { id: 4,Department: '	Reporting Manager',EmployeeCode	: '1',EmployeeName:"rojan" ,Remarks:"ok",IsActive	 :"true"} ]; 
  constructor(private router: Router) {}

  ngOnInit(): void {
   
  }

  delete(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this Userparametermaster?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.UserparametermasterList.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.UserparametermasterList.splice(index, 1); 
        console.log('Userparametermaster deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('Userparametermaster deletion cancelled');
    }
  }
  

  edit(id: number) {
    this.router.navigate(['/dash/hr/hrdashboard/Edit_ClearanceDepartment_User',id]);
  }
}
