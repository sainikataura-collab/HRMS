import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { DemographicService } from '../../../payroll/services/demographic.service';
import { EmployeeFactBoxComponent } from '../../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-demographi-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, RouterLink, EmployeeFactBoxComponent],
  templateUrl: './demographi-details.component.html',
  styleUrl: './demographi-details.component.scss'
})
export class DemographicDetailsComponent implements OnInit {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }
  currentStep: number = 5;
  EmployeeMasterForm!: FormGroup;
  familyMemberForm!: FormGroup;
  fk_empid: string = '';
  EmployeeList: { name: string; value: string }[] = [];
  Religion: { label: string, value: string }[]  = []; 
  bloodGroups: { label: string, value: string }[]  = []; 
  category: { label: string, value: string }[]  = []; 
  isEditMode: boolean = false;
  isFromEmployeeMaster: boolean = false;
  fromSource: string = '';
  route = inject(ActivatedRoute);
  showerror = false;
  shwerrForfamilydetails = false;

  // Dropdown options
  genders = [
    { name: 'Male', value: 'M' },
    { name: 'Female', value: 'F' },
    { name: 'Other', value: 'O' }
  ];

  maritalStatuses = [
    { name: '-- Select Marital Status --', value: '' },
    { name: 'Single', value: 'S' },
    { name: 'Married', value: 'M' },
    { name: 'UnMarried', value: 'U' }
  ];
  Relation = [
    { name: '-- Select Relation --', value: '' },
    { name: 'Brother', value: 'Brother' },
    { name: 'Sister', value: 'Sister' },
    { name: 'Father', value: 'Father' },
    { name: 'Mother', value: 'Mother' },
    { name: 'Daughter', value: 'Daughter' },
    { name: 'Uncle', value: 'Uncle' },
    { name: 'Cousin', value: 'Cousin' }
  ];




  paymentModes = [
    { name: '-- Select Paymode --', value: '' },
    { name: 'Cash', value: 'C' },
    { name: 'Bank Transfer', value: 'B' },
    { name: 'Cheque', value: 'Q' }
  ];
  
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
  };


  recruitmentModes: { name: string; value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private encryptService : EncryptionService,
    private demographicService: DemographicService,
    private ngxUILoaderService:NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.fromSource = this.route.snapshot.queryParamMap.get('from') || '';
    this.isFromEmployeeMaster = this.fromSource === 'employee_list' || this.route.snapshot.queryParamMap.get('isEmp') === 'true';
    this.initializeForms();

    // Check if ID is provided in the route
    this.route.paramMap.subscribe((params) => {
      const id = params.get('fk_empid');

      if (id) {
        this.isEditMode = true;
        this.fk_empid = this.encryptService.decryptText(id.toString());
        this.GetDemographicById(this.fk_empid);
        this.EmployeeMasterForm.controls['fk_empid'].enable();
      } else {
        this.isEditMode = false;
        this.EmployeeMasterForm.controls['fk_empid'].enable();
      }
    });
      this.getEmployees();
      this.getCategoryList('Category');
      this.getReligionList('Religion');
      this.getBloodGroupList('BloodGroup');
      this.getRecruitmentModeList('Recruited');
  }

  

  GetDemographicById(id: string) {
    this.demographicService.GetDemographicById(id).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {

          // Convert date strings to "YYYY-MM-DD"
          const marriagedate = this.formatDate(response.data.marriagedate);
          const incdate = this.formatDate(response.data.incdate);
          // const dob = this.formatDate(response.data.dob);

          if (response.data.fk_empid) {
            const empOption = {
              name: `${response.data.empcode || ''} | ${response.data.empname || ''}`.trim(),
              value: response.data.fk_empid.toString()
            };
            if (!this.EmployeeList.some(e => e.value === empOption.value)) {
              this.EmployeeList.unshift(empOption);
            }
          }

          this.EmployeeMasterForm.patchValue({
            fk_empid: response.data.fk_empid,
            empname: response.data.empname,
            empcode: response.data.empcode,
            employeeCode: response.data.empcode,
            dept: response.data.dept,
            designation: response.data.designation,
            gender: response.data.gender,
            fathername: response.data.fathername,
            paymode: response.data.paymode,
            maritalstatus: response.data.maritalstatus,
            fk_catid: response.data.fk_catid,
            fk_religionid: response.data.fk_religionid,
            spousename: response.data.spousename,
            marriagedate: marriagedate,
            totchild: response.data.totchild,
            emrcontactpername: response.data.emrcontactpername,
            relation: response.data.relation,
            emrcontactno: response.data.emrcontactno,
            esidispname: response.data.esidispname,
            esino: response.data.esino,
            licenseno: response.data.licenseno,
            fk_bgroupid:response.data.fk_bgroupid,
            height: response.data.height,
            permanentContactNo: response.data.permanentContactNo,
            corresContactNo: response.data.corresContactNo,
            reference: response.data.reference,
            scholarships: response.data.scholarships,
            IdentificationMarks: response.data.identificationMarks,
            hobies: response.data.hobies,
            permanentAddress: response.data.permanentAddress,
            corresAddress: response.data.corresAddress,
            remarks: response.data.corresAddress,
            fk_recmodeid: response.data.fk_recmodeid,
            technicalQualifications: response.data.technicalQualifications,
            totalexp: response.data.totalexp,
            incdate:incdate,
            pfno: response.data.pfno,
            prev_pf_amt: response.data.prev_pf_amt,
            prev_volpf_amt: response.data.prev_volpf_amt,
            prev_epf_amt: response.data.prev_epf_amt,
            prev_eps_amt: response.data.prev_eps_amt,
            SAFPolicyNo: response.data.safPolicyNo,
            Vehicles: response.data.vehicles,
            leave: response.data.leave,
            saf: response.data.saf,
            gratuity: response.data.gratuity,
            loans: response.data.loans,
            superannuation: response.data.superannuation,
          });
          if (response.data.familyMembers && Array.isArray(response.data.familyMembers)) {
            this.loadFamilyMembers(response.data.familyMembers); // Backend data patching
          } else {
            this.familyMembers.clear(); // Clear if no family members from backend
          }
        } else {
          console.error('Failed to fetch account:', response.message);
          this.toastrService.error(response.message || 'Failed to fetch demographic data');
        }
        this.ngxUILoaderService.stop();
      },
      (error) => {
        console.error('Error fetching account:', error);
        this.toastrService.error('Error fetching demographic data');
        this.ngxUILoaderService.stop();
      }
    );
  }

  loadFamilyMembers(familyMembers: any[]) {
    const familyArray = this.familyMembers;
    familyArray.clear(); // Clear existing members
    familyMembers.forEach((member) => {
      familyArray.push(this.fb.group({
        pk_familyid: [member.pk_familyid || ''],
        fk_empid: [member.fk_empid || this.fk_empid],
        membername: [member.membername || '', Validators.required],
        relation: [member.relation || ''],
        dob: [this.formatDate(member.dob) || '', Validators.required],
        qualification: [member.qualification || ''],
        occupation: [member.occupation || '']
      }));
    });
  }


  

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return ''; // ✅ Return an empty string if date is null or undefined
    }
  
    const parts = dateString.split('/');
    if (parts.length !== 3) {
      console.warn("Invalid date format:", dateString); // ✅ Log incorrect format cases
      return ''; 
    }
  
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // formatDate(dateString: string): string {
  //   const [ day,month, year] = dateString.split('/');
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // }

  initializeForms(): void {
    this.EmployeeMasterForm = this.fb.group({
      fk_empid: [null],  
      fk_locid: [null],  
      gender: [null, Validators.required],  
      fk_religionid: ['', Validators.required],  
      fk_catid: [null],  
      fk_recmodeid: [null],  
      fk_bgroupid: [null],  
      paymode: [''],  
      incdate: [null],  
      marriagedate: [null],  
      spousename: [''],  
      maritalstatus: [''],  
      totchild: [null],  
      emrcontactpername: [''],  
      relation: [''],  
      emrcontactno: [''],  
      esidispname: [''],  
      pfno: [''],  
      superannuation: [''],  
      prev_pf_amt: [null],  
      prev_volpf_amt: [null],  
      prev_epf_amt: [null],  
      prev_eps_amt: [null],  
      esino: [''],  
      Vehicles: [''],  
      height: [''],  
      hobies: [''],  
      reference: [''],  
      dept: ['', Validators.required],  
      fathername: [''],  
      designation: ['', Validators.required],  
      empcode: [''],  
      manualempcode: [''],  
      empname: [''],  
      IdentificationMarks: [''],  
      scholarships: [''],  
      corresAddress: [''],  
      corresContactNo: [''],  
      permanentAddress: [''],  
      permanentContactNo: [''],  
      technicalQualifications: [''],  
      houserent: [null],  
      totalexp: [null],  
      SAFPolicyNo: [''],  
      saf: [''],  
      gratuity: [''],  
      passport_no: [''],  
      Passport_office: [''],  
      pass_issuedate: [null],  
      pass_validity: [null],  
      licenseno: [''],  
      filename: [''],  
      contenttype: [''],  
      remarks: [''],  
      leave: [''],  
      loans: [''],  
      otherLeaveDate: [null],  
      otherLeaveLock: [false],  
      fk_updUserID: [''],  
      fk_updDateID: [''],  
      PersonalEmail: [''],  
      PersonalContactno: [''],  
      OfficialContactno: [''],  
      familyMembers: this.fb.array([])  
    });

    this.familyMemberForm = this.fb.group({
      pk_familyid : [''],
      fk_empid: [''],
      membername: ['', Validators.required],
      relation: [''],
      dob: ['', Validators.required],
      qualification: [''],
      occupation: ['']
    });
  }

  getEmployees(): void {
    this.ngxUILoaderService.start();
    this.demographicService
      .get_Employees_Ddl(this.employeeFilters)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // this.employeeList = res.data;
            this.EmployeeList = res.data.map((emp: any) => ({
              name: emp.name,
              value: emp.value,
            }));
          } else {
            this.EmployeeList = [];
            this.toastrService.error(res.message, 'Error');
          }
          this.ngxUILoaderService.stop();
        },
        error: (error) => {
          this.EmployeeList = [];
          this.toastrService.error('Failed to retrieve employees', 'Error');
        },
      });
  }
  getCategoryList(fieldName: string) {
    this.demographicService.getdropDawn(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.category = res.data.map((fk_catid: any) => ({
                    name: fk_catid.name,
                    value: fk_catid.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");    
        }
    });
  }
  getReligionList(fieldName: string) {
    this.demographicService.getdropDawn(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.Religion = res.data.map((pk_religionid: any) => ({
                    name: pk_religionid.name,
                    value: pk_religionid.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");    
        }
    });
  }

  getBloodGroupList(fieldName: string) {
    this.demographicService.getdropDawn(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.bloodGroups = res.data.map((pk_bgroupid: any) => ({
                    name: pk_bgroupid.name,
                    value: pk_bgroupid.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");    
        }
    });
  }

  getRecruitmentModeList(fieldName: string) {
    this.demographicService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.recruitmentModes = res.data
            .filter((item: any) => item.value !== null && item.value !== '')
            .map((item: any) => ({
              name: item.name,
              value: item.value
            }));
        } else {
          this.toastrService.error("Failed to load Recruitment Mode list.");
        }
      },
      error: (err) => {
        console.error("Error fetching Recruitment Mode list:", err);
        this.toastrService.error("Error fetching Recruitment Mode list.");
      }
    });
  }







  get familyMembers(): FormArray {
    return this.EmployeeMasterForm.get('familyMembers') as FormArray;
  }

  validateNumber(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }



  validateNumber1(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }


  addFamilyMember(): void {
    console.log('familyMemberForm.value:', this.familyMemberForm.value);
    console.log('fk_empid from component:', this.fk_empid);
    console.log('familyMembers before push:', this.familyMembers.value);

    if (this.familyMemberForm.valid) {
      this.familyMembers.push(this.fb.group(this.familyMemberForm.value));
      console.log('familyMembers after push:', this.familyMembers.value);
      this.familyMemberForm.reset();
      this.shwerrForfamilydetails = false;
      this.toastrService.success('Family member added successfully!');
    } else {
      this.shwerrForfamilydetails = true;
      this.toastrService.error('Please fill all required family member fields.');
      console.log('familyMemberForm errors:', this.familyMemberForm.errors);
    }
  }

  editMember(index: number): void {
    const member = this.familyMembers.at(index);
    this.familyMemberForm.patchValue(member.value);
    this.removeFamilyMember(index);
    // this.toastrService.info('Family member loaded for editing');
  }

  removeFamilyMember(index: number): void {
    this.familyMembers.removeAt(index);
    // this.toastrService.success('Family member removed successfully!');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.toastrService.success('File selected successfully!');
      // Add file handling logic here if needed
    }
  }

  

  onSubmit(): void {
    debugger
    if (this.EmployeeMasterForm.invalid) {
      this.showerror = true;
      this.EmployeeMasterForm.markAllAsTouched();
      this.toastrService.error('Please fill all required fields.');
      return;
    }
  
    // const formData = this.EmployeeMasterForm.value
    const formData = {
      
      demographic: [
        {
          ...this.EmployeeMasterForm.value,
          fk_empid: this.fk_empid, 
          familyMembers: this.EmployeeMasterForm.get('familyMembers')?.value.map((fm: any) => ({
            pk_familyid: fm.pk_familyid || '',
            fk_empid: fm.fk_empid || this.fk_empid,  // Ensure fk_empid is included
            membername: fm.membername || '',
            relation: fm.relation || '',
            qualification: fm.qualification || '',
            occupation: fm.occupation || '',
            dob: fm.dob || ''
          }))

        }
      ]
    };
    console.log(this.fk_empid);
    console.log('Form Data:', formData);
  
    if (this.isEditMode && this.fk_empid) {
      // Update existing employee
      const payload = {
        fk_empid: this.fk_empid, // Ensure fk_empid is included
        ...formData // Spread the form data to include all fields
      };
      console.log('Update Payload:', payload); // Verify the payload
  
      this.demographicService.DemographicUpdate(payload).subscribe(
        (response) => {
          console.log('API Response:', response); // Log the response
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Employee updated successfully!');
            if (this.fk_empid) {
              this.GetDemographicById(this.fk_empid);
            }
            if (this.factBox) {
              this.factBox.refresh();
            }
          } else {
            this.toastrService.error(response.message || 'Failed to update Employee.');
          }
        },
        (error) => {
          console.error('Update Error:', error); // Log the error
          this.toastrService.error('An error occurred while updating the employee.');
        }
      );
    } else {
      this.toastrService.warning('No employee ID provided for update.');
    }
  }
  

  resetForm(): void {
    this.EmployeeMasterForm.reset();
    this.familyMembers.clear();
    this.familyMemberForm.reset();
    this.isEditMode = false;
    this.showerror = false;
    this.shwerrForfamilydetails = false;
    this.toastrService.info('Form has been reset.');
  }

  onEmployeeSelect(selected: any): void {
    if (selected && selected.value) {
      this.fk_empid = selected.value.toString();
      this.isEditMode = true;
      this.GetDemographicById(this.fk_empid);
    }
  }

  goToEmployeeMst(): void {
    if (this.fk_empid) {
      const encryptedId = this.encryptService.encryptText(this.fk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      this.toastrService.warning('Please select an employee first');
    }
  }

  goToAttendance(): void {
    if (this.fk_empid) {
      const encryptedId = this.encryptService.encryptText(this.fk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeAttendance/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      this.toastrService.warning('Please select an employee first');
    }
  }

  goToOtherDetails(): void {
    if (this.fk_empid) {
      const encryptedId = this.encryptService.encryptText(this.fk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeOtherDetails/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      this.toastrService.warning('Please select an employee first');
    }
  }

  goTohead(): void {
    if (this.fk_empid) {
      const encryptedId = this.encryptService.encryptText(this.fk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeHead/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      this.toastrService.warning('Please select an employee first');
    }
  }

  goToDemographic(): void {
    // Already on Demographic details
  }

  goToQualification(): void {
    if (this.fk_empid) {
      const encryptedId = this.encryptService.encryptText(this.fk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
      });
    } else {
      this.toastrService.warning('Please select an employee first');
    }
  }

  goToExperience(): void {
    if (this.fk_empid) {
      const encryptedId = this.encryptService.encryptText(this.fk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
      });
    } else {
      this.toastrService.warning('Please select an employee first');
    }
  }

  onBack(): void {
    if (this.fromSource === 'demographic_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails_list']);
    } else if (this.fromSource === 'qualification_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst_list']);
    } else if (this.fromSource === 'experience_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details_list']);
    } else {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/Employee_list']);
    }
  }
}
