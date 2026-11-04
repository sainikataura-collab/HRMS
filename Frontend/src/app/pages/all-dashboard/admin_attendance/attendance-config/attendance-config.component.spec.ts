import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceConfigComponent } from './attendance-config.component';

describe('AttendanceConfigComponent', () => {
  let component: AttendanceConfigComponent;
  let fixture: ComponentFixture<AttendanceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
