import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeparationRequestService } from '../../../all-employee/emp-exit/Services/Emp_resignation.service';

@Component({
  selector: 'app-relieving-letter',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './relieving-letter.component.html',
  styleUrl: './relieving-letter.component.scss'
})
export class RelievingLetterComponent implements OnInit {
  companyName = '';
  companyAddress = '';
  today = new Date();

  empData: any = {};

  constructor(
    private route: ActivatedRoute,
    private separationRequestService: SeparationRequestService
  ) { }

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

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
          }

        }
      });

  }

  printLetter(): void {
    const content = document.getElementById('letterContent')?.innerHTML;
    const win = window.open('', '_blank');
    win?.document.write(`<html><body style="font-family:'Times New Roman'">${content}</body></html>`);
    win?.document.close();
    win?.print();
  }
}
