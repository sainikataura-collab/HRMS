import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankStatementComponent } from './bank-statement.component';

describe('BankStatementComponent', () => {
  let component: BankStatementComponent;
  let fixture: ComponentFixture<BankStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankStatementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
