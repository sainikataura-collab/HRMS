import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-budgetissuemaster-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './budgetissuemaster-list.component.html',
  styleUrl: './budgetissuemaster-list.component.scss'
})
export class BudgetissuemasterListComponent {
  BudgetissuemasterList = [
    { id: 1,FinancialYear: '	Reporting Manager',CardType: '1',QuarterDec :"ABCD Card",ProjectedAmount:"Shabash Card",IssuedAmount:"Welldone Card"},
    { id: 2, FinancialYear: '	Reporting Manager',CardType: '1',QuarterDec :"ABCD Card",ProjectedAmount:"Shabash Card",IssuedAmount:"Welldone Card" },
    { id: 3,FinancialYear: '	Reporting Manager',CardType: '1',QuarterDec :"ABCD Card",ProjectedAmount:"Shabash Card",IssuedAmount:"Welldone Card"  },
    { id: 4,FinancialYear: '	Reporting Manager',CardType: '1',QuarterDec :"ABCD Card",ProjectedAmount:"Shabash Card",IssuedAmount:"Welldone Card" }
  ]; 
  constructor(private router: Router) {}

  ngOnInit(): void {
   
  }

  delete(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this Budgetissuemaster?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.BudgetissuemasterList.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.BudgetissuemasterList.splice(index, 1); 
        console.log('Budgetissuemaster deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('Budgetissuemaster deletion cancelled');
    }
  }
  

  edit(id: number) {
    this.router.navigate(['/dash/hr/hrdashboard/Edit_CRD_BudgetIssue_Mst',id]);
  }
}
