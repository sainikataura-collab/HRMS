import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollWorkflowComponent } from './payroll-workflow.component';

describe('PayrollWorkflowComponent', () => {
  let component: PayrollWorkflowComponent;
  let fixture: ComponentFixture<PayrollWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollWorkflowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
