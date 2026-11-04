import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceAdjustmentComponent } from './attendance-adjustment.component';

describe('AttendanceAdjustmentComponent', () => {
  let component: AttendanceAdjustmentComponent;
  let fixture: ComponentFixture<AttendanceAdjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceAdjustmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
