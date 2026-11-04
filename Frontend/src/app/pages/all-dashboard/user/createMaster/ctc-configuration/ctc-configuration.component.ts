import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CtcConfigService } from '../../services/ctc-config.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-ctc-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './ctc-configuration.component.html',
  styleUrl: './ctc-configuration.component.scss'
})
export class CtcConfigurationComponent implements OnInit {

  configForm!: FormGroup;
  submitted = false;
  activeTab = 'components'; // 'components' | 'summary'

  // Edit fields
  pk_ctcConfigId: string | null = null;
  Timestamp: any = null;

  // Dropdown data
  locationList: { name: string; value: string }[] = [];
  departmentList: { name: string; value: string }[] = [];
  categoryList: { name: string; value: string }[] = [];
  gradeList: { name: string; value: string }[] = [];

  // CTC Type dropdown (hardcoded)
  ctcTypeList = [
    { name: 'Annual CTC', value: 'A' }
  ];

  // Calculation Type dropdown (hardcoded)
  calculationTypes = [
    { name: 'Percentage of CTC', value: 'PercentageOfCTC' },
    { name: 'Percentage of Head', value: 'PercentageOfHead' },
    { name: 'Fixed Amount', value: 'FixedAmount' },
    { name: 'Balance Amount', value: 'BalanceAmount' },
    { name: 'As per Slab', value: 'AsPerSlab' }
  ];

  // Tax Treatment dropdown
  taxTreatments = [
    { name: 'Taxable', value: 'Taxable' },
    { name: 'Tax Exempted', value: 'TaxExempted' }
  ];

  // Components table data
  components: any[] = [];
  headList: any[] = []; // All heads for "Percentage of Head" dropdown

  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private ctcConfigService: CtcConfigService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.configForm = this.fb.group({
      effectiveFrom: ['', [Validators.required]],
      configName: ['', [Validators.required]],
      fk_locationIds: [[]],
      fk_departmentIds: [[]],
      fk_categoryIds: [[], [Validators.required]],
      fk_gradeIds: [[]],
      ctcType: ['A', [Validators.required]],
      description: ['']
    });

    this.loadDropdowns();

