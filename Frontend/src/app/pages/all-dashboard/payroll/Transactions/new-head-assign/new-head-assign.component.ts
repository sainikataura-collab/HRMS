import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { QualificationDetailService } from '../../services/employeeQualification.service';
import { EmployeeService } from '../../services/employee.service';
import { HeadMasterService } from '../../services/headmaster.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';

@Component({
  selector: 'app-new-head-assign',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './new-head-assign.component.html',
  styleUrl: './new-head-assign.component.scss'
})
export class NewHeadAssignComponent {
EmployeeForm!: FormGroup;
  submitted=false;
  showEmployeeList: boolean = false;
  showError =false;
Isedit=false;
pageIndex: number = 1;
pageSize: number = 10;
totalItems: number = 0;
employees: { name: string, value: string }[] = [];
EmployeeList:any[]=[]
HeadList = [];
totalcount=0
  searchText:string="";

message:string="";

  constructor(
    private fb: FormBuilder,
    private  toastrService: ToastrService,
    private router: Router,
    private httpService: HeadMasterService,
    private commanService: ManualPunchBio,) {}

  ngOnInit() {
    this.EmployeeForm = this.fb.group({
      empCode: [''],
      fk_headid:['',[ Validators.required]],
      effectivedate:['',[ Validators.required]],
      overwrite:[''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      Fk_userid: [''],
      Fk_locid:['']
    });

    this.getHeadList();
  }    
  
  getHeadList() {
    this.commanService.getCommanList('head').subscribe({
      next: (res) => {
        this.HeadList = res.data
        console.log(this.HeadList);
      }
    })
  }
    // Handle filter updates from common search
    handleFilters(filters: any) {

      this.EmployeeForm.patchValue(filters);
    }

    filteredData() {
      if (!this.searchText) {
        return this.EmployeeList;
      }
      const searchTextLower = this.searchText.toLowerCase();
      return this.EmployeeList.filter(res =>
        res.empcode?.toLowerCase().includes(searchTextLower)||
        res.empname?.toLowerCase().includes(searchTextLower),
        
       
      );
    }

  OnVeiw(){
    this.submitted = true;
    if (this. EmployeeForm.invalid) {
      this.showError = true;
     
       return;
    }

  const payload=this.EmployeeForm.value
  

  Object.keys(payload).forEach(key=>{
    if(payload[key]===null){
     payload[key]='';
  }
  })

    this.httpService.get_Head_Employees(this.pageIndex - 1, this.pageSize,payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data;
          this.showEmployeeList = true
          this.totalcount=res.totalCount;
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


  //------------update
   //user=localStorage.getItem('fk_UserID')
   //loc=localStorage.getItem('locationID')
  update() {
    
    debugger
  
    const payload=this.EmployeeForm.value
    // const fk_headid = this.EmployeeForm.value.fk_headid; // your selected HeadId
    // const effectivedate = this.EmployeeForm.value.effectivedate;
    // const overwrite = this.EmployeeForm.value.overwrite;
    Object.keys(payload).forEach(key=>{
      if(payload[key]===null){
       payload[key]='';
    }
    })
    this.httpService.Update_HeadAssign(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
        //  this.EmployeeList = res.data;
          this.showEmployeeList = true
        this.toastrService.success(res.message);
        } else {
        this.toastrService.error(res);
        }
      },
      error: (error) => {
      //  this.employees = [];
        this.toastrService.error('Failed to retrieve employees', error);
      }
    });
 }
  
  

  //--------end

  onpageChange(event:number)
  {this.pageIndex=event;
    this.OnVeiw()

  }

   }



