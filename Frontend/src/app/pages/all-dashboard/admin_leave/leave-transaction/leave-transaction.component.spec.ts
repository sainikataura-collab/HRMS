import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveTransactionComponent } from './leave-transaction.component';

describe('LeaveTransactionComponent', () => {
  let component: LeaveTransactionComponent;
  let fixture: ComponentFixture<LeaveTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
