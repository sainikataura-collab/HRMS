import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManpowerRequisitionListComponent } from './manpower-requisition-list.component';

describe('ManpowerRequisitionListComponent', () => {
  let component: ManpowerRequisitionListComponent;
  let fixture: ComponentFixture<ManpowerRequisitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManpowerRequisitionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManpowerRequisitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
