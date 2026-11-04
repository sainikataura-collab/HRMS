import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuarterService } from '../../services/quarter.service';

import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-quarter',
  standalone: true,
  imports: [ReactiveFormsModule,NgSelectComponent,CommonModule,RouterLink],
  templateUrl: './quarter.component.html',
  styleUrl: './quarter.component.scss'
})
export class QuarterComponent {
  QuarterForm!:FormGroup;
 router=Inject(Router)
  showError = false;
  constructor( private fb:FormBuilder,private quarterService:QuarterService){
  }
financialyear=[
  {name:"2023 -- 2024",value:"GU-1"},
  {name:"2024 -- 2025",value:"GU-2"},
  {name:"2025 -- 2025",value:"GU-5"},
  {name:"2025 -- 2025",value:"GU-4"},
  {name:"2025 -- 2025",value:"GU-6"},
  {name:"2025 -- 2025",value:"GU-9"},
  {name:"2025 -- 2025",value:"GU-8"},
  {name:"2025 -- 2025",value:"GU-7"}
]



quarter=[
  {name:"select",value:""},
  {name:"I Quarter",value:"1"},
  {name:"II Quarter",value:"2"},
  {name:"III Quarter",value:"3"},
  {name:"IV Quarter",value:"4"},
 
]

ngOnInit():void{
  this.QuarterForm=this.fb.group({
    FinancialYear:['',[Validators.required]],
    Quarter:['',[Validators.required]],
    endDate:['',[Validators.required]],
  })
}


// onSubmit() {
//   if (this.QuarterForm.invalid) {
//     this.showError = true;
//     return;
//   }

//   this.quarterService.saveQuarter(this.QuarterForm.value).subscribe({
//     next: (response) => {
//       alert('Data saved successfully');
//       this.QuarterForm.reset();
//     },
//     error: (err) => {
//       console.error(err);
//       alert('Error saving data');
//     }
//   });
// }

onSubmit() {
  if (this.QuarterForm.invalid) {
    this.showError = true;
    return;
  }

  this.quarterService.saveQuarter(this.QuarterForm.value).subscribe({
    next: (response) => {
      alert('Data saved successfully');
     
      // Redirect after saving
    },
    error: (err) => {
      console.error(err);
      alert('Error saving data');
    }
  });
}


 


}
