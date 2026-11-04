import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpViewLeaveBalanceComponent } from './emp-view-leave-balance.component';

describe('EmpViewLeaveBalanceComponent', () => {
  let component: EmpViewLeaveBalanceComponent;
  let fixture: ComponentFixture<EmpViewLeaveBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpViewLeaveBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpViewLeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
