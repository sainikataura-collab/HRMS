import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { kMaxLength } from 'buffer';
import { BankMasterService } from '../../../services/bank-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-bank-master',
  standalone: true,
  imports: [RouterLink,FormsModule, 
    ReactiveFormsModule,
    CommonModule],
  templateUrl: './bank-master.component.html',
  styleUrl: './bank-master.component.scss'
})
export class BankMasterComponent {
    BankDetail!: FormGroup;
    submitted=false;
    showError = false;
    Isedit=false;
  
    // pk_BankId!: string ;
    pk_BankId!: string;

  constructor(private router: Router,private bankMasterService:BankMasterService,
   private formBuilder: FormBuilder,private toastrService: ToastrService,private route: ActivatedRoute,private encryptionService:EncryptionService
  ) {}




ngOnInit():void{
this.BankDetail=this.formBuilder.group({
  
  bankName: ['', [Validators.required,Validators.minLength(3)]],
  accountNo: [''],
  micrCode: [''],
  contactPerson1: [null],
  contactNo1: [''],
  contactPerson2: [null],
  contactNo2: [null],
  address: [null],
  remarks: [null],
  IFSC_Prefix:['',Validators.required],
  BankAccount_Max:[null,Validators.required],
  BankAccount_Min:[null,Validators.required],

  pk_BankId: ['']
});
this.pk_BankId = this.encryptionService.decryptText(this.route.snapshot.params['pk_BankId'].toString()); 

if (this.pk_BankId && this.pk_BankId !== 'undefined') {
  this.loadBankMasterData(this.pk_BankId);
  this.Isedit = true;  // ✅ Set edit mode
}
  this.BankDetail.get('bankName')?.valueChanges.subscribe(value => {
    if (value) {
      this.checkDuplicate(value);
    }
  });
}
checkDuplicate(bankName: string): void {
  const fieldName = 'Bank'; 
  const fieldValue = bankName; 
  const generalId = this.pk_BankId || ''; 

  this.bankMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.BankDetail.get('bankName')?.setErrors({ duplicate: response.message });
      } else {
        this.BankDetail.get('bankName')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.BankDetail.get('bankName')?.setErrors({ duplicate: 'Error checking bank availability.' });
    }
  });
}
redirectToPage() {
  this.router.navigate(['/dash/user/userdashboard/bankMaster_list']); // Redirect to another-page
}

onSubmit() {
  this.showError = true;
 this.submitted = true;
  if (this.BankDetail.invalid) {
    this.showError = true;
    return;
  }

  const data = {
    ...this.BankDetail.value,
      BankAccount_Max: Number(this.BankDetail.value.BankAccount_Max),
      BankAccount_Min: Number(this.BankDetail.value.BankAccount_Min),

    pk_BankId: this.pk_BankId

  };
  
 
  if(this.Isedit){
    this.bankMasterService.update_BankMaster(data).subscribe({
     next: (result) => {
      
       if (result.isSuccess) {
         this.toastrService.success(result.message);
         this.router.navigateByUrl("/dash/user/userdashboard/bankMaster_list");

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
  this.bankMasterService.add_BankMaster(data).subscribe({
    next: (result) => {
      if (result.isSuccess) {
        this.toastrService.success(result.message);
        this.router.navigateByUrl("/dash/user/userdashboard/bankMaster_list");
      } else {
        this.toastrService.error(result.message);
      }
    },
    error: (errorResponse) => {
      if (errorResponse.error && errorResponse.error.message.includes("duplicate")) {
        this.toastrService.error("Bank Name already exists.");
      } else {
        this.toastrService.error("An error occurred during form submission");
      }
    }
  }
 );
}
}

loadBankMasterData(pk_BankId: string) {
  this.bankMasterService.getById_BankMaster(pk_BankId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched Bank Data:", res.data);  // Debugging ke liye

        this.BankDetail.patchValue({
          bankName: res.data.bankName || '',
          accountNo: res.data.accountNo || '',
          micrCode: res.data.micrCode || '',
          contactPerson1: res.data.contactPerson1 || '',
          contactNo1: res.data.contactNo1 || '',
          contactPerson2: res.data.contactPerson2 || '',
          contactNo2: res.data.contactNo2 || '',
          address: res.data.address || '',
          remarks: res.data.remarks || '',
          BankAccount_Max:res.data.bankAccount_Max || '',
          BankAccount_Min:res.data.bankAccount_Min || '',
          IFSC_Prefix:res.data.ifsC_Prefix || '',
          pk_BankId: res.data.pk_BankId || ''
        });

        this.Isedit = true;
      } else {
        this.toastrService.error("Failed to load bank details.");
      }
    },
    error: () => {
      this.toastrService.error("Error loading bank data.");
    }
  });
}

//for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
//contact number validation
validateNumber1(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 54 || charCode >57) {
    event.preventDefault(); // Block non-numeric characters
  }
}

resetForm(): void {
  this.BankDetail.reset();
    }
}
