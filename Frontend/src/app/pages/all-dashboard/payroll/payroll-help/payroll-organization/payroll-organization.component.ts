import { CommonModule } from '@angular/common';
import {  Component } from '@angular/core';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PayrollOrganizationService } from '../../services/payroll-organization.service';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-payroll-organization',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    RouterLink,
    CommonSearchComponent,],
  templateUrl: './payroll-organization.component.html',
  styleUrl: './payroll-organization.component.scss'
})
export class PayrollOrganizationComponent {

  organizationForm!: FormGroup;
  EmployeeList: { name: string; value: string }[] = [];
  selectedEmployee: any = null;
  selectedMessage: string = '';
  selectedEmployeeData: any = null;


  head: any[] = [];
  manager: any[] = [];
  team: any[] = [];
  visibleTeam: any[] = [];

   pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;
  
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

  // Default filter structure
  employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    userId: '',
    empStatus: '',
      search: '',
    pageNo: 1,
    pageSizes: 100

  };


  constructor(private payrollOrgService: PayrollOrganizationService, private fb: FormBuilder) { }



  ngOnInit(): void {
    this.organizationForm = this.fb.group({
      SelectEmployeeType: [null]
    });
   // this.getEmployees();
  }


  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }

  // getEmployees(): void {
  //   this.payrollOrgService
  //     .get_Employees_Ddl(this.employeeFilters).subscribe({
  //       next: (res) => {
  //         if (res.isSuccess) {

  //           this.EmployeeList = res.data.map((emp: any) => ({
  //             name: emp.name,
  //             value: emp.value,
  //           }));
  //         } else {
  //           this.EmployeeList = [];

  //           this.toastrService.error(res.message, 'Error');
  //         }
  //       },
  //       error: (error) => {
  //         this.EmployeeList = [];

  //         this.toastrService.error('Failed to retrieve employees', 'Error');
  //       },
  //     });
  // }



 onEmployeeChange(selectedEmployee: any): void {
    if (selectedEmployee) {
      const pk_empid = selectedEmployee.value;
      this.selectedEmployeeData = selectedEmployee;
  
      // Call API
      this.payrollOrgService.getById_OrganizationChart(pk_empid).subscribe({
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
    } else {
      this.selectedEmployeeData = null;
      this.head = [];
      this.manager = [];
      this.team = [];
      this.visibleTeam = [];
    }
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


   getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.payrollOrgService
      .get_Employees_Ddl(this.employeeFilters)
      .subscribe({

        next: (res) => {


          if (res.isSuccess) {

            this.EmployeeList =
              res.data.map((emp: any) => ({

                name: emp.name,

                value: emp.value

              }));

            if (!this.currentSearch) {

              this.initialEmployeeList =
                [
                  ...this.EmployeeList
                ];

            }
          }

          this.loadingEmployees = false;

        },

        error: () => {

          this.loadingEmployees = false;

          this.EmployeeList = [];

        }

      });

  }

  onEmployeeSearch(event: any) {

    const search =
      (event.term || '')
        .trim()
        .toLowerCase();

    clearTimeout(
      this.searchTimer
    );

    // blank
    if (!search) {
      this.EmployeeList =
        [
          ...this.initialEmployeeList
        ];

         this.loadingEmployees = false;
      return;

    }

    // local check
    const local =
      this.initialEmployeeList
        .filter(x =>

          x.name
            .toLowerCase()
            .includes(search)

        );

    if (local.length > 0) {

      this.EmployeeList =
        local;
      this.loadingEmployees = false;
      return;

    }

    // not found
      this.loadingEmployees = true;
    this.searchTimer =
      setTimeout(() => {
        this.currentSearch = search;
        this.pageNo = 1;
        this.getEmployees();

      }, 100);

  }

}




