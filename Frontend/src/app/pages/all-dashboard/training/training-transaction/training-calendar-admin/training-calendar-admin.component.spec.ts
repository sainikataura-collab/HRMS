import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCalendarAdminComponent } from './training-calendar-admin.component';

describe('TrainingCalendarAdminComponent', () => {
  let component: TrainingCalendarAdminComponent;
  let fixture: ComponentFixture<TrainingCalendarAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingCalendarAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCalendarAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
