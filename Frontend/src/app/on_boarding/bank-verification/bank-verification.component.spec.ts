import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankVerificationComponent } from './bank-verification.component';

describe('BankVerificationComponent', () => {
  let component: BankVerificationComponent;
  let fixture: ComponentFixture<BankVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
