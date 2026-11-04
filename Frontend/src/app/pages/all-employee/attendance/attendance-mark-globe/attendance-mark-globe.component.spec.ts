import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceMarkGlobeComponent } from './attendance-mark-globe.component';

describe('AttendanceMarkGlobeComponent', () => {
  let component: AttendanceMarkGlobeComponent;
  let fixture: ComponentFixture<AttendanceMarkGlobeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceMarkGlobeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceMarkGlobeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
