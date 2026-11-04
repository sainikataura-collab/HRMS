import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportExcelComponent } from './export-excel.component';

describe('ExportExcelComponent', () => {
  let component: ExportExcelComponent;
  let fixture: ComponentFixture<ExportExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportExcelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
