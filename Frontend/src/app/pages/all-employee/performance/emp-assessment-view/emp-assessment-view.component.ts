



import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { KraService } from '../Service/kra.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CandidateMasterService } from '../../../all-dashboard/recruitment/RecruitServices/candidate-master.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

declare const $: any;


@Component({
  selector: 'app-emp-assessment-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, SafeHtmlPipe],
  templateUrl: './emp-assessment-view.component.html',
  styleUrl: './emp-assessment-view.component.scss'
})
export class EmpAssessmentViewComponent implements OnInit {

  EmpWiseForm!: FormGroup;
  staticKRAData: any[] = [];
  imageMap: { [filename: string]: string } = {};
  kraStatus: number = 0;
  pk_kraassId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private KRAService: KraService,
    private sanitizer: DomSanitizer,
    private candidateService: CandidateMasterService
  ) { }

  get cards(): FormArray {
    return this.EmpWiseForm.get('cards') as FormArray;
  }

  ngOnInit(): void {
    this.EmpWiseForm = this.fb.group({
      fk_kraperiodId: [''],
      cards: this.fb.array([])
    });

    this.pk_kraassId = Number(this.route.snapshot.paramMap.get('pk_kraassId'));
    if (!isNaN(this.pk_kraassId) && this.pk_kraassId > 0) {
      this.getAssessmentByKRAId();
    }
  }

  getAssessmentByKRAId(): void {
    this.KRAService.GetById_Assessment_KRA(this.pk_kraassId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.staticKRAData = response.data;
          this.kraStatus = response.data[0].status;
          this.EmpWiseForm.get('fk_kraperiodId')?.setValue(String(response.data[0].kraPeriodId));
          this.populateStaticKRA();
        } else {
          this.toastrService.warning('No data found.');
        }
      },
      error: () => {
        this.toastrService.error('Failed to fetch assessment data.');
      }
    });
  }

  populateStaticKRA(): void {
    this.cards.clear();

    this.staticKRAData.forEach((kra, index) => {
      const group = this.fb.group({
        kra: [kra.kra],
        kpi: [kra.kpi],
        kpa: [kra.kpa],
        targetvalue: [kra.targetvalue],
        weightage: [kra.weightage],
        selfAssessment: [kra.selfAssessment],
        selfRemark: [kra.assessmentRemarks],
        attachmentPath: [kra.attachmentPath],
        status: [kra.status]
      });

      group.disable(); // Make all fields view-only
      this.cards.push(group);

      // Load image if file exists
      if (kra.attachmentPath) {
        this.loadImage(kra.attachmentPath);
      }

      // Init Summernote view
      setTimeout(() => {
        this.initSummernoteReadonly(index, kra);
      }, 100);
    });
  }

  initSummernoteReadonly(index: number, kra: any): void {
    const selfRemarkSelector = `#summernoteViewer2_${index}`;

    if (!$(selfRemarkSelector).next('.note-editor').length) {
      $(selfRemarkSelector).summernote({
        airMode: true,
        toolbar: false,
        disableResizeEditor: true
      });
      $(selfRemarkSelector).summernote('code', kra.assessmentRemarks || '');
      $(selfRemarkSelector).summernote('disable');
    }
  }

  loadImage(filename: string) {
    if (this.imageMap[filename]) return;

    this.candidateService.getImage(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageMap[filename] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Failed to load image:', err);
      }
    });
  }

  download(filename: string) {
    this.candidateService.getImage(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download image:', err);
      }
    });
  }

}
