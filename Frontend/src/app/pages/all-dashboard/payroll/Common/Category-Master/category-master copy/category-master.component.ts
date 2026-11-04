import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { CategoryMasterServiceService } from '../../../services/category-master-service.service';

@Component({
  selector: 'app-category-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './category-master.component.html',
  styleUrl: './category-master.component.scss'
})
export class CategoryMasterComponent {
categoryFrom!:FormGroup;
submitted=false;
showError = false;

pk_Catid!:string;
Isedit=false;
  
  constructor(private fb: FormBuilder,private CategoryMasterService:CategoryMasterServiceService,private  toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService) {}

  ngOnInit():void{
   
    this.categoryFrom=this.fb.group({

      category: ['',[Validators.required,Validators.maxLength(50),Validators.minLength(2)]],
      pk_Catid:['']
    })

    this.pk_Catid = this.encryptionService.decryptText(this.route.snapshot.params['pk_Catid'].toString());  

    if (this.pk_Catid && this.pk_Catid !== 'undefined') {
      this.loadCategoryMasterData(this.pk_Catid);
      this.Isedit = true; 

    }
    this.categoryFrom.get('category')?.valueChanges.subscribe((value) => {
      this.checkDuplicate(value);
    });
  }
  checkDuplicate(category: string): void {
    const fieldName = 'Category'; 
    const fieldValue = category; 
    const generalId = this.pk_Catid || ''; 
  
    this.CategoryMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.categoryFrom.get('category')?.setErrors({ duplicate: response.message });
        } else {
          this.categoryFrom.get('category')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.categoryFrom.get('category')?.setErrors({ duplicate: 'Error checking category availability.' });
      }
    });
  }


  onSubmit(){
    this.submitted = true;
  if (this.categoryFrom.invalid) {
    this.showError = true;
    return;
  }

  const data = {
    ...this.categoryFrom.value,
  fk_UserID: sessionStorage.getItem('fk_UserID'),
   locID: sessionStorage.getItem('fk_LocID'),
   companyId: sessionStorage.getItem('fk_CompanyID'),

   pk_Catid: this.pk_Catid 

  };
      
      if(this.Isedit){
         this.CategoryMasterService.update_categoryMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/categoryMaster_list");
            } else {
              this.toastrService.error(result.message);
            }
          },
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrService.error('An error occurred during form submission');
          }
         })
      }
   
      else{
        this.CategoryMasterService.add_categoryMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/categoryMaster_list");

            } else {
              this.toastrService.error(result.message);
            }
          },
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrService.error('An error occurred during form submission');
          }
        })
      
      }
  }

  
  loadCategoryMasterData(pk_Catid: string) {
    this.CategoryMasterService.getById_categoryMaster(pk_Catid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched Category Data:", res.data);  // Debugging ke liye
  
          this.categoryFrom.patchValue({
            category: res.data.category ,
      
          });
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load Category details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading Category data.");
      }
    });
  }
  resetForm(): void {
         this.categoryFrom.reset();
        }
}