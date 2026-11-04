
import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { PageRightsService } from '../../services/page-rights.service';

@Component({
  selector: 'app-page-rights',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule],
  
  templateUrl: './page-rights.component.html',
  styleUrl: './page-rights.component.scss'
})
export class PageRightsComponent {

  ngxUILoaderService = inject(NgxUiLoaderService);

  webpages: any[] = [];
  Form!: FormGroup;
  submitted = false;
  showError = false;
  Isedit = false;

  // Spin loader at page ONLY when zone-wise locations are loading
  isZoneLocationLoading: boolean = false;
    
  selectedLocations: string[] = [];
   
  Location: { name: string, value: string }[] = []; 
  Zone: { name: string, value: string }[] = []; 
    
  Userlist: { name: string, value: string }[] = []; 
  ModuleList: { name: string, value: string }[] = [];

  // Table variable
  Selected: boolean = false;
      allL1: boolean = false;
    allL2: boolean = false;
    allL3: boolean = false;
    allRaiseReq: boolean = false;
    allEditManpower: boolean = false;


  constructor(
    private fb: FormBuilder,
    private http: PageRightsService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public encryptionserivce: EncryptionService
  ) { }

  ngOnInit() {
    this.Form = this.fb.group({
      fk_locid: [[], Validators.required],
      fk_userId: [null, Validators.required],
      fk_moduleId: [null, Validators.required],
      fk_zoneId: []
    });

    // Load initial dropdowns without page-blocking loaders
    this.getZoneList('Zone');
    this.getUSerList('User');
    this.GetModulelist();
    this.getLocationList('Location');

    // Trigger when either User or Module changes
    this.Form.get('fk_userId')?.valueChanges.subscribe((userId) => {
      this.checkAndLoadUserLocations(userId);
      this.checkAndLoadWebPages();
    });

    this.Form.get('fk_moduleId')?.valueChanges.subscribe(() => {
      this.checkAndLoadWebPages();
    });

    // Synchronize selectedLocations whenever fk_locid is modified
    this.Form.get('fk_locid')?.valueChanges.subscribe((val) => {
      if (Array.isArray(val)) {
        this.selectedLocations = val;
      } else if (!val) {
        this.selectedLocations = [];
      }
    });

    // Handle zone change & clearing: reset selection, load zone or all locations
    this.Form.get('fk_zoneId')?.valueChanges.subscribe(value => {
      this.selectedLocations = [];
      this.Form.patchValue({ fk_locid: [] });
      if (value && value !== '' && value !== '0') {
        this.getLocationListbyzone(value);
      } else {
        this.getLocationList('Location');
      }
    });
  }

  locationSearchTerm: string = '';
  filteredLocations: { name: string, value: string }[] = [];

  // Smooth real-time search without change-detection lag
  onSearchLocation(event: any) {
    const term = (event?.target?.value || '').trim().toLowerCase();
    this.locationSearchTerm = term;
    if (!term) {
      this.filteredLocations = [...this.Location];
      return;
    }
    this.filteredLocations = this.Location.filter(loc =>
      (loc.name && loc.name.toLowerCase().includes(term)) ||
      (loc.value && loc.value.toLowerCase().includes(term))
    );
  }

  // Clear search input and reset filtered list
  clearSearch(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.locationSearchTerm = '';
    this.filteredLocations = [...this.Location];
  }

  onLocationDropdownOpen() {
    this.locationSearchTerm = '';
    this.sortLocationsSelectedFirst();
    this.filteredLocations = [...this.Location];
  }

