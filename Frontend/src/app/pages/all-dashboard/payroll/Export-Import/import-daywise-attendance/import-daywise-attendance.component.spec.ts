import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDaywiseAttendanceComponent } from './import-daywise-attendance.component';

describe('ImportDaywiseAttendanceComponent', () => {
  let component: ImportDaywiseAttendanceComponent;
  let fixture: ComponentFixture<ImportDaywiseAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportDaywiseAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportDaywiseAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
