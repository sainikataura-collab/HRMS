import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpTaxComputationComponent } from './emp-tax-computation.component';

describe('EmpTaxComputationComponent', () => {
  let component: EmpTaxComputationComponent;
  let fixture: ComponentFixture<EmpTaxComputationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpTaxComputationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpTaxComputationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