  // Auto-fetch and patch locations previously assigned to the selected user
  checkAndLoadUserLocations(userId: string) {
    if (!userId) {
      this.selectedLocations = [];
      this.Form.patchValue({ fk_locid: [] });
      this.filteredLocations = [...this.Location];
      return;
    }

    this.http.getUserLocations(userId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const locIds = res.data.map((loc: any) =>
            typeof loc === 'object' && loc !== null && loc.fk_locid != null ? String(loc.fk_locid) : String(loc)
          );
          this.selectedLocations = locIds;
          this.Form.patchValue({ fk_locid: [...this.selectedLocations] });
          // Sort selected locations to the top
          this.sortLocationsSelectedFirst();
        } else {
          this.selectedLocations = [];
          this.Form.patchValue({ fk_locid: [] });
          this.filteredLocations = [...this.Location];
        }
      },
      error: (err) => {
        console.error('Error fetching user assigned locations:', err);
      }
    });
  }

  // Sort locations array so that currently selected items appear at the very top
  sortLocationsSelectedFirst() {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    if (!Array.isArray(selected) || selected.length === 0 || !this.Location || !this.Location.length) {
      this.filteredLocations = [...this.Location];
      return;
    }
    const selectedSet = new Set<string>(selected.map((val: any) => String(val)));

    // Separate selected vs unselected items
    const selectedItems = this.Location.filter(loc => selectedSet.has(String(loc.value)));
    const unselectedItems = this.Location.filter(loc => !selectedSet.has(String(loc.value)));

    this.Location = [...selectedItems, ...unselectedItems];
    this.filteredLocations = [...this.Location];
  }

  // Count of currently selected locations
  get selectedCount(): number {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    return Array.isArray(selected) ? selected.filter(val => val != null && val !== '').length : 0;
  }

  // Returns all selected location names as comma-separated string (for tooltip)
  getAllSelectedNames(): string {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    if (!Array.isArray(selected) || !selected.length) return '';
    return this.Location
      .filter(loc => selected.includes(loc.value))
      .map(loc => loc.name)
      .join(', ');
  }

  // Returns single selected location name
  getSingleSelectedName(): string {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    if (Array.isArray(selected) && selected.length > 0) {
      const match = this.Location.find(loc => loc.value === selected[0]);
      return match ? match.name : selected[0];
    }
    return '';
  }

  // Returns first selected location name (for brief preview)
  getFirstLocationName(): string {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    if (Array.isArray(selected) && selected.length > 0) {
      const match = this.Location.find(loc => loc.value === selected[0]);
      if (match) {
        return match.name.length > 18 ? match.name.substring(0, 18) + '...' : match.name;
      }
      return selected[0];
    }
    return '';
  }

  // Selects/deselects all locations (or filtered locations when searching)
  toggleSelectAll() {
    const currentSelected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    const currentSelectedSet = new Set<string>(currentSelected.map((val: any) => String(val)));
    const targetList = this.filteredLocations;

    if (!targetList.length) return;

    const allFilteredSelected = targetList.every(loc => currentSelectedSet.has(String(loc.value)));

    if (allFilteredSelected) {
      // Unselect only currently filtered items, keeping other selected locations intact
      const targetValuesSet = new Set<string>(targetList.map(loc => String(loc.value)));
      this.selectedLocations = currentSelected
        .map((val: any) => String(val))
        .filter((id: string) => !targetValuesSet.has(id));
    } else {
      // Select all filtered items without losing existing selected locations
      targetList.forEach(loc => currentSelectedSet.add(String(loc.value)));
      this.selectedLocations = Array.from<string>(currentSelectedSet);
    }

    this.Form.patchValue({ fk_locid: [...this.selectedLocations] });
  }

  // Checks if all current target locations are selected
  isAllSelected(): boolean {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    const targetList = this.filteredLocations;
    if (!targetList.length) return false;
    const selectedSet = new Set<string>(selected.map((val: any) => String(val)));
    return targetList.every(loc => selectedSet.has(String(loc.value)));
  }

  // Returns appropriate display text based on selection
  getLocationDisplayText(): string {
    const selected = this.Form?.get('fk_locid')?.value || this.selectedLocations || [];
    const validSelected = selected.filter((val: any) => val != null && val !== '');
    if (!validSelected.length) {
      return "--Select Locations--";
    }
    if (this.selectedCount === this.Location.length && this.Location.length > 0) {
      return `All Selected (${this.Location.length})`;
    } 
    else if (validSelected.length === 1) {
      const match = this.Location.find(item => item.value === validSelected[0]);
      return match?.name || validSelected[0] || "--Select Locations--";
    } 
    else if (validSelected.length > 1) {
      return `${validSelected.length} Locations Selected`;
    } 
    else {
      return "--Select Locations--";
    }
  }
    
  // Adds/removes a location from the selection
  toggleLocation(location: string) {
    if (!location) return;
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(item => item !== location);
    } else {
      this.selectedLocations.push(location);
    }
    this.Form.patchValue({ fk_locid: this.selectedLocations });
  }

  // Get location list
  getLocationList(fieldName: string) {
    this.http.getLocation(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          const processedData = res.data;
          this.Location = processedData
            .filter((location: any) => location.value != null && location.value !== '')
            .map((location: any) => ({
              name: location.name,
              value: String(location.value)
            }));
          this.filteredLocations = [...this.Location];

          if (this.selectedLocations.length > 0) {
            this.Form.patchValue({ fk_locid: [...this.selectedLocations] });
            this.sortLocationsSelectedFirst();
          }
        } else {
          this.Location = [];
          this.filteredLocations = [];
          this.toastrService.error("Failed to load location list.");
        }
      },
      error: (err) => {
        console.error("Error fetching location list:", err);
        this.Location = [];
        this.filteredLocations = [];
        this.toastrService.error("Error fetching location list. Please try again.");
      }
    });
  }

  // Get locations by zone with in-page spin loader (active ONLY when zone-wise location is coming)
  getLocationListbyzone(Zone: string) {
    this.isZoneLocationLoading = true;

    this.http.LocationByZone(Zone).subscribe({
      next: (res) => {
        this.isZoneLocationLoading = false;
        if (res?.isSuccess && res.data?.length) {
          const processedData = res.data;

          this.Location = processedData
            .filter((location: any) => location.value != null && location.value !== '')
            .map((location: any) => ({
              name: location.name,
              value: String(location.value)
            }));
          this.filteredLocations = [...this.Location];

          // Auto-select all locations when a zone is selected
          if (Zone && Zone.trim() !== '' && Zone !== '0') {
            this.selectedLocations = this.Location.map(loc => loc.value);
            this.Form.patchValue({ fk_locid: this.selectedLocations });
          }
        } else {
          this.Location = [];
          this.filteredLocations = [];
          this.selectedLocations = [];
          this.Form.patchValue({ fk_locid: [] });
          this.toastrService.warning(res?.message || "No locations found.");
        }
      },
      error: (err) => {
        this.isZoneLocationLoading = false;
        console.error("Error fetching location list:", err);
        this.Location = [];
        this.filteredLocations = [];
        this.selectedLocations = [];
        this.Form.patchValue({ fk_locid: [] });
        this.toastrService.error("Error fetching location list. Please try again.");
      }
    });
  }

  getZoneList(fieldName: string) {
    this.http.getLocation(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          const processedData = res.data;
          this.Zone = processedData.map((zone: any) => ({
            name: zone.name,
            value: zone.value
          }));
        } else {
          this.toastrService.error("Failed to load list.");
        }
      },
      error: (err) => {
        console.error("Error fetching list:", err);
        this.toastrService.error("Error fetching list. Please try again.");
      }
    });
  }

  getUSerList(fieldName: string) {
    this.http.getLocation(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Userlist = res.data.map((location: any) => ({
            name: location.name,
            value: location.value
          }));
        } else {
          this.toastrService.error("Failed to load user list.");
        }
      },
      error: (err) => {
        console.error("Error fetching user list:", err);
        this.toastrService.error("Error fetching user list. Please try again.");
      }
    });
  }
      
  GetModulelist() {
    this.http.getModuelList().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // this.ModuleList = res.data.map((leaveType: any) => ({
          //   name: leaveType.name,
          //   value: leaveType.value
               this.ModuleList = res.data.map((m: any) => ({
            name: (Number(m.value) === 5 || (m.name && m.name.toLowerCase().includes('recruitment')))
              ? 'Recruitment Management (ATS Talent Suite)'
              : m.name,
            value: m.value
          }));
          
          const queryModId = this.route.snapshot.queryParams['moduleId'];
          if (queryModId) {
            const found = this.ModuleList.find(x => String(x.value) === String(queryModId));
            if (found) {
              this.Form.patchValue({ fk_moduleId: found.value });
            }
          }

        } else {
          this.toastrService.error("Failed to load module list.");
        }
      },
      error: (err) => {
        console.error("Error fetching module list:", err);
        this.toastrService.error("Error fetching module.");
      }
    });
  }

  submit() {
    this.submitted = true;
    if (this.Form.invalid) {
      this.showError = true;
      this.submitted = true;
      return;
    }

    const formValues = this.Form.value;

    // Filter valid locations before sending to API
    const validLocs = (this.selectedLocations || []).filter(loc => loc != null && loc !== '');
    if (!validLocs.length) {
      this.showError = true;
      this.toastrService.warning('Please select at least one Location.');
      return;
    }

    // Build location list
    const locationList = validLocs.map(loc => ({
      fk_locid: loc
    }));

    // Build page rights list
    // const uM_UserPageRights = this.webpages
    //   .filter(page => page.isSelected) // only selected rows
    //   .map(page => ({
    //     fk_webpageId: page.pk_webpageId,
    //     allowAdd: true,
    //     allowUpdate: true,
    //     allowDelete: true,
    //     allowView: true
      const isRec = this.isRecruitmentModule();
  const uM_UserPageRights = this.webpages
    .filter(page => page.isSelected) // only selected rows
    .map(page => ({
      fk_webpageId: page.pk_webpageId,
      allowAdd: page.AllowAdd ?? true,
      allowUpdate: page.AllowUpdate ?? true,
      allowDelete: page.AllowDelete ?? true,
      allowView: page.AllowView ?? true,
      L1_Access: isRec && this.isApprovalPage(page) ? !!page.L1_Access : false,
      L2_Access: isRec && this.isApprovalPage(page) ? !!page.L2_Access : false,
      L3_Access: isRec && this.isApprovalPage(page) ? !!page.L3_Access : false,
      CanRaiseRequisition: isRec && this.isRaiseReqPage(page) ? true : false,
      CanEditManpower: isRec && this.isHeadcountPage(page) ? true : false
      }));

    if (!uM_UserPageRights.length) {
      this.toastrService.warning('Please select at least one page.');
      return;
    }

    const payload = {
      userid: formValues.fk_userId,
      moduleid: Number(formValues.fk_moduleId),
      locationList,
      uM_UserPageRights
    };

    console.log('Payload:', payload);

    this.http.add_pageRight(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastrService.success('Page rights saved successfully!');
        } else {
          this.toastrService.error(res.message || 'Failed to save page rights.');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastrService.error('Something went wrong.');
      }
    });
  }

  /** Select/Deselect all rows */
  AllSelect(): void {
    this.webpages.forEach(item => (item.isSelected = this.Selected));
  }

    toggleAllL1(): void {
    this.webpages.forEach(item => {
      item.L1_Access = this.allL1;
      if (this.allL1) item.isSelected = true;
    });
  }

  toggleAllL2(): void {
    this.webpages.forEach(item => {
      item.L2_Access = this.allL2;
      if (this.allL2) item.isSelected = true;
    });
  }

  toggleAllL3(): void {
    this.webpages.forEach(item => {
      item.L3_Access = this.allL3;
      if (this.allL3) item.isSelected = true;
    });
  }



  isRecruitmentModule(): boolean {
    const mod = this.Form?.get('fk_moduleId')?.value;
    return Number(mod) === 5;
  }

  isApprovalPage(page: any): boolean {
    if (!this.isRecruitmentModule() || !page) return false;
    const name = (page.menucaption || '').toLowerCase();
    const path = (page.pagepath || '').toLowerCase();
    return page.pk_webpageId === 9011 || name.includes('approval') || path.includes('job-management');
  }

  isRaiseReqPage(page: any): boolean {
    if (!this.isRecruitmentModule() || !page) return false;
    const name = (page.menucaption || '').toLowerCase();
    const path = (page.pagepath || '').toLowerCase();
    return page.pk_webpageId === 9010 || page.pk_webpageId === 9009 || page.pk_webpageId === 795 ||
           name.includes('create mrf') || name.includes('create job') || name.includes('open new job') || path.includes('create-job-wizard');
  }

  isHeadcountPage(page: any): boolean {
    if (!this.isRecruitmentModule() || !page) return false;
    const name = (page.menucaption || '').toLowerCase();
    const path = (page.pagepath || '').toLowerCase();
    return page.pk_webpageId === 9012 || name.includes('headcount') || path.includes('location-manpower-headcount');
  }

  onRightChange(page: any): void {
    if (page.L1_Access || page.L2_Access || page.L3_Access) {
      page.isSelected = true;
    }
  }

  checkAndLoadWebPages() {
    const fk_userId = this.Form.get('fk_userId')?.value;
    const fk_moduleId = this.Form.get('fk_moduleId')?.value;

    if (fk_userId && fk_moduleId) {
      this.http.get_Webpage(fk_userId, fk_moduleId).subscribe({
        next: (res: any) => {
          if (res.isSuccess && res.data) {
            console.log('dfg', res.data);
            this.webpages = res.data.map((item: any) => ({
              ...item,
              isSelected: item.IsAssigned === 1,
                AllowAdd: item.AllowAdd === 1 || item.AllowAdd === true,
            AllowUpdate: item.AllowUpdate === 1 || item.AllowUpdate === true,
            AllowDelete: item.AllowDelete === 1 || item.AllowDelete === true,
            AllowView: item.AllowView === 1 || item.AllowView === true,
            L1_Access: item.L1_Access === 1 || item.L1_Access === true,
            L2_Access: item.L2_Access === 1 || item.L2_Access === true,
            L3_Access: item.L3_Access === 1 || item.L3_Access === true,
            CanRaiseRequisition: item.CanRaiseRequisition === 1 || item.CanRaiseRequisition === true,
            CanEditManpower: item.CanEditManpower === 1 || item.CanEditManpower === true
            }));
                this.Selected = this.webpages.length > 0 && this.webpages.every(w => w.isSelected);
          } else {
            this.webpages = [];
            this.toastrService.warning(res.message || 'No records found.');
          }
        },
        error: () => {
          this.webpages = [];
          this.toastrService.error('Failed to fetch web pages.');
        }
      });
       // Also load assigned locations from GetUserAccessRights
    this.http.getUserAccessRights(fk_userId, fk_moduleId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data?.assignedLocationIds?.length) {
          this.selectedLocations = res.data.assignedLocationIds.map((id: any) => String(id));
          this.Form.patchValue({ fk_locid: this.selectedLocations });
        }
      },
      error: () => {
        // Non-blocking if no access rights yet
      }
    });
  }
}
      
  

  // Reset form and selections
  onReset(): void {
    this.submitted = false;
    this.showError = false;
    this.selectedLocations = [];
    this.locationSearchTerm = '';
    this.webpages = [];
    this.Selected = false;
    this.Form.reset({
      fk_locid: [],
      fk_userId: null,
      fk_moduleId: null,
      fk_zoneId: null
    });
    this.getLocationList('Location');
  }

}