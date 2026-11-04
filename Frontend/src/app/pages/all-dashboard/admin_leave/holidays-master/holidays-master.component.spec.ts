import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaysMasterComponent } from './holidays-master.component';

describe('HolidaysMasterComponent', () => {
  let component: HolidaysMasterComponent;
  let fixture: ComponentFixture<HolidaysMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaysMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaysMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
