import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { DepartmentService } from '../../../services/department.service';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-sub-department-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectComponent,RouterLink],

  templateUrl: './sub-department-master.component.html',
  styleUrl: './sub-department-master.component.scss'
})
export class SubDepartmentMasterComponent {

  SubDeptMstForm!:FormGroup;
  department: { label: string, value: string }[]  = []; 

  pk_subdeptid:string | null=null

  Isedit:Boolean=false;
  showError:Boolean=false;


    constructor(private fb:FormBuilder,  private toastrService: ToastrService,private SubDepService:DepartmentService,
      private ngxUILoaderService: NgxUiLoaderService, private route: ActivatedRoute, private router:Router,private encryptionService:EncryptionService){}
      
    
      ngOnInit():void{
      
        this.SubDeptMstForm=this.fb.group({
          fk_deptid:[null,Validators.required],
          description:[null,Validators.required],
          active:[true,Validators.required],
       
        })
    
        // this.pk_assetId = Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['pk_assetId']));
    
        this.getCommonDropdown('Department')

        this.pk_subdeptid=this.route.snapshot.params['pk_subdeptid']
         if (this.pk_subdeptid && this.pk_subdeptid) {
          this.get_SubDeptByid(this.pk_subdeptid);
          this.Isedit = true; 

          // this.SubDeptMstForm.get('fk_deptid')?.disable();
        }
      }



      get_SubDeptByid(pk_subjectid: string) {
     
        this.ngxUILoaderService.start(); // Start loader before API call
      
        this.SubDepService.get_SubDepartmentById(pk_subjectid).subscribe({
          next: (res) => {
            if (res.isSuccess && res.data) {
    
              this.SubDeptMstForm.patchValue({
                pk_subdeptid:res.data.pk_subdeptid,
                fk_deptid:res.data.fk_deptid,
                active:res.data.active,
                description:res.data.description, 
    
              });
             
              this.Isedit = true;
    
            }
             else 
             {
              this.toastrService.error("Failed to load Category details.");
             }
            this.ngxUILoaderService.stop(); // Stop loader after response
      
          },
          error: () => {
            this.toastrService.error("Error loading Category data.");
            this.ngxUILoaderService.stop(); // Stop loader on error
      
          }
        });
      }
    
  
      Onsubmit(): void {
        if (this.SubDeptMstForm.invalid) {
          this.showError = true;
          return;
        }
        const formData = {
          ...this.SubDeptMstForm.value,
        };
      
        if (this.Isedit) {
          const updateData = { ...formData, pk_subdeptid: (this.pk_subdeptid) };
          this.SubDepService.update_Subdepartment(updateData).subscribe({
            next: (res) => {
          
              if (res.isSuccess) {
                this.toastrService.success(res.message);
                this.router.navigate(['/dash/user/userdashboard/Sub-Department_list']);
              } else {
                this.toastrService.error(res.message );
              }
            },
            error: (err) => {
              this.toastrService.error('Something went wrong while updating!');
            }
          });
      
        } else {
         
          this.SubDepService.add_subdepartment(formData).subscribe({
            next: (res) => {
              if (res.isSuccess) {
                this.toastrService.success(res.message);
                this.router.navigate(['/dash/user/userdashboard/Sub-Department_list']);
              } else {
                this.toastrService.error(res.message );
              }
            },
            error: (err) => {
              this.toastrService.error('Something went wrong while adding!');
            }
          });
        }
      }
  
      
      // checkDesignationAvailability(description: string): void {
      //   const fieldName = 'Department'; 
      //   const fieldValue = description; 
      //   const generalId = this.deptpartmentId || ''; 
      
      //   this.SubDepService.(fieldName, fieldValue, generalId).subscribe({
      //     next: (response) => {
      //       if (response && response.isSuccess === false) {
      //         this.departmentForm.get('description')?.setErrors({ duplicate: response.message });
      //       } else {
      //         this.departmentForm.get('description')?.setErrors(null);
      //       }
      //     },
      //     error: (err) => {
      //       console.error('Duplicate Check API Error:', err);
      //       this.departmentForm.get('description')?.setErrors({ duplicate: 'Error checking designation availability.' });
      //     }
      //   });
      // }
      
      
      
      
      getCommonDropdown(fieldName: string) {
      
        this.SubDepService.getCommonList(fieldName).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.department = res.data.map((fk_depHodid: any) => ({
                        name: fk_depHodid.name,
                        value: fk_depHodid.value
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
      
  



}
