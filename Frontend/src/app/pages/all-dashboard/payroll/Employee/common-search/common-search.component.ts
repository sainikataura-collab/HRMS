import { CommonModule } from '@angular/common';
import { Component, inject, HostListener, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchService } from '../../services/common-search.service';
import { DropdownService } from '../../../../../shared/services/dropdown.service';


@Component({
  selector: 'app-common-search',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule],
  templateUrl: './common-search.component.html',
  styleUrl: './common-search.component.scss'
})
export class CommonSearchComponent implements OnInit {
  @Input() defaultFilters: any = {}; // Accept filters from parent
  
  @Output() filtersChanged = new EventEmitter<any>(); // Send filters to parent
  
  commonsearch!: FormGroup;
  isFilterFormVisible = false;
  
  router = inject(Router);
  selectedLocations: string[] = [];
  selectedDepartments: string[] = [];
  
  showTooltip = false;
  
  locationOptions: any[] = [];
  departmentOptions: any[] = [];
  designationOptions: any[] = [];
  cityOptions: any[] = [];
  isInputFocused = false;

  natureOptions: any[] = [];
  statusOptions = [
    { name: '-- Select Status --', value: '' },
    { name: 'Current', value: 'N' },
    { name: 'Left', value: 'Y' },
    { name: 'All', value: 'B' }
  ];
  
  sortByOptions = [
    { name: '-- Sorted By --', value: '' },
    { name: 'Employee Code', value: 'empcode' },
    { name: 'Employee Name', value: 'empname' },
    { name: 'Location', value: 'fk_locid' },
    { name: 'Department', value: 'fk_deptid' },
    { name: 'Designation', value: 'fk_desgid' },
    { name: 'City', value: 'fk_cityid' },
  
  ];

  constructor(
    private fb: FormBuilder,
    private httpservice: CommonSearchService,
    private dropdownService: DropdownService
  ) {}

  get empCodeList(): string[] {
    const empCodeStr = this.commonsearch?.get('empCode')?.value;
    if (!empCodeStr) return [];
    return empCodeStr.split(',').map((code: string) => code.trim()).filter((code: string) => code.length > 0);
  }

  get empCodeCount(): number {
    return this.empCodeList.length;
  }

  tooltipSearchQuery: string = '';

  get filteredEmpCodeList(): string[] {
    if (!this.tooltipSearchQuery) {
      return this.empCodeList;
    }
    const query = this.tooltipSearchQuery.toLowerCase();
    return this.empCodeList.filter(code => code.toLowerCase().includes(query));
  }

  ngOnInit() {
   
    let empStatus= this.defaultFilters?.empStatus;
    if(empStatus==null || empStatus=='')
     empStatus='N';
    
    let SortedBy= this.defaultFilters?.sortBy;
    if(SortedBy==null || SortedBy=='')
     SortedBy='empcode';
    
 
 
     this.commonsearch = this.fb.group({
       empCode: [this.defaultFilters?.empCode || ''],
       empName: [this.defaultFilters?.empName || ''],
       selectedLocations: [this.defaultFilters?.selectedLocations || []], 
       selectedDepartments: [this.defaultFilters?.selectedDepartments || []], 
       selectedDesignation: [this.defaultFilters?.selectedDesignation || ''], 
       selectedNature: [this.defaultFilters?.selectedNature || ''], 
       selectedCity: [this.defaultFilters?.selectedCity || ''], 
       sortBy: [SortedBy || ''], 
       empStatus: [empStatus|| '']
     });
 
   
     this.loadDropdowns();
     // React to location refresh trigger
    this.dropdownService.locationReloadObservable$.subscribe(() => {
      this.dropdownService.refreshLocations().subscribe(data => {
      this.locationOptions = data;
      this.selectedLocations = data.map(loc => loc.value);
      this.commonsearch.controls['selectedLocations'].setValue(this.selectedLocations);
      this.emitIfAllDefaultsReady();
      });
    });

    // React to department refresh trigger
    this.dropdownService.departmentReloadObservable$.subscribe(() => {
      this.dropdownService.refreshDepartments().subscribe(data => {
      this.departmentOptions = data;
      this.selectedDepartments = data.map(dep => dep.value);
      this.commonsearch.controls['selectedDepartments'].setValue(this.selectedDepartments);
      this.emitIfAllDefaultsReady();
     });
   });


    //  this.dropdownService.getLocations().subscribe(data => {
    //    this.locationOptions = data;
    //    this.selectedLocations = this.locationOptions.map(loc => loc.value);
    //    this.commonsearch.controls['selectedLocations'].setValue(this.selectedLocations);
    //    this.emitIfAllDefaultsReady();
    //  });
    //  this.dropdownService.getDepartments().subscribe(data => {
    //    this.departmentOptions = data;
    //    this.selectedDepartments = this.departmentOptions.map(loc => loc.value);
    //    this.commonsearch.controls['selectedDepartments'].setValue(this.selectedDepartments);
    //    this.emitIfAllDefaultsReady();
    //  });
   }
  
  








