import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, } from '@angular/forms';
import { PayrollOrganizationService } from '../../../all-dashboard/payroll/services/payroll-organization.service';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';



@Component({
  selector: 'app-emp-organization',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, RouterLink],
  templateUrl: './emp-organization.component.html',
  styleUrl: './emp-organization.component.scss'
})
export class EmpOrganizationComponent {

  head: any[] = [];
  manager: any[] = [];
  team: any[] = [];
  visibleTeam: any[] = [];


  salaryDisbursement = [

    {
      title: 'Vishal Maurya',
      designation: 'Payroll Control Office (PCO)',
      image: 'assets/Image/profile_images.png',

      manager: {
        managers: [
          {
            name: 'Payroll Head Officer (PHO)',
            description: 'Vishal Maurya ',
            icon: 'fas fa-user-tie',
            image: 'assets/Image/profile_images.png',
          }
        ],

        subordinates: [
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },
          { name: 'Vishal Maurya', icon: '', description: 'Pco Head Operation' },






        ]
      }
    },


  ];




  constructor(private payrollOrgService: PayrollOrganizationService) { }



  ngOnInit(): void {
    this.getemployeeChart();
  }



  getemployeeChart() {
    this.payrollOrgService.getById_OrganizationChart('').subscribe({
      next: (response: any) => {
        if (response.isSuccess && response.data) {
          this.head = response.data.head ? [...response.data.head] : [];
          this.manager = response.data.manager ? [...response.data.manager] : [];
          this.team = response.data.team ? response.data.team.filter((emp: any) => emp !== null && emp !== undefined).map((emp: any) => ({
            empname: emp.empname || '',
            department: emp.department || '',
            icon: emp.icon || 'fas fa-user'
          })) : [];
          this.updateVisibleTeam();
        } else {
          this.head = [];
          this.manager = [];
          this.team = [];
          this.visibleTeam = [];
        }
      },
      error: () => {
        this.head = [];
        this.manager = [];
        this.team = [];
        this.visibleTeam = [];
      }
    });
  }





  // -------------------------------------------------------------


  isExpanded: { [key: string]: boolean } = {};
  // PayrollOrganizationService: any;
  toastrService: any;





  updateVisibleTeam() {
    const isExpanded = this.isExpanded['phase-0'];
    this.visibleTeam = isExpanded ? this.team : this.team.slice(0, 6);
  }

  getVisibleSubordinates(phase: any, index: number, team?: any[]) {
    const key = `phase-${index}`;
    const subordinates = team || [];
    return this.isExpanded[key] ? subordinates : subordinates.slice(0, 6);
  }

  expandSubordinates(title: string) {
    this.isExpanded[title] = true;
    this.updateVisibleTeam();
    setTimeout(() => {
      const container = document.querySelector(`[data-title='${title}']`);
      if (container && typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  collapseSubordinates(title: string) {
    this.isExpanded[title] = false;
    this.updateVisibleTeam();
    setTimeout(() => {
      const container = document.querySelector(`[data-title='${title}']`);
      if (container && typeof container.scrollTo === 'function') {
        container.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  // end chart ts


}





