import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryDeductionHeadComponent } from './salary-deduction-head.component';

describe('SalaryDeductionHeadComponent', () => {
  let component: SalaryDeductionHeadComponent;
  let fixture: ComponentFixture<SalaryDeductionHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryDeductionHeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryDeductionHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
