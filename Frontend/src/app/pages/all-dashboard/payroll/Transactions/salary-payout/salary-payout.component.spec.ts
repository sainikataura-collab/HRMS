import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryPayoutComponent } from './salary-payout.component';

describe('SalaryPayoutComponent', () => {
  let component: SalaryPayoutComponent;
  let fixture: ComponentFixture<SalaryPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryPayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
