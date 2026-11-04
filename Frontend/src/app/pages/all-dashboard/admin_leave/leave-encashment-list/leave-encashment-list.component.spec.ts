import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveEncashmentListComponent } from './leave-encashment-list.component';

describe('LeaveEncashmentListComponent', () => {
  let component: LeaveEncashmentListComponent;
  let fixture: ComponentFixture<LeaveEncashmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveEncashmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveEncashmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
