import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TrainingCalendarService } from '../../services/training-calendar.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule} from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccidentDetailService } from '../../../hr/HRservices/accident-detail.service';

@Component({
  selector: 'app-training-material-list',
  standalone: true,
  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule],
  templateUrl: './training-material-list.component.html',
  styleUrl: './training-material-list.component.scss'
})
export class TrainingMaterialListComponent {

 materials: any[] = [];
  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;

 searchText: string = '';
  // Filter object
  
  filter = {
    materialType: '',
    fk_planningId: undefined,
    searchText: ''
  };

  materialTypes = [
    { id: 'video', name: 'Video' },
    { id: 'document', name: 'Document' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'link', name: 'External Link' }
  ];

  constructor(private service: TrainingCalendarService, private toastr: ToastrService,private router:Router,
    private serivce2:AccidentDetailService
  ) {}

  ngOnInit(): void {
    this.loadMaterials();
  }
  

  loadMaterials(): void {
    this.service.get_Material(
      this.pageIndex-1,
      this.pageSize,
       this.filter.materialType,     // optional
    this.filter.fk_planningId
    ).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.materials = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.materials = [];
          this.totalItems = 0;
          this.toastr.warning(res.message);
        }
      },
      error: () => {
        this.toastr.error('Failed to load materials.');
      }
    });
  }


  filteredData() {
  if (!this.searchText) {
    return this.materials;
  }
  const searchTextLower = this.searchText.toLowerCase();

  return this.materials.filter(material =>
    material.materialType?.toLowerCase().includes(searchTextLower) ||
    material.materialTitle?.toLowerCase().includes(searchTextLower) ||
    material.description?.toLowerCase().includes(searchTextLower)
  );
}


  onFilterChange(): void {
    this.pageIndex = 1; // Reset page
    this.loadMaterials();
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadMaterials();
  }

  

isUpdate(pk_materialId: number) {
  // Encrypt the ID before navigating
  // const encryptedId = this.encryptionService.encryptText(pk_shiftId.toString());
  this.router.navigate(["/dash/training/trainingdashboard/Training_content",pk_materialId]);
}


 

    downloadMaterial(materialPath: string) {
      this.serivce2.getMeterial(materialPath).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = materialPath; // Set the filename for download
          a.click();
          window.URL.revokeObjectURL(url); // Clean up
        },
        error: (err) => {
          console.error('Failed to load image:', err);
        }
      });
    }
 
}