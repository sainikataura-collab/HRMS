import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailSalarySlipLocComponent } from './mail-salary-slip-loc.component';

describe('MailSalarySlipLocComponent', () => {
  let component: MailSalarySlipLocComponent;
  let fixture: ComponentFixture<MailSalarySlipLocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailSalarySlipLocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailSalarySlipLocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
