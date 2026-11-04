import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpRecruitmentDashboardComponent } from './emp-recruitment-dashboard.component';

describe('EmpRecruitmentDashboardComponent', () => {
  let component: EmpRecruitmentDashboardComponent;
  let fixture: ComponentFixture<EmpRecruitmentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpRecruitmentDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpRecruitmentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
