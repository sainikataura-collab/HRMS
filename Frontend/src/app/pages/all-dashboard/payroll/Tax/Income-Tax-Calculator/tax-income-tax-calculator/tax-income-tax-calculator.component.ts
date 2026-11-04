import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-tax-income-tax-calculator',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './tax-income-tax-calculator.component.html',
  styleUrl: './tax-income-tax-calculator.component.scss'
})
export class TaxIncomeTaxCalculatorComponent {
router=Inject(Router)
IncomeTaxForm!:FormGroup;
IncomeTax!:FormGroup;
  showError=false;
showSuggestions = false;

locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];
departments = ['HR', 'Finance', 'Engineering', 'Marketing'];

incomeTaxDetails: any[] = []; // To hold the fetched income tax details

 // 🔹 Financial Year Options
 financialYears = [
  { id: 1, year: '2023-2024' },
  { id: 2, year: '2022-2023' },
  { id: 3, year: '2021-2022' },
  { id: 4, year: '2020-2021' }
];

employeeList = [
  { empCode: 'E001', empName: 'John Doe' },
  { empCode: 'E002', empName: 'Jane Smith' },
  { empCode: 'E003', empName: 'Mark Lee' }
];

// filteredEmployeeList = [...this.employeeList];
filteredEmployeeList = this.employeeList.map(emp => ({
  ...emp,
  displayName: `${emp.empCode} - ${emp.empName}`
}));

employeeCodes = this.employeeList.map(employee => employee.empCode);
staticEmployees = [
  { id: 1, code: 'E001', name: 'John Doe', designation: 'Developer', department: 'Engineering' },

  { id: 2, code: 'E002', name: 'Jane Smith', designation: 'Manager', department: 'HR' },
  { id: 3, code: 'E003', name: 'Alice Brown', designation: 'Analyst', department: 'Finance' }
];



constructor(private fb:FormBuilder){}

ngOnInit():void{
this.initializeForms()
  
}


initializeForms(){
  this.IncomeTaxForm=this.fb.group({
    code: [''],
        name: [''],
        location: [null],
        department: [null],
        status: [{ value: 'Current', disabled: true }]
      });

      this.IncomeTax = this.fb.group({
        employeeCode: [null, Validators.required],
        employeeName: [{ value: '', disabled: true }],
        financialYear: [null, Validators.required],
      });

      this.IncomeTaxForm.get('code')?.valueChanges.subscribe(value => {
        this.filterEmployeeList();
      });
}

 // Update the employee list based on filter
 filterEmployeeList() {
  const code = this.IncomeTaxForm.get('code')?.value;
  if (code) {
    this.filteredEmployeeList = this.employeeList
      .filter(emp => emp.empCode.includes(code))  // Filter by empCode
      .map(emp => ({
        ...emp,
        displayName: `${emp.empCode} - ${emp.empName}`  // Display code and name
      }));
  } else {
    this.filteredEmployeeList = this.employeeList.map(emp => ({
      ...emp,
      displayName: `${emp.empCode} - ${emp.empName}`  // Show full list if no filter applied
    }));
  }
}


onSearch(){
  const codeValue = this.IncomeTaxForm.get('code')?.value;

  if (codeValue && codeValue.length >= 1) {
    // Filter employee codes based on input
    this.employeeCodes = this.staticEmployees
      .filter(emp => emp.code.toLowerCase().includes(codeValue.toLowerCase()))
      .map(emp => emp.code);
    console.log('Filtered employee codes:', this.employeeCodes);
  } else {
    this.employeeCodes = this.staticEmployees.map(emp => emp.code); // Reset to all employee codes
    console.log('Reset employee codes:', this.employeeCodes);
  }
}

onSelectEmployee(selectedEmpCode: string) {
  const selectedEmployee = this.employeeList.find(emp => emp.empCode === selectedEmpCode);
  if (selectedEmployee) {
    this.IncomeTaxForm.patchValue({
      code: selectedEmployee.empCode,
      name: selectedEmployee.empName
    });
  }
}

 // Fetch income tax details based on empCode and financial year
 fetchIncomeTaxDetails(empCode: string, financialYear: string) {
  // Mock data for demonstration purposes
  const taxDetails = [
    { srNo: 1, description: 'Basic Salary', amount: 50000 },
    { srNo: 2, description: 'HRA', amount: 20000 },
    { srNo: 3, description: 'Bonus', amount: 15000 }
  ];
  this.incomeTaxDetails = taxDetails;
}

 // Show income tax details after selecting employee and financial year
  onShowIncomeTaxDetails() {
    const empCode = this.IncomeTax.get('employeeCode')?.value;
    const financialYear = this.IncomeTax.get('financialYear')?.value;

    if (empCode && financialYear) {
      this.fetchIncomeTaxDetails(empCode, financialYear);
    }
    if (this.IncomeTax.controls['financialYear'].invalid) {
      this.showError = true;  // Show error message
    }
  }

clearFilters() {
  this.IncomeTaxForm.reset();
  this.IncomeTax.reset();

}

search() {
}

}
