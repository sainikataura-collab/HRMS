import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalMasterListComponent } from './appraisal-master-list.component';

describe('AppraisalMasterListComponent', () => {
  let component: AppraisalMasterListComponent;
  let fixture: ComponentFixture<AppraisalMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalMasterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
