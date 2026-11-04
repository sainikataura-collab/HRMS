import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { AccidentDetailService } from '../../HRservices/accident-detail.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-accident-details',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent],
  templateUrl: './accident-details.component.html',
  styleUrl: './accident-details.component.scss'
})
export class AccidentDetailsComponent {

  Accidentform!: FormGroup;
  fileToUpload: File | null = null;
  ImageUrl: string = '';   
  FileName: string = '';    
  oldfile: string='';
    submitted=false;
    pk_accidentId: string='';
    Isedit=false;
    EmployeeList: { name: string; value: string }[] = [];
   // Default filter structure
   employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    userId: '',
    empStatus: '',
  };
  
  
    constructor(private Service:AccidentDetailService,private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
  
    ngOnInit() {
      this.Accidentform= this.fb.group({
        fk_empid: [null,Validators.required],
        description: ['',Validators.required],
        location: [''],
        accidentdate: ['',Validators.required],
        claimdate: [''],
        receivedate: [''],
        expenceamt: [''],
        claimamt: [''],
        receivedamt: [''],
        Ifilename: [''],
        remarks:['']
        


        
        
     
      
      });
  
      this.pk_accidentId = this.encryption.decryptText(this.route.snapshot.params['pk_accidentId']);
      if (this.pk_accidentId) {
      this.Patchform(this.pk_accidentId);
      this.Isedit = true; 
    }
    }    
   
    handleFilters(filters: any) {
      this.employeeFilters = filters;
      this.getEmployees(); // Refresh list with new filters
    }
  
    getEmployees(): void {
      this.Service.get_Employees_Ddl(this.employeeFilters).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.EmployeeList = res.data.map((emp: any) => ({
              name: emp.name,
              value: emp.value,
            }));
          } else {
            this.EmployeeList = [];
            this.toastrService.error(res.message, 'Error');
          }
        },
        error: (error) => {
          this.EmployeeList = [];
          this.toastrService.error('Failed to retrieve employees', 'Error');
        },
      });
    }
  
    // Prevents non-numeric input in number fields
 validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
//for file


onFileSelected(event: any) {
  const file: File = event.target.files[0]; // Get the selected file
  if (file) {
    this.fileToUpload = file;
    this.FileName = '';
    this.ImageUrl = '';
  }
}


    submitForm(): void {
  
      if (this.Accidentform.invalid) {
       // this.toastrService.error('Please fill all required fields.');
        this.submitted = true;
        return;
      }
    
      // const formData = {
      //   ...this.Accidentform.value,
        
      // };
      
      const formData = new FormData();
      formData.append('fk_empid', this.Accidentform.get('fk_empid')?.value || '');
      formData.append('description', this.Accidentform.get('description')?.value || '');
      formData.append('location', this.Accidentform.get('location')?.value || '');
      formData.append('accidentdate', this.Accidentform.get('accidentdate')?.value || '');
      formData.append('claimdate', this.Accidentform.get('claimdate')?.value || '');
      formData.append('receivedate', this.Accidentform.get('receivedate')?.value || '');
      formData.append('expenceamt', this.Accidentform.get('expenceamt')?.value || '');
      formData.append('claimamt', this.Accidentform.get('claimamt')?.value || '');
      formData.append('receivedamt', this.Accidentform.get('receivedamt')?.value || '');
      formData.append('remarks', this.Accidentform.get('remarks')?.value || '');
    
      if (this.fileToUpload) {
        formData.append('Ifilename', this.fileToUpload);
      }
      else if (this.oldfile) {
        formData.append('filename', this.oldfile); // No new file, use existing
        console.log("ghihi",this.oldfile)
      }

      
      
      // ✅ **Check if perquisite exists (Update) or not (Insert)**
      if (this.pk_accidentId) {
         formData.append('pk_accidentId', this.pk_accidentId);

        // **UPDATE existing perquisite**
       
    
        this.Service.update_accidentDetail(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'detail updated successfully!');
              this.router.navigate(['/dash/hr/hrdashboard/AccidentDetail_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to update detail.');
            }
          },
          error: (err) => {
            console.error('Update API Error:', err);
            this.toastrService.error('Something went wrong while updating!');
          }
        });
    
      } else {
        // **INSERT new designation**
        
        this.Service.add_accidentDetail(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'detail added successfully!');
              this.router.navigate(['/dash/hr/hrdashboard/AccidentDetail_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to add detail.');
            }
          },
          error: (err) => {
            console.error('Insert API Error:', err);
            this.toastrService.error('Something went wrong while adding!');
          }
        });
      }
    }
    formatDateForInput(dateStr: string): string | null {
      if (!dateStr) return null;
  
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
  
      const [day, month, year] = parts;
      const date = new Date(+year, +month - 1, +day); // Month is 0-based in JS
      if (isNaN(date.getTime())) return null;
  
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60000);
      return localDate.toISOString().split('T')[0];
    }
    //get by id and patch the value
    Patchform(pk_accidentId: string) {
       this.Service.get_accidentDetailByid(this.pk_accidentId).subscribe({
          next: (res) => {
            if (res.isSuccess && res.data)
               {
                 // Helper function to format date safely
                
              this.Accidentform.patchValue({

                fk_empid: res.data.fk_empid,
                description: res.data.description,
                location: res.data.location,
                accidentdate:this.formatDateForInput(res.data.accidentdate),
                claimdate: this.formatDateForInput(res.data.claimdate),
                receivedate: this.formatDateForInput(res.data.receivedate),
                expenceamt: res.data.expenceamt,
                claimamt: res.data.claimamt,
                receivedamt: res.data.receivedamt,
                Ifilename: res.data.filename,
                remarks: res.data.remarks
    
                
       });
             
          this.oldfile = res.data.filename; // Reset selected file
         this.FileName = res.data.filename;
       if (this.FileName) {
        this.Service.getImage(this.FileName).subscribe({
          
          next: (blob) => {
            this.ImageUrl = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Failed to load image:', err);
            this.ImageUrl = '';
          }
        });
      }
      
              this.Isedit = true;
            } else {
              this.toastrService.error("Failed to load details.");
              
            }
           },
          error: () => {
            this.toastrService.error("Error loading data.");
    
      
          }
        });
      }
     
    
  
    resetForm(): void {
           this.Accidentform.reset();
         
          }

}
