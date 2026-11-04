import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingHeaderComponent } from './on-boarding-header.component';

describe('OnBoardingHeaderComponent', () => {
  let component: OnBoardingHeaderComponent;
  let fixture: ComponentFixture<OnBoardingHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBoardingHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBoardingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
