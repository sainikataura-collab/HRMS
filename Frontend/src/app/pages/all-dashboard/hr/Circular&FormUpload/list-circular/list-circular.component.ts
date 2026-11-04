import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { circularformService } from '../../HRservices/circular-form-upload.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-circular',
  standalone: true,
  imports: [NgxPaginationModule,RouterLink,CommonModule,FormsModule],
  templateUrl: './list-circular.component.html',
  styleUrl: './list-circular.component.scss'
})
export class ListCircularComponent {



ProgramDetails: any[] = [];
  searchText:string='';
  Isedit:boolean=false;

  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;

  constructor(private httpservice:circularformService,private route: ActivatedRoute,private toastrService:ToastrService,private router: Router,public encryptionService:EncryptionService) {}
  

  ngOnInit(): void {
    this.getList();
  }



  getList(): void {
    this.httpservice.get_DocUpload(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.ProgramDetails = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
}



   // Method to delete an item from the table
   delete(pk_uploadId: number) {
    if (confirm('Are you sure you want to delete this record?')) {
        this.httpservice.delete_DocUpload(pk_uploadId).subscribe(
            (response: any) => {
                if (response.isSuccess) {
  
                  this.toastrService.success(response.message);
                  this.getList(); // Refresh the list
                } 
                else {
                  this.toastrService.error(response.message);
                }
            },
            (errorMessage) => {
                console.error('Error deleting record', errorMessage);
                this.toastrService.error(errorMessage, 'Error');
            }
        );
    }
  }





isUpdate(pk_uploadId: number) {
  // Encrypt the ID before navigating
  const encryption=this.encryptionService.encryptText(pk_uploadId.toString())
  this.router.navigate(["/dash/hr/hrdashboard/Circular-Forms-Uploads", encryption]);
}
  onPageChange(event: number) {
    this.pageIndex = event;
  }


  filteredData() {
  if (!this.searchText) {
    return this.ProgramDetails;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.ProgramDetails.filter(item =>
    item.circularno?.toLowerCase().includes(searchTextLower) ||
    item.circularname?.toLowerCase().includes(searchTextLower)
  );
}


 //Anjali 5 feb 2026

download(filename: string) {
  this.httpservice.getImage(filename).subscribe({
    next: (blob: Blob) => {
      // Use the blob's type if available, otherwise detect from filename
      const mimeType = blob.type || this.getMimeType(filename);
      
      const fileURL = window.URL.createObjectURL(
        new Blob([blob], { type: mimeType })
      );
      window.open(fileURL, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
    },
    error: (err) => {
      console.error('Failed to load file:', err);
    }
  });
}

private getMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
}


}
