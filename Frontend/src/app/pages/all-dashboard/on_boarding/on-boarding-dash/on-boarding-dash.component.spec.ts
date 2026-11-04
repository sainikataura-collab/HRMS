import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingDashComponent } from './on-boarding-dash.component';

describe('OnBoardingDashComponent', () => {
  let component: OnBoardingDashComponent;
  let fixture: ComponentFixture<OnBoardingDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBoardingDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBoardingDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
