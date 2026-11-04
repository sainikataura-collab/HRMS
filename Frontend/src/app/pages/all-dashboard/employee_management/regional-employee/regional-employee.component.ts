import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { formatDateForInput } from '../../../../healpers/commonlib';
import { BranchMstService } from '../../user/services/branch-mst.service';
import { EmployeeFactBoxComponent } from '../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-regional-employee',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonModule, FormsModule, RouterLink, NgxMaskDirective, EmployeeFactBoxComponent],
  templateUrl: './regional-employee.component.html',
  styleUrl: './regional-employee.component.scss'
})
export class RegionalEmployeeComponent {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  isAutoEmpcode = false;
  isContractApplicable = false;
  Outlet: { label: string, value: string }[] = [];
  Branch: { label: string, value: string }[] = [];
  aadhaarError: string = '';
  panError: string = '';

  domicileList: { name: string; value: string }[] = [];
  serviceTypeList: { name: string; value: string }[] = [];
  businessVerticalList: { name: string; value: string }[] = [];
  VendorList: { name: string; value: string }[] = [];
  bgvList: { name: string; value: string }[] = [];
  isDomicileVisible: boolean = false;
  showclientdetails = false;
  contractorLabel: string = '';

  validateAadhaar() {
    const aadhaarValue = this.EmployeeForm.get('adhaarNo')?.value?.replace(/\s+/g, '').trim();
    this.EmployeeForm.get('adhaarNo')?.setValue(aadhaarValue);

    if (aadhaarValue && !/^[0-9]{12}$/.test(aadhaarValue)) {
      this.aadhaarError = 'Please enter a valid 12-digit Aadhaar number';
    } else {
      this.aadhaarError = '';
    }
  }

