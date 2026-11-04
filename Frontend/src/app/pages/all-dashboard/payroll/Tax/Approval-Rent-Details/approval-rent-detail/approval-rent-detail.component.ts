import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-approval-rent-detail',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './approval-rent-detail.component.html',
  styleUrl: './approval-rent-detail.component.scss'
})
export class ApprovalRentDetailComponent {
  router=Inject(Router)
ApprovalForm!:FormGroup;
showSuggestions = false;

locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];
departments = ['HR', 'Finance', 'Engineering', 'Marketing'];

pendingList:any[]=[
  { Date: '2024-02-14', section: 'HR',  amount: 5000, empCode: 'E001', empName: 'John Doe', branch: 'Delhi', financialYear: '2023-2024', file: 'file1.pdf' },
  { Date: '2023-11-10', section: 'Finance',  amount: 8000, empCode: 'E002', empName: 'Jane Smith', branch: 'Mumbai', financialYear: '2022-2023', file: 'file2.pdf' },
  { Date: '2022-07-01', section: 'IT',amount: 3000, empCode: 'E003', empName: 'Mark Lee', branch: 'Bangalore', financialYear: '2021-2022', file: 'file3.pdf' }

]


 // 🔹 Financial Year Options
 financialYears = [
  { id: 1, year: '2023-2024'  },
  { id: 2, year: '2022-2023' },
  { id: 3, year: '2021-2022' },
  { id: 4, year: '2020-2021' }
];

filteredPendingList: any[] = [];

constructor(private fb:FormBuilder){}

ngOnInit():void{
this.initializeForms()
  
}


initializeForms(){
  this.ApprovalForm=this.fb.group({
    code: [''],
        name: [''],
        location: [''],
        department: [''],
        financialYear: [''],
        status: [{ value: 'Current', disabled: true }, Validators.required]
      });
      this.filteredPendingList = [...this.pendingList];

      // this.ApprovalForm.get('code')?.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      //   this.filterPendingList();
      // });
}

filterPendingList() {
  const formValues = this.ApprovalForm.value;
  this.filteredPendingList = this.pendingList.filter(emp => {
    return (
      (!formValues.code || emp.empCode.toLowerCase().includes(formValues.code.toLowerCase())) &&
      (!formValues.name || emp.empName.toLowerCase().includes(formValues.name.toLowerCase())) &&
      (!formValues.status || emp.status?.toLowerCase().includes(formValues.status.toLowerCase())) &&
      (!formValues.location || emp.branch.toLowerCase().includes(formValues.location.toLowerCase())) &&
      (!formValues.department || emp.department?.toLowerCase().includes(formValues.department.toLowerCase())) &&
      (!formValues.financialYear || emp.financialYear?.toString() === formValues.financialYear)
    );
  });
}

selectCode(code: string) {
  this.ApprovalForm.patchValue({code});
  this.showSuggestions = false;
}

clearFilters() {
  this.ApprovalForm.reset();
  this.filteredPendingList = [...this.pendingList];
}
search() {
  this.filterPendingList();
}

}

