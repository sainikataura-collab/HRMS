import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalDashComponent } from './appraisal-dash.component';

describe('AppraisalDashComponent', () => {
  let component: AppraisalDashComponent;
  let fixture: ComponentFixture<AppraisalDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
