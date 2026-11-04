import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from '../../../services/state.service';
import { EmployeeMasterService } from '../../../services/employee-master.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { NgSelectComponent } from '@ng-select/ng-select';

export interface CategoryHeadItem {
  pk_headid: string;
  description: string;
  shortdesc: string;
  amount: number | null;
}

export interface CategoryMinWageUI {
  fk_catid: string;
  category_name: string;
  minimum_wages: number | null;
  expanded: boolean;
  earning_heads: CategoryHeadItem[];
}

@Component({
  selector: 'app-state-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgSelectComponent],
  templateUrl: './state-master.component.html',
  styleUrl: './state-master.component.scss'
})
export class StateMasterComponent {
  StatemasterForm!: FormGroup;
  submitted = false;
  showError = false;
  stateId: string = '';
  isEditMode: boolean = false;
  Category: { name: string; value: string }[] = [];
  masterEarningHeads: { pk_headid: string; description: string; shortdesc: string }[] = [];
  categoriesWithHeads: CategoryMinWageUI[] = [];
  searchCategoryText: string = '';
  allExpanded: boolean = false;

  private savedStateData: any = null;
  route = inject(ActivatedRoute);

  constructor(
    private fb: FormBuilder,
    private stateService: StateService,
    private employeeMasterService: EmployeeMasterService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.StatemasterForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(150)]],
      lwf_applicable: [false],
      pt_applicable: [false],
      pt_number: [''],
      lwf_number: [''],
      esi_number: [''],
      pf_number: [''],
      is_minimum_wages: [false],
      fk_catid: [null],
      minimum_wages: [0]
    });

    this.StatemasterForm.get('is_minimum_wages')?.valueChanges.subscribe(checked => {
      if (!checked) {
        this.StatemasterForm.get('minimum_wages')?.setValue(0);
        this.StatemasterForm.get('fk_catid')?.setValue(null);
        this.categoriesWithHeads.forEach(cat => {
          cat.minimum_wages = null;
          cat.expanded = false;
          cat.earning_heads.forEach(h => h.amount = 0);
        });
      } else {
        // If checking, expand the first category or any configured category
        if (this.categoriesWithHeads.length > 0) {
          const firstConfigured = this.categoriesWithHeads.find(c => this.isCategoryConfigured(c));
          if (firstConfigured) {
            firstConfigured.expanded = true;
          } else {
            this.categoriesWithHeads[0].expanded = true;
          }
        }
      }
    });

    this.getCategoryList('Category');
    this.loadEarningHeads();

    this.StatemasterForm.get('description')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkOperationalAvailability(value);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_stateid');
      if (id) {
        this.stateId = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getStateById(this.stateId);
      }
    });
  }

  checkOperationalAvailability(description: string): void {
    const fieldName = 'State';
    const fieldValue = description;
    const generalId = this.stateId || '';

    this.stateService.checkDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.StatemasterForm.get('description')?.setErrors({ duplicate: response.message });
        } else {
          this.StatemasterForm.get('description')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.StatemasterForm.get('description')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }

  getCategoryList(fieldName: string): void {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Category = res.data
            .filter((item: any) =>
              item &&
              item.value != null &&
              item.value !== '' &&
              item.value !== '0' &&
              item.value !== 0 &&
              item.name &&
              !item.name.toLowerCase().includes('select')
            )
            .map((item: any) => ({
              name: item.name.trim(),
              value: item.value.toString().trim()
            }));
          this.buildCategoryCards();
          this.applySavedStateData();
        } else {
          this.toastrService.error("Failed to load Category list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Category list.");
      }
    });
  }

  loadEarningHeads(): void {
    this.stateService.getEarningHeads().subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data) {
          this.masterEarningHeads = res.data.map((h: any) => ({
            pk_headid: h.pk_headid?.toString(),
            description: h.description,
            shortdesc: h.shortdesc
          }));
          this.buildCategoryCards();
          this.applySavedStateData();
        }
      },
      error: (err) => {
        console.error('Error fetching earning heads:', err);
      }
    });
  }

  buildCategoryCards(): void {
    if (this.Category.length === 0) return;

    // Filter only valid categories (ignore null, empty, or placeholder)
    const validCategories = this.Category.filter(cat =>
      cat &&
      cat.value != null &&
      cat.value !== '' &&
      cat.value !== '0' &&
      cat.name &&
      !cat.name.toLowerCase().includes('select')
    );

    validCategories.forEach((cat, index) => {
      let existing = this.categoriesWithHeads.find(c => c.fk_catid === cat.value);
      if (!existing) {
        existing = {
          fk_catid: cat.value,
          category_name: cat.name,
          minimum_wages: null,
          expanded: index === 0, // expand first by default
          earning_heads: []
        };
        this.categoriesWithHeads.push(existing);
      }

      // Ensure earning heads are attached
      if (this.masterEarningHeads.length > 0 && existing.earning_heads.length === 0) {
        existing.earning_heads = this.masterEarningHeads.map(h => ({
          pk_headid: h.pk_headid,
          description: h.description,
          shortdesc: h.shortdesc,
          amount: 0
        }));
      }
    });
  }

  getStateById(id: string): void {
    this.stateService.getStateById(id).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.savedStateData = response.data;
          const hasMinWages = Boolean(
            response.data.is_minimum_wages ||
            (response.data.minimum_wages && response.data.minimum_wages > 0) ||
            (response.data.category_minimum_wages && response.data.category_minimum_wages.length > 0)
          );

          this.StatemasterForm.patchValue({
            description: response.data.description,
            lwf_applicable: response.data.lwf_applicable,
            pt_applicable: response.data.pt_applicable,
            pt_number: response.data.pt_number,
            lwf_number: response.data.lwf_number,
            esi_number: response.data.esi_number,
            pf_number: response.data.pf_number,
            is_minimum_wages: hasMinWages,
            fk_catid: response.data.fk_catid || null,
            minimum_wages: response.data.minimum_wages || 0
          });

          this.applySavedStateData();
        } else {
          console.error('Failed to fetch State:', response.message);
          this.toastrService.error(response.message || 'Failed to load state data');
        }
      },
      error: (error) => {
        console.error('Error fetching State:', error);
        this.toastrService.error('Error loading state data');
      }
    });
  }

  private applySavedStateData(): void {
    if (!this.savedStateData || this.Category.length === 0) {
      return;
    }

    this.buildCategoryCards();

    const savedCategories: any[] = this.savedStateData.category_minimum_wages || [];

    if (savedCategories.length > 0) {
      savedCategories.forEach(sc => {
        const catIdStr = (sc.fk_catid ?? '').toString();
        const match = this.categoriesWithHeads.find(c => c.fk_catid.toString() === catIdStr);
        if (match) {
          match.minimum_wages = sc.minimum_wages != null ? Number(sc.minimum_wages) : null;
          match.expanded = true;

          if (sc.earning_heads && sc.earning_heads.length > 0) {
            sc.earning_heads.forEach((sh: any) => {
              const headIdStr = (sh.pk_headid ?? '').toString();
              const headMatch = match.earning_heads.find(h => h.pk_headid.toString() === headIdStr);
              if (headMatch) {
                headMatch.amount = Number(sh.amount) || 0;
              }
            });
          }
        }
      });
    } else if (this.savedStateData.fk_catid) {
      // Legacy fallback: single category saved
      const catIdStr = this.savedStateData.fk_catid.toString();
      const match = this.categoriesWithHeads.find(c => c.fk_catid.toString() === catIdStr);
      if (match) {
        match.minimum_wages = Number(this.savedStateData.minimum_wages) || null;
        match.expanded = true;

        const heads = this.savedStateData.earning_heads || [];
        heads.forEach((sh: any) => {
          const headIdStr = (sh.pk_headid ?? '').toString();
          const headMatch = match.earning_heads.find(h => h.pk_headid.toString() === headIdStr);
          if (headMatch) {
            headMatch.amount = Number(sh.amount) || 0;
          }
        });
      }
    }
  }

  getInitials(name: string): string {
    if (!name) return 'CA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getCategoryHeadsTotal(cat: CategoryMinWageUI): number {
    if (!cat || !cat.earning_heads) return 0;
    const total = cat.earning_heads.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
    return Math.round(total * 100) / 100;
  }

  isCategoryConfigured(cat: CategoryMinWageUI): boolean {
    return (Number(cat.minimum_wages) > 0) || (this.getCategoryHeadsTotal(cat) > 0);
  }

  isValidCategory(cat: CategoryMinWageUI): boolean {
    return Boolean(
      cat &&
      cat.fk_catid != null &&
      cat.fk_catid !== '' &&
      cat.fk_catid !== '0' &&
      cat.category_name &&
      !cat.category_name.toLowerCase().includes('select')
    );
  }

  toggleAllCategories(): void {
    this.allExpanded = !this.allExpanded;
    this.categoriesWithHeads.forEach(c => c.expanded = this.allExpanded);
  }

  filteredCategories(): CategoryMinWageUI[] {
    const validList = this.categoriesWithHeads.filter(c => this.isValidCategory(c));
    if (!this.searchCategoryText || !this.searchCategoryText.trim()) {
      return validList;
    }
    const q = this.searchCategoryText.toLowerCase().trim();
    return validList.filter(c =>
      c.category_name?.toLowerCase().includes(q) ||
      c.fk_catid?.toLowerCase().includes(q)
    );
  }

  getValidCategoriesCount(): number {
    return this.categoriesWithHeads.filter(c => this.isValidCategory(c)).length;
  }

  getConfiguredCategoriesCount(): number {
    return this.categoriesWithHeads.filter(c => this.isValidCategory(c) && this.isCategoryConfigured(c)).length;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.StatemasterForm.invalid) {
      this.showError = true;
      return;
    }

    let configuredCategories: CategoryMinWageUI[] = [];

    // Validation: If Minimum Wages is checked
    if (this.StatemasterForm.get('is_minimum_wages')?.value) {
      configuredCategories = this.categoriesWithHeads.filter(c => this.isCategoryConfigured(c));

      if (configuredCategories.length === 0) {
        this.toastrService.error('Please configure minimum wages for at least one category.');
        return;
      }

      for (const cat of configuredCategories) {
        const minWage = Math.round((Number(cat.minimum_wages) || 0) * 100) / 100;
        const headsSum = this.getCategoryHeadsTotal(cat);

        if (minWage <= 0) {
          this.toastrService.error(`Please enter a valid Minimum Wage for category "${cat.category_name}".`);
          cat.expanded = true;
          return;
        }

        if (headsSum < minWage) {
          this.toastrService.error(`Sum of heads (₹ ${headsSum.toFixed(2)}) is less than Minimum Wage (₹ ${minWage.toFixed(2)}) for "${cat.category_name}".`);
          cat.expanded = true;
          return;
        }

        if (headsSum > minWage) {
          this.toastrService.error(`Sum of heads (₹ ${headsSum.toFixed(2)}) is greater than Minimum Wage (₹ ${minWage.toFixed(2)}) for "${cat.category_name}".`);
          cat.expanded = true;
          return;
        }
      }
    }

    const categoryMinWagesPayload = configuredCategories.map(c => ({
      fk_catid: c.fk_catid,
      category_name: c.category_name,
      minimum_wages: Number(c.minimum_wages) || 0,
      earning_heads: c.earning_heads.map(h => ({
        pk_headid: h.pk_headid,
        description: h.description,
        shortdesc: h.shortdesc,
        amount: Number(h.amount) || 0
      }))
    }));

    const firstCat = configuredCategories[0];
    const formData = {
      ...this.StatemasterForm.value,
      minimum_wages: firstCat ? Number(firstCat.minimum_wages) : 0,
      fk_catid: firstCat ? firstCat.fk_catid : null,
      earning_heads: firstCat ? firstCat.earning_heads : [],
      category_minimum_wages: categoryMinWagesPayload
    };

    if (this.isEditMode && this.stateId) {
      this.stateService.updateState({ pk_stateid: this.stateId, ...formData }).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'State updated successfully!');
            this.view();
          } else {
            this.toastrService.error(response.message || 'Failed to update state');
          }
        },
        error: (error) => {
          console.error('Error updating state:', error);
          this.toastrService.error('Error updating state data');
        }
      });
    } else {
      this.stateService.addStateMaster(formData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'State created successfully!');
            this.view();
          } else {
            this.toastrService.error(response.message || 'Failed to create state');
          }
        },
        error: (error) => {
          console.error('Error creating state:', error);
          this.toastrService.error('Error saving state data');
        }
      });
    }
  }

  view(): void {
    this.router.navigateByUrl("/dash/user/userdashboard/StateMaster_list");
  }

  resetForm(): void {
    this.StatemasterForm.reset({
      description: '',
      lwf_applicable: false,
      pt_applicable: false,
      pt_number: '',
      lwf_number: '',
      esi_number: '',
      pf_number: '',
      is_minimum_wages: false,
      fk_catid: null,
      minimum_wages: 0
    });
    this.categoriesWithHeads.forEach(c => {
      c.minimum_wages = null;
      c.expanded = false;
      c.earning_heads.forEach(h => h.amount = 0);
    });
    this.searchCategoryText = '';
    this.showError = false;
    this.submitted = false;
  }
}
