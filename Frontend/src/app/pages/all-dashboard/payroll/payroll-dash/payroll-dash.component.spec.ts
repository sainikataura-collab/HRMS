import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollDashComponent } from './payroll-dash.component';

describe('PayrollDashComponent', () => {
  let component: PayrollDashComponent;
  let fixture: ComponentFixture<PayrollDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
