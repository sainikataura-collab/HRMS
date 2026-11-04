import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalDetailsByIdComponent } from './appraisal-details-by-id.component';

describe('AppraisalDetailsByIdComponent', () => {
  let component: AppraisalDetailsByIdComponent;
  let fixture: ComponentFixture<AppraisalDetailsByIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalDetailsByIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalDetailsByIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
