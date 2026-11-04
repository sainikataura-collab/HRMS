import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTaxRebateDocListComponent } from './emp-tax-rebate-doc-list.component';

describe('EmpTaxRebateDocListComponent', () => {
  let component: EmpTaxRebateDocListComponent;
  let fixture: ComponentFixture<EmpTaxRebateDocListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTaxRebateDocListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTaxRebateDocListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
