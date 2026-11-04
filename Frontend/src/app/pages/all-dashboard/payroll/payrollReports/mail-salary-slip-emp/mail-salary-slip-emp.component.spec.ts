import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailSalarySlipEmpComponent } from './mail-salary-slip-emp.component';

describe('MailSalarySlipEmpComponent', () => {
  let component: MailSalarySlipEmpComponent;
  let fixture: ComponentFixture<MailSalarySlipEmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailSalarySlipEmpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailSalarySlipEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
