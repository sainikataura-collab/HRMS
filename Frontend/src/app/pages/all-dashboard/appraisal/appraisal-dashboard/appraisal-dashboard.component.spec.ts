import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalDashboardComponent } from './appraisal-dashboard.component';

describe('AppraisalDashboardComponent', () => {
  let component: AppraisalDashboardComponent;
  let fixture: ComponentFixture<AppraisalDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppraisalDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