  // onSearchInput(event: Event) {
  //   const inputValue = (event.target as HTMLInputElement).value;
  //   console.log("Search input changed:", inputValue);
  //   // You can implement further logic as needed
  // }

  onSearchInput(event: Event): void {
  let input = (event.target as HTMLInputElement).value?.trimStart();
  
  if (input) {
    // Convert spaces to commas
    input = input.replace(/\s+/g, ',');
    (event.target as HTMLInputElement).value = input;
  }

  this.commonsearch.patchValue({
    empCode: input
  });

  // Filter turant apply karne ke liye
  this.submitFilterForm();
}

onEmpCodeInput(event: Event): void {
  let input = (event.target as HTMLInputElement).value?.trimStart();
  
  if (input) {
    // Convert spaces to commas
    input = input.replace(/\s+/g, ',');
    this.commonsearch.patchValue({ empCode: input }, { emitEvent: false });
    (event.target as HTMLInputElement).value = input;
  }
}
  
  onModalClick(event: Event) {
    event.stopPropagation(); // Prevents click from closing the filter modal
    console.log("Modal clicked");
  }


  // Fetch Dropdown Data from Service
  loadDropdowns() {
    // this.dropdownService.getLocations().subscribe(data => {
    //   // console.log('Locations:', data);
    //   this.locationOptions = data;
    // });

    // this.dropdownService.getDepartments().subscribe(data => {
    //   //console.log('Departments:', data);
    //   this.departmentOptions= data;
    // });

    this.dropdownService.getLocations().subscribe(data => {
      //this.locationOptions = data;
        this.locationOptions = [
        { name: 'Select All', value: '__select_all__' },
        ...data
      ];
      this.selectedLocations = data.map(loc => loc.value);
      this.commonsearch.controls['selectedLocations'].setValue(this.selectedLocations);
      this.emitIfAllDefaultsReady();
    });

    this.dropdownService.getDepartments().subscribe(data => {
      //this.departmentOptions = data;
          this.departmentOptions = [
        { name: 'Select All', value: '__select_all__' },
        ...data
      ];
      this.selectedDepartments = data.map(dep => dep.value);
      this.commonsearch.controls['selectedDepartments'].setValue(this.selectedDepartments);
      this.emitIfAllDefaultsReady();
    });

    this.dropdownService.getDesignations().subscribe(data => {
      //console.log('Designations:', data);
      this.designationOptions = data;
    });

    this.dropdownService.getPostingCities().subscribe(data => {
     // console.log('Posting Cities:', data);
      this.cityOptions = data;
    });

    this.dropdownService.getNature().subscribe(data => {
     // console.log('Nature Options:', data);
      this.natureOptions = data;
    });
  }


    toggleFilterForm(event: Event) {
      event.preventDefault();
      this.isFilterFormVisible = !this.isFilterFormVisible;
    }

    closeFilterForm() {
      this.isFilterFormVisible = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
      const target = event.target as HTMLElement;
      
      const clickedInsideModal = target.closest('.card.shadow-lg');
      const clickedFilterBtn = target.closest('.filter-btn');

      if (!clickedInsideModal && !clickedFilterBtn) {
        this.isFilterFormVisible = false;
      }

      const clickedTooltipBtn = target.closest('.tooltip-container');
      if (!clickedTooltipBtn) {
        this.showTooltip = false;
      }
    }

    // ------------------------------
//   Multi-Select Logic: Location
// ------------------------------
    toggleSelectAllLocations(event: any) {
      // isChecked = event.target.checked;
      //this.selectedLocations = isChecked ? this.locationOptions.map(loc => loc.value) : [];
          const isChecked = event.target.checked;
      const realLocationValues = this.locationOptions
        .filter(loc => loc.value !== '__select_all__')
        .map(loc => loc.value);

      this.selectedLocations = isChecked ? realLocationValues : [];
      this.commonsearch.controls['selectedLocations'].setValue(this.selectedLocations);
    }

    toggleLocation(location: string) {
      const index = this.selectedLocations.indexOf(location);
      index === -1 ? this.selectedLocations.push(location) : this.selectedLocations.splice(index, 1);
      this.commonsearch.controls['selectedLocations'].setValue(this.selectedLocations);
    }

    // isAllLocationsSelected(): boolean {
    //   return this.selectedLocations.length > 0 && this.selectedLocations.length === this.locationOptions.length;
    // }

    isAllLocationsSelected(): boolean {
  const realLocations = this.locationOptions.filter(item => item.value !== '__select_all__');
  return (
    this.selectedLocations.length === realLocations.length &&
    realLocations.every(loc => this.selectedLocations.includes(loc.value))
  );
}


