import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalShortLeaveComponent } from './approval-short-leave.component';

describe('ApprovalShortLeaveComponent', () => {
  let component: ApprovalShortLeaveComponent;
  let fixture: ComponentFixture<ApprovalShortLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalShortLeaveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalShortLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
