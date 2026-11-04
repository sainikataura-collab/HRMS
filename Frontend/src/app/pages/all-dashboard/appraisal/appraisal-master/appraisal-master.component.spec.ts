import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalMasterComponent } from './appraisal-master.component';

describe('AppraisalMasterComponent', () => {
  let component: AppraisalMasterComponent;
  let fixture: ComponentFixture<AppraisalMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
