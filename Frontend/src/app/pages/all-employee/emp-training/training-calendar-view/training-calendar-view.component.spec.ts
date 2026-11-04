import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCalendarViewComponent } from './training-calendar-view.component';

describe('TrainingCalendarViewComponent', () => {
  let component: TrainingCalendarViewComponent;
  let fixture: ComponentFixture<TrainingCalendarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingCalendarViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
