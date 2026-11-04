import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpSalaryPayoutComponent } from './emp-salary-payout.component';

describe('EmpSalaryPayoutComponent', () => {
  let component: EmpSalaryPayoutComponent;
  let fixture: ComponentFixture<EmpSalaryPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpSalaryPayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpSalaryPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
