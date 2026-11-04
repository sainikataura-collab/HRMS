import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedLeaveListComponent } from './approved-leave-list.component';

describe('ApprovedLeaveListComponent', () => {
  let component: ApprovedLeaveListComponent;
  let fixture: ComponentFixture<ApprovedLeaveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedLeaveListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedLeaveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
