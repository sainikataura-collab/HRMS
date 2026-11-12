import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentDashboardComponent } from './recruitment-dashboard.component';

describe('RecruitmentDashboardComponent', () => {
  let component: RecruitmentDashboardComponent;
  let fixture: ComponentFixture<RecruitmentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