    // Check route for editing existing config ID
    this.route.paramMap.subscribe(params => {
      const encryptedId = params.get('pk_ctcConfigId');
      if (encryptedId) {
        const decryptedId = this.encryptionService.decryptText(encryptedId);
        this.pk_ctcConfigId = decryptedId;
        this.loadHeadsOnly(() => {
          this.loadConfigDetails(decryptedId);
        });
      } else {
        this.loadHeads();
      }
    });
  }

  // ========== DROPDOWN LOADING ==========
  loadDropdowns(): void {
    this.loadDropdown('Location', 'locationList');
    this.loadDropdown('Department', 'departmentList');
    this.loadDropdown('Category', 'categoryList');
    this.loadDropdown('Grade', 'gradeList');
  }

  loadDropdown(fieldName: string, targetList: string): void {
    this.ctcConfigService.getDropdownList(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          (this as any)[targetList] = res.data.map((item: any) => ({
            name: item.name,
            value: item.value
          }));
        }
      },
      error: (err) => {
        console.error(`Error fetching ${fieldName} list:`, err);
      }
    });
  }

  loadHeadsOnly(callback?: () => void): void {
    this.ngxUILoaderService.start();
    this.ctcConfigService.getHeadsByType().subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.headList = res.data;
          if (callback) {
            callback();
          }
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching heads:', err);
        this.toastrService.error('Error loading head master data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  loadHeads(): void {
    this.ngxUILoaderService.start();
    this.ctcConfigService.getHeadsByType().subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.headList = res.data;
          // Auto-populate components with all heads
          this.components = res.data.map((head: any, index: number) => ({
            fk_headId: head.fk_headId,
            headName: head.headName,
            headType: head.headType,
            componentType: head.componentType,
            calculationType: '',
            calcHeadId: null,
            calcHeadName: '',
            value: null,
            percentOfCTC: null,
            taxTreatment: head.taxTreatment || 'Taxable',
            considerForPF: false,
            isActive: true,
            sortOrder: index + 1,
            isEditing: false
          }));
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching heads:', err);
        this.toastrService.error('Error loading head master data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  loadConfigDetails(id: string): void {
    this.ngxUILoaderService.start();
    this.ctcConfigService.getCTCConfigById(id).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const config = res.data;
          this.Timestamp = config.timestamp || config.Timestamp;
          
          // Parse CSVs to arrays for ng-select
          const locationIds = config.fk_locationIds ? config.fk_locationIds.split(',') : [];
          const departmentIds = config.fk_departmentIds ? config.fk_departmentIds.split(',') : [];
          const categoryIds = config.fk_categoryIds ? config.fk_categoryIds.split(',') : [];
          const gradeIds = config.fk_gradeIds ? config.fk_gradeIds.split(',') : [];
          
          let formattedDate = '';
          if (config.effectiveFrom) {
            const dateObj = new Date(config.effectiveFrom);
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              formattedDate = `${year}-${month}-${day}`;
            }
          }

          this.configForm.patchValue({
            effectiveFrom: formattedDate,
            configName: config.configName,
            fk_locationIds: locationIds,
            fk_departmentIds: departmentIds,
            fk_categoryIds: categoryIds,
            fk_gradeIds: gradeIds,
            ctcType: config.ctcType || 'A',
            description: config.description
          });
          
          if (config.components && config.components.length) {
            this.components = config.components.map((comp: any) => ({
              pk_ctcCompId: comp.pk_ctcCompId,
              fk_ctcConfigId: comp.fk_ctcConfigId,
              fk_headId: comp.fk_headId,
              headName: comp.headName,
              headType: comp.headType,
              componentType: comp.componentType,
              calculationType: comp.calculationType,
              calcHeadId: comp.calcHeadId,
              calcHeadName: comp.calcHeadName,
              value: comp.value,
              percentOfCTC: comp.percentOfCTC,
              taxTreatment: comp.taxTreatment || 'Taxable',
              considerForPF: comp.considerForPF || false,
              isActive: comp.isActive !== false,
              sortOrder: comp.sortOrder,
              isEditing: false
            }));
            this.updateCalculations();
          }
        } else {
          this.toastrService.error(res?.message || 'Failed to load configuration details.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching config details:', err);
        this.toastrService.error('Error loading configuration details.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  // ========== COMPONENT TYPE BADGE ==========
  getComponentTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Earning': return 'badge-earning';
      case 'Reimbursement': return 'badge-reimbursement';
      case 'Deduction': return 'badge-deduction';
      default: return 'badge-other';
    }
  }

  // ========== CALCULATION TYPE CHANGE ==========
  onCalculationTypeChange(comp: any): void {
    if (comp.calculationType !== 'PercentageOfHead') {
      comp.calcHeadId = null;
      comp.calcHeadName = '';
    }
    this.updateCalculations();
  }

  onCalcHeadChange(comp: any): void {
    const selectedHead = this.headList.find((h: any) => h.fk_headId === comp.calcHeadId);
    comp.calcHeadName = selectedHead ? selectedHead.headName : '';
    this.updateCalculations();
  }

  // ========== STATUS TOGGLE ==========
  toggleStatus(comp: any): void {
    comp.isActive = !comp.isActive;
    this.updateCalculations();
  }

  // ========== ROW ACTIONS ==========
  toggleEdit(index: number): void {
    const comp = this.components[index];
    if (comp.isEditing) {
      comp.isEditing = false;
      this.updateCalculations();
    } else {
      comp.isEditing = true;
    }
  }

  deleteComponent(index: number): void {
    const compName = this.components[index].headName;
    if (confirm(`Are you sure you want to remove the component "${compName}"?`)) {
      this.components.splice(index, 1);
      this.updateCalculations();
      this.toastrService.success(`Removed ${compName} from configuration.`);
    }
  }

  // ========== CALCULATIONS ==========
  updateCalculations(): void {
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 5) {
      changed = false;
      for (const comp of this.components) {
        let newPercent = 0;
        if (comp.isActive && comp.calculationType) {
          if (comp.calculationType === 'PercentageOfCTC') {
            newPercent = Number(comp.value) || 0;
          } else if (comp.calculationType === 'PercentageOfHead' && comp.calcHeadId) {
            const parent = this.components.find(c => c.fk_headId === comp.calcHeadId);
            const parentPercent = parent ? (parent.percentOfCTC || 0) : 0;
            newPercent = ((Number(comp.value) || 0) * parentPercent) / 100;
          }
        }
        
        // Round to 2 decimal places
        newPercent = Math.round(newPercent * 100) / 100;
        
        if (comp.percentOfCTC !== newPercent) {
          comp.percentOfCTC = newPercent;
          changed = true;
        }
      }
      iterations++;
    }
  }

  get totalEarningsPercent(): number {
    return this.components
      .filter(c => c.componentType === 'Earning' && c.isActive && c.percentOfCTC)
      .reduce((sum, c) => sum + (Number(c.percentOfCTC) || 0), 0);
  }

  get totalDeductionsPercent(): number {
    return this.components
      .filter(c => (c.componentType === 'Deduction') && c.isActive && c.percentOfCTC)
      .reduce((sum, c) => sum + (Number(c.percentOfCTC) || 0), 0);
  }

  get totalReimbursementPercent(): number {
    return this.components
      .filter(c => c.componentType === 'Reimbursement' && c.isActive && c.percentOfCTC)
      .reduce((sum, c) => sum + (Number(c.percentOfCTC) || 0), 0);
  }

  get totalCTCPercent(): number {
    return this.totalEarningsPercent + this.totalReimbursementPercent;
  }

  get pfContributionPercent(): number {
    return this.components
      .filter(c => c.considerForPF && c.isActive && c.percentOfCTC)
      .reduce((sum, c) => sum + (Number(c.percentOfCTC) || 0), 0);
  }

  get earningCount(): number {
    return this.components.filter(c => c.componentType === 'Earning' && c.isActive).length;
  }

  get deductionCount(): number {
    return this.components.filter(c => (c.componentType === 'Deduction') && c.isActive).length;
  }

  get reimbursementCount(): number {
    return this.components.filter(c => c.componentType === 'Reimbursement' && c.isActive).length;
  }

  get taxableCount(): number {
    return this.components.filter(c => c.taxTreatment === 'Taxable' && c.isActive).length;
  }

  get taxExemptedCount(): number {
    return this.components.filter(c => c.taxTreatment === 'TaxExempted' && c.isActive).length;
  }

  get activeComponents(): any[] {
    return this.components.filter(c => c.isActive);
  }

  get top5Components(): any[] {
    return [...this.activeComponents]
      .filter(c => c.percentOfCTC)
      .sort((a, b) => (b.percentOfCTC || 0) - (a.percentOfCTC || 0))
      .slice(0, 5);
  }

  getCalcTypeLabel(value: string): string {
    const found = this.calculationTypes.find(ct => ct.value === value);
    return found ? found.name : value || '-';
  }

  // ========== FORM SUBMIT ==========
  onSave(): void {
    if (this.configForm.invalid) {
      this.submitted = true;
      this.toastrService.warning('Please fill all required fields.');
      return;
    }

    // Run calculations one final time
    this.updateCalculations();

    const formData = this.configForm.value;
    
    // Format date from yyyy-MM-dd to dd/MM/yyyy
    let formattedDate = formData.effectiveFrom;
    if (formattedDate && formattedDate.includes('-')) {
      const parts = formattedDate.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const configData: any = {
      effectiveFrom: formattedDate,
      configName: formData.configName,
      fk_locationIds: formData.fk_locationIds?.join(',') || '',
      fk_departmentIds: formData.fk_departmentIds?.join(',') || '',
      fk_categoryIds: formData.fk_categoryIds?.join(',') || '',
      fk_gradeIds: formData.fk_gradeIds?.join(',') || '',
      ctcType: formData.ctcType,
      description: formData.description
    };

    if (this.pk_ctcConfigId) {
      configData.pk_ctcConfigId = Number(this.pk_ctcConfigId);
      configData.Timestamp = this.Timestamp;
    }

    const request = {
      config: configData,
      components: this.components.map((c, i) => ({
        pk_ctcCompId: c.pk_ctcCompId || 0,
        fk_ctcConfigId: this.pk_ctcConfigId ? Number(this.pk_ctcConfigId) : 0,
        fk_headId: c.fk_headId,
        calculationType: c.calculationType,
        calcHeadId: c.calcHeadId,
        value: c.value,
        percentOfCTC: c.percentOfCTC,
        taxTreatment: c.taxTreatment,
        considerForPF: c.considerForPF,
        isActive: c.isActive,
        sortOrder: i + 1
      }))
    };

    this.ngxUILoaderService.start();

    const apiCall = this.pk_ctcConfigId
      ? this.ctcConfigService.updateCTCConfig(request)
      : this.ctcConfigService.saveCTCConfig(request);

    apiCall.subscribe({
      next: (result) => {
        if (result.isSuccess) {
          this.toastrService.success(result.message || 'CTC Configuration saved successfully!');
          this.router.navigateByUrl('/dash/user/userdashboard/CtcConfiguration_list');
        } else {
          this.toastrService.error(result.message || 'Failed to save.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Save error:', err);
        this.toastrService.error('An error occurred during save.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  onReset(): void {
    this.configForm.reset({ ctcType: 'A' });
    this.submitted = false;
    if (this.pk_ctcConfigId) {
      this.loadConfigDetails(this.pk_ctcConfigId);
    } else {
      this.loadHeads();
    }
  }

  // ========== SELECT ALL HELPERS (CHECKBOXES) ==========
  isAllLocationsSelected(): boolean {
    const selected = this.configForm.get('fk_locationIds')?.value || [];
    return this.locationList.length > 0 && selected.length === this.locationList.length;
  }
  toggleAllLocations(event: any): void {
    const checked = event.target.checked;
    this.configForm.patchValue({
      fk_locationIds: checked ? this.locationList.map(item => item.value) : []
    });
  }

  isAllDepartmentsSelected(): boolean {
    const selected = this.configForm.get('fk_departmentIds')?.value || [];
    return this.departmentList.length > 0 && selected.length === this.departmentList.length;
  }
  toggleAllDepartments(event: any): void {
    const checked = event.target.checked;
    this.configForm.patchValue({
      fk_departmentIds: checked ? this.departmentList.map(item => item.value) : []
    });
  }

  isAllCategoriesSelected(): boolean {
    const selected = this.configForm.get('fk_categoryIds')?.value || [];
    return this.categoryList.length > 0 && selected.length === this.categoryList.length;
  }
  toggleAllCategories(event: any): void {
    const checked = event.target.checked;
    this.configForm.patchValue({
      fk_categoryIds: checked ? this.categoryList.map(item => item.value) : []
    });
  }

  isAllGradesSelected(): boolean {
    const selected = this.configForm.get('fk_gradeIds')?.value || [];
    return this.gradeList.length > 0 && selected.length === this.gradeList.length;
  }
  toggleAllGrades(event: any): void {
    const checked = event.target.checked;
    this.configForm.patchValue({
      fk_gradeIds: checked ? this.gradeList.map(item => item.value) : []
    });
  }
}
