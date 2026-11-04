import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAttendanceOTComponent } from './import-attendance-ot.component';

describe('ImportAttendanceOTComponent', () => {
  let component: ImportAttendanceOTComponent;
  let fixture: ComponentFixture<ImportAttendanceOTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAttendanceOTComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAttendanceOTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
