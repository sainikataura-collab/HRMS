import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DeductionSlabService } from '../../services/deduction-slab.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-deduction-slab',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './deduction-slab.component.html',
  styleUrl: './deduction-slab.component.scss'
})
export class DeductionSlabComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
 
  DeductionSlabform!: FormGroup;
   submitted=false;
   showError = false;
 
   pk_slabid!:string;
   Isedit=false;
   types=[
    { name: 'select Type', value: '' },
    { name: 'Male', value: 'M' },
    { name: 'Female', value: 'F' },
    { name: 'Senior Sitizion', value: 'S' }
   ]
   // add anjali
   selectResime=[
     { name: 'select Type', value: '' },
    { name: 'Old', value: 'Old' },
    { name: 'New', value: 'New' },
   ]
 
   constructor(private fb: FormBuilder,private DeductionSlabService:DeductionSlabService,private  toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService){}
   ngOnInit() {
     this.DeductionSlabform = this.fb.group({
      personType: ['',Validators.required],
      //add this 9 sept anjali
  taxRegime: ['', Validators.required],  
            //
       sno: ['',Validators.required,],
       lowerLimit: ['',Validators.required],
       upperLimit: ['',Validators.required],
       tax_Percent: ['',Validators.required],
       pk_slabid:['']
     });
     if(this.route.snapshot.params['pk_slabid']){
       this.pk_slabid = this.encryptionService.decryptText(this.route.snapshot.params['pk_slabid'].toString());  
 
     }
     if (this.pk_slabid && this.pk_slabid !== 'undefined') {
       this.loadDeductionSlabData(this.pk_slabid);
       this.Isedit = true; 
 
     }
 
   }
  
   restrictInput(event: KeyboardEvent) {
     const pattern = /^[0-9]$/;
     const inputChar = event.key;
   
     if (!pattern.test(inputChar)) {
       event.preventDefault(); // Prevent invalid characters from being typed
     }
   }
   restrictInputDecimal(event: KeyboardEvent) {
     const pattern = /^[0-9to.]$/;
     const inputChar = event.key;
   
     if (!pattern.test(inputChar)) {
       event.preventDefault(); // Prevent invalid characters from being typed
     }
   }
   
   onSubmit(){
     this.submitted = true;
    
     if (this.DeductionSlabform.invalid) {
       this.showError = true;
       debugger
       return;
     }
 
   const data = {
     ...this.DeductionSlabform.value,
   
    pk_slabid: this.pk_slabid 
 
   };
       
       if(this.Isedit){
          this.DeductionSlabService.update_deductionSlab(data).subscribe({
           next: (result) => {
             if (result.isSuccess) {
               this.toastrService.success(result.message);
               this.router.navigateByUrl("/dash/payroll/payrolldashboard/deductionSlab_list");
             } else {
               this.toastrService.error(result.message);
             }
           },
           error: () => {
             this.toastrService.error('An error occurred during form submission');
           }
          })
       }
    
       else{
         this.DeductionSlabService.add_deductionSlab(data).subscribe({
           next: (result) => {
             if (result.isSuccess) {
               this.toastrService.success(result.message);
               this.router.navigateByUrl("/dash/payroll/payrolldashboard/deductionSlab_list");
 
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
 
   
   loadDeductionSlabData(pk_slabid: string) {
     this.DeductionSlabService.getById_deductionSlab(pk_slabid).subscribe({
       next: (res) => {
         if (res.isSuccess && res.data) {
           console.log("Fetched DeductionSlab Data:", res.data);  // Debugging ke liye
   
           this.DeductionSlabform.patchValue({
            personType : res.data.personType? res.data.personType.toString() : '',
            //addanjali
  taxRegime: res.data.taxRegime ? res.data.taxRegime.toString() : '', 
//
             sno: res.data.sno ,
             lowerLimit: res.data.lowerLimit ,
             upperLimit: res.data.upperLimit ,
             tax_Percent: res.data.tax_Percent ,
 
           });
   
           this.Isedit = true;
         } else {
           this.toastrService.error("Failed to load DeductionSlab details.");
         }
       },
       error: () => {
         this.toastrService.error("Error loading DeductionSlab data.");
       }
     });
   }
   
 
   resetForm(): void {
          this.DeductionSlabform.reset();
        
         }
 }
 
 
 
 