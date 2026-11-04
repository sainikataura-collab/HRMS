import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { TrainingCalendarService } from '../../../all-dashboard/training/services/training-calendar.service';
import { ProgramService } from '../../../all-dashboard/training/services/program.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccidentDetailService } from '../../../all-dashboard/hr/HRservices/accident-detail.service';

@Component({
  selector: 'app-training-material-emp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgSelectModule, NgxPaginationModule],
  templateUrl: './training-material-emp.component.html',
  styleUrls: ['./training-material-emp.component.scss']
})
export class TrainingMaterialEmpComponent implements OnInit {

  materials: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 2;
  totalItems: number = 0;
  showError: boolean = false;

  trainingPrograms: any[] = [];



  // 🔍 Filter object
  filter = {
    fk_planningId: undefined as number | undefined,
    materialType: '',
    isActive: '',
  };

  searchText: string = '';

  // Dropdown list for types
  materialTypes = [
    { id: '', name: 'Select Type' },
    { id: 'video', name: 'Video' },
    { id: 'document', name: 'Document' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'link', name: 'External Link' },
  ];

  constructor(
    private service: TrainingCalendarService,
    private programService: ProgramService,
    private toastr: ToastrService,
    private serivce2:AccidentDetailService
  ) { }

  ngOnInit(): void {
    this.loadTrainingPrograms();
  }


  // 🧾 Load Training Program list for dropdown
  loadTrainingPrograms(): void {
    this.programService.getCommonList('PlannedProgram').subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data?.length) {
          this.trainingPrograms = res.data.slice(1).map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastr.warning('No training programs found.');
        }
      },
      error: (err) => {
        console.error('Error fetching training programs:', err);
        this.toastr.error('Failed to load training programs.');
      },
    });
  }

  // 📦 Load Material Data
  loadMaterials(): void {
    if (!this.filter.fk_planningId) {
      this.showError = true;
      return;
    }

    this.showError = false;

    // Convert null to empty string
    const materialType = this.filter.materialType || '';

    this.service
      .get_Material(
        this.pageIndex - 1,
        this.pageSize,
        materialType,
        this.filter.fk_planningId
      )
      .subscribe({
        next: (res: any) => {
          // this.isLoading = false;
          if (res.isSuccess) {
            this.materials = res.data || [];
            this.totalItems = res.totalCount || 0;
          } else {
            this.materials = [];
            this.totalItems = 0;
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {

          // this.isLoading = false;

          console.error(err);
          this.toastr.error('Failed to load materials.');
        },
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



  // 🔁 On Filter Change
  onFilterChange(): void {
    this.pageIndex = 1;
    this.loadMaterials();
  }

  // 🔄 Reset Filters
  resetFilters(): void {
    this.filter = {
      fk_planningId: undefined,
      materialType: '',
      isActive: '',
    };
    this.pageIndex = 1;
    this.materials = [];
    this.totalItems = 0;
  }


  // ⏩ Pagination

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadMaterials(); // Fetch new page data
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
