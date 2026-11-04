import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyRentDetailComponent } from './monthly-rent-detail.component';

describe('MonthlyRentDetailComponent', () => {
  let component: MonthlyRentDetailComponent;
  let fixture: ComponentFixture<MonthlyRentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyRentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyRentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
