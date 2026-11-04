import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingDashboardComponent } from './on-boarding-dashboard.component';

describe('OnBoardingDashboardComponent', () => {
  let component: OnBoardingDashboardComponent;
  let fixture: ComponentFixture<OnBoardingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBoardingDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBoardingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
