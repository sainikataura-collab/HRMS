import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dueclearencemaster-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './dueclearencemaster-list.component.html',
  styleUrl: './dueclearencemaster-list.component.scss'
})
export class DueclearencemasterListComponent {
  DueclearencemasterList = [
    { id: 1,Department: '	Reporting Manager',OrderNumber	: '1',IsActive	 :"true"},
    { id: 2, Department: '	Reporting Manager',OrderNumber	: '1',IsActive	 :"true" },
    { id: 3,Department: '	Reporting Manager',OrderNumber	: '1',IsActive	 :"true" },
    { id: 4,Department: '	Reporting Manager',OrderNumber	: '1',IsActive	 :"true"} ]; 


    ParametersList = [
      { id: 1,Description: '	Reporting Manager',OrderNumber	: '1',InputType:"yes", IsActive	 :"true"},
      { id: 2, Description: '	Reporting Manager',OrderNumber	: '1',InputType:"yes",IsActive	 :"true" },
      { id: 3,Description: '	Reporting Manager',OrderNumber	: '1',InputType:"yes",IsActive	 :"true" },
      { id: 4,Description: '	Reporting Manager',OrderNumber	: '1',InputType:"yes",IsActive	 :"true"} ]; 
  constructor(private router: Router) {}

  ngOnInit(): void {
   
  }

  delete(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this Dueclearencemaster?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.DueclearencemasterList.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.DueclearencemasterList.splice(index, 1); 
        console.log('Dueclearencemaster deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('Dueclearencemaster deletion cancelled');
    }
  }
  
  delete1(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this Parameters?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.ParametersList.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.ParametersList.splice(index, 1); 
        console.log('Parameters deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('Parameters deletion cancelled');
    }
  }
  edit(id: number) {
    this.router.navigate(['/dash/hr/hrdashboard/Edit_Due_Clearence',id]);
  }
}