    getLocationDisplayText(): string {
        const realLocations = this.locationOptions.filter(loc => loc.value !== '__select_all__');
         const selectedRealLocations = this.selectedLocations.filter(value => value !== '__select_all__');

        if (
      selectedRealLocations.length === realLocations.length &&
      realLocations.every(loc => selectedRealLocations.includes(loc.value))
    ) {
      return "All Selected";
      } else if (this.selectedLocations.length === 1) {
       return realLocations.find(loc => loc.value === selectedRealLocations[0])?.name || "--Select Locations--";
      } else if (this.selectedLocations.length > 1) {
       const firstSelected = realLocations.find(loc => loc.value === selectedRealLocations[0])?.name;
    return firstSelected ? `${firstSelected}...` : "--Select Locations--"; } else {
        return "--Select Locations--";
      }
    }

    clearLocations() {
      this.selectedLocations = [];
      this.commonsearch.controls['selectedLocations'].setValue([]);
    }
    

    // ------------------------------
    //   Multi-Select Logic: Department
    // ------------------------------
    toggleSelectAllDepartments(event: any) {
      //const isChecked = event.target.checked;
      //this.selectedDepartments = isChecked ? this.departmentOptions.map(dep => dep.value) : [];
      const isChecked = event.target.checked;
        const realDepartmentValues = this.departmentOptions
          .filter(dep => dep.value !== '__select_all__')
          .map(dep => dep.value);

  this.selectedDepartments = isChecked ? realDepartmentValues : [];
      this.commonsearch.controls['selectedDepartments'].setValue(this.selectedDepartments);
    }

    toggleDepartment(department: string) {
      const index = this.selectedDepartments.indexOf(department);
      index === -1 ? this.selectedDepartments.push(department) : this.selectedDepartments.splice(index, 1);
      this.commonsearch.controls['selectedDepartments'].setValue(this.selectedDepartments);
    }

    isAllDepartmentsSelected(): boolean {
      //return this.selectedDepartments.length > 0 && this.selectedDepartments.length === this.departmentOptions.length;
       const realDepartments = this.departmentOptions.filter(item => item.value !== '__select_all__');
  return (
    this.selectedDepartments.length === realDepartments.length &&
    realDepartments.every(dep => this.selectedDepartments.includes(dep.value))
  );
    }

  
    getDepartmentDisplayText(): string {      
      const realDepartments = this.departmentOptions.filter(dep => dep.value !== '__select_all__');
  const selectedRealDepartments = this.selectedDepartments.filter(value => value !== '__select_all__');

  if (
    selectedRealDepartments.length === realDepartments.length &&
    realDepartments.every(dep => selectedRealDepartments.includes(dep.value))
  ) {       
        return "All Selected";
      } else if (this.selectedDepartments.length === 1) {
        return this.departmentOptions.find(item => item.value === this.selectedDepartments[0])?.name || "--Select Departments--";
      } else if (this.selectedDepartments.length > 1) {
        const firstSelected = this.departmentOptions.find(item => item.value === this.selectedDepartments[0])?.name;
        return firstSelected ? `${firstSelected}...` : "--Select Departments--";
      } else {
        return "--Select Departments--";
      }
    }

    clearDepartments() {
      this.selectedDepartments = [];
      this.commonsearch.controls['selectedDepartments'].setValue([]);
    }
    



  submitFilterForm() {
    if (this.commonsearch.invalid) {
      alert("Please fill out all required fields!");
      return;
    }
    const selectedFilters  = { ...this.commonsearch.value };
    console.log("Form Data",selectedFilters );
    // alert("Form Submitted Successfully!\n\n" + JSON.stringify(selectedFilters , null, 2));

    this.filtersChanged.emit(selectedFilters); // Send filters to parent
    this.closeFilterForm();
  }

  clearForm() {
    this.commonsearch.reset(); // Reset the form
  
    // Explicitly reset multi-select dropdowns
    this.selectedLocations = [];
    this.selectedDepartments = [];
    this.commonsearch.controls['selectedLocations'].setValue([]);
    this.commonsearch.controls['selectedDepartments'].setValue([]);
  
    // Explicitly reset all dropdown fields
    this.commonsearch.controls['selectedDesignation'].setValue(null);
    this.commonsearch.controls['selectedNature'].setValue(null);
    this.commonsearch.controls['selectedCity'].setValue(null);
    this.commonsearch.controls['sortBy'].setValue(null);
    this.commonsearch.controls['status'].setValue(null);
  
    // Debugging - Log form values to confirm reset
    console.log("Form after reset:", this.commonsearch.value);

    this.filtersChanged.emit({}); // Emit empty filters
}


private hasEmittedDefaults = false;

emitIfAllDefaultsReady() {
  if (!this.hasEmittedDefaults &&
      this.selectedLocations.length &&
      this.selectedDepartments.length &&
      this.locationOptions.length &&
      this.departmentOptions.length) {
    
    this.hasEmittedDefaults = true;
    const filters = { ...this.commonsearch.value };
    this.filtersChanged.emit(filters);
}
}

applyQuickSearch(event: any): void {
  const input = (event.target as HTMLInputElement).value?.trim();
  if (input) {
    this.commonsearch.patchValue({
      empCode: input
    });

    // Trigger filter logic manually
    this.submitFilterForm();

    // Optional: clear the search input or keep it
    // (event.target as HTMLInputElement).value = '';
}}





}