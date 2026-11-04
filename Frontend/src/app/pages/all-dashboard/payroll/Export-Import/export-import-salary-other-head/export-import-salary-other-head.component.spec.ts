import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportSalaryOtherHeadComponent } from './export-import-salary-other-head.component';

describe('ExportImportSalaryOtherHeadComponent', () => {
  let component: ExportImportSalaryOtherHeadComponent;
  let fixture: ComponentFixture<ExportImportSalaryOtherHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportSalaryOtherHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportImportSalaryOtherHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
