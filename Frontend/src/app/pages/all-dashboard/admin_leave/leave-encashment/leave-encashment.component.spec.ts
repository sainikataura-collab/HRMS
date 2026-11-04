import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveEncashmentComponent } from './leave-encashment.component';

describe('LeaveEncashmentComponent', () => {
  let component: LeaveEncashmentComponent;
  let fixture: ComponentFixture<LeaveEncashmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveEncashmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveEncashmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
