import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-lockunlockflexihead-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './lockunlockflexihead-list.component.html',
  styleUrl: './lockunlockflexihead-list.component.scss'
})
export class LockunlockflexiheadListComponent {
  LockunlockflexiheadList = [
    { id: 1, FinancialYear: 'Uttar Pradesh', Quarter: '2000', EndDated: "01/12/20024"},
    { id: 2, FinancialYear: 'Uttar Pradesh', Quarter: '2000', EndDated: "01/12/20024" },
    { id: 3, FinancialYear: 'Uttar Pradesh', Quarter: '2000', EndDated: "01/12/20024" },
    { id: 4,FinancialYear: 'Uttar Pradesh', Quarter: '2000', EndDated: "01/12/20024"}
  ]; 
  constructor(private router: Router) {}

  ngOnInit(): void {
   
  }

  delete(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this Lockunlockflexihead?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.LockunlockflexiheadList.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.LockunlockflexiheadList.splice(index, 1); 
        console.log('Lockunlockflexihead deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('Lockunlockflexihead deletion cancelled');
    }
  }
  

  edit(id: number) {
    this.router.navigate(['/dash/payroll/payrolldashboard/Editlockunlockflexihead',id]);
  }
}
