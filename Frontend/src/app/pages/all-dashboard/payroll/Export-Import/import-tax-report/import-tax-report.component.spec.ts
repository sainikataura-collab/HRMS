import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTaxReportComponent } from './import-tax-report.component';

describe('ImportTaxReportComponent', () => {
  let component: ImportTaxReportComponent;
  let fixture: ComponentFixture<ImportTaxReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportTaxReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTaxReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
