import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-all-quarter',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './all-quarter.component.html',
  styleUrl: './all-quarter.component.scss'
})
export class AllQuarterComponent {

  router=Inject(Router)
  // Static data for the table
  QuarterList = [
    { id: 1, financialYear: '2023-2024', quarter: 'Q1', endDate: '2024-06-30' },
    { id: 2, financialYear: '2023-2024', quarter: 'Q2', endDate: '2024-09-30' },
    { id: 3, financialYear: '2023-2024', quarter: 'Q3', endDate: '2024-12-31' },
    { id: 4, financialYear: '2023-2024', quarter: 'Q4', endDate: '2025-03-31' }
  ];

  // Delete function
  deleteBank(id: number) {
    this.QuarterList = this.QuarterList.filter(bank => bank.id !== id);
  }

}
