import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { EmpweekoffmasterService } from '../../../payroll/services/empweekoffmaster.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-employee-weekly-off-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    RouterLink,
    CommonSearchComponent,
  ],
  templateUrl: './employee-weekly-off-master.component.html',
  styleUrl: './employee-weekly-off-master.component.scss',
})
export class EmployeeWeeklyOffMasterComponent implements OnInit {
  departmentForm!: FormGroup;
  router = inject(Router);
  isEditMode: boolean = false;
  weeklyOffId: string | null = null;
  EmployeeList: { name: string; value: string }[] = [];
  searchText: string = '';
  showError = false;
  pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;
  weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private empweekoffmasterService: EmpweekoffmasterService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private ngxUiLoaderService: NgxUiLoaderService,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    // Initialize the form group
    this.departmentForm = this.fb.group({
      SelectEmployeeType: [null, Validators.required], // Single employee selection
      sun: [''],
      mon: [''],
      tue: [''],
      wed: [''],
      thur: [''],
      fri: [''],
      sat: [''],
      offDays: this.fb.array(
        this.weekDays.map(() =>
          this.fb.array([
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
          ])
        ) // 5 checkboxes for each day
      ),
    });

    this.getEmployees();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('fk_empid');
      if (id) {
        this.isEditMode = true;
        //this.weeklyOffId = id.toString() ;
        this.weeklyOffId = this.encryptionService.decryptText(id.toString());

        this.loadWeeklyOffData(this.weeklyOffId);
        this.departmentForm.controls['SelectEmployeeType'].disable();
      } else {
        this.isEditMode = false;
        this.departmentForm.controls['SelectEmployeeType'].enable();
      }
    });
  }



  loadWeeklyOffData(id: string) {
    this.empweekoffmasterService.getEmpWeeklyOffById(id).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          const data = response.data;

          // Convert binary string to checkbox array
          const parseDays = (binaryStr: string) =>
            binaryStr.split('').map((char) => char === '1');

          this.departmentForm.patchValue({
            SelectEmployeeType: data.fk_empid,
            sun: data.sun,
            mon: data.mon,
            tue: data.tue,
            wed: data.wed,
            thur: data.thur,
            fri: data.fri,
            sat: data.sat,
          });

          // Patch checkbox values
          this.offDaysArray.controls.forEach((dayArray, index) => {
            const formArray = dayArray as FormArray;
            const binaryString = [
              data.mon,
              data.tue,
              data.wed,
              data.thur,
              data.fri,
              data.sat,
              data.sun,
            ][index];

            parseDays(binaryString).forEach((checked, i) => {
              formArray.controls[i].setValue(checked);
            });
          });
        }
      },
      error: (err) => {
        this.toastrService.error('Error fetching weekly off data.');
      },
    });
  }

  get offDaysArray(): FormArray {
    return this.departmentForm.get('offDays') as FormArray;
  }

  getDayArray(i: number): FormArray {
    return this.offDaysArray.at(i) as FormArray;
  }

  getCheckboxControl(i: number, n: number): FormControl {
    return this.getDayArray(i).at(n) as FormControl;
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.showError = true;
      return;
    }

    const formValue = this.departmentForm.value;
    const offDaysArray = this.offDaysArray.value;

    // Construct the weekly off data for a single employee
    const weeklyOffData = {
      mon: offDaysArray[0]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      tue: offDaysArray[1]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      wed: offDaysArray[2]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      thur: offDaysArray[3]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      fri: offDaysArray[4]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      sat: offDaysArray[5]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      sun: offDaysArray[6]
        .map((checked: boolean) => (checked ? '1' : '0'))
        .join(''),
      fk_empid: formValue.SelectEmployeeType,
    };

    // Wrap the data in an object with empWeekOffMstList property as a list
    const payload = [weeklyOffData];

    if (this.isEditMode && this.weeklyOffId) {
      // For update, assuming the API still expects a list
      this.empweekoffmasterService
        .updateEmpWeeklyOff({ ...payload[0], fk_empid: this.weeklyOffId })
        .subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success(
                response.message || 'Weekly off updated successfully!'
              );
              this.router.navigate([
                '/dash/adminAttendance/adminAttendancedashboard/EmployeeWeeklyOffMaster_list',
              ]);
            } else {
              this.toastrService.error(
                response.message || 'Error updating weekly off data.'
              );
            }
          },
          error: (err) => {
            this.toastrService.error('Something went wrong while updating');
            console.error('Update Error:', err);
          },
        });
    } else {
      // For save
      this.empweekoffmasterService
        .submitEmpweekoffmasterData(payload)
        .subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.toastrService.success(
                response.message || 'Weekly off added successfully!'
              );
              this.router.navigate([
                '/dash/adminAttendance/adminAttendancedashboard/EmployeeWeeklyOffMaster_list',
              ]);
            } else {
              this.toastrService.error(
                response.message || 'Error saving weekly off data.'
              );
            }
          },
          error: (err) => {
            this.toastrService.error('Something went wrong while saving');
            console.error('Save Error:', err);
          },
        });
    }
  }

  resetForm(): void {
    this.departmentForm.reset();
    this.offDaysArray.controls.forEach((dayArray) => {
      const formArray = dayArray as FormArray;
      formArray.controls.forEach((control) => control.setValue(false));
    });
  }

  view(): void {
    this.router.navigateByUrl(
      '/dash/adminAttendance/adminAttendancedashboard/EmployeeWeeklyOffMaster_list'
    );
  }

  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }
// comment for top 100
  // getEmployees(): void {
  //   this.empweekoffmasterService
  //     .get_Employees_Ddl(this.employeeFilters)
  //     .subscribe({
  //       next: (res) => {
  //         if (res.isSuccess) {
  //           // this.employeeList = res.data;
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

  getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.empweekoffmasterService
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

