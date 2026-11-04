import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestrictedHolidaysComponent } from './restricted-holidays.component';

describe('RestrictedHolidaysComponent', () => {
  let component: RestrictedHolidaysComponent;
  let fixture: ComponentFixture<RestrictedHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestrictedHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestrictedHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
