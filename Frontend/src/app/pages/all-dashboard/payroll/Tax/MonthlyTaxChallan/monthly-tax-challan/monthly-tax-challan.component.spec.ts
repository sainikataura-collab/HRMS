import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTaxChallanComponent } from './monthly-tax-challan.component';

describe('MonthlyTaxChallanComponent', () => {
  let component: MonthlyTaxChallanComponent;
  let fixture: ComponentFixture<MonthlyTaxChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTaxChallanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyTaxChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
