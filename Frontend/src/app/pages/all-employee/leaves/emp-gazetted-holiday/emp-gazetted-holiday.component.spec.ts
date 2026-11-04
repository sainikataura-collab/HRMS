import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpGazettedHolidayComponent } from './emp-gazetted-holiday.component';

describe('EmpGazettedHolidayComponent', () => {
  let component: EmpGazettedHolidayComponent;
  let fixture: ComponentFixture<EmpGazettedHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpGazettedHolidayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpGazettedHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
