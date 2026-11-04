

import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { KraService } from '../../recruitment/RecruitServices/kra.service';
declare const $: any;

@Component({
  selector: 'app-rolewise-kra',
  standalone: true,
  imports: [CommonModule, RouterLink, NgSelectComponent, ReactiveFormsModule],
  templateUrl: './rolewise-kra.component.html',
  styleUrl: './rolewise-kra.component.scss'
})
export class RolewiseKraComponent implements AfterViewInit, AfterViewChecked {

  // cards: number[] = [0];
  shouldScroll = false;
  Roles: any[] = [];
  RolewiseForm!: FormGroup;
  showError = false;
  roleid: string = "";
  srno: number = 0;

  Isedit: boolean = false;
  index: number = 0
  userId: string = '';
  fileToUpload: File | null = null;



  @ViewChild('scrollContainer') scrollContainer!: ElementRef;


  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeeMasterService: EmployeeMasterService,
    private KRAService: KraService,
    private router: Router,
    private toastrService: ToastrService) { }



  ngOnInit() {

    this.RolewiseForm = this.fb.group({
      RoleId: ['', Validators.required],
      cards: this.fb.array([]) // FormArray to hold all your cards

      // fk_empId: [''],
      // SrNo: [0],
      // KPA: [''],
      // KRA: [''],
      // KPI: [''],
      // UserId: [this.userId],
      // TargetValue: [''],
      // Weightage: [null],
      // AttachmentPath: [null],
      // FileBytes: [[]],
      // IsActive: [true]
    })
    this.addCard();
    this.getRoleList('RoleName')

    this.roleid = this.route.snapshot.paramMap.get('roleid')!;
    this.userId = sessionStorage.getItem('UserId')!;
    this.srno = Number(this.route.snapshot.paramMap.get('srno'));
    if (this.srno > 0) {
      this.Isedit = true;
    }
    if (this.Isedit) {
      this.getrolewiseByid(this.roleid, 1)
    }

  }


  // Getter for easy access to FormArray controls
  get cards(): FormArray {
    return this.RolewiseForm.get('cards') as FormArray;
  }

  getTotalWeightage(): number {
    return this.cards.controls.reduce((sum, control) => {
      const weight = Number(control.get('Weightage')?.value || 0);
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
  }

  weightageErrors: string[] = [];

  validateWeightage(index: number) {
    const currentControl = this.cards.at(index).get('Weightage');
    let currentValue = Number(currentControl?.value || 0);
    this.weightageErrors[index] = '';

    // 1. Prevent individual input > 100
    if (currentValue > 100) {
      currentControl?.setValue(100, { emitEvent: false });
      this.weightageErrors[index] = 'weightage cannot be more than 100';
      return;
    }

    // 2. Check total weightage
    const totalExcludingCurrent = this.cards.controls.reduce((sum, ctrl, i) => {
      if (i !== index) {
        const val = Number(ctrl.get('Weightage')?.value || 0);
        return sum + (isNaN(val) ? 0 : val);
      }
      return sum;
    }, 0);

    const newTotal = totalExcludingCurrent + currentValue;

    if (newTotal > 100) {
      const allowed = 100 - totalExcludingCurrent;
      currentControl?.setValue(allowed, { emitEvent: false });
      this.weightageErrors[index] = `weightage cannot exceed 100. Adjusted to ${allowed}.`;
      return;
    }

    this.weightageErrors[index] = '';
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
      IsActive: [true]
    });

  }

  // Add a new empty card

  addCard(record?: any) {
  const index = this.cards.length;
  this.cards.push(this.createCard(record));

  setTimeout(() => {
    this.initSummernoteForIndex(index); // initialize Summernote

    if (record) {
      $(`#summernoteEditor${index}`).summernote('code', record.kra || '');
      $(`#summernoteEditor2_${index}`).summernote('code', record.kpa || '');
      $(`#summernoteEditor3_${index}`).summernote('code', record.kpi || '');
      $(`#summernoteEditor4_${index}`).summernote('code', record.targetValue || '');
    }

    // Scroll to the newly added card smoothly
    const element = document.getElementById(`kra-card-${index}`);
    if (element) 
      {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }, 100); // delay to allow DOM rendering
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
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Scroll failed', err);
    }
  }

  initSummernoteForIndex(index: number): void {
    const commonOptions = {
      airMode: true,
      placeholder: 'Type here...',
      tabsize: 2,
      toolbar: [
        ['style', ['bold', 'italic', 'underline']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['link']],
        ['view', ['codeview']]
      ]
    };

    $(`#summernoteEditor${index}`).summernote({ ...commonOptions, placeholder: 'Type KRA...' });
    $(`#summernoteEditor2_${index}`).summernote({ ...commonOptions, placeholder: 'Type KPA...' });
    $(`#summernoteEditor3_${index}`).summernote({ ...commonOptions, placeholder: 'Type KPI...' });
    $(`#summernoteEditor4_${index}`).summernote({ ...commonOptions, placeholder: 'Type Target...' });
  }


  deleteCard(index: number) {
    this.cards.removeAt(index);
  }


  getRoleList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          res.data = res.data.slice(1);
          // console.log("new res.data",res.data);
          console.log('order 1', res.data)
          this.Roles = res.data.map((Role: any) => ({
            name: Role.name,
            value: Role.value.toString()
          }));
        } else {
          this.toastrService.error("Failed to load role list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching role list.");
      }
    });
  }


  getrolewiseByid(roleid: string, srno: number) {
    this.Isedit = true
    this.KRAService.GetByIdrolewiseKRA(roleid, srno).subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.data)) {
          this.cards.clear(); // clear existing cards

          res.data.forEach((record: any) => {
            this.addCard(record);
          });

          this.RolewiseForm.patchValue({
            RoleId: roleid
          });
          this.RolewiseForm.get('RoleId')?.disable();
          // const data=
          setTimeout(() => {
            res.data.forEach((record: any, i: number) => {

              this.initSummernoteForIndex(i);
              $(`#summernoteEditor${i}`).summernote('code', record.kra || '');

              $(`#summernoteEditor2_${i}`).summernote('code', record.kpa || '');
              $(`#summernoteEditor3_${i}`).summernote('code', record.kpi || '');
              $(`#summernoteEditor4_${i}`).summernote('code', record.targetValue || '');
            });
          }, 0);

        } else {
          this.toastrService.error("Failed to load Category details.");

        }
        // Stop loader after response

      },
      error: () => {
        this.toastrService.error("Error loading Category data.");
        // Stop loader on error

      }
    });
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      this.cards.at(index).patchValue({ FileBytes: file });
      // this.RolewiseFrom.patchValue({ FileBytes: file });
    }
  }


  onSubmit(index: number) {
    const cardForm = this.cards.at(index) as FormGroup;

    if (cardForm.invalid) {
      this.showError = true;
      return;
    }

    // Patch updated Summernote content into the form
    cardForm.patchValue({
      KRA: $(`#summernoteEditor${index}`).summernote('code'),
      KPA: $(`#summernoteEditor2_${index}`).summernote('code'),
      KPI: $(`#summernoteEditor3_${index}`).summernote('code'),
      TargetValue: $(`#summernoteEditor4_${index}`).summernote('code')
    });
    const formvalue = cardForm.value;
    const SrNo = index + 1;
    const formData = new FormData();

    formData.append('RoleId', this.roleid || this.RolewiseForm.get('RoleId')?.value);

    formData.append('SrNo', SrNo.toString());
    formData.append('KPA', formvalue.KPA);
    formData.append('KRA', formvalue.KRA);
    formData.append('KPI', formvalue.KPI);
    formData.append('UserId', this.userId);
    formData.append('TargetValue', formvalue.TargetValue);
    formData.append('Weightage', formvalue.Weightage);

    if (formvalue.FileBytes instanceof File) {
      formData.append("FileBytes", formvalue.FileBytes);
    }
    // Update
    this.KRAService.updaterolewiseKRA(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success("KRA updated successfully");

        } else {
          this.toastrService.error("Update failed");
        }
      },
      error: () => {
        this.toastrService.error("Error occurred while updating");
      }
    });

  }



}


