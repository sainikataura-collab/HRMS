import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LanguageMasterService } from '../../HRservices/language-master.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-language-master',
     standalone: true,
    imports: [ReactiveFormsModule, RouterLink, CommonModule, NgxPaginationModule],
    templateUrl: './language-master.component.html',
    styleUrl: './language-master.component.scss'
})

export class LanguageMasterComponent {
  LanguageMaster!: FormGroup;
  submitted = false;
  showError = false;
  pk_langid!:number;
  Isedit=false;

  constructor(private fb: FormBuilder, private languageMasterService: LanguageMasterService,private toastrService:ToastrService, private router: Router, private route: ActivatedRoute,public encryptionService:EncryptionService) { }

  ngOnInit(): void {
    this.LanguageMaster = this.fb.group({
      description:['',[Validators.required]],
    });

    this.pk_langid = +this.encryptionService.decryptText(this.route.snapshot.params['pk_langid']);  
    if (this.pk_langid && this.pk_langid) {
      this.loadLanguageMasterData(this.pk_langid);
      this.Isedit = true; 
    } 
  }

  checkDuplicate(description: string): void {
    const fieldName = 'Language'; 
    const fieldValue = description; 
    const generalId = this.pk_langid; 
    
    this.languageMasterService.CheckDuplicateValue(fieldName, fieldValue,generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.LanguageMaster.get('description')?.setErrors({ duplicate: response.message });
        } 
        else {
  
          this.LanguageMaster.get('description')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.LanguageMaster.get('description')?.setErrors({ duplicate: 'Error checking Language Master Master availability.' });
      }
    });
    }

   


 

 

 



 


  onSubmit(): void {
    this.submitted = true;
  
    if (this.LanguageMaster.invalid) {
      this.showError = true;
      return;
    }

    const data = {
      ...this.LanguageMaster.value,
    };



// 
if(this.Isedit){

  const data = {
    ...this.LanguageMaster.value,
    pk_langid: this.pk_langid,
  };


   this.languageMasterService.update_languageMaster(data).subscribe({
    next: (result) => {
      if (result.isSuccess) {
        this.toastrService.success(result.message);
        this.router.navigateByUrl("/dash/hr/hrdashboard/LanguageMaster_list");
      }
       else {
        this.toastrService.error(result.message);
      }
    },
    
    error: () => {
      this.toastrService.error('An error occurred during form submission');
    }
   })
}

else{
  this.languageMasterService.add_languageMaster(data).subscribe({
    next: (result) => {
      if (result.isSuccess) {
        this.toastrService.success(result.message, 'Success');
        this.router.navigateByUrl('/dash/hr/hrdashboard/LanguageMaster_list');
      } else {
        this.toastrService.error(result.message || 'Failed to insert data.', 'Error');
      }
    },

    error: () => {
      this.toastrService.error('An error occurred during submission.', 'Error');
    }
  });
}

// 

  }



  loadLanguageMasterData(pk_langid:number) {
    this.languageMasterService.getById_languageMaster(pk_langid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.LanguageMaster.patchValue({        
            description:res.data.description,   
           
          
          });
  
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load Language master details.");
        }
      },
  
  
      error: () => {
        this.toastrService.error("Error loadingLanguage Master data.");
      }
    });
  }
  
    
  }

  
  