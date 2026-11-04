import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EmployeeMasterService } from '../../../../all-dashboard/payroll/services/employee-master.service';
import { KraService } from '../../Service/kra.service';
declare const $: any;

@Component({
  selector: 'app-emp-draft-kra',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './emp-draft-kra.component.html',
  styleUrl: './emp-draft-kra.component.scss',
})
export class EmpDraftKRAComponent {
  employee: any[] = [];
  EmpDraftKRAForm!: FormGroup;
  showError = false;
  draftWeightageErrors: string[] = [];
  shouldScroll = false;
  fileToUpload: File | null = null;
  fk_empid: string = '';
  srno: number = 0;
  Isedit: boolean = false;
  userId: string = '';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeMasterService: EmployeeMasterService,
    private KRAService: KraService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.EmpDraftKRAForm = this.fb.group({
      fk_empid: [''],
      EmpDraftKRACards: this.fb.array([]),
    });

    this.getEmployeeList();

    this.fk_empid = this.route.snapshot.paramMap.get('fk_empid') || '';
    this.userId = sessionStorage.getItem('UserId') || '';
    this.srno = Number(this.route.snapshot.paramMap.get('srno'));

    this.getEmpwiseByid();
  }

  get EmpDraftKRACards(): FormArray {
    return this.EmpDraftKRAForm.get('EmpDraftKRACards') as FormArray;
  }

  createCard(record?: any): FormGroup {
    return this.fb.group({
      KRA: [record?.kra || ''],
      KPA: [record?.kpa || ''],
      KPI: [record?.kpi || ''],
      TargetValue: [record?.targetValue || ''],
      Weightage: [record?.weightage || 0],
      AttachmentPath: [null],
      FileBytes: [[]],
      IsActive: [true],
    });
  }

  addDraftCard(record?: any) {
    const index = this.EmpDraftKRACards.length;
    this.EmpDraftKRACards.push(this.createCard(record));
    setTimeout(() => {
      this.initSummernoteForIndex(index);
      if (record) {
        $(`#kraEditor${index}`).summernote('code', record.kra || '');
        $(`#kpaEditor${index}`).summernote('code', record.kpa || '');
        $(`#kpiEditor${index}`).summernote('code', record.kpi || '');
        $(`#targetEditor${index}`).summernote('code', record.targetValue || '');
      }
    }, 0);
  }

  deleteDraftCard(index: number) {
    this.EmpDraftKRACards.removeAt(index);
  }

  onDraftSubmit(index: number) {
    const cardForm = this.EmpDraftKRACards.at(index) as FormGroup;
    if (cardForm.invalid) {
      this.showError = true;
      return;
    }

    cardForm.patchValue({
      KRA: $(`#kraEditor${index}`).summernote('code'),
      KPA: $(`#kpaEditor${index}`).summernote('code'),
      KPI: $(`#kpiEditor${index}`).summernote('code'),
      TargetValue: $(`#targetEditor${index}`).summernote('code'),
    });

    const formvalue = cardForm.value;
    const formData = new FormData();

    formData.append(
      'fk_empid',
      this.fk_empid || this.EmpDraftKRAForm.get('fk_empid')?.value
    );
    formData.append('SrNo', (index + 1).toString());
    formData.append('KPA', formvalue.KPA);
    formData.append('KRA', formvalue.KRA);
    formData.append('KPI', formvalue.KPI);
    formData.append('UserId', this.userId);
    formData.append('TargetValue', formvalue.TargetValue);
    formData.append('Weightage', formvalue.Weightage);

    if (formvalue.FileBytes instanceof File) {
      formData.append('FileBytes', formvalue.FileBytes);
    }

    this.KRAService.updateEmployeewiseKRA(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('KRA updated successfully');
        } else {
          this.toastrService.error('Update failed');
        }
      },
      error: () => {
        this.toastrService.error('Error occurred while updating');
      },
    });
  }

  getDraftKRATotalWeightage(): number {
    return this.EmpDraftKRACards.controls.reduce((sum, ctrl) => {
      const weight = Number(ctrl.get('Weightage')?.value || 0);
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
  }

  validateDraftKRAWeightage(index: number) {
    const currentControl = this.EmpDraftKRACards.at(index).get('Weightage');
    let currentValue = Number(currentControl?.value || 0);
    if (currentValue > 100) {
      currentValue = 100;
      currentControl?.setValue(currentValue, { emitEvent: false });
    }

    const totalExcludingCurrent = this.EmpDraftKRACards.controls.reduce(
      (sum, ctrl, i) => {
        if (i !== index) {
          const w = Number(ctrl.get('Weightage')?.value || 0);
          return sum + (isNaN(w) ? 0 : w);
        }
        return sum;
      },
      0
    );

    if (totalExcludingCurrent + currentValue > 100) {
      const maxAllowed = 100 - totalExcludingCurrent;
      currentControl?.setValue(maxAllowed, { emitEvent: false });
      this.draftWeightageErrors[
        index
      ] = `Total weightage cannot exceed 100. Adjusted to ${maxAllowed}.`;
    }

    currentControl?.setErrors(null);
  }

  onDraftFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      this.EmpDraftKRACards.at(index).patchValue({ FileBytes: file });
    }
  }

  getEmployeeList() {
    this.employeeMasterService.get_DropdownList('Employee').subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          res.data = res.data.slice(1);
          this.employee = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));

          if (this.fk_empid) {
            this.EmpDraftKRAForm.patchValue({ fk_empid: this.fk_empid });
            this.EmpDraftKRAForm.get('fk_empid')?.disable();
          }
        } else {
          // this.toastrService.error('Failed to load employee list.');
        }
      },
      error: () => {
        this.toastrService.error('Error fetching employee list.');
      },
    });
  }

  getEmpwiseByid() {
    this.Isedit = true;
    this.KRAService.Employeewise_KRAGetEmployeeKRAIdAsync().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.data)) {
          this.EmpDraftKRACards.clear();
          res.data.forEach((record: any) => this.addDraftCard(record));

          this.EmpDraftKRAForm.patchValue({});
          this.EmpDraftKRAForm.get('fk_empid')?.disable();

          setTimeout(() => {
            res.data.forEach((record: any, i: number) => {
              this.initSummernoteForIndex(i);
              $(`#kraEditor${i}`).summernote('code', record.kra || '');
              $(`#kpaEditor${i}`).summernote('code', record.kpa || '');
              $(`#kpiEditor${i}`).summernote('code', record.kpi || '');
              $(`#targetEditor${i}`).summernote(
                'code',
                record.targetValue || ''
              );
            });
          }, 0);
        } else {
          this.toastrService.error('Failed to load KRA data.');
        }
      },
      error: () => {
        this.toastrService.error('Error loading KRA data.');
      },
    });
  }

  initSummernoteForIndex(index: number): void {
    const options = {
      airMode: true,
      tabsize: 2,
      toolbar: [
        ['style', ['bold', 'italic', 'underline']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['link']],
        ['view', ['codeview']],
      ],
    };
    $(`#kraEditor${index}`).summernote({
      ...options,
      placeholder: 'Type KRA...',
    });
    $(`#kpaEditor${index}`).summernote({
      ...options,
      placeholder: 'Type KPA...',
    });
    $(`#kpiEditor${index}`).summernote({
      ...options,
      placeholder: 'Type KPI...',
    });
    $(`#targetEditor${index}`).summernote({
      ...options,
      placeholder: 'Type Target...',
    });
    $(`#kpiEditor${index}`).summernote('disable');
    $(`#targetEditor${index}`).summernote('disable');
    $(`#kraEditor${index}`).summernote('disable');
    $(`#kpaEditor${index}`).summernote('disable');
  }

  ngAfterViewInit(): void {
    this.initSummernoteForIndex(0);

    const header = document.getElementById('stickyHeader');
    const stickyOffset = header?.offsetTop || 0;

    window.addEventListener('scroll', () => {
      if (window.scrollY >= stickyOffset) {
        header?.classList.add('sticky-active');
      } else {
        header?.classList.remove('sticky-active');
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Scroll failed', err);
    }
  }
}
