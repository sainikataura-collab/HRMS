import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject,Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HeadMasterService } from '../../../services/headmaster.service';



@Component({
  selector: 'app-head-master',
  standalone: true,
  imports: [NgSelectModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './head-master.component.html',
  styleUrl: './head-master.component.scss'
})
export class HeadMasterComponent {
ngxUILoaderService = inject(NgxUiLoaderService);

 SalaryHeadForm!:FormGroup;
 submitted=false;
showError = false;

pk_headid!:string;
Isedit=false;

Formula: { label: string, value: string }[]  = []; 
ParentHeads: { label: string, value: string }[]  = [];
   // Dropdown options
   headTypes = [
    { name: 'Earnings', value: 'E' },
    { name: 'Deductions', value: 'D' },
    { name: 'Over Time', value: 'O' },
    { name: 'Bonus', value: 'B' },
    { name: 'Notice Pay', value: 'N' },
    { name: 'Reimbursement', value: 'R' },
    { name: 'Other', value: 'T' }
  ];
  
   deductionTypes = [
    {name: 'select deduction', value: ''},
    {name: 'LOAN/ADVANCE', value: 'L' },
    {name: 'INSURANCE', value: 'I' },
    {name: 'OTHERS', value: 'O' }

   ];
  
   fixedHeads = [
    {name: 'select fixedhead', value: ''}
  ];

   taxable = [
    {name: 'select Taxable', value: ''},
    {name: 'Taxable', value: 'T' },
    {name: 'Partial Taxable', value: 'P' },
    {name: 'Non Taxable', value: 'N' }

   ];
   chapterVITypes = [
    {name: '80C', value: '80C' },
    {name: '80CCC', value: '80CCC' },
    {name: '80CCD', value: '80CCD' },
    {name: '80D',value:'80D'}

   ];
  
   sectionParts = [
    {name: 'select section part', value: ''},
    {name: 'Unser Section 10', value: '0'}
   ];



   effectTypes=[
    { name: 'OneTime', value: 'O' },
    { name: 'Monthly', value: 'M' },
    { name: 'Quarterly', value: 'Q' },
    { name: 'Half Yearly', value: 'H' },
    { name: 'Yearly', value: 'Y' }

  ]
  roundings=[
    { name: 'None', value: '0' },
    { name: '50 Paise', value: '1' },
    { name: 'Rupees', value: '2' }
  ]

 
 
  constructor(private fb: FormBuilder,private headMasterService:HeadMasterService,private  toastrService: ToastrService,private router: Router,private route: ActivatedRoute,private encryptionService : EncryptionService) {}

 
  ngOnInit() {
    this.SalaryHeadForm = this.fb.group({
      description: ['',[Validators.required]],
      shortdesc: ['',[Validators.required]],
      importdesc: ['',[Validators.required]],
      headtype: [null,[Validators.required]],
    deductiontype: [{ value: '', disabled: true }], // Initially disabled
      salaryorder: [0],
      fk_headfixedid: [0],
      mapping: [false],
      amount: [0],
      fk_formulaid: [],
      displayorder: [0,[Validators.required]],
      orderlevel: [0,[Validators.required]],
      orderlevel_ctc: [0,[Validators.required]],
      taxable: ['',[Validators.required]],
      non_taxable_limit: [{ value: 0, disabled: true }],
      chapVItype: [null],
      undersection: [null],
      calcinterest: [false],
      interestper: [{ value: 0, disabled: true }],
      rounding: [null,[Validators.required]],
      salRegShow_Flag: [false],
      active: [true],
      blocksummation: [false],
      pf_gross_part: [false],
      esi_groos_part: [false],
      gross_Part: [false],
      prsence_dep: [false],
      effecttype: [null,[Validators.required]],
      taxablesubbill: [false],
      remarks: [''],
      pf_rate_part: [{ value: false, disabled: true }],
      esi_Rate_Part: [{ value: false, disabled: true }],
      fk_headid:[0],
      pk_headid:[null],
      isRatePart :[false],
      allowImportMonthly:[false],
      isPartCTC:[false]
    });
    this.getParentHeadList('ParentHead');
    this.getFormulaList('Formula');

    if(this.route.snapshot.params['pk_headid']){
      this.pk_headid =this.encryptionService.decryptText(this.route.snapshot.params['pk_headid']?.toString()) ;  

    }

    if (this.pk_headid && this.pk_headid !== 'undefined') {
      this.loadHeadMasterData(this.pk_headid);
      this.Isedit = true; 

    }
     
    console.log("salarayHeadForm",this.SalaryHeadForm);
    console.log(this.SalaryHeadForm.get('description'));


    this.SalaryHeadForm.get('description')?.valueChanges.subscribe((value) => {
      console.log("value in desc",value);
      if (value) {
        this.checkDescriptionDuplicate(value);
      }
    });
  
    // Validate Short Description
    this.SalaryHeadForm.get('shortdescri')?.valueChanges.subscribe((value) => {
      if (value) {
        this.checkShortdescDuplicate(value);
      }
    });
  
    // Validate Import Description
    this.SalaryHeadForm.get('importdesc')?.valueChanges.subscribe((value) => {
      if (value) {
        this.checkImportdescDuplicate(value);
      }
    });


    this.SalaryHeadForm.get('calcinterest')?.valueChanges.subscribe((checked) => {
      if (checked) {
        this.SalaryHeadForm.get('interestper')?.enable();
      } else {
        this.SalaryHeadForm.get('interestper')?.disable();
        this.SalaryHeadForm.get('interestper')?.setValue(0); // Reset value
      }
    });
  
    this.SalaryHeadForm.get('headtype')?.valueChanges.subscribe((value) => {
      const deductionControl = this.SalaryHeadForm.get('deductiontype');
      if (value?.trim() === 'D') {
        deductionControl?.enable(); // Enable when value is "D"
      } else {
        deductionControl?.disable(); // Disable for other values
        deductionControl?.setValue('');
      }
    });

    this.SalaryHeadForm.get('mapping')?.valueChanges.subscribe((checked) => {
      if (checked) {
        this.SalaryHeadForm.get('fk_formulaid')?.disable();
        this.SalaryHeadForm.get('amount')?.disable();

      } else {
        this.SalaryHeadForm.get('fk_formulaid')?.enable();
        this.SalaryHeadForm.get('fk_formulaid')?.setValue(0);
        this.SalaryHeadForm.get('amount')?.enable();
        this.SalaryHeadForm.get('amount')?.setValue(0); // Reset value
      }
    });
    this.SalaryHeadForm.get('taxable')?.valueChanges.subscribe((value) => {
      const deductionControl = this.SalaryHeadForm.get('non_taxable_limit');
      if (value?.trim() === 'P') {
        deductionControl?.enable(); // Enable when value is "D"
      } else {
        deductionControl?.disable(); // Disable for other values
        deductionControl?.setValue('');
      }
    });

    // PF Gross Part must be checked before PF Rate Part can be checked
    this.SalaryHeadForm.get('pf_gross_part')?.valueChanges.subscribe((checked) => {
      const pfRateControl = this.SalaryHeadForm.get('pf_rate_part');
      if (checked) {
        pfRateControl?.enable();
      } else {
        pfRateControl?.setValue(false);
        pfRateControl?.disable();
      }
    });

    this.SalaryHeadForm.get('pf_rate_part')?.valueChanges.subscribe((checked) => {
      if (checked && !this.SalaryHeadForm.get('pf_gross_part')?.value) {
        this.SalaryHeadForm.get('pf_rate_part')?.setValue(false, { emitEvent: false });
        this.SalaryHeadForm.get('pf_rate_part')?.disable({ emitEvent: false });
      }
    });

    // ESI Gross Part must be checked before ESI Rate Part can be checked
    this.SalaryHeadForm.get('esi_groos_part')?.valueChanges.subscribe((checked) => {
      const esiRateControl = this.SalaryHeadForm.get('esi_Rate_Part');
      if (checked) {
        esiRateControl?.enable();
      } else {
        esiRateControl?.setValue(false);
        esiRateControl?.disable();
      }
    });

    this.SalaryHeadForm.get('esi_Rate_Part')?.valueChanges.subscribe((checked) => {
      if (checked && !this.SalaryHeadForm.get('esi_groos_part')?.value) {
        this.SalaryHeadForm.get('esi_Rate_Part')?.setValue(false, { emitEvent: false });
        this.SalaryHeadForm.get('esi_Rate_Part')?.disable({ emitEvent: false });
      }
    });
   }
  
  checkDescriptionDuplicate(description: string): void {
    this.checkDuplicate('HeadDescription', description, 'description');
  }
  
  checkShortdescDuplicate(shortdesc: string): void {
    this.checkDuplicate('Shortdesc', shortdesc, 'shortdescri');
  }
  
  checkImportdescDuplicate(importdesc: string): void {
    this.checkDuplicate('Importdesc', importdesc, 'importdesc');
  }
  
  // Generic Duplicate Check Function
  checkDuplicate(fieldName: string, fieldValue: string, controlName: string): void {
    const generalId = this.pk_headid || '';
  
    this.headMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        const control = this.SalaryHeadForm.get(controlName);
        if (control) {
          if (response && response.isSuccess === false) {
            control.setErrors({ duplicate: response.message });
          } else {
            control.setErrors(null);
          }
        }
      },  
      error: (err) => {
        console.error(`Duplicate Check API Error for ${controlName}:`, err);
        this.SalaryHeadForm.get(controlName)?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }
  getParentHeadList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call
  
    this.headMasterService.get_DropdownList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.ParentHeads = res.data.map((fk_headid: any) => ({
                    name: fk_headid.name,
                    value: fk_headid.value
                }));
            } else {
                this.toastrService.error("Failed to load ParentHead.");
            }
            this.ngxUILoaderService.stop(); // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching ParentHead.");
            
        }
    });
  }
  getFormulaList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call
  
    this.headMasterService.get_DropdownList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.Formula = res.data.map((pk_formulaid: any) => ({
                    name: pk_formulaid.name,
                    value: pk_formulaid.value
                }));
            } else {
                this.toastrService.error("Failed to load formula data.");
            }
            this.ngxUILoaderService.stop(); // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching formula data.");
            
        }
    });
  }
  restrictInput(event: KeyboardEvent) {
    const pattern = /^[a-zA-Z0-9]$/;
    const inputChar = event.key;
  
    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent invalid characters from being typed
    }
  }
  
  onSubmit(){
    this.submitted = true;

    const headtypeControl = this.SalaryHeadForm.get('headtype');
    const deductionControl = this.SalaryHeadForm.get('deductiontype');
  
    if (headtypeControl?.value === 'D') {
      deductionControl?.setValidators([Validators.required]);
    } else {
      deductionControl?.clearValidators(); 
      deductionControl?.setValue(''); 
    }
    
    deductionControl?.updateValueAndValidity(); 
  
  
  if (this.SalaryHeadForm.invalid) {
    this.showError = true;
    return;
  }
  const rawValue = this.SalaryHeadForm.getRawValue();
  const data = {
    ...rawValue,
   // interestper: 0,
    mapping: rawValue.mapping ,
    calcinterest: rawValue.calcinterest ,
    salRegShow_Flag: rawValue.salRegShow_Flag ,
    interestper: rawValue.calcinterest ? rawValue.interestper : 0,
    amount: rawValue.mapping ? 0 : rawValue.amount,
    non_taxable_limit: rawValue.taxable == 'P' ? rawValue.non_taxable_limit : 0,
    active: rawValue.active ,
    pk_headid: this.pk_headid ,
    fk_formulaid: rawValue.fk_formulaid ? rawValue.fk_formulaid : null,
    isRatePart : rawValue.isRatePart,
     isPartCTC : rawValue.isPartCTC,
    pf_gross_part: !!rawValue.pf_gross_part,
    pf_rate_part: rawValue.pf_gross_part ? !!rawValue.pf_rate_part : false,
    esi_groos_part: !!rawValue.esi_groos_part,
    esi_Rate_Part: rawValue.esi_groos_part ? !!rawValue.esi_Rate_Part : false
  };


      if(this.Isedit){
         this.headMasterService.update_headMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/head-master_list");
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
        this.headMasterService.add_headMaster(data).subscribe({

          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/head-master_list");

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


  loadHeadMasterData(pk_headid: string) {
    this.headMasterService.getById_headMaster(pk_headid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched Category Data:", res.data);  // Debugging ke liye

          const isPfGross = res.data.pf_gross_part ?? false;
          const isEsiGross = res.data.esi_groos_part ?? false;

          if (isPfGross) {
            this.SalaryHeadForm.get('pf_rate_part')?.enable();
          } else {
            this.SalaryHeadForm.get('pf_rate_part')?.disable();
          }

          if (isEsiGross) {
            this.SalaryHeadForm.get('esi_Rate_Part')?.enable();
          } else {
            this.SalaryHeadForm.get('esi_Rate_Part')?.disable();
          }

          this.SalaryHeadForm.patchValue({
            description: res.data.description || '',  
          shortdesc: res.data.shortdesc || '',  
          importdesc: res.data.importdesc || '',  
          headtype: res.data.headtype || '',  
          deductiontype: res.data.deductiontype || '',
          salaryorder: res.data.salaryorder ?? 0,  
          fk_headfixedid: res.data.fk_headfixedid ?? 0,  
          mapping: res.data.mapping?? false,  
          amount: res.data.amount ?? 0,  
          fk_formulaid: res.data.fk_formulaid || '',  
          displayorder: res.data.displayorder ?? 0,  
          orderlevel: res.data.orderlevel ?? 0,  
          orderlevel_ctc: res.data.orderlevel_ctc ?? 0,  
          taxable: res.data.taxable || '',  
          non_taxable_limit: res.data.non_taxable_limit ?? 0,  
          chapVItype: res.data.chapVItype || '',  
          undersection: res.data.undersection || '',  
          calcinterest:  res.data.calcinterest ?? false,  
          interestper: res.data.interestper ?? 0,  
          rounding: res.data.rounding || '',  
          salRegShow_Flag: res.data.salRegShow_Flag ?? false,  
          active: res.data.active?? false,  
          blocksummation: res.data.blocksummation ?? false,  
          pf_gross_part: isPfGross,  
          esi_groos_part: isEsiGross,  
          gross_Part: res.data.gross_Part ?? false,  
          prsence_dep: res.data.prsence_dep ?? false,  
          effecttype: res.data.effecttype || '',  
          taxablesubbill: res.data.taxablesubbill ?? false,  
          remarks: res.data.remarks || '',  
          pf_rate_part: isPfGross ? (res.data.pf_rate_part ?? false) : false,  
          esi_Rate_Part: isEsiGross ? (res.data.esi_Rate_Part ?? false) : false,  
          fk_headid: res.data.fk_headid ?? 0,
          isRatePart: res.data.isRatePart ?? false,
           isPartCTC: res.data.isPartCTC ?? false,
            allowImportMonthly: res.data.allowImportMonthly ?? false
          });
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading head data.");
      }
    });
  }
  resetForm(): void {
    this.SalaryHeadForm.reset({
      active: true,
      salaryorder: 0,
      fk_headfixedid: 0,
      mapping: false,
      amount: 0,
      calcinterest: false,
      salRegShow_Flag: false,
      blocksummation: false,
      pf_gross_part: false,
      esi_groos_part: false,
      gross_Part: false,
      prsence_dep: false,
      taxablesubbill: false,
      pf_rate_part: false,
      esi_Rate_Part: false,
      isRatePart: false,
        isPartCTC: false,
      allowImportMonthly: false
    });
    this.SalaryHeadForm.get('pf_rate_part')?.disable();
    this.SalaryHeadForm.get('esi_Rate_Part')?.disable();
  }
}