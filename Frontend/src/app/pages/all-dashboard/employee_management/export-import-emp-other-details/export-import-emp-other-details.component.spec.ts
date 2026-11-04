import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportEmpOtherDetailsComponent } from './export-import-emp-other-details.component';

describe('ExportImportEmpOtherDetailsComponent', () => {
  let component: ExportImportEmpOtherDetailsComponent;
  let fixture: ComponentFixture<ExportImportEmpOtherDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportEmpOtherDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportImportEmpOtherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
