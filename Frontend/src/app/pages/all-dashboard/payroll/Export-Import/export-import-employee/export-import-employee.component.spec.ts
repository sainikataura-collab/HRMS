import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportEmployeeComponent } from './export-import-employee.component';

describe('ExportImportEmployeeComponent', () => {
  let component: ExportImportEmployeeComponent;
  let fixture: ComponentFixture<ExportImportEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportImportEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
