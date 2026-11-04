import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedHolidayComponent } from './restricted-holiday.component';

describe('RestrictedHolidayComponent', () => {
  let component: RestrictedHolidayComponent;
  let fixture: ComponentFixture<RestrictedHolidayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestrictedHolidayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestrictedHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
