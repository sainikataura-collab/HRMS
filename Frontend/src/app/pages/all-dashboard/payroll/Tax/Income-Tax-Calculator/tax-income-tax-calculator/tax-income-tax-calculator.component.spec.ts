import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxIncomeTaxCalculatorComponent } from './tax-income-tax-calculator.component';

describe('TaxIncomeTaxCalculatorComponent', () => {
  let component: TaxIncomeTaxCalculatorComponent;
  let fixture: ComponentFixture<TaxIncomeTaxCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxIncomeTaxCalculatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxIncomeTaxCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
