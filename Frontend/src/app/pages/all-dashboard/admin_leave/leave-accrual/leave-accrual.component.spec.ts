import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveAccrualComponent } from './leave-accrual.component';

describe('LeaveAccrualComponent', () => {
  let component: LeaveAccrualComponent;
  let fixture: ComponentFixture<LeaveAccrualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveAccrualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveAccrualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
