import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportImportLeaveComponent } from './export-import-leave.component';

describe('ExportImportLeaveComponent', () => {
  let component: ExportImportLeaveComponent;
  let fixture: ComponentFixture<ExportImportLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportImportLeaveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportImportLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
