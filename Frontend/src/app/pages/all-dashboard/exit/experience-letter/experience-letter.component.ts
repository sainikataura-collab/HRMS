import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeparationRequestService } from '../../../all-employee/emp-exit/Services/Emp_resignation.service';

@Component({
  selector: 'app-experience-letter',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './experience-letter.component.html',
  styleUrl: './experience-letter.component.scss'
})
export class ExperienceLetterComponent implements OnInit {
  companyName = '';
  companyAddress = '';
  today = new Date();
  tenure = '';

  empData: any = {};

  constructor(
    private route: ActivatedRoute,
    private separationRequestService: SeparationRequestService
  ) { }

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id'));

    this.separationRequestService
      .getLetterData(id)
      .subscribe({
        next: (res: any) => {

          if (res.isSuccess) {

            this.empData = {
              empCode: res.data.employeeCode,
              empName: res.data.employeeName,
              designation: res.data.designation,
              department: res.data.department,
              joiningDate: res.data.dateOfJoining,
              lwd: res.data.expectedLWD
            };

            this.companyName = res.data.companyName;
            this.companyAddress = res.data.companyAddress;
            this.calculateTenure();

          }

        }
      });
  }


  calculateTenure() {

    const joining = new Date(this.empData.joiningDate);

    const lwd = new Date(this.empData.lwd);

    const months =
      (lwd.getFullYear() - joining.getFullYear()) * 12 +
      (lwd.getMonth() - joining.getMonth());

    const years = Math.floor(months / 12);

    const rem = months % 12;

    this.tenure =
      `${years} Year${years != 1 ? 's' : ''} ${rem} Month${rem != 1 ? 's' : ''}`;

  }

  printLetter(): void {
    const content = document.getElementById('expLetterContent')?.innerHTML;
    const win = window.open('', '_blank');
    win?.document.write(`<html><body style="font-family:'Times New Roman'">${content}</body></html>`);
    win?.document.close();
    win?.print();
  }
}
