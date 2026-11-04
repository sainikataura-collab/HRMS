import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportSalaryHeadComponent } from './export-import-salary-head.component';

describe('ExportImportSalaryHeadComponent', () => {
  let component: ExportImportSalaryHeadComponent;
  let fixture: ComponentFixture<ExportImportSalaryHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportSalaryHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportImportSalaryHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
