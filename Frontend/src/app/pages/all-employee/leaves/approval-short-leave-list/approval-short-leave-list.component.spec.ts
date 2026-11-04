import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalShortLeaveListComponent } from './approval-short-leave-list.component';

describe('ApprovalShortLeaveListComponent', () => {
  let component: ApprovalShortLeaveListComponent;
  let fixture: ComponentFixture<ApprovalShortLeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalShortLeaveListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalShortLeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
