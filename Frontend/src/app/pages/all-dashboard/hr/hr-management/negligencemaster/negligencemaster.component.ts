import { Component } from '@angular/core';
import { CommonSearchComponent } from "../../../payroll/Employee/common-search/common-search.component";
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-negligencemaster',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, CommonSearchComponent],
  templateUrl: './negligencemaster.component.html',
  styleUrl: './negligencemaster.component.scss'
})
export class NegligencemasterComponent {
  PendingNegligencelist = [
    { id: 1,Dated:'Reporting Manager',DetailofIncident	: '1',Type	 :"true",EmpCode:"000001",EmpName:"RAMM",department:"SS",RaisedBy:"OK",Status:"PROCDES",File:".JPG"},
    { id: 2,Dated:'Reporting Manager',DetailofIncident	: '1',Type	 :"true",EmpCode:"000001",EmpName:"RAMM",department:"SS",RaisedBy:"OK",Status:"PROCDES",File:".JPG" },
    { id: 3,Dated:'Reporting Manager',DetailofIncident	: '1',Type	 :"true",EmpCode:"000001",EmpName:"RAMM",department:"SS",RaisedBy:"OK",Status:"PROCDES",File:".JPG"},
    { id: 4,Dated:'Reporting Manager',DetailofIncident	: '1',Type	 :"true",EmpCode:"000001",EmpName:"RAMM",department:"SS",RaisedBy:"OK",Status:"PROCDES",File:".JPG"} 
  ]; 
  ApprovedNegligencelist=[
    { id: 1,	EmployeeName:'Reporting Manager',EmployeeCode	: '1',RaisedBy :"true",Department:"sss",EmpName:"RRR",Location:"GKP",IncidentDate:"12/2/2003",IncidentDetails:"SSSS" ,Status:"CDOEN",OPENFile:".JPG"},
    { id: 2,	EmployeeName:'Reporting Manager',EmployeeCode	: '1',RaisedBy :"true",Department:"sss",EmpName:"RRR",Location:"GKP",IncidentDate:"12/2/2003",IncidentDetails:"SSSS" ,Status:"CDOEN",OPENFile:".JPG" },
    { id: 3,	EmployeeName:'Reporting Manager',EmployeeCode	: '1',RaisedBy :"true",Department:"sss",EmpName:"RRR",Location:"GKP",IncidentDate:"12/2/2003",IncidentDetails:"SSSS" ,Status:"CDOEN",OPENFile:".JPG"},
    { id: 4,	EmployeeName:'Reporting Manager',EmployeeCode	: '1',RaisedBy :"true",Department:"sss",EmpName:"RRR",Location:"GKP",IncidentDate:"12/2/2003",IncidentDetails:"SSSS" ,Status:"CDOEN",OPENFile:".JPG"} 

  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
   
  }
  
  delete(Id: number): void {
    const confirmation = window.confirm("Are you sure you want to delete this ApprovedNegligence?");
    
    if (confirmation) {
      // Proceed with deletion if the user confirms
      const index = this.ApprovedNegligencelist.findIndex(c => c.id === Id);
      if (index !== -1) {
        this.ApprovedNegligencelist.splice(index, 1); 
        console.log('ApprovedNegligence deleted:', Id);
      }
    } else {
      // Do nothing if the user cancels
      console.log('ApprovedNegligence deletion cancelled');
    }
  }
  

}
