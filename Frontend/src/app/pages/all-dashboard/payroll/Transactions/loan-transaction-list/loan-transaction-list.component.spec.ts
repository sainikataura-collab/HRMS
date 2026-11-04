import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTransactionListComponent } from './loan-transaction-list.component';

describe('LoanTransactionListComponent', () => {
  let component: LoanTransactionListComponent;
  let fixture: ComponentFixture<LoanTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanTransactionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
