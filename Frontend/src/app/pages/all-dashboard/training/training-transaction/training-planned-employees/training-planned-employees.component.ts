import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingPlanningService } from '../../services/training-planning.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-training-planned-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-planned-employees.component.html',
  styleUrl: './training-planned-employees.component.scss'
})
export class TrainingPlannedEmployeesComponent {

  programId!: number;
  subProgramId!: number;

  programName: string = '';
  subProgramName: string = '';


  employeeList: any[] = [];
  isLoading: boolean = true;
  searchText: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingPlanningService: TrainingPlanningService,
    private toastr: ToastrService,
    private ngxService: NgxUiLoaderService,
    private encriptService: EncryptionService
  ) { }

  ngOnInit(): void {
    // Get program & subprogram from query params
    this.route.queryParams.subscribe(params => {

      // const decryptedEmpId = this.encriptService.decryptText(params['pk_empid']);
      const decryptedProgramId = this.encriptService.decryptText(params['programId']);
      const decryptedSubProgramId = this.encriptService.decryptText(params['subprogramId']);


      this.programId = Number(decryptedProgramId);
      this.subProgramId = Number(decryptedSubProgramId);


      if (!this.programId || !this.subProgramId) {
        this.toastr.error('Program or SubProgram not provided');
        this.router.navigate(['/training-planning']); // go back
      } else {
        this.loadEmployees();
      }
    });
  }



  loadEmployees() {

    this.isLoading = true;
    this.ngxService.start();

    this.trainingPlanningService.getPlanned_Employee(this.programId, this.subProgramId)
      .subscribe(
        (res: any) => {
          if (res && res.data) {

            const programData = res.data.programs;
            
            // ✅ Set names here
            this.programName = programData?.programName || 'N/A';
            this.subProgramName = programData?.subProgramName || 'N/A';

            // ✅ Set employee list
            this.employeeList = (res.data.employees || []).map((emp: any) => ({
              fk_empId: emp.fk_empId,
              empName: emp.empName
            }));
          }

          this.ngxService.stop();
          this.isLoading = false;
        },
        err => {
          console.error(err);
          this.ngxService.stop();
          this.toastr.error('Failed to load employees');
          this.isLoading = false;
        }
      );
  }




  filteredEmployees() {
    if (!this.searchText) return this.employeeList;
    const txt = this.searchText.toLowerCase();
    return this.employeeList.filter(emp =>
      emp.fk_empId.toLowerCase().includes(txt) || emp.EmpName.toLowerCase().includes(txt)
    );
  }

  viewEmployee(item: any) {
    
    const encryptedEmpId = this.encriptService.encryptText(item.fk_empId.toString());
    const encryptedProgramId = this.encriptService.encryptText(this.programId.toString());
    const encryptedSubProgramId = this.encriptService.encryptText(this.subProgramId.toString());

    this.router.navigate(['/dash/training/trainingdashboard/All_Employees_Attendance'], {
      queryParams: {
        pk_empid: encryptedEmpId,
        programId: encryptedProgramId,
        subprogramId: encryptedSubProgramId
      }
    });
  }

  // viewEmployee(item: any) {


  // this.router.navigate(['/dash/training/trainingdashboard/All_Employees_Attendance'], {
  //   queryParams: {
  //      pk_empid: item.fk_empId,
  //      programId: this.programId,
  //       subprogramId: this.subProgramId

  //   }
  // });
  // }

}



