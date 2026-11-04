import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent } from '@ng-select/ng-select';
import { re } from 'mathjs';
import { Router, RouterLink } from '@angular/router';
import { CommonSearchComponent } from '../../../../payroll/Employee/common-search/common-search.component';
import { ManualPunchBio } from '../../../../payroll/services/manual-puch-bio.service';
import { EmployeeService } from '../../../../payroll/services/employee.service';

@Component({
  selector: 'app-employee-image-upload',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent,RouterLink],

  templateUrl: './employee-image-upload.component.html',
  styleUrl: './employee-image-upload.component.scss'
})
export class EmployeeImageUploadComponent {
  ImageUploadForm!: FormGroup;
    submitted=false;
    showError =false;
    showErroronProcess=false;
    EmployeeImageList=[]=[]
    selectedFile: File | null = null;
    // fk_empid:string='';
    pageIndex: number = 1;
pageSize: number = 10;
searchTextLock = '';
    ImageTypeList=[
      {name:'Photo',value:"P"},
      {name:'Signature',value:"S"},

    ]
    employees=[]=[];
    
      constructor(private fb: FormBuilder,
        private  toastrService: ToastrService,
         private Loader:NgxUiLoaderService,
               private httpservice: ManualPunchBio,
               private httppolicyservice: EmployeeService,
               private router: Router
        ) {}

        ngOnInit() {

          const fk_empid=sessionStorage.getItem('UserId');
          this.ImageUploadForm = this.fb.group({
            fk_empid: ['', Validators.required],
            imageType: ['', Validators.required],
            date: ['', Validators.required],
            description: ['', Validators.required],
            filename: [null] ,
            FileBytes:[[]]
          });
          this.getempList();

        }

// Get_Employee_image(){
  
//   this.httppolicyservice.Get_Employee_Image(pageIndex, pageSize ).subscribe({ next: (res) => {
//     if(res.isSuccess){
//       this.EmployeeImageList=res.data;
//       console.log(res.message);
//       this.toastrService.error(res.message)
//     }
//     else{
//       this.EmployeeImageList=[];
//       this.toastrService.error(res.message)
//     }
//   }})
// }

        getempList() {
          this.httpservice.getCommanList('Employee').subscribe({
            next: (res) => {
              this.employees = res.data
            }
          })
        }

        onFileSelected(event: any) {
          const file = event.target.files[0];
          if (file) {
            this.selectedFile = file;
            this.ImageUploadForm.patchValue({ FileBytes: file });
          }
        }
      handleFilters(filters: any) {
      this.ImageUploadForm.patchValue(filters);    
      }

  Submit(){
    debugger
    this.submitted = true;
    if (this.ImageUploadForm.invalid || !this.selectedFile) {
      this.toastrService.error('Please fill all required fields and upload a file.');
      return;
    }
    const formValue = this.ImageUploadForm.value;
    // const xmlData = {
    //   HR_Employee_Image_Mst: {
    //     fk_empid: formValue.fk_empid,
    //     imagetype: formValue.imageType,
    //     dated: formValue.date,
    //     description: formValue.description,
    //     // filename: this.selectedFile.name
    //   }
    // };
  
    const formData = new FormData();
    formData.append('Items.Items.FkEmpId', formValue.fk_empid);
    formData.append('Items.Items.ImageType', formValue.imageType);
    formData.append('Items.Items.Dated', formValue.date);
    formData.append('Items.Items.Description', formValue.description);
    formData.append('filename', formValue.filename || '');
    formData.append('FileBytes', this.selectedFile as Blob);
    formData.append('contentType', this.selectedFile?.type || '');
    // this.Loader.start();
    this.httppolicyservice.add_Employee_Image(formData).subscribe({next:(res)=>{
      // this.Loader.stop();
      if(res.isSuccess){
        this.toastrService.success(res.message);
         this.EmployeeImageList=res.data
        this.router.navigateByUrl("/dash/hr/hrdashboard/Employee_Image_list")
      }else{
        this.toastrService.info('Duplicate data is not submit.');
      }
    },
    error: () => {
      // this.Loader.stop();
      this.toastrService.error('Upload failed. Please try again.');
    }})
  }


}
