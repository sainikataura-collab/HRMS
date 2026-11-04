import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirmationattributemaster-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule],

  templateUrl: './confirmationattributemaster-list.component.html',
  styleUrl: './confirmationattributemaster-list.component.scss'
})
export class ConfirmationattributemasterListComponent {
  ConfirmationattributemasterList = [
    { id: 1,Description: '	Reporting Manager',Disorder	: '1',Active:"yes"},
    { id: 2, Description: '	Reporting Manager',Disorder	: '1',Active:"yes"},
    { id: 3,Description: '	Reporting Manager',Disorder	: '1',Active:"yes"},
    { id: 4,Description: '	Reporting Manager',Disorder	: '1',Active:"yes"} ]; 
  constructor(private router: Router) {}

  ngOnInit(): void {
   
  }

  delete(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this Confirmationattributemaster?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.ConfirmationattributemasterList.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.ConfirmationattributemasterList.splice(index, 1); 
        console.log('Confirmationattributemaster deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('Confirmationattributemaster deletion cancelled');
    }
  }
  

  edit(id: number) {
    this.router.navigate(['/dash/hr/hrdashboard/Edit-Confirmation-Attribute-Master',id]);
  }
}
