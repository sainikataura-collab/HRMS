import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollOrganizationComponent } from './payroll-organization.component';

describe('PayrollOrganizationComponent', () => {
  let component: PayrollOrganizationComponent;
  let fixture: ComponentFixture<PayrollOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
