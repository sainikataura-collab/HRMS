import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportAttendanceComponent } from './export-attendance.component';

describe('ExportAttendanceComponent', () => {
  let component: ExportAttendanceComponent;
  let fixture: ComponentFixture<ExportAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
