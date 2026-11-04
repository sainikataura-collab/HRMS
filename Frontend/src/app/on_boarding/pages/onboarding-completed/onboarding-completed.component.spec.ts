import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingCompletedComponent } from './onboarding-completed.component';

describe('OnboardingCompletedComponent', () => {
  let component: OnboardingCompletedComponent;
  let fixture: ComponentFixture<OnboardingCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingCompletedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
