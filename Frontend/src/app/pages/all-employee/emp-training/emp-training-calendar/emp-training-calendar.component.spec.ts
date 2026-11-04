import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTrainingCalendarComponent } from './emp-training-calendar.component';

describe('EmpTrainingCalendarComponent', () => {
  let component: EmpTrainingCalendarComponent;
  let fixture: ComponentFixture<EmpTrainingCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTrainingCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTrainingCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
