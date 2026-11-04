import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCalendarAdminViewComponent } from './training-calendar-admin-view.component';

describe('TrainingCalendarAdminViewComponent', () => {
  let component: TrainingCalendarAdminViewComponent;
  let fixture: ComponentFixture<TrainingCalendarAdminViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingCalendarAdminViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCalendarAdminViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
