import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTaxRebateDocComponent } from './emp-tax-rebate-doc.component';

describe('EmpTaxRebateDocComponent', () => {
  let component: EmpTaxRebateDocComponent;
  let fixture: ComponentFixture<EmpTaxRebateDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTaxRebateDocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTaxRebateDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
