import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaysDetailsComponent } from './holidays-details.component';

describe('HolidaysDetailsComponent', () => {
  let component: HolidaysDetailsComponent;
  let fixture: ComponentFixture<HolidaysDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaysDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaysDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
