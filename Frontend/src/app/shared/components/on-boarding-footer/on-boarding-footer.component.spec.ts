import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingFooterComponent } from './on-boarding-footer.component';

describe('OnBoardingFooterComponent', () => {
  let component: OnBoardingFooterComponent;
  let fixture: ComponentFixture<OnBoardingFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBoardingFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBoardingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