  validatePan() {
    const panValue = this.EmployeeForm.get('panno')?.value?.toUpperCase().trim();
    this.EmployeeForm.get('panno')?.setValue(panValue);

    if (panValue && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panValue)) {
      this.panError = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    } else {
      this.panError = '';
    }
  }

  onBack(): void {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/RegionalEmployee_list']);
  }

  ngxUILoaderService = inject(NgxUiLoaderService);

  EmployeeForm!: FormGroup;
  Recruited: { label: string, value: string }[] = [];
  Category: { label: string, value: string }[] = [];
  Religion: { label: string, value: string }[] = [];
  Bank: { label: string, value: string }[] = [];
  City: { label: string, value: string }[] = [];
  Department: { label: string, value: string }[] = [];
  Designation: { label: string, value: string }[] = [];
  Grade: { name: string, value: string }[] = [];
  Nature: { label: string, value: string }[] = [];
  OperationalDivision: { label: string, value: string }[] = [];
  EmployeCode: { label: string, value: string }[] = [];
  Zone: { label: string, value: string }[] = [];
  Location: { label: string, value: string }[] = [];
  Roles: { label: string, value: string }[] = [];
  SubDepartment: { label: string, value: string }[] = [];
  CostCenter: { label: string, value: string }[] = [];

  GenderType = [
    { name: '-- Select Gender --', value: '' },
    { name: 'Male', value: 'M' },
    { name: 'Female', value: 'F' },
    { name: 'Other', value: 'O' },
  ];

  LeftStatus = [
    { name: '--Select LeftStatus--', value: '' },
    { name: 'NO', value: 'N' },
    { name: 'Yes', value: 'Y' },
  ];

  GroupEmployee = [
    { name: '--Select GroupEmployee--', value: '' },
    { name: 'NO', value: 'N' },
    { name: 'Yes', value: 'Y' },
  ];

  AccommodationStatus = [
    { name: '--Select AccommodationStatus--', value: '' },
    { name: 'Self', value: 'S' },
    { name: 'Company Provided', value: 'C' },
  ];

  AttendanceSource = [
    { name: '--Select AttendanceSource--', value: '' },
    { "name": "Biometric", "value": "B" },
    { "name": "Mobile Attendence", "value": "M" },
    { "name": "Both", "value": "A" },
  ];

  TransportType = [
    { name: '--Select TransportType--', value: '' },
    { "name": "Normal Mode", "value": "1" },
    { "name": "With Lunch Mode", "value": "2" },
  ];

  TaxRegime = [
    { name: '--Select TaxRegime--', value: '' },
    { "name": "New", "value": "New" },
    { "name": "Old", "value": "Old" },
  ];

  AttendanceType = [
    { name: '--Select  AttendanceType--', value: '' },
    { "name": "Normal Mode", "value": "1" },
    { "name": "With Lunch Mode", "value": "2" },
  ];

  OverTimeType = [
    { name: '--Select  OverTimeType--', value: '' },
    { "name": "Normal Mode", "value": "1" },
    { "name": "With Lunch Mode", "value": "2" },
  ];

  showError = false;
  submitted = false;
  pk_empid!: string;
  Isedit = false;
  fromSource: string = '';
  stateList: { name: string; value: string }[] = [];
  permanentCityList: { name: string; value: string }[] = [];
  currentCityList: { name: string; value: string }[] = [];

  constructor(
    private service: BranchMstService,
    private fb: FormBuilder,
    private employeeMasterService: EmployeeMasterService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true";
    this.showclientdetails = sessionStorage.getItem('showclientdetails') == "true";
    this.isAutoEmpcode = sessionStorage.getItem('isAutoEmpcode') == "true";

    const contractValue = sessionStorage.getItem('ContractApplicable');
    const labelValue = sessionStorage.getItem('contractor_LabelName');

    this.isContractApplicable = contractValue === 'true';

    // Clean label logic
    if (this.isContractApplicable && labelValue) {
      let cleanedLabel = labelValue.replace(/name/gi, '').trim();
      cleanedLabel = cleanedLabel.split(' ')[0];
      this.contractorLabel = cleanedLabel;
    } else {
      this.contractorLabel = 'Cost Center';
    }

    this.EmployeeForm = this.fb.group({
      gender: ['', [Validators.required]],
      manualempcode: [''],
      punchingempcode: [''],
      empname: [null, [Validators.required]],
      fatherName: [null],
      motherName: [null],
      fk_religionid: [null, [Validators.required]],
      fk_catid: [null, [Validators.required]],
      fk_locid: [null, Validators.required],
      corresContactNo: [''],
      permanentContactNo: [''],
      personalEmail: [''],
      personalContactno: [''],
      officialContactno: [''],
      fk_costcentreid: [null, [Validators.required]],
      fk_dealerOutletId: [null],
      fk_branchId: [null],
      pk_empid: [''],
      fk_recId: [''],
      empcode: [null, [Validators.required]],
      fk_cityid: [null, [Validators.required]],
      Domicile: [null],
      ServiceType: [null],
      BusinessVertical: [null],
      vendorId: [null],
      bgv: [null],
      fk_deptid: [null, [Validators.required]],
      fk_subdeptid: [null],
      fk_RoleId: [null],
      fk_desgid: [null, [Validators.required]],
      fk_classid: [null],
      fk_natureid: [null, [Validators.required]],
      fk_bankid: [null],
      bankaccountno: [null],
      panno: [null],
      dateofbirth: [null, [Validators.required]],
      dateofjoining: [null, [Validators.required]],
      dateOfConfirmation: [null, [Validators.required]],
      safStartDate: [null],
      contractenddate: [null],
      resigndate: [null],
      employeeleftstatus: [null, [Validators.required]],
      leftdate: [null],
      leftremarks: [null],
      remarks: [null],
      transferstatus: [true],
      email: [null],
      active: [true],
      fk_zoneId: [null],
      fk_OperationalId: [0],
      adhaarNo: [null],
      dateOfRelieving: [null],
      debit_Card: [null],
      advance_Limit: [0],
      attendanceType: [null],
      transportType: [null],
      fk_rentCityId: [null, [Validators.required]],
      OverTimeType: [null],
      groupemployee: [null],
      fk_CouponHODid: [''],
      PLI: [0],
      Accommodationstatus: [''],
      fk_AdministrativeRepempid: [null],
      fk_FunctionalRepempid: [null],
      fk_AdministrativeHODempid: [null],
      fk_FunctionalHODempid: [null],
      IFSCCODE: [null],
      taxRegime: [''],
      fk_cityid_permanent: [null],
      fk_stateid_permanent: [null, [Validators.required]],
      Address_permanent: [''],
      pincode_permanent: [''],
      fk_cityid_current: [null],
      fk_stateid_current: [null, [Validators.required]],
      Address_current: [''],
      pincode_current: [''],
      isBlacklisted: [false],
      blacklistDate: [null],
      blacklistReason: [null]
    });

    this.getRecruitedList('Recruited');
    this.getCategoryList('Category');
    this.getReligionList('Religion');
    this.getBankList('Bank');
    this.getDepartmentList('Department');
    this.getZoneList('Zone');
    this.getCityList('City');
    this.getOperationalDivisionList('OperationalDivision');
    this.getDesignationList('Designation');
    this.getGradeList('Grade');
    this.getNatureList('Nature');
    this.getEmployeCodeList('Employee');
    this.getLocationList('Location');
    this.getRoleList('RoleName');
    this.getCostList('CostCenter');
    this.getoutletList('Outlet');
    this.getbranchList('Branch');

    this.EmployeeForm.get('fk_stateid_permanent')?.valueChanges.subscribe(value =>
      value && this.loadCity(value, 'permanent')
    );

    this.EmployeeForm.get('fk_stateid_current')?.valueChanges.subscribe(value =>
      value && this.loadCity(value, 'current')
    );
    this.getState('State');
    this.getDomicileList();
    this.getServiceTypeList();
    this.getBusinessVerticalList();
    this.getVendorList();
    this.getBgvList();

    // Date functionality: DOJ + 6 months -> confirmation date
    this.EmployeeForm.get('dateofjoining')?.valueChanges.subscribe((doj: string) => {
      if (doj) {
        const dojDate = new Date(doj);
        const confirmationDate = new Date(dojDate.setMonth(dojDate.getMonth() + 6));
        const formattedDate = confirmationDate.toISOString().split('T')[0];
        this.EmployeeForm.get('dateOfConfirmation')?.setValue(formattedDate);
      }
    });

    this.EmployeeForm.get('fk_deptid')?.valueChanges.subscribe((selectedDeptId) => {
      if (selectedDeptId) {
        this.getSubDepartmentList(selectedDeptId);
        this.EmployeeForm.get('fk_subdeptid')?.reset();
      }
    });

    this.fromSource = this.route.snapshot.queryParamMap.get('from') || '';

    const paramId = this.route.snapshot.params['pk_empid'];
    if (paramId) {
      this.pk_empid = this.encryptionService.decryptText(paramId);
    }

    if (this.pk_empid && this.pk_empid !== 'undefined') {
      this.loadEmployeeMasterData(this.pk_empid);
      this.Isedit = true;
    }

    if (this.isAutoEmpcode && !this.Isedit) {
      this.EmployeeForm.get('empcode')?.patchValue('System Generated');
    }
  }

  loadCity(stateId: string, type: 'permanent' | 'current') {
    this.employeeMasterService.CityByState(stateId).subscribe(res => {
      if (type === 'permanent') {
        this.permanentCityList = res?.data || [];
      } else {
        this.currentCityList = res?.data || [];
      }
    });
  }

  getState(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.stateList = res?.data || [];
    });
  }

  getDomicileList() {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    if (compId === 'GU-1' || compId === 'GU-8' || compId === '1' || compId === '8' || compId === '') {
      this.isDomicileVisible = true;
    }

    this.employeeMasterService.getDdlListBasedOnCodeType('13', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.domicileList = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? item.name ?? '').toString().trim()
        }));
      },
      error: (err: any) => console.error('Error fetching Domicile list:', err)
    });
  }

  getSubDepartmentList(fk_deptid: string) {
    this.employeeMasterService.getSubDepById_Dropdown(fk_deptid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.SubDepartment = res.data.map((fk_subdeptid: any) => ({
            name: fk_subdeptid.name,
            value: fk_subdeptid.value
          }));
        } else {
          this.toastrService.error("Failed to load Parameter list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Parameter list.")
    });
  }

  getLocationList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Location = res.data.map((fk_locid: any) => ({
            name: fk_locid.name,
            value: fk_locid.value
          }));
        } else {
          this.toastrService.error("Failed to load Location list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Location list.")
    });
  }

  getoutletList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Outlet = res.data.slice(1).map((Outlet: any) => ({
            name: Outlet.name,
            value: Outlet.value
          }));
        } else {
          this.toastrService.error("Failed to load list.");
        }
      },
      error: () => this.toastrService.error("Error fetching list.")
    });
  }

  getbranchList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Branch = res.data.slice(1).map((Branch: any) => ({
            name: Branch.name,
            value: Branch.value
          }));
        } else {
          this.toastrService.error("Failed to load list.");
        }
      },
      error: () => this.toastrService.error("Error fetching list.")
    });
  }

  getCostList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.CostCenter = res.data.map((costcenter: any) => ({
            name: costcenter.name,
            value: costcenter.value
          }));
        } else {
          this.toastrService.error("Failed to load Location list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Location list.")
    });
  }

  getRoleList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Roles = res.data.map((Role: any) => ({
            name: Role.name,
            value: Role.value
          }));
        }
      }
    });
  }

  getZoneList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Zone = res.data.map((fk_zoneId: any) => ({
            name: fk_zoneId.name,
            value: fk_zoneId.value
          }));
        } else {
          this.toastrService.error("Failed to load Zone list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("Error fetching Zone list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getDepartmentList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Department = res.data.map((pk_deptid: any) => ({
            name: pk_deptid.name,
            value: pk_deptid.value
          }));
        } else {
          this.toastrService.error("Failed to load Department list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("Error fetching Department list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getDesignationList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Designation = res.data.map((pk_desgid: any) => ({
            name: pk_desgid.name,
            value: pk_desgid.value
          }));
        } else {
          this.toastrService.error("Failed to load Designation list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("Error fetching Designation list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getGradeList(fieldName: string = 'Grade') {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Grade = res.data.map((item: any) => ({
            name: item.name,
            value: item.value
          }));
        } else {
          this.toastrService.error("Failed to load Grade list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Grade list.")
    });
  }

  getCityList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.City = res.data.map((fk_cityid: any) => ({
            name: fk_cityid.name,
            value: fk_cityid.value
          }));
        } else {
          this.toastrService.error("Failed to load City list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("Error fetching City list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getNatureList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Nature = res.data.map((pk_natureid: any) => ({
            name: pk_natureid.name,
            value: pk_natureid.value
          }));
        } else {
          this.toastrService.error("Failed to load Nature list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Nature list.")
    });
  }

  getEmployeCodeList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.EmployeCode = res.data.map((pk_empid: any) => ({
            name: pk_empid.name,
            value: pk_empid.value
          }));
        } else {
          this.toastrService.error("Failed to load EmployeCode list.");
        }
      },
      error: () => this.toastrService.error("Error fetching EmployeCode list.")
    });
  }

  checkDuplicate(empcode: string): void {
    if (!empcode || !empcode.trim()) {
      return;
    }
    const fieldName = 'EmployeeCode';
    const fieldValue = empcode.trim();
    const generalId = this.pk_empid || '';

    this.employeeMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.EmployeeForm.get('empcode')?.setErrors({ duplicate: response.message });
        } else {
          const currentErrors = this.EmployeeForm.get('empcode')?.errors;
          if (currentErrors) {
            delete currentErrors['duplicate'];
            this.EmployeeForm.get('empcode')?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
          }
        }
      },
      error: () => {
        this.EmployeeForm.get('empcode')?.setErrors({ duplicate: 'Error checking EmpCode availability.' });
      }
    });
  }

  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validateNumber1(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 54 || charCode > 57) {
      event.preventDefault();
    }
  }

  restrictInputDecimal(event: KeyboardEvent) {
    const pattern = /^[0-9to.]$/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  onSubmit() {
    this.submitted = true;

    const aadhaarNo = this.EmployeeForm.get('adhaarNo')?.value?.replace(/\s+/g, '').trim();
    const panNo = this.EmployeeForm.get('panno')?.value?.toUpperCase().trim();

    this.EmployeeForm.get('adhaarNo')?.setValue(aadhaarNo);
    this.EmployeeForm.get('panno')?.setValue(panNo);

    const aadhaarValid = /^[0-9]{12}$/.test(aadhaarNo);
    const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo);

    if (aadhaarNo && !aadhaarValid) {
      this.toastrService.error('Please fill correct Aadhaar No.', 'Validation Warning');
      this.showError = true;
      return;
    }

    if (panNo && !panValid) {
      this.toastrService.error('Please fill correct PAN no.', 'Validation Warning');
      this.showError = true;
      return;
    }

    if (this.EmployeeForm.get('isBlacklisted')?.value) {
      if (!this.EmployeeForm.get('blacklistDate')?.value) {
        this.toastrService.error('Please enter Effective Date for Blacklist.', 'Validation Error');
        this.showError = true;
        return;
      }
      if (!this.EmployeeForm.get('blacklistReason')?.value?.toString().trim()) {
        this.toastrService.error('Please enter Reason for Blacklist.', 'Validation Error');
        this.showError = true;
        return;
      }
    }

    if (this.EmployeeForm.invalid) {
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      this.showError = true;
      return;
    }

    const numericFields = ['fk_zoneId', 'fk_OperationalId', 'advance_Limit', 'PLI'];
    numericFields.forEach(field => {
      const value = this.EmployeeForm.get(field)?.value;
      if (value !== null && value !== '' && !isNaN(value)) {
        this.EmployeeForm.patchValue({ [field]: Number(value) });
      }
    });

    const data = {
      employee: {
        ...this.EmployeeForm.value,
        resigndate: this.EmployeeForm.get('resigndate')?.value,
        leftremarks: this.EmployeeForm.get('leftremarks')?.value,
        leftdate: this.EmployeeForm.get('leftdate')?.value,
        employeeleftstatus: this.EmployeeForm.get('employeeleftstatus')?.value,
        dateOfRelieving: this.EmployeeForm.get('dateOfRelieving')?.value,
        fk_dealerOutletId: Number(this.EmployeeForm.get('fk_dealerOutletId')?.value) || 0,
        fk_branchId: Number(this.EmployeeForm.get('fk_branchId')?.value) || 0,
      },
      employeeOther: {
        ...this.EmployeeForm.value,
        fk_stateid_permanent: Number(this.EmployeeForm.get('fk_stateid_permanent')?.value) || null,
        fk_stateid_current: Number(this.EmployeeForm.get('fk_stateid_current')?.value) || null,
      }
    };

    if (this.Isedit) {
      this.employeeMasterService.update_employee(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            if (this.factBox) {
              this.factBox.refresh();
            }
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    } else {
      this.employeeMasterService.add_employee(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.pk_empid = result.data?.pk_empid;
            this.Isedit = true;
            if (this.factBox) {
              this.factBox.refresh();
            }
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    }
  }

  loadEmployeeMasterData(pk_empid: string) {
    this.employeeMasterService.getById_employee(pk_empid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const employeeData = res.data.employeeMst;
          const otherDetails = res.data.employeeOtherDetails;

          if (employeeData) {
            const formattedEmployeeData = {
              ...employeeData,
              fatherName: employeeData.fathername,
              motherName: employeeData.mothername,
              IFSCCODE: employeeData.ifsccode,
              fk_OperationalId: employeeData.fk_OperationalId ? employeeData.fk_OperationalId.toString() : '',
              fk_rentCityId: employeeData.fk_rentCityId,
              fk_recId: employeeData.fk_recId,
              attendanceType: employeeData.attendanceType,
              transportType: employeeData.transportType,
              PLI: employeeData.pli,
              OverTimeType: employeeData.overTimeType,
              Accommodationstatus: employeeData.accommodationstatus,
              fk_zoneId: employeeData.fk_zoneId ? employeeData.fk_zoneId.toString() : '',
              fk_costcentreid: employeeData.fk_costcentreid ? employeeData.fk_costcentreid.toString() : '',
              fk_branchId: employeeData.fk_branchId ? employeeData.fk_branchId.toString() : '',
              fk_dealerOutletId: employeeData.fk_dealerOutletId ? employeeData.fk_dealerOutletId.toString() : '',
              fk_classid: employeeData.fk_classid ? employeeData.fk_classid.toString() : null,
              dateofbirth: formatDateForInput(employeeData.dateofbirth),
              dateofjoining: formatDateForInput(employeeData.dateofjoining),
              dateOfConfirmation: formatDateForInput(employeeData.dateOfConfirmation),
              safStartDate: formatDateForInput(employeeData.safStartDate),
              contractenddate: formatDateForInput(employeeData.contractenddate),
              resigndate: formatDateForInput(employeeData.resigndate),
              leftdate: formatDateForInput(employeeData.leftdate),
              dateOfRelieving: formatDateForInput(employeeData.dateOfRelieving),
              ServiceType: employeeData.serviceType || employeeData.ServiceType || null,
              BusinessVertical: employeeData.businessVertical || employeeData.BusinessVertical || null,
              vendorId: employeeData.vendorId || employeeData.VendorId || null,
              bgv: employeeData.bgv || employeeData.Bgv || employeeData.BGV || null,
              isBlacklisted: employeeData.isBlacklisted === true || employeeData.isBlacklisted === 1 || employeeData.isBlacklisted === 'true',
              blacklistDate: formatDateForInput(employeeData.blacklistDate),
              blacklistReason: employeeData.blacklistReason || null,
            };

            this.EmployeeForm.patchValue(formattedEmployeeData);
          }

          if (otherDetails) {
            this.EmployeeForm.patchValue({
              ...otherDetails,
              Address_current: otherDetails.address_current ? otherDetails.address_current : '',
              Address_permanent: otherDetails.address_permanent ? otherDetails.address_permanent : '',
              fk_stateid_permanent: otherDetails.fk_stateid_permanent ? otherDetails.fk_stateid_permanent.toString() : '',
              fk_stateid_current: otherDetails.fk_stateid_current ? otherDetails.fk_stateid_current.toString() : ''
            });
          }
        } else {
          this.toastrService.error("Failed to load employee data.");
        }
      },
      error: () => {
        this.toastrService.error("Error fetching employee data.");
      }
    });
  }

  resetForm(): void {
    this.EmployeeForm.reset();
  }

  onPanInput(event: any) {
    const input = event.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = input.value.toUpperCase();
    event.target.setSelectionRange(start, end);

    this.EmployeeForm.get('panno')?.setValue(input.value, { emitEvent: false });
  }

  getRecruitedList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Recruited = res.data.map((pk_recmodeid: any) => ({
            name: pk_recmodeid.name,
            value: pk_recmodeid.value
          }));
        } else {
          this.toastrService.error("Failed to load Recruited list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Recruited list.")
    });
  }

  getCategoryList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Category = res.data.map((fk_catid: any) => ({
            name: fk_catid.name,
            value: fk_catid.value
          }));
        } else {
          this.toastrService.error("Failed to load Category list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Category list.")
    });
  }

  getReligionList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Religion = res.data.map((pk_religionid: any) => ({
            name: pk_religionid.name,
            value: pk_religionid.value
          }));
        } else {
          this.toastrService.error("Failed to load Religion list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Religion list.")
    });
  }

  getBankList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Bank = res.data.map((pk_bankid: any) => ({
            name: pk_bankid.name,
            value: pk_bankid.value
          }));
        } else {
          this.toastrService.error("Failed to load Bank list.");
        }
      },
      error: () => this.toastrService.error("Error fetching Bank list.")
    });
  }

  getOperationalDivisionList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.OperationalDivision = res.data.map((fk_locid: any) => ({
            name: fk_locid.name,
            value: fk_locid.value
          }));
        } else {
          this.toastrService.error("Failed to load OperationalDivision list.");
        }
      },
      error: () => this.toastrService.error("Error fetching OperationalDivision list.")
    });
  }

  getServiceTypeList() {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    this.employeeMasterService.getDdlListBasedOnCodeType('14', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.serviceTypeList = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? item.name ?? '').toString().trim()
        }));
      },
      error: (err: any) => console.error('Error fetching Service Type list:', err)
    });
  }

  getBusinessVerticalList() {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    this.employeeMasterService.getDdlListBasedOnCodeType('15', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.businessVerticalList = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? item.name ?? '').toString().trim()
        }));
      },
      error: (err: any) => console.error('Error fetching Business Vertical list:', err)
    });
  }

  getVendorList() {
    this.employeeMasterService.get_DropdownList('Vendor').subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.VendorList = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? '').toString().trim()
        }));
      },
      error: (err: any) => console.error('Error fetching vendors:', err)
    });
  }

  getBgvList() {
    const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
    this.employeeMasterService.getDdlListBasedOnCodeType('18', compId).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        this.bgvList = list.map((item: any) => ({
          name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
          value: (item.value ?? item.Value ?? item.name ?? '').toString().trim()
        }));
      },
      error: (err: any) => console.error('Error fetching BGV list:', err)
    });
  }

  onBlacklistChange(): void {
    const isBlacklisted = this.EmployeeForm.get('isBlacklisted')?.value;
    if (!isBlacklisted) {
      this.EmployeeForm.get('blacklistDate')?.setValue(null);
      this.EmployeeForm.get('blacklistReason')?.setValue(null);
    }
  }
}