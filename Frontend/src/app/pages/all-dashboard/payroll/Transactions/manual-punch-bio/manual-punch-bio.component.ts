import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { QualificationDetailService } from '../../services/employeeQualification.service';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';

@Component({
  selector: 'app-manual-punch-bio',
  standalone: true,
  imports: [NgSelectComponent, CommonModule, FormsModule, NgxPaginationModule, ReactiveFormsModule, CommonSearchComponent, NgxMaterialTimepickerModule],
  templateUrl: './manual-punch-bio.component.html',
  styleUrl: './manual-punch-bio.component.scss'
})
export class ManualPunchBioComponent {
  manualpunchForm!: FormGroup;
  showError = false;
  submitted = false;
  presentCount = 0;
  absentCount = 0;
  mpCount = 0;
  hdCount = 0;
  woCount = 0;
  totalLeave = 0;
  id!: number;
  totalWorkHoursFormatted: string = '00h 00m';
  totalOTHoursFormatted: string = '00h 00m';
  Isedit = false;
  showAttendanceList = false;
  manualList: any[] = [];
  months = [];
  empCode = [];
  years = [];
  employees: { name: string, value: string }[] = [];
  pk_inoutid: string = '';
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
    empStatus: ''
  };
  constructor(
    private fb: FormBuilder,
    private httpservice: ManualPunchBio,
    private qualificationService: QualificationDetailService,
    private toastrService: ToastrService,
    private router: Router
  ) { }
  ngOnInit() {
    this.manualpunchForm = this.fb.group({
      pk_inoutid: [null],
      month: [null, [Validators.required]],
      year: [null, [Validators.required]],
      dated: [''],
      inDate: [''],
      outDate: [''],
      daystatus: [''],
      empname: [''],
      EmployeeCode: [null, [Validators.required]],
      flag: [null],
    });
    this.getMonthsList();
    this.getyearsList();
    // this.getEmpCodeList();
    this.getEmployees();
  }
  getMonthsList() {
    this.httpservice.getCommanList('month').subscribe({
      next: (res) => {
        this.months = res.data
      }
    })
  }
  getyearsList() {
    this.httpservice.getCommanList('Year').subscribe({
      next: (res) => {
        this.years = res.data
      }
    })
  }
  // getEmpCodeList() {
  //   this.httpservice.getCommanList('Employee').subscribe({
  //     next: (res) => {
  //       this.empCode = res.data
  //     }
  //   })

  // }
  // Handle filter updates from common search
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }
  getEmployees(): void {
    this.qualificationService.getEmpList(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // this.employeeList = res.data;
          this.employees = res.data.map((emplyeedata: any) => ({
            name: emplyeedata.name,
            value: emplyeedata.value
          }));
        } else {
          this.employees = [];
        }
      },
      error: (error) => {
        this.employees = [];
        this.toastrService.error('Failed to retrieve employees', error);
      }
    });
  }

  isUpdate(pk_inoutid: string) {
    this.Isedit = true;
    this.pk_inoutid = pk_inoutid;
    this.getInOutByid(this.pk_inoutid);
  }

  // 
  showModal = false;
  selectedImage: string | null = null;

  openImage(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedImage = null;
  }

  resetForm(): void {
    this.manualpunchForm.reset();
    this.manualList = []
    this.presentCount = 0;
    this.absentCount = 0;
    this.mpCount = 0;
    this.hdCount = 0;
    this.woCount = 0;
    this.totalLeave = 0;
    this.totalWorkHoursFormatted = '00h 00m';
    this.totalOTHoursFormatted = '00h 00m'

  }

  // 
  getInOutByid(pk_inoutid: string) {
    this.Isedit = true
    this.httpservice.getInOut_Byid(pk_inoutid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.manualpunchForm.patchValue({
            dated: res.data.dated,
            daystatus: res.data.daystatus,
            outDate: res.data.outDate,
            inDate: res.data.inDate,
            empname: res.data.empname,
            EmployeeCode: res.data.empcode
          });
        } else {
          this.toastrService.error("Failed to load Category details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading Category data.");
      }
    });
  }
  onSubmit() {
    this.submitted = true;
    if (this.manualpunchForm.invalid) {
      this.showError = true;
      return;
    }
    const month = this.manualpunchForm.value.month;
    const year = this.manualpunchForm.value.year;
    const EmployeeCode = this.manualpunchForm.value.EmployeeCode;
    this.httpservice.get_Manual_Details(EmployeeCode, month, year).subscribe({
      next: (res) => {
        this.manualList = res.data.data;
        this.showAttendanceList = true
        this.totalLeave = res.data.count;
        this.presentCount = this.manualList.filter(x => x.daystatus === 'P').length;
        this.absentCount = this.manualList.filter(x => x.daystatus === 'A').length;
        this.mpCount = this.manualList.filter(x => x.daystatus === 'MP').length;
        this.hdCount = this.manualList.filter(x => x.daystatus === 'HD').length;
        this.woCount = this.manualList.filter(x => x.daystatus === 'WO').length;

        // Total Working Hours calculation
        let totalWorkMinutes = 0;
        let totalOTMinutes = 0;
        this.manualList.forEach(item => {
          // Work Hours
          if (item.workhour && item.workhour.includes(':')) {
            const [whHrs, whMins] = item.workhour.split(':').map(Number);
            if (!isNaN(whHrs) && !isNaN(whMins)) {
              totalWorkMinutes += whHrs * 60 + whMins;
            }
          }
          // OT Hours
          if (item.oThour && item.oThour.includes(':')) {
            const [otHrs, otMins] = item.oThour.split(':').map(Number);
            if (!isNaN(otHrs) && !isNaN(otMins)) {
              totalOTMinutes += otHrs * 60 + otMins;
            }
          }
        });
        const workHrs = Math.floor(totalWorkMinutes / 60);
        const workMins = totalWorkMinutes % 60;
        this.totalWorkHoursFormatted = `${workHrs}h ${workMins}m`;

        const otHrs = Math.floor(totalOTMinutes / 60);
        const otMins = totalOTMinutes % 60;
        this.totalOTHoursFormatted = `${otHrs}h ${otMins}m`;
      },
      error: (err) => {
        this.toastrService.error(err)
      }
    });
  }

}
