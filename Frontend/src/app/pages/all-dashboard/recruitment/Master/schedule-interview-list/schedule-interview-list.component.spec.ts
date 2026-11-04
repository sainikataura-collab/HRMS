import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleInterviewListComponent } from './schedule-interview-list.component';

describe('ScheduleInterviewListComponent', () => {
  let component: ScheduleInterviewListComponent;
  let fixture: ComponentFixture<ScheduleInterviewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleInterviewListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleInterviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
