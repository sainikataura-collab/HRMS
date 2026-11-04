import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAttendancePunchComponent } from './import-attendance-punch.component';

describe('ImportAttendancePunchComponent', () => {
  let component: ImportAttendancePunchComponent;
  let fixture: ComponentFixture<ImportAttendancePunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAttendancePunchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAttendancePunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
