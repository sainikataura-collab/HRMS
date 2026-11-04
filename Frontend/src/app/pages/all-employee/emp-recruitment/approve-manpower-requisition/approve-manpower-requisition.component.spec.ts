import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveManpowerRequisitionComponent } from './approve-manpower-requisition.component';

describe('ApproveManpowerRequisitionComponent', () => {
  let component: ApproveManpowerRequisitionComponent;
  let fixture: ComponentFixture<ApproveManpowerRequisitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveManpowerRequisitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveManpowerRequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
