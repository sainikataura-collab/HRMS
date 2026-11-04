import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalLeaveODComponent } from './approval-leave-od.component';

describe('ApprovalLeaveODComponent', () => {
  let component: ApprovalLeaveODComponent;
  let fixture: ComponentFixture<ApprovalLeaveODComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalLeaveODComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalLeaveODComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
