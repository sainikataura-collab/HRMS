import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManpowerRequisitionComponent } from './manpower-requisition.component';

describe('ManpowerRequisitionComponent', () => {
  let component: ManpowerRequisitionComponent;
  let fixture: ComponentFixture<ManpowerRequisitionComponent>;

  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManpowerRequisitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManpowerRequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
