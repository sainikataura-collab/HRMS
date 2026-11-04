
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveManpowerRequisitionListComponent } from './approve-manpower-requisition-list.component';

describe('ApproveManpowerRequisitionListComponent', () => {
  let component: ApproveManpowerRequisitionListComponent;
  let fixture: ComponentFixture<ApproveManpowerRequisitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveManpowerRequisitionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveManpowerRequisitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });







});
