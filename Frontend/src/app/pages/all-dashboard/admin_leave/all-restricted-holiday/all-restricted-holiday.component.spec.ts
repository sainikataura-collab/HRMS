import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRestrictedHolidayComponent } from './all-restricted-holiday.component';

describe('AllRestrictedHolidayComponent', () => {
  let component: AllRestrictedHolidayComponent;
  let fixture: ComponentFixture<AllRestrictedHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllRestrictedHolidayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllRestrictedHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
